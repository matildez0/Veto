# Veto: company catalogue

The catalogue tells Veto who a sender is and where to send a privacy request: the company's name, the domains it sends email from, its area on the exposure map and its published privacy contact. The format is defined in [DATA_CONTRACTS.md, Section 7](../DATA_CONTRACTS.md#7-catalogue-file).

| File | What it is |
|---|---|
| `catalogo.json` | The catalogue the app uses. Generated; do not edit by hand. |
| `empresas_pt.json` | Portuguese companies checked by the team. Edit this one. |
| `importar_datenanfragen.py` | Builds `catalogo.json` from the two sources. |
| `assinar.mjs`, `catalogo.json.sig`, `catalogo.pub.json` | The group's signature (see below). |

## Sources

**Datenanfragen.de.** Most records come from the company database of [Datenanfragen.de](https://github.com/datenanfragen/data), a German non-profit, released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (public domain). We can use it freely; we credit them anyway. Only records that meet all of these are imported:

- quality `verified` or `tested` (records marked `scraped` were collected automatically and are left out);
- relevant to Portugal (`pt`) or to all countries (`all`), plus Amazon.es, which serves Portugal;
- a privacy email or a web form (records that only accept letters or fax are left out);
- not an advertising-only company (they do not send email to people, so they never appear in a scan).

For these records, `verifiedAt` is the date the record last changed in the Datenanfragen repository.

**Veto team.** `empresas_pt.json` holds Portuguese companies that Datenanfragen does not cover. Each contact was copied from the company's own privacy policy, and `privacyUrl` points to that page. For these records, `verifiedAt` is the date the team checked the page. When a Veto record and a Datenanfragen record share a domain, the Veto record wins.

## Updating the catalogue

```bash
git clone https://github.com/datenanfragen/data /tmp/datenanfragen
python3 importar_datenanfragen.py /tmp/datenanfragen empresas_pt.json catalogo.json
node assinar.mjs assinar
```

The script prints how many records were imported and why the others were left out. Run it before each release, and check the diff of `catalogo.json` in the pull request.

## Adding a Portuguese company

1. Open the company's privacy policy on its own website. Do not use third-party sites, directories or old copies.
2. Copy the privacy contact exactly: the email of the Data Protection Officer (Encarregado de Proteção de Dados) or the address the policy gives for exercising rights, or the web form.
3. Add an entry to `empresas_pt.json` with `privacyUrl` set to that page and `verifiedAt` set to today's date.
4. Use `notes` for what the user needs to know: the policy date, other channels, what to choose in a form.
5. Run the script, sign the catalogue (`node mvp/catalogo/assinar.mjs assinar`) and open a pull request.

If a company has no email and no web form (only branches, phone or letters), leave it out and add it to the list below.

## Still to check

These companies are common in Portuguese inboxes but are not in the catalogue yet:

- **Checked, no digital channel:** Caixa Geral de Depósitos (Caixadirecta, a branch, or a letter to the Data Protection Officer at Av. João XXI, 63, 1000-300 Lisboa) and Millennium bcp (a letter to the Data Protection Officer at Av. Prof. Dr. Cavaco Silva, Tagus Park, Edf. 4, n.º 26, 2740-256 Porto Salvo, or the general contacts).
- **Contact shown only as an image:** Universidade do Minho.
- **Privacy page only loads with JavaScript, check by hand:** OLX (help.olx.pt/olxpthelp/s/privacy-policy), Vinted, Radio Popular.
- **Contact hidden or missing on the page:** Wook and Bertrand (Porto Editora hides the email behind a protection script), Ticketline (only the customer service address), McDonald's Portugal (contact in a country addendum that is not published as text), KuantoKusta and Goldenergy (pages did not load).
- **Not checked yet:** NOWO, Farmácias Portuguesas, Luz Saúde, Intermarché, Telepizza, Too Good To Go, Nespresso, Klarna, Segurança Social, ePortugal, Indeed, Medium, Net-Empregos and FlixBus.

Datenanfragen records are kept as published there; the team has not re-checked each one. The app always shows their source and date.

## Giving back

Datenanfragen has very few Portuguese companies. Once a record in `empresas_pt.json` has been confirmed by testers, consider submitting it to their repository, so other projects can use it too.

## How the prototype uses it

The web prototype loads `../catalogo/catalogo.json` (or a `catalogo.json` next to the page) when it starts, from the same site, so no third party sees the request.

- If the group's public key is set in `app.js`, the catalogue is used only when its signature is valid (see below); otherwise, the user confirms every contact.
- A sender whose domain is in the catalogue gets that company's name, area and contact. All its domains are grouped into one company (`edp.pt` and `edp.com` are both EDP).
- The company's details show where the contact comes from: "checked by the Veto team on [date]" or "registered in the Datenanfragen.de database, updated on [date]", with a link to the source.
- Companies that only accept a web form open that form, and the request text is copied so the user can paste it.
- Outside the catalogue, Veto never guesses an address: before the request, it asks the user to find the email in the company's privacy policy (with a search link) and type it in.
- Results saved by older versions are updated when the catalogue loads; guessed `privacy@…` addresses are removed.

To test it locally, serve the `mvp` folder (`python3 -m http.server` inside `mvp/`) and open `/prototipo/`. Serving only `mvp/prototipo/` hides the catalogue.

## Signature: only the group can change the catalogue

The catalogue decides where requests go, so a changed contact would send people's requests to the wrong address. To stop that, the group signs `catalogo.json` with a private key that only the group has. The app checks the signature before using the catalogue: if someone changes the file without the key, the app does not use it and asks the user to confirm each contact instead. GitHub also checks the signature on every pull request.

The catalogue is public data, so it is signed, not encrypted: anyone can read it, but only the group can change it.

| File | What it is |
|---|---|
| `assinar.mjs` | Creates the keys, signs and checks. Needs only Node.js. |
| `catalogo.json.sig` | The signature of `catalogo.json`. |
| `catalogo.pub.json` | The group's public key. The same key is inside `mvp/prototipo/app.js`. |

**Once, by one person in the group:**

```bash
node mvp/catalogo/assinar.mjs chaves
```

This creates the private key outside the repository (`~/.veto/catalogo-privada.pem`; on Windows, `C:\Users\<name>\.veto\`), writes `catalogo.pub.json` and puts the public key in `app.js`. Keep a copy of the private key in a password manager shared by the group. **Never commit it.** If it is lost, create new keys and sign again; if it leaks, do the same at once.

**Every time `catalogo.json` changes** (after running the import script or editing it):

```bash
node mvp/catalogo/assinar.mjs assinar
```

Commit `catalogo.json` and `catalogo.json.sig` together. To check without signing: `node mvp/catalogo/assinar.mjs verificar`.

The signature uses ECDSA P-256 with SHA-256, which every browser can check (Web Crypto). Line endings are normalised before signing, so Git on Windows does not break it.

**What the signature does not cover.** In the web prototype, `app.js` (with the public key) comes from the same repository, so someone who can change `main` could also change the key. That is why `main` must also be protected: changes only through pull requests, approved by someone in the group (see [CONTRIBUTING.md](../../CONTRIBUTING.md)), with `.github/CODEOWNERS` requiring the group's approval for this folder. In the mobile app, the public key is built into the app, so the signature alone is enough.
