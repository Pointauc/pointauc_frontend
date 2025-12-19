# Secure Random Winner Selection

This directory contains the architecture and security documentation for the provably fair random winner selection system using Random.org's Signed API.

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system design, data flows, and implementation details
- **[SECURITY-ANALYSIS.md](./SECURITY-ANALYSIS.md)** - In-depth security analysis from a security engineer's perspective

## 🎯 Quick Overview

This system ensures **transparent**, **verifiable**, and **fair** winner selection for auctions where winning chances are proportional to bid amounts.

### Key Features

✅ **Cryptographically Verifiable** - Uses Random.org's RSA-2048 signed random numbers  
✅ **Publicly Auditable** - All proof data accessible to anyone  
✅ **Tamper-Evident** - Client-side hash commitment prevents data manipulation  
✅ **Trustless** - No need to trust website or streamer, only Random.org  
✅ **Provably Fair** - Mathematical guarantee of proportional winning chances

## 🔒 How It Works (Simple)

```
1. Streamer clicks "Decide Winner"
   ↓
2. Browser creates hash of participants (client key)
   ↓
3. Server creates hash with secret (server key)
   ↓
4. Request signed random number from Random.org
   ↓
5. Save all data + signature to database
   ↓
6. Display winner + verification link
   ↓
7. Anyone can verify:
   - Data wasn't changed (hash check)
   - Random.org really provided the number (signature check)
   - Winner was calculated correctly (math check)
```

## 🔐 Security Properties

| Property             | Status      | Description                                |
| -------------------- | ----------- | ------------------------------------------ |
| Non-repudiation      | ✅ Strong   | Random.org's signature proves authenticity |
| Data integrity       | ✅ Strong   | Client hash detects tampering              |
| Public verifiability | ✅ Strong   | Anyone can independently verify            |
| True randomness      | ✅ Strong   | Atmospheric noise, not pseudo-random       |
| Fairness             | ✅ Provable | Mathematically proportional chances        |

## 🎨 System Diagram

```
┌─────────────┐
│  Streamer   │ Wants to verify website isn't cheating
└──────┬──────┘
       │ Computes hash of participants (client_key)
       │ Sends to backend
       ▼
┌─────────────┐
│   Backend   │ Generates server_key
└──────┬──────┘ Requests random from Random.org
       │        Stores all proof data
       │
       ├────────► Random.org (userData: "client_key:server_key")
       │                │
       │                ▼
       │          Signed Response + Signature
       │                │
       ◄────────────────┘
       │
       │ Saves to database:
       │  - participants
       │  - client_key
       │  - server_key
       │  - random_value
       │  - signature
       │
       ▼
┌─────────────┐
│   Public    │
│ Verification│ Anyone can access and verify:
│    Page     │ 1. Hash(participants) == client_key ✓
└─────────────┘ 2. Random.org signature valid ✓
                3. userData contains client_key ✓
                4. Winner calculation correct ✓

┌─────────────┐
│   Viewers   │ Can independently verify everything
└─────────────┘ Don't need to trust website or streamer
```

## 🛡️ Trust Model

**You MUST trust:**

- ✅ Random.org generates true random numbers
- ✅ Your own ability to compute a hash

**You DON'T need to trust:**

- ❌ The website operator
- ❌ The streamer
- ❌ The internet connection (after obtaining proof)

## 🔗 External Resources

- [Random.org Signed API Documentation](https://api.random.org/json-rpc/4/signed)
- [Random.org Signature Verification](https://api.random.org/verify)
- [SHA-256 Online Calculator](https://emn178.github.io/online-tools/sha256.html) - For manual verification
- [Provably Fair Gaming](https://en.wikipedia.org/wiki/Provably_fair_algorithm)
