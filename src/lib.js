// ===== Toulouse Way – bibliothèque commune (emails, pages, utilitaires) =====
const TW = (() => {
  const DEFAULTS = {
    nom_asso: 'Toulouse Way', slogan: 'Mieux vivre ici, ensemble',
    couleur_principale: '#F26716', couleur_encre: '#12343B',
    logo_url: 'https://www.toulouseway.org/assets/logo.png', site_url: 'https://www.toulouseway.org',
    email_gestionnaire: 'contact@toulouseway.org', n8n_url: '', signature: "L'équipe Toulouse Way",
    pied_de_page: 'Toulouse Way · Association loi 1901 · Toulouse',
    score_minimum: '50', max_propositions: '3'
  };
  const RTL = ['ar', 'fa', 'he', 'ur'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const list = s => String(s ?? '').split(/[,;]/).map(x => x.trim()).filter(Boolean);
  const norm = s => String(s ?? '').trim().toLowerCase();
  const rnd = n => { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; for (let i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
  const uid = p => `${p}-${Date.now().toString(36).toUpperCase()}${rnd(3).toUpperCase()}`;
  const token = () => rnd(32);

  function params(rows) {
    const P = { ...DEFAULTS };
    for (const r of rows || []) if (r && r.id && String(r.valeur ?? '').trim() !== '') P[String(r.id).trim()] = String(r.valeur).trim();
    P.n8n_url = String(P.n8n_url).replace(/\/+$/, '');
    return P;
  }
  const link = (P, path, q) => `${P.n8n_url}/webhook/${path}` + (q ? '?' + Object.entries(q).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&') : '');

  // ---------- Dates (texte « AAAA-MM-JJ », JJ/MM/AAAA ou numéro de série Sheets) ----------
  function isoDate(v) {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number') { const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 864e5); return d.toISOString().slice(0, 10); }
    const s = String(v).trim(); let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return '';
  }
  const todayParis = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const nowParis = () => todayParis() + ' ' + new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' }).format(new Date());
  const daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
  function longDate(iso, lang) {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00Z');
    try { return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : (lang || 'fr') , { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d); }
    catch (e) { return iso; }
  }

  // ---------- Couleurs ----------
  function mix(hex, other, t) {
    const h = x => x.replace('#', '').padEnd(6, '0'); const a = h(hex), b = h(other);
    return '#' + [0, 2, 4].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t).toString(16).padStart(2, '0')).join('');
  }

  // ---------- Rendu d'un texte de template ----------
  // {{variable}} = valeur (échappée) · **gras** · [[Texte du bouton|variable_lien]] = bouton
  // Un bloc qui ne contient que {{details_...}} ou {{liste_...}} insère un encadré HTML.
  function button(P, label, url, quiet) {
    const c = P.couleur_principale;
    const style = quiet
      ? `display:inline-block;padding:11px 20px;margin:4px 8px 4px 0;border:2px solid ${c};color:${mix(c, '#000000', 0.25)};background:#ffffff;border-radius:999px;font-weight:700;text-decoration:none;font-size:15px`
      : `display:inline-block;padding:13px 22px;margin:4px 8px 4px 0;background:${c};color:#ffffff;border-radius:999px;font-weight:700;text-decoration:none;font-size:15px`;
    return `<a href="${esc(url)}" style="${style}">${esc(label)}</a>`;
  }
  function renderText(text, vars, P) {
    const html = {}; for (const k in vars) if (/^(details_|liste_)/.test(k)) html[k] = true;
    const blocks = String(text ?? '').replace(/\r/g, '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
    let nb = 0;
    return blocks.map(b => {
      const only = b.match(/^\{\{(\w+)\}\}$/);
      if (only && html[only[1]]) return vars[only[1]] || '';
      const buttonsOnly = /^(\s*\[\[[^\]]+\]\]\s*)+$/.test(b);
      let out = '', last = 0;
      const re = /\{\{(\w+)\}\}|\[\[([^\]|]+)\|(\w+)\]\]|\*\*(.+?)\*\*/g; let m;
      while ((m = re.exec(b))) {
        out += esc(b.slice(last, m.index)).replace(/\n/g, '<br>');
        if (m[1]) out += html[m[1]] ? (vars[m[1]] || '') : esc(vars[m[1]] ?? '');
        else if (m[2]) out += button(P, m[2].trim(), vars[m[3]] || '#', nb++ > 0);
        else out += '<strong>' + esc(m[4]).replace(/\{\{(\w+)\}\}/g, (_, k) => html[k] ? '' : esc(vars[k] ?? '')) + '</strong>';
        last = re.lastIndex;
      }
      out += esc(b.slice(last)).replace(/\n/g, '<br>');
      return buttonsOnly ? `<p style="margin:22px 0">${out}</p>` : `<p style="margin:0 0 16px">${out}</p>`;
    }).join('\n');
  }
  const fill = (text, vars) => String(text ?? '').replace(/\{\{(\w+)\}\}/g, (_, k) => /^(details_|liste_)/.test(k) ? '' : String(vars[k] ?? ''));

  // ---------- Choix des templates selon les langues ----------
  function pick(templates, cle, langs) {
    const rows = (templates || []).filter(t => norm(t.cle) === norm(cle) && String(t.contenu || '').trim());
    const by = {}; for (const t of rows) by[norm(t.langue)] = t;
    const found = []; for (const l of (langs || []).map(norm)) if (by[l] && !found.includes(by[l])) found.push(by[l]);
    if (!found.length) for (const l of ['fr', 'en']) if (by[l]) { found.push(by[l]); break; }
    if (!found.length && rows[0]) found.push(rows[0]);
    return found;
  }

  // ---------- Mise en page des emails ----------
  function layout(P, sections, preheader) {
    const c = P.couleur_principale, ink = P.couleur_encre;
    const body = sections.map((s, i) => {
      const rtl = RTL.includes(norm(s.lang));
      return `${i ? `<tr><td style="padding:0 36px"><div style="border-top:1px dashed ${mix(c, '#ffffff', 0.55)};margin:8px 0 0"></div></td></tr>` : ''}
<tr><td dir="${rtl ? 'rtl' : 'ltr'}" lang="${esc(s.lang)}" style="padding:28px 36px 12px;text-align:${rtl ? 'right' : 'left'};font-family:'Atkinson Hyperlegible',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:${ink}">${s.html}</td></tr>`;
    }).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(P.nom_asso)}</title></head>
<body style="margin:0;padding:0;background:#EEF2F2">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader || '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF2F2;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="padding:22px 36px 18px;border-bottom:4px solid ${c}">
  <a href="${esc(P.site_url)}" style="text-decoration:none"><img src="${esc(P.logo_url)}" alt="${esc(P.nom_asso)}" height="44" style="height:44px;max-width:220px;display:block;border:0"></a>
</td></tr>
${body}
<tr><td style="padding:12px 36px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${ink}">${esc(P.signature)}</td></tr>
<tr><td style="background:${ink};padding:20px 36px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#D8E3E4">
  <div style="color:#ffffff;font-weight:700;font-size:15px">${esc(P.slogan)}</div>
  <div style="margin-top:6px">${esc(P.pied_de_page)}</div>
  <div style="margin-top:6px"><a href="${esc(P.site_url)}" style="color:${mix(c, '#ffffff', 0.35)}">${esc(String(P.site_url).replace(/^https?:\/\//, ''))}</a></div>
</td></tr></table></td></tr></table></body></html>`;
  }

  // Construit un email {sujet, html} à partir d'une clé de template et d'une liste de langues
  function email(templates, cle, langs, vars, P) {
    const rows = pick(templates, cle, langs);
    if (!rows.length) throw new Error(`Template introuvable : ${cle}`);
    const sujets = [...new Set(rows.map(t => fill(t.sujet, vars).trim()).filter(Boolean))];
    const sections = rows.map(t => ({ lang: norm(t.langue), html: renderText(t.contenu, vars, P) }));
    return { sujet: sujets.slice(0, 2).join(' / '), html: layout(P, sections, fill(rows[0].sujet, vars)), langues: rows.map(t => norm(t.langue)) };
  }

  // ---------- Encadrés ----------
  function box(P, inner) {
    return `<div style="background:${mix(P.couleur_principale, '#ffffff', 0.9)};border-left:4px solid ${P.couleur_principale};border-radius:10px;padding:16px 18px;margin:6px 0 20px">${inner}</div>`;
  }
  const L = {
    fr: { date: 'Date', heure: 'Horaire', lieu: 'Lieu', lien: 'En ligne', intervenant: 'Animé par', type: 'Type', metiers: 'Métiers recherchés', langues: 'Langues', ville: 'Ville', parcours: 'Parcours', email: 'Email', tel: 'Téléphone' },
    en: { date: 'Date', heure: 'Time', lieu: 'Venue', lien: 'Online', intervenant: 'Led by', type: 'Type', metiers: 'Target jobs', langues: 'Languages', ville: 'City', parcours: 'Background', email: 'Email', tel: 'Phone' }
  };
  const lab = lang => L[norm(lang)] || L.fr;
  function rowsTable(rows) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.5">' +
      rows.filter(r => r[1]).map(([k, v]) => `<tr><td style="padding:3px 16px 3px 0;color:#4A6266;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:3px 0;vertical-align:top">${v}</td></tr>`).join('') + '</table>';
  }
  function sessionTitle(s, lang) { return (norm(lang) === 'en' && s.titre_en) ? s.titre_en : (s.titre || ''); }
  function detailsSession(P, s, lang) {
    const l = lab(lang), iso = isoDate(s.date);
    const h = s.heure_debut ? (s.heure_fin ? `${s.heure_debut} – ${s.heure_fin}` : s.heure_debut) : '';
    return box(P, `<div style="font-size:18px;font-weight:700;margin-bottom:8px">${esc(sessionTitle(s, lang))}</div>` + rowsTable([
      [l.date, esc(longDate(iso, lang))], [l.heure, esc(h)], [l.lieu, esc(s.lieu)],
      [l.lien, s.lien_visio ? `<a href="${esc(s.lien_visio)}" style="color:${P.couleur_principale}">${esc(s.lien_visio)}</a>` : ''],
      [l.intervenant, esc(s.intervenant)]
    ]) + (s.infos_pratiques ? `<div style="margin-top:10px">${esc(s.infos_pratiques)}</div>` : ''));
  }
  // Coordonnées d'un contact : sans libellés, donc lisible dans toutes les langues
  function detailsContact(P, c) {
    const lines = [
      `<div style="font-size:18px;font-weight:700">${esc(`${c.prenom || ''} ${c.nom || ''}`.trim())}</div>`,
      [c.poste, c.entreprise].filter(Boolean).length ? `<div>${esc([c.poste, c.entreprise].filter(Boolean).join(' · '))}</div>` : '',
      c.email ? `<div>✉️ <a dir="ltr" href="mailto:${esc(c.email)}" style="color:${P.couleur_principale};unicode-bidi:isolate">${esc(c.email)}</a></div>` : '',
      c.telephone ? `<div>📞 <a dir="ltr" href="tel:${esc(String(c.telephone).replace(/\s/g, ''))}" style="color:${P.couleur_principale};unicode-bidi:isolate">${esc(c.telephone)}</a></div>` : '',
      c.ville ? `<div>📍 ${esc(c.ville)}</div>` : ''
    ];
    return box(P, lines.join(''));
  }
  function libelles(listes, type, codes, lang) {
    const m = {}; for (const r of listes || []) if (norm(r.type) === type) m[norm(r.code)] = (norm(lang) === 'en' && r.libelle_en) ? r.libelle_en : (r.libelle_fr || r.code);
    return list(codes).map(c => m[norm(c)] || c).join(', ');
  }
  function detailsDemandeur(P, d, lang, listes, withContact) {
    const l = lab(lang);
    return box(P, `<div style="font-size:18px;font-weight:700;margin-bottom:8px">${esc(`${d.prenom || ''} ${d.nom || ''}`.trim())}</div>` + rowsTable([
      [l.metiers, esc(libelles(listes, 'metier', d.metiers, lang))], [l.langues, esc(libelles(listes, 'langue', d.langues, lang))],
      [l.ville, esc(d.ville)], [l.parcours, esc(d.parcours)],
      [l.email, withContact && d.email ? `<a href="mailto:${esc(d.email)}" style="color:${P.couleur_principale}">${esc(d.email)}</a>` : ''],
      [l.tel, withContact ? esc(d.telephone) : '']
    ]));
  }

  // ---------- Page de réponse (après un clic dans un email) ----------
  function page(P, o) {
    const c = P.couleur_principale, ink = P.couleur_encre;
    const tone = { ok: '#2E7D5B', warn: '#B7791F', err: '#B23A2E' }[o.tone || 'ok'];
    const rtl = RTL.includes(norm(o.lang));
    return `<!doctype html><html lang="${esc(o.lang || 'fr')}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(o.title)} – ${esc(P.nom_asso)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&display=swap" rel="stylesheet">
<style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;background:#EEF2F2;font-family:'Atkinson Hyperlegible',Arial,sans-serif;color:${ink}}
header{padding:18px 24px;background:#fff;border-bottom:4px solid ${c}}header img{height:40px}
main{flex:1;display:flex;align-items:center;justify-content:center;padding:32px 16px}
.card{background:#fff;border-radius:18px;max-width:520px;width:100%;padding:36px 32px;box-shadow:0 1px 0 rgba(18,52,59,.06),0 12px 32px -18px rgba(18,52,59,.35)}
.mark{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${tone}1A;color:${tone};font-size:26px;font-weight:700}
h1{font-family:'Bricolage Grotesque',Arial,sans-serif;font-weight:800;font-size:28px;line-height:1.15;margin:18px 0 10px}
p{font-size:17px;line-height:1.6;margin:0 0 12px}a.btn{display:inline-block;margin-top:10px;padding:12px 20px;border-radius:999px;background:${c};color:#fff;text-decoration:none;font-weight:700}
footer{padding:18px;text-align:center;font-size:14px;color:#4A6266}</style></head>
<body><header><a href="${esc(P.site_url)}"><img src="${esc(P.logo_url)}" alt="${esc(P.nom_asso)}"></a></header>
<main><div class="card"><div class="mark">${o.tone === 'err' ? '!' : o.tone === 'warn' ? 'i' : '✓'}</div><h1>${esc(o.title)}</h1>${(o.paras || []).map(p => `<p>${esc(p)}</p>`).join('')}${o.cta ? `<a class="btn" href="${esc(o.cta.url)}">${esc(o.cta.label)}</a>` : ''}</div></main>
<footer>${esc(P.slogan)} · ${esc(P.nom_asso)}</footer></body></html>`;
  }

  return { DEFAULTS, RTL, esc, list, norm, uid, token, params, link, isoDate, todayParis, nowParis, daysBetween, longDate, mix,
    renderText, fill, pick, layout, email, button, box, detailsSession, detailsContact, detailsDemandeur, libelles, sessionTitle, page };
})();
