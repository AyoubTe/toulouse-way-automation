# Setup

About one hour, no server needed. You need:

- an **n8n** instance (n8n Cloud or self-hosted) reachable from the internet;
- a **Google account** for the association: Google Sheets for the data, Gmail to send the emails.

---

## 1. Create the Google Sheet

1. In Google Drive: **New → File upload → `template/Toulouse_Way_base.xlsx`**.
2. Open it, then **File → Save as Google Sheets**. The copy that opens is a real Google Sheet; delete the `.xlsx` to avoid confusion. n8n cannot read an `.xlsx` file stored in Drive.
3. Copy the Sheet ID from its address: `https://docs.google.com/spreadsheets/d/`**`<SHEET_ID>`**`/edit`.

   Copy it from the address bar rather than retyping it: IDs mix `l` (lower-case L) and `I` (upper-case i), which look identical.
4. Do not rename the tabs or the column headers.

The Sheet has 8 tabs: `Parametres`, `Listes`, `Templates`, `Sessions`, `Inscriptions`, `Demandeurs`, `Contacts`, `MisesEnRelation`. They are described in [architecture.md](architecture.md#data-model). Rows marked *Exemple* are fictitious and can be deleted after testing.

---

## 2. Create the n8n credentials

In n8n: **Overview → Credentials → Create credential**.

| Name (suggested) | Type | Settings |
| --- | --- | --- |
| `Google Sheets – Toulouse Way` | Google Sheets OAuth2 API | Sign in with the Google account that owns the Sheet |
| `Gmail – Toulouse Way` | Gmail OAuth2 API | Sign in with the account that will send the emails, e.g. contact@… |
| `Espace gestion – Toulouse Way` | Header Auth | **Name** `X-TW-Auth` · **Value** `username:password` |

**Google sign-in:** on Google's consent screen, **tick every box**. If a box is left unticked, n8n can list the files in Drive but not read them, and every Sheets node fails with *"The resource you are requesting could not be found"*. To redo it, remove n8n's access at [myaccount.google.com/permissions](https://myaccount.google.com/permissions), then click **Reconnect** on the credential.

**Self-hosted n8n:** create an OAuth client first.

1. In Google Cloud Console, enable the Google Sheets, Google Drive and Gmail APIs.
2. Configure the OAuth consent screen and add yourself as a test user.
3. Create an OAuth client ID of type *Web application*, with the n8n redirect URL.
4. Paste the client ID and secret into both Google credentials.
5. Publish the consent screen, otherwise Google disconnects the credentials after 7 days.

**Management password:** the management space asks for the username and the password separately. With Value `gestion:Long-Password-2026`, sign in with `gestion` / `Long-Password-2026`. Don't put a colon in the username. To change the password, edit this credential; n8n hides the stored value.

---

## 3. Import the workflows

1. Build the workflows with your Sheet ID:

   ```bash
   TW_SHEET_ID=<SHEET_ID> npm run build:workflows
   ```

   Alternatively, search and replace `YOUR_GOOGLE_SHEET_ID` with your ID in the 7 files of `workflows/`.
2. In n8n: **Create workflow → ⋯ → Import from file**, once per file.
3. In each workflow, open the nodes showing a red warning and select the credential:
   - Google Sheets nodes → *Google Sheets – Toulouse Way*
   - Gmail nodes → *Gmail – Toulouse Way*
   - **Webhook API** node (workflow 7) → Authentication *Header Auth* → *Espace gestion – Toulouse Way*

   n8n usually applies a credential to the other nodes of the same type in that workflow.
4. **Check the column mapping.** If you change the *Document* field of a Google Sheets node, n8n resets its *Mapping Column Mode* to manual. Every node that writes (Append / Update / Append or Update) must use **Map Automatically**, and Update nodes must use **Column to Match On = `id`**. Workflow 3's *Mettre à jour les demandes* also matches on `id`.
5. **Save and Publish** (activate) all 7 workflows. Pages and email buttons only work on published workflows, so publish again after every change.

---

## 4. Fill in the settings

In the `Parametres` tab, or later from the management space:

| id | Value |
| --- | --- |
| `n8n_url` | Public address of your n8n, **without** a trailing `/`, e.g. `https://toulouseway.app.n8n.cloud` |
| `email_gestionnaire` | Address that receives the notifications |
| `logo_url`, `couleur_principale`, `couleur_encre`, `slogan`, `signature`, `pied_de_page` | Visual identity |
| `score_minimum`, `max_propositions` | Matching settings (50 and 3 by default) |

---

## 5. Test end to end

Use your own email addresses: replace those of the example contacts with yours first.

- [ ] Open `…/webhook/tw-gestion` and sign in. The dashboard shows the example data.
- [ ] Open `…/webhook/tw-demande`, choose 2 languages (one of them Arabic) and the job *Développeur·se logiciel*, then send. Expected: an acknowledgement with one section per language, a notification to the manager, and a row **Nouveau** in *Demandeurs*.
- [ ] Run workflow 3 manually (*Execute workflow*). Expected: the email *"mise(s) en relation à valider"*.
- [ ] Click **Valider** for a contact with consent. Expected: both people receive each other's details.
- [ ] Validate a proposal for a contact without consent. Expected: the consent email; **J'accepte** triggers the exchange and notifies the manager.
- [ ] Open `…/webhook/tw-agenda?lang=en` and register. Expected: a confirmation in English and a notification to the manager.
- [ ] Move a session to today + 3 days, run workflow 6 manually, then click *I can't make it* in the reminder. Expected: cancellation emails to the participant and the manager.
- [ ] Edit an email in **Emails**, save, and trigger it again. Expected: the new wording.

Workflows started by a webhook (1, 2, 4, 5, 7) can't be tested with *Execute workflow*: the editor would wait for a call to the *test* URL. Use the real pages and email buttons instead, and look at the **Executions** tab.

---

## Rebuilding from source

```bash
npm run build           # template/Toulouse_Way_base.xlsx + workflows/*.json
npm test                # logic tests of every Code node
npm run screenshots     # regenerates docs/images (needs Playwright + Chromium)
```

`seed/seed.js` holds the default settings, lists and the 41 email templates. `src/` holds the pages and the Code-node logic.
