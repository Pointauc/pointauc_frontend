# Random.org Signed Flow

## Core Concept

Random.org signed flow provides verifiable randomness through a ticketed system. Users pre-generate tickets before spinning the wheel, and these tickets are revealed during spin to produce cryptographically signed random numbers that can be independently verified.

## Ticket Lifecycle

1. **Unrevealed State**: Ticket is created when user selects signed mode. Contains ticket ID and creation timestamp. Random number not yet generated.

2. **Revealed State**: Ticket is revealed when spin executes. Random.org generates the random number, signs it, and returns completion timestamp. This data proves the randomness was fairly generated.

## User Data Flow

**Selection Phase**:

- User selects "Random.org (Signed & Verifiable)" from randomness source dropdown
- System checks for active ticket via API
- If no ticket exists, system automatically creates one
- Ticket card displays with ticket ID and creation time

**Spinning Phase**:

- User clicks spin button
- System sends participant list and ticket ID to Random.org API
- API returns signed random data with completion timestamp
- Random number determines wheel winner

**Reveal Phase**:

- Revealed timestamp and random number display in ticket card
- For runtime dropout wheel: revelation deferred until final elimination spin completes

## Special Handling

**Dropout Wheel (Runtime Variant)**: Multiple spins occur as participants are eliminated one by one. Random number and reveal timestamp are hidden until the final spin completes to maintain suspense throughout the elimination process.

**Restricted Wheels**: Battle Royal and runtime dropout wheels disable signed randomness option due to multi-step random generation requirements incompatible with single-ticket flow.
