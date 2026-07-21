/* 버킷메이트 — 리뷰·장소 정보 자동 번역 (A04)
 * 인트로에서 고른 국적(localStorage 'jb-intro-flag')에 맞춰
 * 한국어 리뷰 본문과 장소 정보를 해당 언어로 자동 번역한다.
 * 한국(🇰🇷)은 원문 유지. 번역 엔진: MyMemory (무료·API 키 불필요),
 * 실패하거나 쿼터 초과 시 원문을 그대로 둔다. 개인정보/키를 저장하지 않는다. */
(function () {
  // 국기 → 번역 대상 언어 코드 (한국은 null → 번역 안 함)
  var FLAG_LANG = {
    '🇰🇷': null,
    '🇺🇸': 'en', '🇬🇧': 'en', '🇨🇦': 'en', '🇦🇺': 'en', '🇳🇿': 'en',
    '🇸🇬': 'en', '🇮🇳': 'en', '🇵🇭': 'en', '🌍': 'en',
    '🇯🇵': 'ja', '🇨🇳': 'zh-CN', '🇹🇼': 'zh-TW', '🇭🇰': 'zh-TW', '🇲🇴': 'zh-TW',
    '🇫🇷': 'fr', '🇩🇪': 'de', '🇨🇭': 'de', '🇪🇸': 'es', '🇲🇽': 'es',
    '🇧🇷': 'pt', '🇮🇹': 'it', '🇷🇺': 'ru', '🇳🇱': 'nl', '🇸🇪': 'sv',
    '🇻🇳': 'vi', '🇹🇭': 'th', '🇮🇩': 'id', '🇲🇾': 'ms', '🇲🇳': 'mn'
  };

  function targetLang() {
    var f = null;
    try { f = localStorage.getItem('jb-intro-flag'); } catch (e) {}
    return FLAG_LANG[f] || null;
  }

  var HANGUL = /[가-힣]/;
  var BAD = /MYMEMORY|QUOTA|INVALID|PLEASE SELECT/i;
  var cache = {};

  function translate(text, lang) {
    var key = lang + '::' + text;
    if (cache[key]) return cache[key];
    var url = 'https://api.mymemory.translated.net/get?q=' +
      encodeURIComponent(text) + '&langpair=ko|' + encodeURIComponent(lang);
    var p = fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var out = j && j.responseData && j.responseData.translatedText;
        if (!out || BAD.test(out)) return text;   // 실패·쿼터 → 원문
        return out;
      })
      .catch(function () { return text; });
    cache[key] = p;
    return p;
  }

  // 텍스트 노드 하나만 번역 (이모지·굵은 글씨 등 구조는 보존)
  function translateTextNode(node, lang) {
    if (node.__jbTr) return;
    var raw = node.nodeValue;
    var trimmed = raw.trim();
    if (!trimmed || !HANGUL.test(trimmed)) return;
    node.__jbTr = 1;
    translate(trimmed, lang).then(function (out) {
      if (out && out !== trimmed) node.nodeValue = raw.replace(trimmed, out);
    });
  }

  function walk(root, lang) {
    if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach(function (nd) { translateTextNode(nd, lang); });
  }

  // 장소 정보(이름·메타·공식정보)와 리뷰 본문을 번역
  function sweep() {
    var lang = targetLang();
    if (!lang) return;
    ['placeName', 'placeMeta', 'placeOfficial'].forEach(function (id) {
      walk(document.getElementById(id), lang);
    });
    var rl = document.getElementById('reviewList');
    if (rl) {
      rl.querySelectorAll('.review > p').forEach(function (p) { walk(p, lang); });
    }
  }

  function boot() {
    if (!targetLang()) return;   // 한국 게스트 → 원문 유지, 관찰 안 함
    var t;
    var obs = new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(sweep, 300);   // 리뷰/장소 시트가 그려지면 번역
    });
    obs.observe(document.body, { childList: true, subtree: true });
    sweep();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
