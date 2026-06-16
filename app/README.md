# VerityChain

## What it is

VerityChain is a cryptographic election observation platform. Field observers submit reports that are encrypted at the moment of capture using TideCloak's identity-based encryption. No mission chief, headquarters analyst, or server operator can read, alter, or suppress a sealed report. Only the observer's verified identity can decrypt it.

Built on TideCloak + Next.js.

## How to run

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000. Click "Continue with Tide" to authenticate against the configured TideCloak realm.

## Pages & features

| Route | Feature | Tide Primitive |
|---|---|---|
| `/` | Login — branded login with brand mark and value proposition | `useTideCloak().login()` |
| `/home` | Dashboard — navigation cards, recent reports list | `doDecrypt` to load stored reports |
| `/submit-report` | Submit Field Report — form encrypts report before storage | `doEncrypt` seals report under observer identity |
| `/view-reports` | My Reports — decrypts and displays all filed reports | `doDecrypt` restores plaintext for viewing |
| `/incidents` | Incident Map — demo incident log with severity levels | (plain feature, no Tide) |
| `/mission` | Mission Dashboard — stats overview and station checklist | (plain feature, no Tide) |

## What's mocked vs real

- **Real**: TideCloak authentication via `@tidecloak/nextjs` SDK (login, logout, DPoP-bound sessions)
- **Real**: `doEncrypt` / `doDecrypt` — actual TideCloak cryptographic operations encrypting and decrypting observer reports
- **Real**: Identity-bound encryption — only the encrypting user can decrypt; enforced by TideCloak tag-based access control
- **Mocked**: IAMService.doEncrypt (M-of-N oversight quorum) — declared in pitch as the production path; the current implementation uses self-encryption
- **Mocked**: Forseti contracts (policy-in-token enforcement) — declared in pitch; server-side policy enforcement is mocked
- **Mocked**: Server-side storage — reports persist in localStorage for demo purposes; production would sync ciphertext to a server
- **Mocked**: Incident data on /incidents page is static demo content