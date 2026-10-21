// Runs in a sandbox without same-origin privileges, storage or network access.
const roots = [document.getElementById('remote-app'), document.getElementById('remote-modal')];
let revision = 0, control = false, pending = false;
const send = message => parent.postMessage({killteam:true, ...message}, '*');
function cleanHTML(html) {
  const template = document.createElement('template'); template.innerHTML = html;
  for (const el of template.content.querySelectorAll('*')) {
    if (['SCRIPT','IFRAME','OBJECT','EMBED','LINK','META','BASE','FORM','STYLE','FOREIGNOBJECT','ANIMATE','SET','ANIMATETRANSFORM','IMAGE','USE','AUDIO','VIDEO'].includes(el.tagName.toUpperCase())) { el.remove(); continue; }
    for (const attr of [...el.attributes]) {
      if (/^on/i.test(attr.name) || /^(src|href|xlink:href|srcdoc|action|formaction|target|autofocus)$/i.test(attr.name)) el.removeAttribute(attr.name);
    }
  }
  return template.content;
}
window.addEventListener('message', e => {
  if (e.source !== parent || !e.data?.killteam) return;
  const m = e.data;
  if (m.type === 'snapshot' && Number.isSafeInteger(m.revision) && m.revision >= revision && typeof m.app === 'string' && typeof m.modal === 'string') {
    const scroll = [scrollX, scrollY];
    const focus = document.activeElement, root = roots.findIndex(r => r.contains(focus));
    const index = root < 0 ? -1 : [...roots[root].querySelectorAll('*')].indexOf(focus);
    const selection = focus?.selectionStart;
    roots[0].replaceChildren(cleanHTML(m.app)); roots[1].replaceChildren(cleanHTML(m.modal));
    revision = m.revision; control = m.control; pending = false;
    roots[0].dataset.revision = revision;
    if (index >= 0) {
      const next = roots[root].querySelectorAll('*')[index];
      if (next?.tagName === focus.tagName && next?.dataset.act === focus.dataset.act) {
        next.focus({preventScroll:true});
        try { next.setSelectionRange(selection, selection); } catch { /* non-text input */ }
      }
    }
    scrollTo(...scroll);
  }
  if (m.type === 'control') { control = m.control; pending = false; }
});
for (const type of ['click', 'change', 'input', 'contextmenu', 'keydown', 'pointerdown']) {
  document.addEventListener(type, e => {
    const target = e.target.closest?.('[data-net-node]');
    if (!target) return;
    // Native input editing and details are local; only committed values/actions are relayed.
    if (type === 'pointerdown') return;
    if (type === 'keydown') { if (!e.target.matches('input,select,textarea')) e.preventDefault(); return; }
    if (type === 'contextmenu') { e.preventDefault(); return; }
    if (type === 'click' && (e.target.closest('input,select,textarea,summary') || e.target.closest('label')?.control)) return;
    if (type === 'input' && !['teamSearch','rseek'].includes(e.target.dataset.act)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (!control || pending) return;
    const root = roots.findIndex(r => r.contains(target));
    if (root < 0) return;
    const message = {type:'action', revision, root, node:Number(target.dataset.netNode), event:type};
    if (type === 'input' || type === 'change') { message.value = e.target.value; message.checked = e.target.checked; }
    const board = target.closest('#board');
    if (board) {
      const p = board.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(board.getScreenCTM().inverse());
      message.point = {x:q.x, y:q.y};
    }
    pending = true; send(message);
  }, true);
}
send({type:'ready'});
