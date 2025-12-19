# Secure Random Winner Selection Architecture

## Overview

Approach name - **Provably Fair with External Oracle**

This system implements cryptographically verifiable random winner selection using Random.org's Signed API, ensuring fairness and transparency for all parties involved in the auction.

## Parties Involved

### 1. Website (Backend Service)

- Manages auction data persistence
- Interfaces with Random.org Signed API
- Generates server-side keys
- Stores verifiable proofs

### 2. Streamer (Frontend User)

- Initiates winner selection
- Views results in real-time
- Can verify website legitimacy through public proof

### 3. Viewers (Audience)

- Participate by donating
- View auction through stream
- Can independently verify both website and streamer legitimacy
- Can audit complete auction history

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WINNER SELECTION FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

[Streamer]                [Frontend]              [Backend]         [Random.org]
    │                          │                       │                  │
    │  1. Click "Decide"       │                       │                  │
    ├─────────────────────────>│                       │                  │
    │                          │                       │                  │
    │                          │ 2. Capture participants                  │
    │                          │    [id, name, amount] │                  │
    │                          │                       │                  │
    │                          │ 3. Generate client_key│                  │
    │                          │    SHA256(participants)│                  │
    │                          │                       │                  │
    │                          │ 4. Send request       │                  │
    │                          │    {participants, client_key}            │
    │                          ├──────────────────────>│                  │
    │                          │                       │                  │
    │                          │                       │ 5. Generate      │
    │                          │                       │    server_key    │
    │                          │                       │    HMAC-SHA256(  │
    │                          │                       │      participants│
    │                          │                       │      + secret)   │
    │                          │                       │                  │
    │                          │                       │ 6. Request signed│
    │                          │                       │    random number │
    │                          │                       │    userData:     │
    │                          │                       │    "client:server"│
    │                          │                       ├─────────────────>│
    │                          │                       │                  │
    │                          │                       │  7. Response +   │
    │                          │                       │     signature    │
    │                          │                       │<─────────────────┤
    │                          │                       │                  │
    │                          │                       │ 8. Save to DB:   │
    │                          │                       │    - participants│
    │                          │                       │    - client_key  │
    │                          │                       │    - server_key  │
    │                          │                       │    - random_response│
    │                          │                       │    - signature   │
    │                          │                       │    - timestamp   │
    │                          │                       │                  │
    │                          │ 9. Return result      │                  │
    │                          │    {winner, proof}    │                  │
    │                          │<──────────────────────┤                  │
    │                          │                       │                  │
    │  10. Display winner      │                       │                  │
    │<─────────────────────────┤                       │                  │
    │                          │                       │                  │
```

## Verification Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PUBLIC VERIFICATION FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

[Viewer]              [Public Page]            [Random.org]
   │                       │                        │
   │  1. Open verification │                        │
   │       page            │                        │
   ├──────────────────────>│                        │
   │                       │                        │
   │  2. View data:        │                        │
   │     - Participants    │                        │
   │     - client_key      │                        │
   │     - server_key      │                        │
   │     - random response │                        │
   │     - signature       │                        │
   │<──────────────────────┤                        │
   │                       │                        │
   │  3. Independently     │                        │
   │     compute hash:     │                        │
   │     SHA256(participants)                       │
   │                       │                        │
   │  4. Compare with      │                        │
   │     stored client_key │                        │
   │     ✓ Match = Data    │                        │
   │       not tampered    │                        │
   │                       │                        │
   │  5. Verify signature  │                        │
   │     using Random.org  │                        │
   │     verification tool │                        │
   ├──────────────────────────────────────────────>│
   │                       │                        │
   │  6. Signature valid?  │                        │
   │     ✓ Yes = Random.org│                        │
   │       response genuine│                        │
   │<───────────────────────────────────────────────┤
   │                       │                        │
   │  7. Check userData    │                        │
   │     contains computed │                        │
   │     client_key        │                        │
   │     ✓ Match = Keys    │                        │
   │       binding verified│                        │
   │                       │                        │
```

## Key Components

### 1. Client Key Generation

```typescript
// Frontend computes deterministic hash of participants
const clientKey = SHA256(
  JSON.stringify(
    participants.sort((a, b) => a.id.localeCompare(b.id)).map((p) => ({ id: p.id, name: p.name, amount: p.amount })),
  ),
);
```

**Purpose**: Commit to specific participant data before server processing

### 2. Server Key Generation

```typescript
// Backend computes keyed hash with server secret
const serverKey = HMAC_SHA256(serverSecret, JSON.stringify(participants) + timestamp);
```

**Purpose**: Prove backend processed the exact data and prevent replay attacks

### 3. Random.org Request

```typescript
{
  jsonrpc: "2.0",
  method: "generateSignedIntegers",
  params: {
    apiKey: API_KEY,
    n: 1,
    min: 1,
    max: totalBidAmount,
    userData: `${clientKey}:${serverKey}`
  }
}
```

**Purpose**: Get cryptographically signed random number bound to specific auction

### 4. Database Storage

```typescript
interface AuctionResult {
  id: string;
  timestamp: string;

  // Participants snapshot
  participants: Array<{
    id: string;
    name: string;
    amount: number;
  }>;

  // Cryptographic binding
  clientKey: string;
  serverKey: string;

  // Random.org response
  randomValue: number;
  randomOrgResponse: {
    random: {
      data: number[];
      completionTime: string;
    };
    signature: string;
    serialNumber: number;
  };
  userData: string; // "client_key:server_key"

  // Computed result
  winnerId: string;
  winnerName: string;
  winningChance: number;
}
```

### 5. Winner Calculation

```typescript
// Weighted random selection using Random.org value
function selectWinner(participants, randomValue) {
  let accumulated = 0;
  const total = participants.reduce((sum, p) => sum + p.amount, 0);

  // Normalize random value to [0, total]
  const target = (randomValue / maxRandomValue) * total;

  for (const participant of participants) {
    accumulated += participant.amount;
    if (target <= accumulated) {
      return participant;
    }
  }
}
```

## Security Properties

### 1. **Non-Repudiation**

- Random.org's signature proves they generated the number
- Neither website nor streamer can claim different number was provided

### 2. **Tamper Evidence**

- Client key binds to exact participant data
- Any change in participants invalidates the hash
- Viewers can detect data manipulation

### 3. **Commitment Binding**

- userData field in Random.org response contains both keys
- Links random number to specific auction instance
- Prevents result reuse across different auctions

### 4. **Public Verifiability**

- All proof data stored and publicly accessible
- Anyone can verify without trusting the website
- Random.org provides independent verification tool

### 5. **Server Authenticity**

- Server key proves backend processed the request
- HMAC with secret prevents forgery
- Timestamp prevents replay attacks

## Verification Steps for Viewers

### Manual Verification

1. **Verify Data Integrity**

   ```javascript
   const computedHash = SHA256(JSON.stringify(participants));
   assert(computedHash === storedClientKey);
   // ✓ Data was not tampered with
   ```

2. **Verify Random.org Signature**

   - Visit: https://api.random.org/verify
   - Paste the signed response
   - Check signature validates
   - ✓ Random.org actually generated this number

3. **Verify Key Binding**

   ```javascript
   const userData = randomOrgResponse.userData;
   assert(userData.startsWith(computedHash));
   // ✓ This random number is bound to this specific auction
   ```

4. **Verify Winner Calculation**
   ```javascript
   const recalculatedWinner = selectWinner(participants, randomOrgResponse.random.data[0]);
   assert(recalculatedWinner.id === storedWinnerId);
   // ✓ Winner was calculated correctly
   ```

## Attack Scenarios & Mitigations

### Attack 1: Website Manipulates Participants

**Attempt**: Change bid amounts to favor specific participant

**Detection**:

- Streamer's client key won't match manipulated data
- Viewers computing hash will detect discrepancy

**Mitigation**: Client key commitment before backend processing

---

### Attack 2: Website Requests Multiple Random Numbers

**Attempt**: Ask Random.org for many numbers, pick favorable one

**Detection**:

- Each request gets unique signature and serial number
- Serial numbers are sequential
- Gap in serial numbers indicates hidden requests

**Mitigation**:

- Display serial number prominently
- Allow checking previous/next serial numbers
- Sequential audit trail

---

### Attack 3: Streamer Claims Different Winner

**Attempt**: Display wrong winner to viewers

**Detection**:

- Public verification page shows true winner
- Signature proves random number used
- Calculation is deterministic and reproducible

**Mitigation**: Public audit page, viewer verification

---

### Attack 4: Replay Attack

**Attempt**: Reuse old result for new auction

**Detection**:

- Server key includes timestamp
- Participant data won't match
- Client key will be different

**Mitigation**: Timestamp in server key, unique client key per auction

---

### Attack 5: Man-in-the-Middle

**Attempt**: Intercept and modify Random.org response

**Detection**:

- Signature verification will fail
- Random.org's signature cannot be forged without their private key

**Mitigation**: Cryptographic signature verification

## Implementation Checklist

### Frontend

- [ ] Implement deterministic participant hashing (sorted, normalized)
- [ ] Send both raw data and client key to backend
- [ ] Display verification link after winner announcement
- [ ] Create public verification page
- [ ] Add signature verification UI

### Backend

- [ ] Generate server key with HMAC-SHA256
- [ ] Integrate Random.org Signed API
- [ ] Store complete proof data in database
- [ ] Create public API endpoint for verification
- [ ] Implement rate limiting on Random.org calls

### Database Schema

- [ ] Create auction_results table
- [ ] Index by timestamp, serial number
- [ ] Store complete Random.org response
- [ ] Store participant snapshot

### Security

- [ ] Secure server secret storage (environment variable)
- [ ] HTTPS everywhere
- [ ] Rate limiting on verification page
- [ ] Input validation and sanitization
- [ ] Audit logging

## API Endpoints

### POST /api/auction/decide-winner

Request:

```json
{
  "participants": [
    { "id": "user1", "name": "Alice", "amount": 100 },
    { "id": "user2", "name": "Bob", "amount": 50 }
  ],
  "clientKey": "a1b2c3..."
}
```

Response:

```json
{
  "auctionId": "abc123",
  "winner": {
    "id": "user1",
    "name": "Alice",
    "chance": 66.67
  },
  "proof": {
    "randomValue": 87,
    "signature": "...",
    "serialNumber": 12345,
    "verificationUrl": "https://auction.example/verify/abc123"
  }
}
```

### GET /api/auction/verify/:auctionId

Response:

```json
{
  "id": "abc123",
  "timestamp": "2024-01-01T12:00:00Z",
  "participants": [...],
  "clientKey": "a1b2c3...",
  "serverKey": "x9y8z7...",
  "randomOrgResponse": {...},
  "winner": {...},
  "verificationInstructions": "..."
}
```

## User Interface Elements

### Streamer View

- "Decide Winner" button with loading state
- Winner announcement with confetti
- Prominent "Verification Link" button
- Copy verification URL feature

### Public Verification Page

```
┌────────────────────────────────────────────┐
│  Auction Verification                      │
│  ID: abc123                                │
│  Date: 2024-01-01 12:00:00                │
├────────────────────────────────────────────┤
│  Participants:                             │
│  ✓ Alice - 100 points (66.67%)            │
│  ✓ Bob   - 50 points (33.33%)             │
│                                            │
│  Winner: Alice                             │
├────────────────────────────────────────────┤
│  Cryptographic Proof:                      │
│  Client Key: a1b2c3... [Copy] [Verify]   │
│  Server Key: x9y8z7... [Copy]             │
│  Random Value: 87                          │
│  Random.org Serial: #12345                │
│  Signature: ... [Copy] [Verify on Random.org]│
├────────────────────────────────────────────┤
│  Verification Steps:                       │
│  [1] ✓ Data integrity verified            │
│  [2] ✓ Signature valid                    │
│  [3] ✓ Keys binding correct               │
│  [4] ✓ Winner calculation verified        │
│                                            │
│  [View Raw Data] [Download Proof]         │
└────────────────────────────────────────────┘
```

## Trust Model

**What you must trust:**

- Random.org generates truly random numbers
- Random.org's cryptographic signing is secure
- Your own ability to compute SHA256 hash

**What you DON'T need to trust:**

- The website operator
- The streamer
- The internet connection (after obtaining proof)

This creates a **trustless verification system** where transparency replaces trust.
