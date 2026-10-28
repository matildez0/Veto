# Veto: company catalogue

The catalogue tells Veto who a sender is and where to send a privacy request: the company's name, the domains it sends email from, its area on the exposure map and its published privacy contact. The format is defined in [DATA_CONTRACTS.md, Section 7](../DATA_CONTRACTS.md#7-catalogue-file).

| File | What it is |
|---|---|
| `catalogo.json` | The catalogue the app uses. Generated; do not edit by hand. |
| `empresas_pt.json` | Portuguese companies checked by the team. Edit this one. |
| `importar_datenanfragen.py` | Builds `catalogo.json` from the two sources. |

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
```

The script prints how many records were imported and why the others were left out. Run it before each release, and check the diff of `catalogo.json` in the pull request.

## Adding a Portuguese company

1. Open the company's privacy policy on its own website. Do not use third-party sites, directories or old copies.
2. Copy the privacy contact exactly: the email of the Data Protection Officer (Encarregado de Proteção de Dados) or the address the policy gives for exercising rights, or the web form.
3. Add an entry to `empresas_pt.json` with `privacyUrl` set to that page and `verifiedAt` set to today's date.
4. Use `notes` for what the user needs to know: the policy date, other channels, what to choose in a form.
5. Run the script and open a pull request.

If a company has no email and no web form (only branches, phone or letters), leave it out and add it to the list below.

## Still to check

These companies are common in Portuguese inboxes but are not in the catalogue yet:

- **Checked, no digital channel:** Caixa Geral de Depósitos (Caixadirecta, a branch, or a letter to the Data Protection Officer at Av. João XXI, 63, 1000-300 Lisboa) and Millennium bcp (a letter to the Data Protection Officer at Av. Prof. Dr. Cavaco Silva, Tagus Park, Edf. 4, n.º 26, 2740-256 Porto Salvo, or the general contacts).
- **Website blocks automatic reading, check by hand:** Vodafone Portugal (privacy portal at privacidade.vodafone.pt).
- **Contact shown only as an image:** Universidade do Minho.
- **Privacy page only loads with JavaScript, check by hand:** OLX (help.olx.pt/olxpthelp/s/privacy-policy), Vinted, Radio Popular.
- **Contact hidden or missing on the page:** Wook and Bertrand (Porto Editora hides the email behind a protection script), Ticketline (only the customer service address), McDonald's Portugal (contact in a country addendum that is not published as text), KuantoKusta and Goldenergy (pages did not load).
- **Not checked yet:** Ageas, Iberdrola, EPAL, NOWO, Farmácias Portuguesas, Unilabs, Luz Saúde, Intermarché, Telepizza, Too Good To Go, Nespresso, Klarna, Segurança Social, ePortugal, Indeed, Medium, Net-Empregos, FlixBus, Carris.

Datenanfragen records are kept as published there; the team has not re-checked each one. The app always shows their source and date.

## Giving back

Datenanfragen has very few Portuguese companies. Once a record in `empresas_pt.json` has been confirmed by testers, consider submitting it to their repository, so other projects can use it too.

## How the prototype uses it

The web prototype loads `../catalogo/catalogo.json` (or a `catalogo.json` next to the page) when it starts, from the same site, so no third party sees the request.

- A sender whose domain is in the catalogue gets that company's name, area and contact. All its domains are grouped into one company (`edp.pt` and `edp.com` are both EDP).
- The company's details show where the contact comes from: "checked by the Veto team on [date]" or "registered in the Datenanfragen.de database, updated on [date]", with a link to the source.
- Companies that only accept a web form open that form, and the request text is copied so the user can paste it.
- Outside the catalogue, Veto never guesses an address: before the request, it asks the user to find the email in the company's privacy policy (with a search link) and type it in.
- Results saved by older versions are updated when the catalogue loads; guessed `privacy@…` addresses are removed.

To test it locally, serve the `mvp` folder (`python3 -m http.server` inside `mvp/`) and open `/prototipo/`. Serving only `mvp/prototipo/` hides the catalogue.

## Not done yet

- **Signature.** The contract says the published catalogue is signed, so the app can check it has not been changed. The script does not sign it yet.
