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

| Property | Status | Description |
|----------|--------|-------------|
| Non-repudiation | ✅ Strong | Random.org's signature proves authenticity |
| Data integrity | ✅ Strong | Client hash detects tampering |
| Public verifiability | ✅ Strong | Anyone can independently verify |
| True randomness | ✅ Strong | Atmospheric noise, not pseudo-random |
| Fairness | ✅ Provable | Mathematically proportional chances |

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

**This is a trustless system** - transparency replaces trust.

## 🚀 Implementation Status

### Phase 1: Core System ⬜ Not Started
- [ ] Frontend client key generation
- [ ] Backend server key generation
- [ ] Random.org Signed API integration
- [ ] Database schema for proof storage
- [ ] Winner calculation algorithm

### Phase 2: Verification ⬜ Not Started
- [ ] Public verification page
- [ ] Hash verification tool
- [ ] Signature verification UI
- [ ] Winner recalculation tool

### Phase 3: Enhancements ⬜ Not Started
- [ ] Serial number gap detection
- [ ] Automated verification
- [ ] Statistical dashboard
- [ ] Export proof data feature

## 📖 For Developers

### Key Files (To Be Implemented)

```
src/
├── api/
│   └── randomApi.ts              # Random.org integration (UPDATE)
├── services/
│   ├── RandomOrgService.ts       # Signed API wrapper (NEW)
│   └── VerificationService.ts    # Verification logic (NEW)
├── domains/
│   └── winner-selection/
│       ├── api/
│       │   ├── decideWinner.ts   # Backend endpoint (NEW)
│       │   └── getProof.ts       # Verification endpoint (NEW)
│       └── ui/
│           ├── DecideWinnerButton.tsx   # Streamer UI (NEW)
│           └── VerificationPage.tsx     # Public verification (NEW)
└── models/
    └── auction-proof.model.ts    # TypeScript interfaces (NEW)
```

### Key Functions

```typescript
// 1. Generate client key (frontend)
function generateClientKey(participants: Participant[]): string {
  const normalized = normalizeParticipants(participants);
  return SHA256(JSON.stringify(normalized));
}

// 2. Generate server key (backend)
function generateServerKey(
  participants: Participant[],
  secret: string,
  timestamp: string
): string {
  const data = JSON.stringify(participants) + timestamp;
  return HMAC_SHA256(secret, data);
}

// 3. Request signed random (backend)
async function getSignedRandom(
  min: number,
  max: number,
  userData: string
): Promise<SignedRandomResponse> {
  // Call Random.org Signed API
}

// 4. Verify proof (frontend/backend)
function verifyProof(proof: AuctionProof): VerificationResult {
  // Check hash, signature, calculation
}
```

## 🧪 Testing Checklist

- [ ] Hash determinism across platforms
- [ ] JSON serialization consistency  
- [ ] Signature verification
- [ ] Winner calculation accuracy
- [ ] Edge cases (ties, single participant)
- [ ] Rate limiting
- [ ] Error handling
- [ ] Security headers

## 📊 Success Metrics

**Security Metrics:**
- 0 successful data tampering attacks
- 0 false verification failures
- 100% signature verification success rate

**Transparency Metrics:**
- Public verification page load time < 2s
- All auctions have complete proof data
- Verification instructions clear to 95% users

**Performance Metrics:**
- Winner decision latency < 1s (excluding Random.org)
- Database writes < 100ms
- Verification page queries < 50ms

## 🔗 External Resources

- [Random.org Signed API Documentation](https://api.random.org/json-rpc/4/signed)
- [Random.org Signature Verification](https://api.random.org/verify)
- [SHA-256 Online Calculator](https://emn178.github.io/online-tools/sha256.html) - For manual verification
- [Provably Fair Gaming](https://en.wikipedia.org/wiki/Provably_fair_algorithm)

## ⚠️ Important Notes

### Critical Implementation Requirements

1. **Deterministic Hashing** - JSON serialization MUST be consistent across all platforms
2. **Secure Secret Storage** - Server secret must be properly secured (env vars minimum, HSM recommended)
3. **HTTPS Everywhere** - All communication must use TLS
4. **Input Validation** - Sanitize all user inputs
5. **Rate Limiting** - Protect Random.org API quota

### Known Limitations

- **Single Point of Trust**: System relies on Random.org trustworthiness
- **Rate Limits**: Random.org has request limits (1000/day free tier)
- **Latency**: ~500ms overhead from Random.org API call
- **Cost**: Paid tier needed for high-volume usage

### Future Considerations

- **Multi-source randomness**: Combine Random.org + NIST Beacon + Bitcoin blocks
- **Blockchain anchoring**: Store proofs on immutable ledger
- **Decentralized alternative**: Chainlink VRF for complete trustlessness
- **Privacy mode**: Option to anonymize participant names

## 📞 Questions?

For implementation questions, refer to:
- Architecture details → [ARCHITECTURE.md](./ARCHITECTURE.md)
- Security concerns → [SECURITY-ANALYSIS.md](./SECURITY-ANALYSIS.md)

---

**Last Updated**: December 2025  
**Status**: Design Complete, Implementation Pending  
**Security Review**: ✅ Approved with recommendations

