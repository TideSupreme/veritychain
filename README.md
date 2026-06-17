# VerityChain

## Why use it

Every year, 200 million voters in 70 countries have their elections observed by international monitors — the OSCE, the Carter Center, the African Union. These observers fan across thousands of polling stations, photographing tally sheets, documenting intimidation, capturing the evidence that can validate a government or trigger sanctions. And every single one of those reports goes through a single point of failure: the mission chief. One person who decides which evidence reaches the final report. One person who can edit, suppress, or spin every observation. The entire edifice of election integrity depends on a chain of custody where the person at the top holds all the keys.

We built VerityChain. A field observer photographs a ballot-box violation, fills out a report on their phone, and submits it. From that instant, the report is cryptographically sealed — encrypted to a policy that requires, say, any two of three oversight bodies to decrypt it. No one person can read it alone. No mission chief can delete it. No headquarters analyst can alter it. The middleman simply does not exist.

The reason only TideCloak makes this possible is the convergence of three primitives. First, doEncrypt seals every field report at the moment of capture under the observer's identity — the data is encrypted before it ever leaves the device, so the server physically cannot read what it stores. Second, IAMService.doEncrypt lets us encrypt the evidence under an M-of-N oversight policy — say, two out of three designated watchdog organizations must co-sign to unseal. A single rogue official cannot decrypt a report alone, no matter what access they have. Third, Forseti contracts enforce that the decryption rules are baked into the token itself — no server-side override, no admin backdoor. Without TideCloak, you'd need a trusted operator holding the decryption key, and that operator is exactly the vulnerability VerityChain eliminates. With TideCloak, the policy is the key, and no human controls it.

This is for every international observation mission, every domestic watchdog, every journalist documenting electoral fraud. A world where a whistleblower in Caracas or Nairobi can submit evidence knowing it cannot be suppressed — because the person who would suppress it was never given the power to begin with. The chain of custody is the cryptography itself.

That's VerityChain.

## What it is

A [Next.js](https://nextjs.org) app secured with [TideCloak](https://tidecloak.com) — decentralized identity where keys are split across a network, so **no single server (not even this app) ever holds a usable copy**. Login, sessions, and the app's sensitive data are protected by that model.

## Prerequisites

- **Node.js 20+**
- **Docker** (to run TideCloak locally)
- **`jq`** and **`curl`** (used by the init script)

## Run it locally

**1. Start TideCloak** (the public dev image — has a pre-configured entrypoint, do *not* append `start-dev`):

```bash
docker run -d --name tidecloak -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=password \
  tideorg/tidecloak-dev:latest

# wait until it answers:
until curl -sf http://localhost:8080 >/dev/null; do sleep 3; done
```

**2. Install and initialise** (the init script wires up TideCloak — see below):

```bash
cd app
npm install
npm run init
```

**3. Start the app:**

```bash
npm run dev
```

Open **http://localhost:3000**.

## Initialising TideCloak (what `npm run init` does)

`npm run init` runs [`init/tcinit.sh`](app/init/tcinit.sh) against your local TideCloak and:

- creates the **`nextjs-test`** realm and the **`myclient`** client,
- enables the **Tide IdP** and **IGA** (identity governance),
- creates an **`admin`** user and prints an account-link invite,
- writes the adapter config to **`tidecloak.json`**, which the app reads.

TideCloak admin console: **http://localhost:8080** (`admin` / `password`).

## Using it

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

---

Built on [TideCloak](https://tidecloak.com). The product story is in **[pitch.md](pitch.md)**.
