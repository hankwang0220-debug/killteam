let lang = 'zh';
try {
  lang = localStorage.getItem('kt.lang') || (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');
} catch { /* storage unavailable */ }

export const getLang = () => lang;

export function setLang(l) {
  lang = l;
  try { localStorage.setItem('kt.lang', l); } catch { /* ignore */ }
  document.documentElement.lang = l === 'zh' ? 'zh-Hant' : 'en';
}

/** Inline bilingual string. */
export const L = (zh, en) => (lang === 'zh' ? zh : en);

/** Translate a {zh, en} object (or pass a plain string through). */
/** Proper names (e.g. teams): in Chinese, append the English name since translations vary by region. */
export const bi = (o) => (lang === 'zh' && o?.en ? `${o.zh}（${o.en}）` : tx(o));

export const tx = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] ?? o.en ?? o.zh));
