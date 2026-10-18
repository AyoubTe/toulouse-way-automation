"""Takes the documentation screenshots (docs/images) of the real pages, with fictitious demo data.
Run after: node tools/build-pages.js && node tools/demo-data.js && node tools/render-emails.js"""
import json, os, asyncio
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); os.chdir(ROOT)
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.async_api import async_playwright
DATA = json.load(open('build/demo.json'))
PRE = 'file://' + os.path.abspath('build/preview') + '/'
EM = 'file://' + os.path.abspath('build/emails') + '/'
OUT = 'docs/images'; os.makedirs(OUT, exist_ok=True)
LOGO = os.path.abspath('tools/logo_stub.png')  # stand-in logo: the real one is loaded from toulouseway.org in production

async def page(b, w, h=860):
    pg = await b.new_page(viewport={'width': w, 'height': h})
    await pg.route('https://www.toulouseway.org/**', lambda r: r.fulfill(path=LOGO))
    async def api(route):
        body = json.loads(route.request.post_data or '{}')
        if body.get('action') == 'load': return await route.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': True, 'data': DATA}))
        row = body.get('row', {}); row.setdefault('id', 'NEW-1')
        return await route.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': True, 'row': row}))
    await pg.route('**/tw-api', api)
    await pg.route('**/tw-demande-envoi', lambda r: r.fulfill(status=200, content_type='application/json', body='{"ok":true}'))
    await pg.route('**/tw-inscription-envoi', lambda r: r.fulfill(status=200, content_type='application/json', body='{"ok":true}'))
    return pg

async def shot(pg, name, full=False, clip=None):
    await pg.wait_for_timeout(250)
    await pg.screenshot(path=f'{OUT}/{name}.png', full_page=full, clip=clip)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---- Public request form
        pg = await page(b, 1280); await pg.goto(PRE + 'demande_en.html'); await shot(pg, '01-request-form', full=True)
        pg = await page(b, 390, 844); await pg.goto(PRE + 'demande_en.html')
        await pg.fill('#prenom', 'Karim'); await pg.fill('#nom', 'Example'); await pg.fill('#email', 'karim@example.org')
        await pg.locator('#ms-langues').scroll_into_view_if_needed()
        await pg.click('#ms-langues .ms-trigger'); await pg.fill('#ms-langues .ms-search', 'arab'); await pg.keyboard.press('Enter')
        await pg.fill('#ms-langues .ms-search', ''); await pg.click('#ms-langues .ms-opt[data-v=fr]'); await pg.click('#ms-langues .ms-opt[data-v=en]')
        await shot(pg, '02-request-languages-mobile')
        await pg.keyboard.press('Escape')
        await pg.click('#ms-metiers .ms-trigger'); await pg.fill('#ms-metiers .ms-search', 'dev'); await pg.wait_for_timeout(100)
        await shot(pg, '03-request-jobs-mobile')
        await pg.click('#ms-metiers .ms-opt[data-v=dev]'); await pg.keyboard.press('Escape')
        await pg.check('#rgpd'); await pg.click('#send'); await shot(pg, '04-request-sent-mobile')
        # ---- Public calendar
        pg = await page(b, 1280); await pg.goto(PRE + 'agenda_en.html'); await shot(pg, '05-calendar', full=True)
        pg = await page(b, 390, 844); await pg.goto(PRE + 'agenda_en.html'); await pg.click('[data-reg=S-001]')
        await pg.fill('#r-prenom', 'Amina'); await pg.fill('#r-nom', 'Example'); await pg.fill('#r-email', 'amina@example.org'); await pg.check('[name=rgpd]')
        await shot(pg, '06-registration-form-mobile')
        await pg.click('#rsend'); await shot(pg, '07-registration-done-mobile')
        # ---- Management space (desktop)
        pg = await page(b, 1440, 900); await pg.goto(PRE + 'admin.html'); await shot(pg, '10-admin-login')
        await pg.fill('#lu', 'gestion'); await pg.fill('#lp', 'demo'); await pg.click('#lbtn'); await pg.wait_for_timeout(400)
        await shot(pg, '11-admin-dashboard', full=True)
        await pg.hover('.seg.a >> nth=0'); await pg.wait_for_timeout(150); await shot(pg, '12-admin-chart-tooltip', clip={'x': 248, 'y': 270, 'width': 1192, 'height': 340})
        await pg.evaluate("location.hash='demandes'"); await pg.wait_for_timeout(300); await shot(pg, '13-admin-requests')
        await pg.click('tr[data-id=D-EX1]'); await pg.wait_for_timeout(400); await shot(pg, '14-admin-request-detail')
        await pg.click('#dm-c'); await pg.evaluate("location.hash='contacts'"); await pg.wait_for_timeout(300); await shot(pg, '15-admin-contacts')
        await pg.click('tr[data-id=C-EX2]'); await pg.wait_for_timeout(400)
        await pg.locator('#d-body').evaluate('e => e.scrollTop = e.scrollHeight'); await pg.wait_for_timeout(150); await shot(pg, '16-admin-contact-consent')
        await pg.click('#d-cancel'); await pg.evaluate("location.hash='sessions'"); await pg.wait_for_timeout(300); await shot(pg, '17-admin-sessions')
        await pg.click('tr[data-id=S-002]'); await pg.wait_for_timeout(300); await shot(pg, '18-admin-session-edit')
        await pg.click('[data-tab=ins]'); await pg.wait_for_timeout(200); await shot(pg, '19-admin-session-registrants')
        await pg.click('#d-cancel'); await pg.evaluate("location.hash='emails'"); await pg.wait_for_timeout(400)
        await pg.click('[data-cle=rappel_j3]'); await pg.wait_for_timeout(500); await shot(pg, '20-admin-email-editor', full=True)
        await pg.click('[data-cle=mise_en_relation_demandeur]'); await pg.wait_for_timeout(200); await pg.click('[data-lg=ar]'); await pg.wait_for_timeout(500)
        await shot(pg, '21-admin-email-arabic')
        await pg.evaluate("location.hash='parametres'"); await pg.wait_for_timeout(300); await shot(pg, '22-admin-settings', full=True)
        # ---- Management space (mobile)
        pg = await page(b, 390, 844); await pg.goto(PRE + 'admin.html'); await pg.fill('#lu', 'gestion'); await pg.fill('#lp', 'demo'); await pg.click('#lbtn'); await pg.wait_for_timeout(400)
        await shot(pg, '23-admin-dashboard-mobile')
        await pg.evaluate("location.hash='emails'"); await pg.wait_for_timeout(400); await shot(pg, '24-admin-emails-mobile')
        # ---- Emails and confirmation pages
        for name, w in [('demande_recue', 680), ('gestionnaire_nouvelle_demande', 680), ('gestionnaire_propositions', 680), ('accord_contact', 680),
                        ('mise_en_relation_demandeur', 680), ('mise_en_relation_contact', 680), ('gestionnaire_reponse_contact', 680),
                        ('inscription_confirmee', 680), ('gestionnaire_nouvelle_inscription', 680), ('rappel_j3', 680), ('rappel_j1', 680),
                        ('annulation_participant', 680), ('gestionnaire_annulation', 680),
                        ('page_validated', 760), ('page_contact_consent', 420), ('page_confirmed', 420), ('page_cancelled', 420)]:
            pg = await page(b, w, 700); await pg.goto(EM + name + '.html'); await shot(pg, 'email-' + name.replace('_', '-'), full=True); await pg.close()
        await b.close()
asyncio.run(main()); print('screenshots ok:', len(os.listdir(OUT)))
