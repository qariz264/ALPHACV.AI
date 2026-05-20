# Security Specification: AlphaCV AI

This specification details the Attribute-Based Access Control (ABAC) rules and data invariants protecting AlphaCV AI Firestore resources from data leaks and state bypass attacks.

## 1. Data Invariants
- **Owner Security**: A resume belongs to a single authenticated user (`userId`). No user may view, update, delete, or list any resume other than their own.
- **Payment Link**: A payment record is bound to a single user (`userId`) and a specific resume (`resumeId`).
- **Paywall Protection**: Free users can perform AI edits, modifications, and preview their resumes, but absolute access to clean downloads and watermark-removal requires authorization flags (`hasPaid = true`), which should be set upon successful Paystack payment verification.
- **ID Safety**: Resume IDs and Payment IDs must match the typical alphanumeric format (`^[a-zA-Z0-9_\-]+$`) and never exceed 128 characters to guard against Resource Poisoning and ID spoofing.
- **Temporal Integrity**: Saved and modified dates must align with the server timestamp (`request.time`).

## 2. The "Dirty Dozen" Poison Payloads

The following payloads represent malicious attempts to bypass state transition rules or escalate access. All must be rejected (`PERMISSION_DENIED` / rules validation failure):

### Resume Exploit Scenarios
1. **PII Reader Hijack**: Attacker tries to read a `/resumes/{resumeId}` document owned by another user.
2. **Identity Spoofing (Create)**: Attacker attempts to create a resume with a custom `userId` representing a different user (e.g., `userId: "root_admin"`).
3. **Identity Spoofing (Update)**: Attacker attempts to update a valid resume of another user by overwriting the `userId` of the target document.
4. **CreatedAt Tampering**: Attacker attempts to alter the immutable `createdAt` field on resume updates.
5. **Direct Monetization Bypass**: Unpaid user attempts to write `hasPaid = true` directly to their resume document without paying.
6. **Denial-of-Wallet (DOW) String Bomb**: Attacker sends a resume description with a `jobTitle` string exceeding 20Kb to exhaust storage.
7. **Malformed ID Injection**: Malicious user injects a 2KB junk character string containing SQL/HTML vectors as a resume ID.
8. **Anarchic Format**: Attacker supplies `workExperience` as a string instead of a structured array containing elements.

### Payment Exploit Scenarios
9. **Direct Payment Hijack**: Attacker tries to read a `/payments/{paymentId}` document belonging to another user's business transactions.
10. **Transaction Amount Inflation**: Attacker creates a database transaction log claiming they paid $10,000 to trick business logic, with a randomized status `success`.
11. **Spoofed Reference Overwrite**: Attacker tries to update an existing payment's unique `reference` with custom properties.
12. **Double Spending**: Attacker attempts to bind a single transaction reference to multiple distinct resumes.

## 3. Firestore Rules Structure
A fortress security system is configured in `/firestore.rules` containing helper validations:
- `isValidId(id)`: checks ID size and pattern.
- `isValidResume(data)`: validates typing, boundaries, and fields strictly.
- `isValidPayment(data)`: guarantees clean transaction logs.
- `allow update`: utilizes Action-based updates to divide fields editable by client from paid variables.
