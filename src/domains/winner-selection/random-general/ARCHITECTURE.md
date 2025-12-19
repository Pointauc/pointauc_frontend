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
