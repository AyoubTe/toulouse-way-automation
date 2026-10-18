# Troubleshooting

The **Executions** tab of each workflow in n8n shows every run node by node, with the exact error.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| *"Credentials for Google Sheets are not set"* | Imported workflows aren't linked to your credentials | Open each node with a red warning and select the credential ([setup step 3](setup.md#3-import-the-workflows)) |
| *"The resource you are requesting could not be found"* on every Sheets node | The Google credential was granted without the Sheets permission, the ID is mistyped (`l`/`I`), or the file is still an `.xlsx` | Remove n8n's access at myaccount.google.com/permissions and reconnect, ticking every box; pick the document **From list**; use *File → Save as Google Sheets* |
| *"At least one value has to be added under 'Values to Send'"* | *Mapping Column Mode* was reset to manual after changing the document | Set **Map Automatically** (and *Column to Match On* = `id` for updates) |
| Page `…/webhook/tw-…` shows 404 | Workflow 1 not published | Publish it |
| Management space: *"Impossible de joindre le serveur"* | Workflow 7 not published | Publish it |
| Management space: *"Identifiant ou mot de passe incorrect"* | Header Auth value differs | Check `X-TW-Auth` = `username:password` in the credential |
| Buttons in emails lead to `VOTRE-INSTANCE…` or nowhere | `n8n_url` not set, or set with a trailing `/` | Fix it in Settings |
| The editor shows *"Waiting for you to call the Test URL"* | You clicked *Execute workflow* on a webhook workflow | Stop it; test through the real pages and email buttons |
| No reminder sent | Session date unreadable, `formation`/`session_id` mismatch, or reminder already timestamped | Use `AAAA-MM-JJ` dates; check `session_id`; clear `rappel_J3` / `rappel_J1` to resend |
| A request stays *Nouveau* | No available contact shares a job with it | Add contacts or jobs; the request moves to *À traiter manuellement* after the hourly run |
| Emails land in spam | New sending account | Send from the association's address; ask recipients to add it to their contacts |
| Page layout looks broken on a phone | Old version of workflow 1 | Re-import the latest `1_pages.json` |
