// Liste déroulante à choix multiples (accessible au clavier)
function MultiSelect(root, opts) {
  let selected = [];
  let active = -1;
  const o = Object.assign({ placeholder: 'Choisir…', search: 'Rechercher…', empty: 'Aucun résultat', remove: 'Retirer', max: 0 }, opts);
  const uidN = 'ms' + Math.random().toString(36).slice(2, 8);
  root.classList.add('ms'); root.setAttribute('aria-expanded', 'false');
  root.innerHTML = `<div class="ms-trigger" role="combobox" tabindex="0" aria-haspopup="listbox" aria-controls="${uidN}-list" ${o.labelledby ? `aria-labelledby="${o.labelledby}"` : ''}></div>
    <div class="ms-panel"><input class="ms-search" type="search" autocomplete="off" placeholder="${o.search}" aria-label="${o.search}"><ul class="ms-list" id="${uidN}-list" role="listbox" aria-multiselectable="true"></ul></div>`;
  const trigger = root.querySelector('.ms-trigger'), panel = root.querySelector('.ms-panel');
  const search = root.querySelector('.ms-search'), listEl = root.querySelector('.ms-list');
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const label = v => (o.options.find(x => x.value === v) || { label: v }).label;

  function renderTrigger() {
    trigger.innerHTML = selected.length
      ? selected.map(v => `<span class="chip">${esc(label(v))}<button type="button" data-rm="${esc(v)}" aria-label="${esc(o.remove)} ${esc(label(v))}">×</button></span>`).join('')
      : `<span class="ms-placeholder">${esc(o.placeholder)}</span>`;
  }
  function visible() {
    const q = search.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return o.options.filter(x => !q || (x.label + ' ' + (x.natif || '') + ' ' + (x.group || '')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q));
  }
  function renderList() {
    const items = visible(); let html = '', g = null;
    items.forEach((x, i) => {
      if (x.group && x.group !== g) { g = x.group; html += `<li class="ms-group" role="presentation">${esc(g)}</li>`; }
      const on = selected.includes(x.value);
      html += `<li class="ms-opt${i === active ? ' active' : ''}" role="option" id="${uidN}-${i}" aria-selected="${on}" data-v="${esc(x.value)}"><input type="checkbox" tabindex="-1" ${on ? 'checked' : ''}><span>${esc(x.label)}</span>${x.natif && x.natif !== x.label ? `<span class="natif" lang="${esc(x.value)}">${esc(x.natif)}</span>` : ''}</li>`;
    });
    listEl.innerHTML = html || `<li class="ms-empty">${esc(o.empty)}</li>`;
    if (active >= 0) { trigger.setAttribute('aria-activedescendant', `${uidN}-${active}`); const el = document.getElementById(`${uidN}-${active}`); el && el.scrollIntoView({ block: 'nearest' }); }
  }
  function toggle(v) {
    if (selected.includes(v)) selected = selected.filter(x => x !== v);
    else { if (o.max && selected.length >= o.max) return; selected.push(v); }
    renderTrigger(); renderList(); o.onChange && o.onChange(selected.slice());
  }
  function open(focusSearch) {
    if (root.getAttribute('aria-expanded') === 'true') return;
    root.setAttribute('aria-expanded', 'true'); active = -1; search.value = ''; renderList();
    if (focusSearch) setTimeout(() => search.focus(), 0);
  }
  function close(refocus) { root.setAttribute('aria-expanded', 'false'); if (refocus) trigger.focus(); }
  trigger.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]');
    if (rm) { e.stopPropagation(); toggle(rm.dataset.rm); return; }
    root.getAttribute('aria-expanded') === 'true' ? close() : open(true);
  });
  trigger.addEventListener('keydown', e => { if (['Enter', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); open(true); } });
  search.addEventListener('input', () => { active = 0; renderList(); });
  search.addEventListener('keydown', e => {
    const n = visible().length;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(n - 1, active + 1); renderList(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); renderList(); }
    else if (e.key === 'Enter') { e.preventDefault(); const x = visible()[active]; if (x) toggle(x.value); }
    else if (e.key === 'Escape' || e.key === 'Tab') { close(e.key === 'Escape'); }
  });
  listEl.addEventListener('mousedown', e => e.preventDefault());
  listEl.addEventListener('click', e => { const li = e.target.closest('[data-v]'); if (li) toggle(li.dataset.v); });
  document.addEventListener('click', e => { if (e.target.isConnected && !root.contains(e.target)) close(); });
  renderTrigger();
  return {
    get: () => selected.slice(),
    set: vals => { selected = (vals || []).filter(v => o.options.some(x => x.value === v)); renderTrigger(); },
    setOptions: (options, keep) => { o.options = options; selected = keep ? selected.filter(v => options.some(x => x.value === v)) : []; renderTrigger(); },
    focus: () => trigger.focus()
  };
}
