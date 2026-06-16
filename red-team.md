# Red-Team Report: VerityChain

## **What it is**

VerityChain is a Next.js/TideCloak demo application for election-observation field reports. Users authenticate with TideCloak, submit reports encrypted client-side via `doEncrypt`, and later decrypt them via `doDecrypt`. The app stores report ciphertext in browser `localStorage`, not in a server database. It also includes a Tide DPoP helper endpoint and one protected API route.

**Assumed attacker model:** privileged insider with root on the application server and/or database. Findings also note rogue admin, supply-chain, replay, MiTM, client-bundle, and inherited Tide platform residuals.

**Separation of responsibility:**

- **Tide/TideCloak can protect:** token signing, embedded JWKS verification when correctly used, Tide identity binding, client-side E2EE operations, DPoP support, and Tide-side IGA/change-set controls.
- **The application must protect:** route coverage, server-side authorization, DPoP enforcement at APIs, Forseti/policy gating, production secrets/configuration, CSP/SRI for the main app, and safe deployment practices.

## **Posture verdict**

**Mixed / demo-grade.** The app uses TideCloak primitives in important places, including SDK token verification on one API route and a DPoP helper page with pinned CSP. However, the main application pages are not server-side protected, DPoP is not enforced on the protected API, Forseti/policy-governed access is absent, encryption is self-scoped rather than oversight-quorum scoped, and production hardening is incomplete. A server/DB-root attacker cannot read report plaintext from a server database because reports are stored as client-side ciphertext, but the attacker can still alter the client bundle, weaken future encryption flows, exfiltrate plaintext after decryption, or bypass unprotected UI routes.

## **Findings**

### F-01 — Main application routes are not server-side protected

- **Threats:** T-09 server-side JWT verification, T-03 rogue admin, T-02 server compromise
- **Traditional outcome + severity:** **High.** A user can request `/home`, `/submit-report`, `/view-reports`, `/mission`, and `/incidents` without middleware enforcement. Some pages rely on client-side `token` checks, and `/incidents` contains no Tide auth hook at all.
- **Tide neutralization:** TideCloak can validate tokens when the app routes traffic through the server-side middleware or `verifyTideCloakToken`. Tide does **not** automatically protect routes the app leaves outside the middleware matcher.
- **Mechanism:** Middleware only matches `/protected` and `/protected/:path*`, while the user-facing app routes are separate pages.
- **Evidence:**
  - Middleware only protects `/protected`: `middleware.ts:36-38`
  - Middleware role gate uses only `/protected`: `middleware.ts:8-13`
  - `/incidents` is a client page with hard-coded incident data and no Tide auth hook: `app/incidents/page.tsx:1`, `app/incidents/page.tsx:18-23`
  - `/mission` reads `token` client-side but has no server-side route protection: `app/mission/page.tsx:23-31`
  - `/view-reports` decrypts after a client-side `token` check: `app/view-reports/page.tsx:19-29`
- **Residual:** Even if Tide tokens are cryptographically valid, unprotected Next.js pages can still be served to unauthenticated users. Sensitive server data is limited here because reports are client-local, but production pages/API routes must be covered by middleware or server-side checks.

---

### F-02 — Server-side JWT verification exists, but coverage and role policy are weak

- **Threats:** T-09 server-side JWT verification, T-03 rogue admin
- **Traditional outcome + severity:** **Medium.** The app correctly demonstrates server-side token verification on `/api/protected`, but the allowed role is `offline_access`, which the code comments describe as granted to every authenticated user. This is authentication, not meaningful application authorization.
- **Tide neutralization:** TideCloak SDK verification can neutralize forged or expired JWTs when invoked with embedded JWKS. The provided `tidecloak.json` embeds a public JWK. However, the application source does not directly show `createLocalJWKSet`; verification is delegated to `@tidecloak/nextjs`.
- **Mechanism:** `/api/protected` extracts a bearer token and calls `verifyTideCloakToken(tcConfig, token, [ALLOWED_ROLE])`.
- **Evidence:**
  - Protected API imports TideCloak verifier: `app/api/protected/route.ts:1-3`
  - API requires `Authorization: Bearer`: `app/api/protected/route.ts:8-16`
  - API calls `verifyTideCloakToken`: `app/api/protected/route.ts:18-20`
  - Role is `offline_access`: `app/api/protected/route.ts:5`
  - Middleware comment says `offline_access` is granted to every authenticated user: `middleware.ts:9-12`
  - Embedded JWK is present in config: `tidecloak.json:1`
- **Residual:** The app does not itself evidence `createLocalJWKSet` versus `createRemoteJWKSet`; this must be confirmed in the SDK implementation or locked by dependency review. Also verify issuer, azp/audience, exp, and iat enforcement in the SDK. Application authorization should use real realm/client roles, not `offline_access`.

---

### F-03 — DPoP helper is present, but protected API does not enforce DPoP proof

- **Threats:** T-05 token replay / DPoP, T-02 server compromise, T-06 MiTM
- **Traditional outcome + severity:** **High.** The app serves a Tide DPoP helper page, but `/api/protected` accepts a bearer token and does not require or verify a DPoP proof header. If an access token is stolen, the API code shown does not independently bind the request to a DPoP key.
- **Tide neutralization:** Tide provides a DPoP flow and helper page. That helps bind browser sessions where the SDK and server enforce the binding. Tide does not protect APIs that only verify bearer tokens.
- **Mechanism:** The DPoP page retrieves a key from IndexedDB, signs a challenge, and posts the public key/signature back to the opener. The API route only checks `Authorization: Bearer` and calls token verification.
- **Evidence:**
  - DPoP route serves the helper HTML: `app/tide_dpop/[...path]/route.ts:16`, `app/tide_dpop/[...path]/route.ts:23-31`
  - DPoP route pins inline script/style via CSP hashes: `app/tide_dpop/[...path]/route.ts:18-21`
  - Helper reads DPoP state from IndexedDB: `public/tide_dpop_auth.html:151-176`
  - Helper validates opener origin for challenge messages: `public/tide_dpop_auth.html:193-196`
  - Helper signs challenge and returns public key/signature: `public/tide_dpop_auth.html:211-227`
  - Protected API only checks bearer authorization: `app/api/protected/route.ts:8-20`
- **Residual:** DPoP support is incomplete unless every sensitive resource endpoint verifies proof-of-possession: method, URL, nonce/jti, iat, access-token hash, and public-key binding. Token replay risk remains for APIs that accept bearer-only tokens.

---

### F-04 — Forseti / policy-governed access control is absent; E2EE is self-scoped

- **Threats:** T-10 Forseti policy gating, T-01 DB breach, T-02 server compromise, T-03 rogue admin
- **Traditional outcome + severity:** **High.** The UI claims that only an “oversight quorum” can unseal reports, but the code uses `doEncrypt`/`doDecrypt` with a single tag and realm roles for self-encrypt/self-decrypt. No Forseti policy, quorum, or policy-governed decrypt path is present in the app files.
- **Tide neutralization:** Tide E2EE can protect report plaintext from server/DB insiders when ciphertext only is stored. Tide policy/Forseti controls would be needed for quorum-governed decryption. The application currently uses self-decryption semantics.
- **Mechanism:** Reports are encrypted client-side with `doEncrypt([{ data, tags: [TAG] }])`, stored as ciphertext in `localStorage`, and decrypted client-side with `doDecrypt([{ encrypted, tags: [TAG] }])`.
- **Evidence:**
  - Submit path uses `doEncrypt`: `app/submit-report/page.tsx:29`, `app/submit-report/page.tsx:42-51`
  - Ciphertext is stored in `localStorage`: `app/submit-report/page.tsx:64-72`
  - Home page uses `doDecrypt`: `app/home/page.tsx:24`, `app/home/page.tsx:34-40`
  - View reports decrypts local ciphertext: `app/view-reports/page.tsx:19`, `app/view-reports/page.tsx:29-43`
  - Realm grants default self-encrypt/self-decrypt roles: `init/realm.json:15-22`, `init/realm.json:23-32`
  - UI claims oversight quorum: `app/home/page.tsx:72-75`
- **Residual:** A server/DB-root attacker does not get plaintext from a server database in this design, but a compromised client bundle or malicious browser environment can capture plaintext before encryption or after decryption. Policy-governed access remains unimplemented.

---

### F-05 — Client-bundle integrity is not enforced site-wide

- **Threats:** T-14 client-bundle SRI/CSP, T-02 server compromise, T-04 supply chain
- **Traditional outcome + severity:** **High.** Because encryption and decryption occur in the browser, client-bundle integrity is critical. The DPoP helper route has CSP hashes, but the main Next.js app has no global CSP, SRI, Trusted Types, or script restrictions configured in `next.config.js`.
- **Tide neutralization:** Tide E2EE protects data only if the delivered client code honestly calls `doEncrypt`/`doDecrypt` and does not exfiltrate plaintext. Tide cannot prevent a compromised app server from serving malicious JavaScript unless the app deploys integrity controls.
- **Mechanism:** Empty Next config; no headers configured for the main app. Only the DPoP helper has a route-specific CSP.
- **Evidence:**
  - `next.config.js` is empty: `next.config.js:1-4`
  - DPoP route has CSP only for `/tide_dpop/...`: `app/tide_dpop/[...path]/route.ts:18-31`
  - Root layout wraps all pages in TideCloak provider but does not set CSP/SRI: `app/layout.tsx:21-25`
- **Residual:** A root server attacker or compromised CI/CD pipeline can ship JavaScript that steals plaintext, tokens, or decrypted reports. E2EE reduces database blast-radius but does not eliminate malicious-client risk.

---

### F-06 — Production secrets/configuration are unsafe if defaults are reused

- **Threats:** T-01 DB breach, T-02 server compromise, T-03 rogue admin, T-06 MiTM
- **Traditional outcome + severity:** **Medium.** The init script defaults to `KC_USER=admin` and `KC_PASSWORD=password`, uses HTTP localhost defaults, and sources `.env.example`. This may be acceptable for local demo setup but is unsafe if copied to production.
- **Tide neutralization:** TideCloak admin tokens and IGA/change-set workflows can reduce unauthorized admin changes when properly configured. Tide does not protect deployments that use default admin passwords or non-TLS URLs.
- **Mechanism:** Initialization obtains an admin token via password grant and uses it to create/modify realms.
- **Evidence:**
  - Defaults include HTTP URLs and `KC_PASSWORD=password`: `init/tcinit.sh:27-33`
  - Script sources `.env.example`: `init/tcinit.sh:15-24`
  - Admin token is obtained with username/password grant: `init/tcinit.sh:72-79`
  - Realm setup/admin endpoints are called with the admin bearer token: `init/tcinit.sh:136-147`
  - Config uses localhost HTTP in generated TideCloak config: `tidecloak.json:1`
- **Residual:** Root server compromise can read env files, scripts, generated config, and logs. Production must use unique secrets, TLS-only issuer URLs, secret management, least-privilege admin accounts, and no password-grant bootstrap path after setup.

---

### F-07 — Supply-chain versions are floating

- **Threats:** T-04 supply chain, T-14 client-bundle integrity
- **Traditional outcome + severity:** **Medium.** Dependencies use broad ranges such as `next: 16.x`, `react: 19.x`, and `@tidecloak/nextjs: ^0.13.32`. This can admit unreviewed minor/patch changes, including security-relevant auth or crypto behavior.
- **Tide neutralization:** Tide SDKs can provide correct primitives, but the application must pin, review, and attest the exact SDK and framework versions it deploys.
- **Mechanism:** Floating semver ranges in `package.json`.
- **Evidence:**
  - Floating Next/React/TideCloak dependencies: `package.json:12-17`
- **Residual:** A compromised registry package, dependency confusion, or unreviewed update can alter auth, DPoP, or encryption behavior. Use lockfiles, provenance, SBOM, CI verification, and pinned versions.

---

### F-08 — Local report indexing is inconsistent and can mix users on a shared browser

- **Threats:** T-01 local data exposure, T-03 shared-device misuse, T-12 inherited endpoint/browser residual
- **Traditional outcome + severity:** **Medium.** Submitted reports are stored under either an existing `vc-reports:*` key or `vc-reports:demo`, while view logic scans all `vc-reports:*` keys. Decryption failures are ignored, but metadata and ciphertext from multiple users can coexist and be enumerated in the same browser profile.
- **Tide neutralization:** Tide E2EE prevents users without decrypt rights from reading ciphertext contents. It does not hide local metadata, report IDs, timestamps, storage keys, or the existence/count of reports.
- **Mechanism:** Submit code does not reliably derive the storage key from the authenticated user’s VUID; view code scans all report keys.
- **Evidence:**
  - Submit path falls back to `vc-reports:demo`: `app/submit-report/page.tsx:53-62`
  - Report IDs/timestamps/ciphertext are stored locally: `app/submit-report/page.tsx:64-72`
  - View path scans all `vc-reports:*` keys: `app/view-reports/page.tsx:27-30`
  - Decrypt failures are swallowed: `app/view-reports/page.tsx:38-43`
- **Residual:** On shared or compromised endpoints, ciphertext and metadata remain exposed. Browser compromise can still access plaintext during active decrypt.

---

## **App-responsibility checklist**

| Control | Status | Evidence | Notes |
|---|---:|---|---|
| **T-09 server-side JWT verification with embedded JWKS** | **FAIL / partial** | API calls `verifyTideCloakToken`: `app/api/protected/route.ts:18-20`; embedded JWK exists: `tidecloak.json:1`; middleware protects only `/protected`: `middleware.ts:36-38` | Server-side verification exists for one API and `/protected`, but main app routes are not covered. App source does not directly evidence `createLocalJWKSet` versus `createRemoteJWKSet`; verification is delegated to SDK. Confirm `iss`, `azp`/audience, `exp`, and `iat` enforcement in SDK. |
| **Avoid client-only role checks** | **FAIL** | Client pages use `token` and local logic: `app/mission/page.tsx:23-31`, `app/view-reports/page.tsx:19-29`; `/incidents` has no auth hook: `app/incidents/page.tsx:1`, `app/incidents/page.tsx:18-23` | Route authorization must be enforced server-side for protected pages/data. |
| **T-05 DPoP** | **FAIL / partial** | DPoP helper served: `app/tide_dpop/[...path]/route.ts:23-31`; helper signs challenge: `public/tide_dpop_auth.html:211-227`; API accepts bearer-only token: `app/api/protected/route.ts:8-20` | DPoP setup exists, but resource-server DPoP proof verification is not shown. |
| **T-10 Forseti / policy gating** | **FAIL** | Self roles in realm: `init/realm.json:15-22`, `init/realm.json:23-32`; app encrypts/decrypts with one tag: `app/submit-report/page.tsx:42-51`, `app/view-reports/page.tsx:38-43` | No policy/quorum/Forseti checks found. |
| **Secrets at rest / production config** | **FAIL for production** | Default admin password and HTTP URLs: `init/tcinit.sh:27-33`; password grant token bootstrap: `init/tcinit.sh:72-79`; HTTP config: `tidecloak.json:1` | Public client/JWK are not secrets, but bootstrap/admin defaults must not ship to production. |
| **E2EE: `doEncrypt` / `doDecrypt`** | **PASS for self-E2EE; FAIL for claimed quorum E2EE** | `doEncrypt`: `app/submit-report/page.tsx:29`, `app/submit-report/page.tsx:42-51`; `doDecrypt`: `app/home/page.tsx:24`, `app/home/page.tsx:34-40`; self roles: `init/realm.json:15-22` | Self-encryption is implemented. Policy-governed/quorum decryption is not. |
| **T-14 client-bundle SRI/CSP** | **FAIL / partial** | Empty Next config: `next.config.js:1-4`; DPoP-specific CSP only: `app/tide_dpop/[...path]/route.ts:18-31` | DPoP helper has pinned CSP; main app does not. |
| **Unauthenticated setup/admin routes** | **PASS for app routes observed; residual in init tooling** | No Next.js setup/admin route present in provided files; init admin calls use bearer token: `init/tcinit.sh:136-147` | No unauthenticated app setup/admin route was found, but bootstrap defaults are risky if exposed or reused. |

## **Breach blast-radius**

### Exposed under server or DB-root compromise

- **Client bundle integrity:** A root server attacker can alter Next.js JavaScript and exfiltrate future plaintext before encryption or after decryption because the main app lacks site-wide CSP/SRI. Evidence: `next.config.js:1-4`.
- **Bearer-token replay surface:** `/api/protected` accepts bearer tokens without shown DPoP proof enforcement. Evidence: `app/api/protected/route.ts:8-20`.
- **Route access coverage:** Main pages are outside middleware protection. Evidence: `middleware.ts:36-38`.
- **Operational secrets/config:** Init defaults include `admin/password` and HTTP local URLs. Evidence: `init/tcinit.sh:27-33`.
- **Metadata/local ciphertext:** Browser `localStorage` contains report IDs, timestamps, and ciphertext; metadata remains visible on the endpoint. Evidence: `app/submit-report/page.tsx:64-72`.

### Protected or reduced by Tide / app design

- **Server database plaintext:** No server-side report database is shown. Reports are encrypted client-side and stored as ciphertext in browser `localStorage`. Evidence: `app/submit-report/page.tsx:42-51`, `app/submit-report/page.tsx:64-72`.
- **JWT forgery where server checks are used:** `/api/protected` and `/protected` middleware invoke TideCloak server-side verification. Evidence: `app/api/protected/route.ts:18-20`, `middleware.ts:7-13`.
- **DPoP helper page integrity:** The DPoP helper route has a route-specific CSP with inline hashes. Evidence: `app/tide_dpop/[...path]/route.ts:18-31`.
- **Self-E2EE confidentiality:** Users without decrypt authorization should not read ciphertext contents via normal Tide decrypt flows. Evidence: `app/view-reports/page.tsx:38-43`, `init/realm.json:15-22`.

## **Residual risk**

- **T-12 / endpoint and browser compromise:** A compromised observer device, browser extension, or XSS-capable client context can read plaintext at capture/decrypt time. Tide E2EE reduces server-side exposure but does not remove endpoint risk.
- **T-15 / operational and availability residuals:** Tide/ORK availability, quorum operation, account lifecycle, and deployment operations remain dependencies. The app should define outage and recovery behavior.
- **T-18 / cryptographic implementation residuals:** Correctness depends on the Tide SDK, browser WebCrypto, key storage, and exact dependency versions. Pin and audit `@tidecloak/nextjs`.
- **T-19 / metadata leakage:** Report existence, counts, timestamps, routes visited, localStorage keys, issuer/client IDs in DPoP paths, and traffic patterns may remain visible even when content is encrypted.
- **T-20 / recovery, governance, and lifecycle residuals:** User recovery, admin governance, role assignment, key rotation, policy updates, and deprovisioning must be handled outside the shown app logic.
- **T-04 supply chain:** Floating dependencies and lack of bundle integrity leave meaningful residual risk.
- **T-06 MiTM:** Local HTTP config is acceptable for development only; production must enforce HTTPS, HSTS, secure cookies, and strict issuer origins.
- **T-01/T-02 privileged insider:** Tide E2EE can limit database plaintext exposure, but a server-root insider can still change code, steal future plaintext, harvest tokens if DPoP is not enforced, or alter UI behavior.
