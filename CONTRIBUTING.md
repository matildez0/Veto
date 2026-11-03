# Contributing to Veto

## Branches

`main` is what users see: GitHub Pages publishes the prototype from it. Nobody pushes to `main` directly; every change goes through a pull request.

Create one branch per issue, from an up-to-date `main`, named after the kind of change:

| Prefix | For | Example |
|---|---|---|
| `feat/` | A new feature | `feat/daily-limit` |
| `fix/` | A bug fix | `fix/form-contact-copy` |
| `docs/` | Documents only | `docs/security-october-decisions` |
| `chore/` | Setup, tools, dependencies | `chore/ci-checks` |

Use short names in English, in lower case, with hyphens. Delete the branch after it is merged.

## Commits

Write a short message that says what the commit does, starting with a verb: "Add the daily request limit", "Fix accents in batch emails". Mention the issue when there is one: "Add the daily request limit (#10)".

## Pull requests

1. Open the pull request against `main` and fill in the template.
2. Write `Closes #<number>` in the description, so the issue closes when the pull request is merged.
3. The automatic checks must pass (lint, formatting and types for the app; syntax for the prototype).
4. Another team member reviews and approves it before the merge.
5. For changes to the prototype, test locally before asking for review: from the `mvp` folder, run `python3 -m http.server 8000` and open `http://localhost:8000/prototipo/`.

## Personal data and secrets

Veto is about protecting personal data, so the repository has to protect it too:

- Never commit real emails, email addresses, screenshots of a real inbox, Gmail tokens, `.env` files or OAuth client secrets. Test data is always fictional.
- The Google OAuth client ID is not a secret, but client secrets (`GOCSPX-…`) are: they never go in the code.
- A change to what Veto reads, stores or sends (a new permission, a new statistics event, anything that leaves the device) needs the agreement of the team and an update to [SECURITY_AND_PRIVACY.md](mvp/SECURITY_AND_PRIVACY.md), the [privacy policy](mvp/prototipo/privacidade.html) and, for statistics, [DATA_CONTRACTS.md](mvp/DATA_CONTRACTS.md).

## Repository settings (for the owner)

So that nobody, by mistake or with a stolen password, can publish a change to users or redirect requests to another address:

- Settings › Branches › add a rule for `main`: require a pull request with one approval. Do not mark the automatic checks as required: they only run when the app or the prototype changes, and GitHub would wait for them forever on pull requests that only change documents. A failed check shows in red on the pull request, and nobody merges it like that.
- Every member turns on two-factor authentication on GitHub.
