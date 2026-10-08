/* ==========================================================================
   מרכיבים ממשלה – לוגיקת המשחק וממשק המשתמש
   ========================================================================== */
'use strict';
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------------- שפה (עברית / אנגלית) ---------------- */
  const LS_LANG = 'gov-game-lang';
  let LANG = 'he';
  try { if (localStorage.getItem(LS_LANG) === 'en') LANG = 'en'; } catch (e) { /* ignore */ }
  const missingT = new Set();
  // T(טקסט עברי, משתנים): מחזיר את התרגום לאנגלית כשהשפה היא אנגלית; {name} מוחלף בערך המשתנה
  function T(he, vars) {
    let s = he;
    if (LANG === 'en') {
      const en = I18N_EN.ui[he];
      if (en != null) s = en;
      else if (!missingT.has(he)) { missingT.add(he); console.warn('Missing English text: ' + he); }
    }
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return s;
  }
  const ARROW_NEXT = () => (LANG === 'en' ? '→' : '←');

  const MAJORITY = 61;
  const TOTAL_SEATS = 120;
  const PBY = {};
  PARTIES.forEach((p, i) => { p.idx = i; PBY[p.id] = p; });
  const POSBY = {};
  POSITIONS.forEach((p, i) => { p.idx = i; POSBY[p.id] = p; });
  const TIER_KEYS = ['top', 'mid', 'low'];
  const TIER_W = { top: 4, mid: 2, low: 1 };
  const TIER_LABEL = { top: 'בכירים', mid: 'בינוניים', low: 'זוטרים' };
  const tierOf = (posId) => { const t = POSBY[posId].tier; return t === 'special' ? 'top' : t; };
  const posVal = (posId) => (posId === 'pm' ? 10 : posId === 'altpm' ? 8 : POSBY[posId].upper ? 4 : { top: 6, mid: 3, low: 1 }[POSBY[posId].tier]);
  // משקל התפקיד בחישוב הערך: בכיר 4, בינוני-בכיר (upper) 3, בינוני 2, זוטר 1
  const posWeight = (posId) => (POSBY[posId].upper ? 3 : TIER_W[tierOf(posId)]);

  /* ---------------- סקרים: בדיקת תקינות + ממוצע ---------------- */
  POLLS.forEach((p) => {
    const s = Object.values(p.seats).reduce((a, b) => a + b, 0);
    if (s !== TOTAL_SEATS) console.warn('Poll ' + p.id + ' sums to ' + s);
  });
  /* ממוצע סקרים: מפלגה נכללת אם עברה את אחוז החסימה ברוב הסקרים, ומקבלת לפחות 4 מנדטים
     (3.25% מ-120). שאר המנדטים מחולקים יחסית לממוצע (כולל אפסים) בשיטת השארית הגדולה. */
  const MIN_SEATS = 4;
  function averageSeats(polls) {
    const n = polls.length;
    const ids = PARTIES.map((p) => p.id).filter((id) => polls.filter((p) => (p.seats[id] || 0) > 0).length > n / 2);
    const raw = {};
    ids.forEach((id) => { raw[id] = polls.reduce((s, p) => s + (p.seats[id] || 0), 0) / n; });
    const seats = {};
    let free = ids.slice();
    let pool = TOTAL_SEATS;
    let quota = {};
    for (;;) {
      const tot = free.reduce((s, id) => s + raw[id], 0);
      quota = {};
      free.forEach((id) => { quota[id] = (raw[id] * pool) / tot; });
      const low = free.filter((id) => quota[id] < MIN_SEATS);
      if (!low.length) break;
      low.forEach((id) => { seats[id] = MIN_SEATS; pool -= MIN_SEATS; });
      free = free.filter((id) => !low.includes(id));
    }
    free.forEach((id) => { seats[id] = Math.floor(quota[id]); });
    let left = pool - free.reduce((s, id) => s + seats[id], 0);
    free.slice().sort((a, b) => (quota[b] % 1) - (quota[a] % 1) || raw[b] - raw[a] || PBY[a].idx - PBY[b].idx)
      .forEach((id) => { if (left > 0) { seats[id]++; left--; } });
    return seats;
  }
  (function addAverages() {
    const all = POLLS.slice();
    const adj = all.filter((p) => !ADJUSTED_AVERAGE_EXCLUDE.includes(p.outlet));
    const range = (list) => list[list.length - 1].date.replace('.2026', '') + '–' + list[0].date;
    const note = 'מפלגה נכללת אם עברה את אחוז החסימה ברוב הסקרים, ומקבלת לפחות 4 מנדטים';
    const noteEn = 'A party is included if it passed the threshold in most polls, and gets at least 4 seats';
    POLLS.unshift(
      { id: 'avg', outlet: 'ממוצע הסקרים', pollster: 'כל ' + all.length + ' הסקרים', date: range(all), seats: averageSeats(all), isAvg: true,
        note: 'ממוצע של ' + all.length + ' הסקרים האחרונים. ' + note,
        en: { outlet: 'Poll average', pollster: 'All ' + all.length + ' polls', note: 'Average of the ' + all.length + ' latest polls. ' + noteEn } },
      { id: 'avg-adj', outlet: 'ממוצע ללא ערוץ 14 ו-i24', pollster: adj.length + ' סקרים', date: range(adj), seats: averageSeats(adj), isAvg: true,
        note: 'ממוצע של ' + adj.length + ' סקרים, ללא סקרי ' + ADJUSTED_AVERAGE_EXCLUDE.join(' ו-') + ' שתוצאותיהם חריגות לעומת שאר הסקרים. ' + note,
        en: { outlet: 'Average excl. Ch. 14 & i24', pollster: adj.length + ' polls', note: 'Average of ' + adj.length + ' polls, excluding Channel 14 and i24NEWS, whose results deviate from the other polls. ' + noteEn } }
    );
  })();
  const POLLBY = {};
  POLLS.forEach((p) => { POLLBY[p.id] = p; });

  /* החלפת שפת הנתונים: שומרים את המקור העברי ומחליפים לשדות האנגליים מ-I18N_EN */
  const HE_ORIG = (() => {
    const o = { parties: {}, positions: {}, polls: {}, blocs: {}, tiers: {}, groups: {}, src: {}, rel: [], anti: {}, only: {}, notice: Object.assign({}, NOTICE_TEXT), limits: [] };
    PARTIES.forEach((p) => { o.parties[p.id] = { name: p.name, short: p.short, tag: p.tag, list: p.list.slice(), demand: p.demand && p.demand.text, holdout: p.holdout && p.holdout.text }; });
    POSITIONS.forEach((p) => { o.positions[p.id] = { name: p.name, short: p.short, note: p.note }; });
    POLLS.forEach((p) => { o.polls[p.id] = { outlet: p.outlet, pollster: p.pollster, note: p.note }; });
    Object.keys(BLOCS).forEach((k) => { o.blocs[k] = BLOCS[k].name; });
    Object.keys(TIERS).forEach((k) => { o.tiers[k] = TIERS[k].name; });
    SRC_GROUPS.forEach((g) => { o.groups[g.id] = g.name; });
    Object.keys(SRC).forEach((k) => { o.src[k] = { pub: SRC[k].pub, label: SRC[k].label }; });
    o.rel = RELATIONS.map((r) => r.text);
    Object.keys(ANTI_BIBI).forEach((k) => { o.anti[k] = ANTI_BIBI[k].text; });
    Object.keys(BIBI_ONLY).forEach((k) => { o.only[k] = BIBI_ONLY[k].text; });
    o.limits = PERSON_LIMITS.map((l) => ({ tag: l.tag, text: l.text }));
    return o;
  })();

  function applyLang(lang) {
    LANG = lang === 'en' ? 'en' : 'he';
    const en = LANG === 'en' ? I18N_EN : null;
    const pick = (enVal, heVal) => (en && enVal != null && enVal !== '' ? enVal : heVal);
    PARTIES.forEach((p) => {
      const h = HE_ORIG.parties[p.id];
      const e = en && en.parties[p.id];
      p.name = pick(e && e.name, h.name);
      p.short = pick(e && e.short, h.short);
      p.tag = pick(e && e.tag, h.tag);
      p.list = e && e.list && e.list.length === h.list.length ? e.list.slice() : h.list.slice();
      if (p.demand) p.demand.text = pick(en && en.demand[p.id], h.demand);
      if (p.holdout) p.holdout.text = pick(en && en.holdout[p.id], h.holdout);
    });
    POSITIONS.forEach((p) => {
      const h = HE_ORIG.positions[p.id];
      const e = en && en.positions[p.id];
      p.name = pick(e && e[0], h.name);
      p.short = pick(e && e[1], h.short);
      p.note = h.note ? pick(e && e[2], h.note) : h.note;
    });
    POLLS.forEach((p) => {
      const h = HE_ORIG.polls[p.id];
      const e = en ? (p.en || (en.polls[p.id] ? { outlet: en.polls[p.id][0], pollster: en.polls[p.id][1] } : null)) : null;
      p.outlet = e ? e.outlet : h.outlet;
      p.pollster = e ? e.pollster : h.pollster;
      p.note = e && e.note ? e.note : h.note;
    });
    Object.keys(BLOCS).forEach((k) => { BLOCS[k].name = pick(en && en.blocs[k], HE_ORIG.blocs[k]); });
    Object.keys(TIERS).forEach((k) => { TIERS[k].name = pick(en && en.tiers[k], HE_ORIG.tiers[k]); });
    SRC_GROUPS.forEach((g) => { g.name = pick(en && en.srcGroups[g.id], HE_ORIG.groups[g.id]); });
    Object.keys(SRC).forEach((k) => {
      const h = HE_ORIG.src[k];
      SRC[k].pub = pick(en && en.srcPub[h.pub], h.pub);
      SRC[k].label = pick(en && en.src[k], h.label);
    });
    RELATIONS.forEach((r, i) => { r.text = pick(en && en.relations[r.a + '|' + r.b], HE_ORIG.rel[i]); });
    Object.keys(ANTI_BIBI).forEach((k) => { ANTI_BIBI[k].text = pick(en && en.antiBibi[k], HE_ORIG.anti[k]); });
    Object.keys(BIBI_ONLY).forEach((k) => { BIBI_ONLY[k].text = pick(en && en.bibiOnly[k], HE_ORIG.only[k]); });
    Object.keys(HE_ORIG.notice).forEach((k) => { NOTICE_TEXT[k] = pick(en && en.noticeText[k], HE_ORIG.notice[k]); });
    PERSON_LIMITS.forEach((l, i) => {
      const e = en && en.limits[l.p + ':' + l.r];
      l.tag = pick(e && e[0], HE_ORIG.limits[i].tag);
      l.text = pick(e && e[1], HE_ORIG.limits[i].text);
    });
    // מסמך ותוכן סטטי
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.lang = LANG;
      root.dir = LANG === 'en' ? 'ltr' : 'rtl';
      const st = en ? en.static : null;
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const k = el.getAttribute('data-i18n');
        if (!el.hasAttribute('data-he')) el.setAttribute('data-he', el.textContent);
        el.textContent = st && st[k] ? st[k] : el.getAttribute('data-he');
      });
      document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const k = el.getAttribute('data-i18n-aria');
        if (!el.hasAttribute('data-he-aria')) el.setAttribute('data-he-aria', el.getAttribute('aria-label') || '');
        el.setAttribute('aria-label', st && st[k] ? st[k] : el.getAttribute('data-he-aria'));
      });
      if (!root.hasAttribute('data-he-title')) root.setAttribute('data-he-title', document.title);
      document.title = st ? st.title : root.getAttribute('data-he-title');
      const tg = document.getElementById('lang-toggle');
      if (tg) tg.textContent = LANG === 'en' ? 'עברית' : 'English';
    }
    try { localStorage.setItem(LS_LANG, LANG); } catch (e) { /* ignore */ }
  }

  /* ---------------- מצב ---------------- */
  const state = { step: 1, pollId: null, seats: {}, edited: false, coal: {}, pm: null, pmManual: false, assign: {}, name: '', fromShare: false };
  const ui = { expanded: new Set(), editSeats: false, lastHash: '' };

  const seat = (id) => state.seats[id] || 0;
  const sumSeats = (ids) => ids.reduce((s, id) => s + seat(id), 0);
  const bySize = (ids) => ids.slice().sort((a, b) => seat(b) - seat(a) || PBY[a].idx - PBY[b].idx);
  const active = () => PARTIES.filter((p) => seat(p.id) > 0).map((p) => p.id);
  const members = () => active().filter((id) => state.coal[id] === 1);
  const supporters = () => active().filter((id) => state.coal[id] === 2);
  const largestMember = () => bySize(members())[0] || null;
  const totalSeatsNow = () => Object.values(state.seats).reduce((a, b) => a + b, 0);
  const personName = (a) => PBY[a.p].list[a.r];

  /* מגבלות אישיות (PERSON_LIMITS): מי רשאי/צפוי לכהן באיזה תפקיד */
  const PARL = new Set(['speaker', 'fincom']);
  const personLimit = (pid, r) => PERSON_LIMITS.find((l) => l.p === pid && l.r === r) || null;
  function blockedFor(pid, r, posId) {
    const l = personLimit(pid, r);
    if (!l) return null;
    if (l.onlyPM && posId !== 'pm') return l;
    if (l.noMinister && !PARL.has(posId)) return l;
    return null;
  }
  function pmRank() {
    let r = 0;
    while (state.pm && r < PBY[state.pm].list.length - 1 && blockedFor(state.pm, r, 'pm')) r++;
    return r;
  }
  const pmPerson = () => PBY[state.pm].list[pmRank()];

  function syncPM() {
    const mem = members();
    if (!mem.includes(state.pm)) { state.pm = null; state.pmManual = false; }
    if (!state.pmManual) state.pm = largestMember();
  }

  function purgeAssignments() {
    const mem = members();
    Object.keys(state.assign).forEach((k) => {
      const a = state.assign[k];
      if (!mem.includes(a.p) || !PBY[a.p].list[a.r]) delete state.assign[k];
    });
    if (state.pm) state.assign.pm = { p: state.pm, r: pmRank() };
    else delete state.assign.pm;
  }

  /* ניסוח ההודעה כשאחת המפלגות רק תומכת מבחוץ: האם המקור עוסק בכך במפורש, או שזו הערכה */
  function supSuffix(member, explicit) {
    if (member) return '';
    return explicit ? T(' (ההצהרה חלה במפורש גם על הישענות על תמיכה מבחוץ)') : T(' – ההצהרה עוסקת בישיבה משותפת בקואליציה; לגבי תמיכה מבחוץ זו הערכה בלבד');
  }

  /* ---------------- ניתוח קואליציה ---------------- */
  function analyzeCoalition() {
    const mem = members();
    const sup = supporters();
    const memSeats = sumSeats(mem);
    const supSeats = sumSeats(sup);
    const total = memSeats + supSeats;
    const issues = [];
    const role = (id) => state.coal[id];
    const inCoal = mem.concat(sup);
    const add = (lvl, text, penalty, parties, src) => {
      const it = { lvl, text, penalty, parties: parties || [], src: src || [] };
      issues.push(it);
      return it;
    };
    const ns = (key) => NOTICE_SRC[key] || [];

    RELATIONS.forEach((r) => {
      if (!inCoal.includes(r.a) || !inCoal.includes(r.b)) return;
      if (r.cond && !r.cond(state)) return;
      if (role(r.a) === 2 && role(r.b) === 2) return;
      const both = role(r.a) === 1 && role(r.b) === 1;
      let lvl = both ? r.level : r.sup;
      // רק הצהרה שעוסקת במפורש בתמיכה מבחוץ (supExplicit) יכולה להיות קו אדום גם לתמיכה מבחוץ; אחרת – לכל היותר מתיחות
      // supExplicit: true = ההצהרה עוסקת בתמיכה מבחוץ בכל כיוון; מזהה מפלגה = רק כשהמפלגה הזו היא התומכת מבחוץ
      const explicit = r.supExplicit === true || (!!r.supExplicit && role(r.supExplicit) === 2);
      if (!both && !explicit) lvl = Math.min(lvl, 1);
      if (!lvl) return;
      const pen = lvl === 2 ? (both ? 30 : 15) : (both ? 10 : 6);
      const it = add(lvl, r.text + supSuffix(both, explicit), pen, [r.a, r.b], r.src);
      if (lvl === 2) it.hard = both ? 'member' : 'support';
    });

    // כללים לפי זהות ראש הממשלה: ANTI_BIBI חל כשנתניהו בראש, BIBI_ONLY כשמישהו אחר בראש
    const leaderRule = (id, rule, parties) => {
      if (rule.onlyIfNeeded && total - seat(id) >= MAJORITY) return; // ״לא אשלים 61״ – בממשלה רחבה שבה אינה הכרחית אין בעיה
      const asMember = role(id) === 1;
      let lvl = asMember ? rule.level : rule.sup;
      const explicit = rule.supExplicit === true || rule.supExplicit === id;
      if (!asMember && !explicit) lvl = Math.min(lvl, 1);
      if (!lvl) return;
      const pen = lvl === 2 ? (asMember ? 30 : 15) : (asMember ? 10 : 6);
      const it = add(lvl, rule.text + supSuffix(asMember, explicit), pen, parties, rule.src);
      if (lvl === 2) it.hard = asMember ? 'member' : 'support';
    };
    if (state.pm === 'likud') {
      inCoal.forEach((id) => { if (ANTI_BIBI[id]) leaderRule(id, ANTI_BIBI[id], ['likud', id]); });
    }
    if (state.pm && state.pm !== 'likud') {
      inCoal.forEach((id) => { if (BIBI_ONLY[id] && id !== state.pm) leaderRule(id, BIBI_ONLY[id], [id, state.pm]); });
    }
    if (mem.includes('likud') && state.pm && state.pm !== 'likud') {
      add(2, NOTICE_TEXT.likudNotPM, 30, ['likud'], ns('likudNotPM')).hard = 'member';
    }
    // התמריץ של ראש ממשלה מגוש השינוי לממשלת מיעוט בתמיכה ערבית מבחוץ
    if (state.pm && PBY[state.pm].minorityIncentive && memSeats < MAJORITY && sup.some((id) => PBY[id].bloc === 'arab')) {
      add(0, NOTICE_TEXT.minorityIncentive, 0, [state.pm].concat(sup.filter((id) => PBY[id].bloc === 'arab')), ns('minorityIncentive'));
    }
    // יתרון המכהן: ממשלה בראשות הליכוד עם מפלגות מגוש השינוי, בלי ש״ס או יהדות התורה
    if (state.pm === 'likud' && mem.some((id) => PBY[id].bloc === 'change')) {
      const dropped = ['shas', 'utj'].filter((id) => seat(id) && !inCoal.includes(id));
      if (dropped.length) add(1, NOTICE_TEXT.blocBreak, 15, ['likud'].concat(dropped), ns('blocBreak'));
    }
    if (mem.includes('joint')) {
      add(1, NOTICE_TEXT.jointMember, 10, ['joint'], ns('jointMember'));
    }
    if (sup.length && memSeats < MAJORITY && total >= MAJORITY) {
      add(1, T('ממשלת מיעוט: לחברות הקואליציה ') + memSeats + T(' מנדטים בלבד, והיא תלויה ב-') + supSeats + T(' תומכים מבחוץ'), 12, sup, ns('minority'));
    }
    if (mem.length >= 7) {
      add(1, mem.length + T(' מפלגות בקואליציה – ממשלה מרובת שותפות קשה לניהול ולשרידות'), 5 * (mem.length - 6), [], ns('manyParties'));
    }
    const big = largestMember();
    if (state.pm && big && state.pm !== big && seat(state.pm) < seat(big)) {
      if (seat(state.pm) / seat(big) < 0.5) {
        add(1, T('ראש ממשלה ממפלגה קטנה בהרבה מהגדולה בקואליציה (') + seat(state.pm) + T(' מול ') + seat(big) + T(' מנדטים) – היה תקדים ב-2021, אך זה דורש הסכם רוטציה נדיב'), 8, [state.pm, big], ns('smallPM'));
      } else {
        add(0, T('ראש הממשלה אינו מהמפלגה הגדולה בקואליציה – ') + PBY[big].short + T(' תדרוש הסכם רוטציה (תפקיד ראש הממשלה החליפי מבוטל בחוק החל מהכנסת ה-26, כך שהסכם כזה לא יעוגן)'), 0, [big], ns('rotation'));
      }
    }
    mem.forEach((id) => { if (PBY[id].demand) add(0, PBY[id].demand.text, 0, [id], PBY[id].demand.src); });
    mem.forEach((id) => { if (PBY[id].holdout && total >= MAJORITY && total - seat(id) < MAJORITY) add(1, PBY[id].holdout.text, 0, [id], PBY[id].holdout.src).label = T('מיקוח קשוח'); });
    if (mem.length > 1 && mem.includes('likud') && mem.every((id) => PBY[id].bloc === 'bibi')) {
      add(-1, NOTICE_TEXT.naturalBloc, 0, [], ns('naturalBloc'));
    }
    if (mem.length > 1 && mem.every((id) => PBY[id].bloc === 'change')) {
      add(-1, NOTICE_TEXT.pact, 0, [], ns('pact'));
    }
    if (NOTICE_TEXT.shasEisenkot && mem.includes('shas') && mem.includes('yashar') && !mem.includes('likud')) {
      add(-1, NOTICE_TEXT.shasEisenkot, 0, [], ns('shasEisenkot'));
    }
    if (NOTICE_TEXT.unity && mem.includes('likud') && (mem.includes('yashar') || mem.includes('together'))) {
      add(0, NOTICE_TEXT.unity, 0, [], ns('unity'));
    }

    // אפשר להקים ממשלה גם בלי 61: בהצבעת האמון נדרש רוב מבין המצביעים, כך שהימנעויות באופוזיציה יכולות להכריע
    const missing = MAJORITY - total;
    if (mem.length && missing > 0) {
      const abstain = 2 * missing - 1;
      const it = add(missing === 1 ? 1 : 2, T('לקואליציה ') + total + T(' מנדטים בלבד (חסרים ') + missing + T('). כדי לזכות באמון הכנסת היא תזדקק להימנעות של ') +
        (abstain === 1 ? T('חבר אופוזיציה אחד לפחות (כמו ב-2021, 60 מול 59)') : abstain + T(' חברי אופוזיציה לפחות')), Math.min(60, 12 * missing), [], ns('noMajority'));
      it.label = T('אין רוב');
    }

    // הצהרה אחת שחלה על כמה זוגות מפלגות (למשל ״עמך ישראל לא תשב עם המפלגות הערביות״) מוצגת פעם אחת
    for (let i = 0; i < issues.length; i++) {
      for (let j = issues.length - 1; j > i; j--) {
        const x = issues[i];
        const y = issues[j];
        if (x.text !== y.text || x.lvl !== y.lvl) continue;
        x.parties = Array.from(new Set(x.parties.concat(y.parties)));
        x.src = Array.from(new Set(x.src.concat(y.src)));
        x.penalty += y.penalty;
        if (y.hard === 'member' || (y.hard && !x.hard)) x.hard = y.hard;
        issues.splice(j, 1);
      }
    }

    const majority = total >= MAJORITY;
    const pivotal = new Set(majority ? mem.filter((id) => total - seat(id) < MAJORITY) : []);
    const score = clamp(100 - issues.reduce((s, i) => s + i.penalty, 0), 0, 100);
    issues.sort((a, b) => b.lvl - a.lvl);
    return { mem, sup, memSeats, supSeats, total, issues, score, pivotal, majority, missing: Math.max(0, missing), ok: mem.length > 0 && !!state.pm };
  }

  /* ---------------- דרישות המפלגות (ד'הונדט לפי דרגים) ---------------- */
  const prefCache = {};
  function prefOrder(id) {
    if (!prefCache[id]) {
      const own = PBY[id].prefs.filter((x) => POSBY[x]);
      const rest = POSITIONS.map((p) => p.id).filter((x) => x !== 'pm' && x !== 'altpm' && !own.includes(x));
      prefCache[id] = own.concat(rest);
    }
    return prefCache[id];
  }

  function dhondt(ids, n, init) {
    const cnt = Object.assign({}, init);
    const order = [];
    for (let k = 0; k < n; k++) {
      let best = null;
      let bq = -1;
      ids.forEach((id) => {
        const q = seat(id) / ((cnt[id] || 0) + 1);
        if (q > bq + 1e-9) { best = id; bq = q; }
      });
      order.push(best);
      cnt[best] = (cnt[best] || 0) + 1;
    }
    return order;
  }

  /* תוספת תפקידים למפלגות מסוימות: לוקחים את הבחירה האחרונה (המנה הנמוכה ביותר) ממפלגה שרשאית לוותר,
     ומעבירים את התור לראש הרשימה */
  function withBonus(order, bonus, canGive) {
    const o = order.slice();
    const front = [];
    bonus.forEach((id) => {
      for (let i = o.length - 1; i >= 0; i--) {
        if (canGive(o[i], o)) { o.splice(i, 1); front.push(id); return; }
      }
    });
    return front.concat(o);
  }

  function computeDemands() {
    const mem = bySize(members());
    const pm = state.pm;
    if (!pm || !mem.length) return null;
    const big = mem[0];
    const rotation = pm !== big && seat(big) > seat(pm);
    const total = sumSeats(mem);
    const D = {};
    mem.forEach((id) => { D[id] = { top: 0, mid: 0, low: 0, picks: [], share: seat(id) / total }; });
    const owner = {};
    D[pm].top++; D[pm].picks.push('pm'); owner.pm = pm;
    const init = {};
    init[pm] = 1;
    if (rotation) {
      D[big].top++; D[big].picks.push('altpm'); owner.altpm = big;
      init[big] = (init[big] || 0) + 1;
    }
    // המפלגות החרדיות (noTop) אינן מתחרות על התיקים הבכירים; על כל תיק בכיר שהיה מגיע להן לפי כוחן
    // הן מקבלות בתמורה תיק בינוני נוסף (בנוסף לדרישות המדיניות שלהן, כמו חוק הפטור מגיוס)
    const topCount = POSITIONS.filter((p) => p.tier === 'top').length;
    const topEligible = mem.filter((id) => !PBY[id].noTop);
    const extraMid = [];
    if (topEligible.length < mem.length) {
      dhondt(mem, topCount, init).forEach((id) => { if (PBY[id].noTop) extraMid.push(id); });
    }
    // מיקוח קשוח (holdout): מפלגה הכרחית לרוב שמוכנה להישאר בחוץ דורשת תיק בינוני נוסף, על חשבון תיק זוטר
    const coalTotal = sumSeats(members()) + sumSeats(supporters());
    const holdouts = mem.filter((id) => PBY[id].holdout && coalTotal >= MAJORITY && coalTotal - seat(id) < MAJORITY);
    TIER_KEYS.forEach((tier) => {
      const avail = POSITIONS.filter((p) => p.tier === tier).map((p) => p.id);
      let order;
      if (tier === 'top') order = dhondt(topEligible.length ? topEligible : mem, avail.length, init);
      else if (tier === 'mid') {
        // פיצוי בין דרגים: כל תפקיד בכיר שמפלגה כבר מחזיקה נספר נגדה בחלוקת הדרג הבינוני
        const held = {};
        mem.forEach((id) => { held[id] = D[id].top; });
        order = withBonus(dhondt(mem, avail.length, held), extraMid.concat(holdouts), (x) => !PBY[x].noTop && !holdouts.includes(x));
      }
      else {
        // כל מפלגה בקואליציה מקבלת לפחות תפקיד אחד
        const empty = mem.filter((id) => !D[id].picks.length);
        order = withBonus(dhondt(mem, avail.length, {}), empty, (x, o) => !empty.includes(x) && o.filter((y) => y === x).length > 1);
        holdouts.forEach((h) => {
          const i = order.lastIndexOf(h);
          if (i >= 0 && order.filter((y) => y === h).length > 1) order[i] = mem[0] !== h ? mem[0] : mem[1];
        });
      }
      const left = new Set(avail);
      order.forEach((id) => {
        const pick = prefOrder(id).find((x) => left.has(x));
        left.delete(pick);
        D[id][tier]++;
        D[id].picks.push(pick);
        owner[pick] = id;
      });
    });
    mem.forEach((id) => { D[id].value = D[id].picks.reduce((v, pos) => v + posWeight(pos), 0); });
    return { D, owner, rotation, big, pm, mem, holdouts };
  }

  /* הסדר הצפוי בתוך המפלגה: מקום 1 מקבל את הדרישה הראשונה, מקום 2 את השנייה וכו' */
  function expectedSlots(id, dem) {
    const picks = dem.D[id].picks.slice();
    const slots = [];
    if (picks[0] === 'pm') slots.push([picks.shift()]);
    else if (picks[0] === 'altpm') {
      const alt = picks.shift();
      const firstTop = picks.length && POSBY[picks[0]].tier === 'top' ? picks.shift() : null;
      slots.push(firstTop ? [alt, firstTop] : [alt]);
    }
    // התפקידים החשובים יותר הולכים למקומות הגבוהים ברשימה (מיון יציב לפי חשיבות)
    picks.map((x, i) => ({ x, i })).sort((u, v) => posVal(v.x) - posVal(u.x) || u.i - v.i).forEach((o) => slots.push([o.x]));
    return slots;
  }

  /* מיפוי צפוי של מקום ברשימה לתפקידים, בדילוג על מי שמנוע מלכהן בהם */
  function expectedByRank(id, dem) {
    const map = {};
    const busy = new Set();
    let next = 0;
    expectedSlots(id, dem).forEach((slot) => {
      if (slot[0] === 'pm') { const r = id === state.pm ? pmRank() : 0; map[r] = slot; busy.add(r); return; }
      while (next < PBY[id].list.length && (busy.has(next) || slot.some((pos) => blockedFor(id, next, pos)))) next++;
      if (next >= PBY[id].list.length) return;
      map[next] = slot;
      busy.add(next);
    });
    return map;
  }

  function leastLoadedRank(id, slot) {
    const n = Math.max(1, Math.min(PBY[id].list.length, seat(id)));
    const cnt = new Array(n).fill(0);
    Object.values(state.assign).forEach((a) => { if (a.p === id && a.r < n) cnt[a.r]++; });
    let best = -1;
    cnt.forEach((c, i) => {
      if ((slot || []).some((pos) => blockedFor(id, i, pos))) return;
      if (best < 0 || c < cnt[best]) best = i;
    });
    return best < 0 ? 0 : best;
  }

  function autoFill(overwrite) {
    const dem = computeDemands();
    if (!dem) return;
    if (overwrite) state.assign = {};
    state.assign.pm = { p: state.pm, r: pmRank() };
    dem.mem.forEach((id) => {
      const list = PBY[id].list;
      const busy = new Set(Object.values(state.assign).filter((a) => a.p === id).map((a) => a.r));
      let next = 0;
      expectedSlots(id, dem).forEach((slot) => {
        const empties = slot.filter((pos) => !state.assign[pos]);
        if (!empties.length) return;
        while (next < list.length && (busy.has(next) || empties.some((pos) => blockedFor(id, next, pos)))) next++;
        let r = next;
        if (r >= list.length) r = leastLoadedRank(id, empties);
        empties.forEach((pos) => { state.assign[pos] = { p: id, r }; });
        busy.add(r);
      });
    });
  }

  /* ---------------- הערכת הממשלה ---------------- */
  // הורדת נקודות לפי מצב המפלגה: [בעייתי, לא מציאותי]
  const PARTY_PEN = { pm: [8, 20], pivotal: [10, 30], other: [6, 18] };

  function evaluateGov(dem, coal) {
    const parties = {};
    dem.mem.forEach((id) => { parties[id] = { g: { top: 0, mid: 0, low: 0 }, holders: {}, notes: [], order: [], penalty: 0 }; });
    const unfilled = [];
    const perPerson = {};
    POSITIONS.forEach((pos) => {
      const a = state.assign[pos.id];
      if (!a || !parties[a.p]) {
        if (pos.id !== 'altpm' || dem.rotation) unfilled.push(pos.id);
        return;
      }
      const r = parties[a.p];
      r.g[tierOf(pos.id)]++;
      (r.holders[a.r] = r.holders[a.r] || []).push(pos.id);
      const key = a.p + ':' + a.r;
      (perPerson[key] = perPerson[key] || []).push(pos.id);
    });

    const general = [];
    let orderPen = 0;
    let partyPen = 0;
    const ns = (key) => NOTICE_SRC[key] || [];

    dem.mem.forEach((id) => {
      const d = dem.D[id];
      const r = parties[id];
      const p = PBY[id];
      const isPM = id === state.pm;
      r.value = Object.values(r.holders).reduce((v, list) => v + list.reduce((w, pos) => w + posWeight(pos), 0), 0);
      const hold = dem.holdouts.includes(id) ? PBY[id].holdout : null;
      const dv = hold ? Math.max(d.value, hold.minValue) : d.value;
      r.ratio = dv ? r.value / dv : (r.value ? 2 : 1);
      let lvl = 0;
      const lo1 = isPM ? 0.7 : 0.55;
      const lo2 = isPM ? 0.85 : 0.8;
      const hi1 = isPM ? 1.5 : 1.3;
      const hi2 = isPM ? 2 : 1.7;
      const pct = Math.round(r.ratio * 100);
      if (r.ratio < lo1) { lvl = 2; r.notes.push({ lvl: 2, text: T('קיבלה ') + pct + T('% ממה שמגיע לה – מפלגה בגודל כזה לא הייתה חותמת על ההסכם'), src: ns('alloc') }); }
      else if (r.ratio < lo2) { lvl = 1; r.notes.push({ lvl: 1, text: T('קיבלה ') + pct + T('% ממה שמגיע לה – מקופחת, צפוי משא ומתן קשה'), src: ns('alloc') }); }
      else if (r.ratio > hi2) { lvl = 2; r.notes.push({ lvl: 2, text: T('קיבלה ') + pct + T('% ממה שמגיע לה – השותפות האחרות לא יסכימו לכך'), src: ns('alloc') }); }
      else if (r.ratio > hi1) { lvl = 1; r.notes.push({ lvl: 1, text: T('קיבלה ') + pct + T('% ממה שמגיע לה – נדיבות יתר, שותפות אחרות ידרשו פיצוי'), src: ns('alloc') }); }

      if (d.top >= 1 && r.g.top === 0) {
        lvl = Math.max(lvl, r.ratio < 1 ? 2 : 1);
        r.notes.push({ lvl: 2, text: T('מגיע לה ') + (d.top === 1 ? T('תיק בכיר') : d.top + T(' תיקים בכירים')) + T(' – ולא קיבלה אף אחד'), src: ns('senior') });
      } else if (r.g.top < d.top) {
        lvl = Math.max(lvl, 1);
        r.notes.push({ lvl: 1, text: T('קיבלה ') + r.g.top + T(' תפקידים בכירים במקום ') + d.top, src: ns('senior') });
      } else if (r.g.top > d.top + 1) {
        lvl = Math.max(lvl, 1);
        r.notes.push({ lvl: 1, text: T('קיבלה ') + r.g.top + T(' תפקידים בכירים – הרבה מעבר ל-') + d.top + T(' שמגיעים לה'), src: ns('senior') });
      } else if (r.g.top > d.top && !isPM) {
        r.notes.push({ lvl: 0, text: T('קיבלה תפקיד בכיר מעבר למגיע לה – חריג, אבל היו לכך תקדימים'), src: ns('seniorSmall') });
      }
      if (d.mid >= 2 && r.g.mid === 0 && r.g.top <= d.top) {
        lvl = Math.max(lvl, 1);
        r.notes.push({ lvl: 1, text: T('מגיעים לה ') + d.mid + T(' תיקים בינוניים – ולא קיבלה אף אחד'), src: ns('alloc') });
      }
      if (coal.pivotal.has(id) && !isPM && lvl === 1 && r.ratio < lo2) {
        lvl = 2;
        r.notes.push({ lvl: 2, text: T('המפלגה הכרחית לרוב – הקיפוח מסכן את הקמת הממשלה'), src: ns('pivotal') });
      }
      if (hold && r.value < hold.minValue) {
        lvl = 2;
        r.notes.push({ lvl: 2, text: T('כשהיא הכרחית לרוב, עוצמה יהודית לא תחתום על פחות מתיק בכיר ותיק בינוני-בכיר, או שני תיקים בינוניים-בכירים'), src: hold.src });
      } else if (hold && r.value > dv + 3 && lvl < 2) {
        lvl = 2;
        r.notes.push({ lvl: 2, text: T('גם במיקוח קשוח, השותפות לא יסכימו לתת לעוצמה יהודית יותר מזה (למשל את דרישת הפתיחה: ביטחון, משפטים וביטחון לאומי)'), src: ['ynet-bengvir-demands', 'method:alloc'] });
      }
      r.lvl = lvl;
      // כיוון הסטייה: מקופחת (לא תחתום) או מתוגמלת יתר על המידה (השותפות האחרות לא יסכימו)
      r.dir = r.ratio > 1 || r.g.top > d.top + 1 ? 'over' : 'under';
      if (!r.notes.length) r.notes.push({ lvl: -1, text: T('החלוקה תואמת את כוחה הפוליטי'), src: ns('alloc') });

      // סדר פנימי ברשימה
      const ranks = Object.keys(r.holders).map(Number).sort((x, y) => x - y);
      const best = (k) => Math.max.apply(null, r.holders[k].map(posVal));
      const leaderLimited = !!personLimit(id, 0) && !(id === state.pm && pmRank() === 0);
      if (ranks.length && !leaderLimited) {
        if (!r.holders[0]) {
          r.order.push({ lvl: 2, text: T('יו״ר המפלגה, ') + p.list[0] + T(', לא קיבל/ה אף תפקיד'), src: ns('order') });
          r.penalty += 6;
        } else {
          const maxB = Math.max.apply(null, ranks.map(best));
          if (best(0) < maxB) {
            r.order.push({ lvl: 1, text: T('יו״ר המפלגה, ') + p.list[0] + T(', לא קיבל/ה את התפקיד הבכיר ביותר של המפלגה'), src: ns('order') });
            r.penalty += 5;
          }
        }
        const maxRank = ranks[ranks.length - 1];
        for (let i = 1; i < maxRank; i++) {
          if (!r.holders[i]) {
            r.order.push({ lvl: 1, text: T('דילוג על מס׳ ') + (i + 1) + T(' ברשימה (') + p.list[i] + T(') לטובת מועמדים שמתחתיו'), src: ns('order') });
            r.penalty += 3;
          }
        }
        for (let j = 1; j < ranks.length; j++) {
          const rj = ranks[j];
          const above = ranks.slice(0, j).filter((ri) => ri !== 0);
          if (above.some((ri) => best(ri) < best(rj))) {
            r.order.push({ lvl: 1, text: T('מס׳ ') + (rj + 1) + ' (' + p.list[rj] + T(') קיבל/ה תפקיד בכיר יותר מחברים שמעליו ברשימה'), src: ns('order') });
            r.penalty += 2;
          }
        }
        ranks.filter((k) => k + 1 > seat(id)).forEach((k) => {
          r.order.push({ lvl: 0, text: p.list[k] + T(' (מס׳ ') + (k + 1) + T(') אינו/ה נבחר/ת לכנסת לפי הסקר – מינוי מחוץ לכנסת'), src: ns('outsideKnesset') });
          r.penalty += 1;
        });
      }
      orderPen += r.penalty;
      if (lvl) partyPen += PARTY_PEN[isPM ? 'pm' : coal.pivotal.has(id) && r.dir === 'under' ? 'pivotal' : 'other'][lvl - 1];
    });

    let multiPen = 0;
    Object.entries(perPerson).forEach(([key, list]) => {
      if (list.length >= 3) {
        const [pid, rs] = key.split(':');
        general.push({ lvl: 1, text: PBY[pid].list[+rs] + T(' מחזיק/ה ') + list.length + T(' תפקידים במקביל'), src: ns('multi') });
        multiPen += 3 * (list.length - 2);
      }
    });
    // מינויים של מי שמנוע מלכהן בתפקיד (נאשם, פסול בבג״ץ, או לא צפוי להסכים)
    const limited = [];
    POSITIONS.forEach((pos) => {
      const a = state.assign[pos.id];
      if (!a || !parties[a.p]) return;
      const l = blockedFor(a.p, a.r, pos.id);
      if (!l) return;
      limited.push({ pos: pos.id, a, l });
      general.push({ lvl: 2, text: PBY[a.p].list[a.r] + T(' ב') + POSBY[pos.id].short + ': ' + l.text, src: l.src });
    });
    if (unfilled.length) {
      general.push({ lvl: unfilled.length > 4 ? 1 : 0, text: unfilled.length + T(' תפקידים לא אוישו – הם יוחזקו זמנית בידי ראש הממשלה'), src: ns('unfilled') });
    }
    const unfilledPen = Math.min(12, unfilled.length);
    const penalty = partyPen + Math.min(30, orderPen) + unfilledPen + multiPen + 20 * limited.length;
    const score = Math.round(clamp(100 - penalty, 0, 100));
    return { parties, unfilled, general, score, penalty, limited };
  }

  /* תקרות לציון הכולל: מצבים שבהם הממשלה פשוט לא הייתה קמה */
  function scoreCaps(coal, dem, gov) {
    const caps = [];
    const names = (ids) => ids.map((id) => PBY[id].short).join(', ');
    const ns = (key) => NOTICE_SRC[key] || [];
    const srcOf = (list) => Array.from(new Set([].concat(...list.map((i) => i.src || []))));
    if (!coal.majority) caps.push({ max: Math.max(5, 70 - 15 * coal.missing), reason: T('אין רוב: ') + coal.total + T(' מנדטים בלבד – הממשלה תלויה בהימנעויות באופוזיציה'), src: ns('noMajority') });
    const hardM = coal.issues.filter((i) => i.hard === 'member');
    const hardS = coal.issues.filter((i) => i.hard === 'support');
    if (hardM.length) caps.push({ max: 50, reason: T('בקואליציה יושבות מפלגות שהצהירו שלא ישבו זו עם זו'), src: srcOf(hardM) });
    else if (hardS.length) caps.push({ max: 65, reason: T('הממשלה נשענת על תמיכה שחלק משותפותיה שללו במפורש'), src: srcOf(hardS) });
    const red = dem.mem.filter((id) => id !== state.pm && gov.parties[id].lvl === 2);
    const under = red.filter((id) => gov.parties[id].dir === 'under');
    const over = red.filter((id) => gov.parties[id].dir === 'over');
    const redPiv = under.filter((id) => coal.pivotal.has(id));
    const redOther = under.filter((id) => !coal.pivotal.has(id));
    if (over.length) caps.push({ max: 60, reason: names(over) + ' ' + (over.length > 1 ? T('קיבלו') : T('קיבלה')) + T(' הרבה מעבר לכוחה – השותפות האחרות, ובראשן מפלגת ראש הממשלה, לא יסכימו לכך'), src: ns('alloc') });
    if (redPiv.length) caps.push({ max: 45, reason: names(redPiv) + T(' לא ') + (redPiv.length > 1 ? T('היו חותמות') : T('הייתה חותמת')) + T(' על ההסכם – ') + (redPiv.length > 1 ? T('ובלעדיהן') : T('ובלעדיה')) + T(' אין רוב'), src: ns('pivotal') });
    if (redOther.length) caps.push({ max: 65, reason: names(redOther) + T(' לא ') + (redOther.length > 1 ? T('היו חותמות') : T('הייתה חותמת')) + T(' על חלוקת התיקים הזו'), src: ns('alloc') });
    if (gov.limited.length) {
      const who = Array.from(new Set(gov.limited.map((x) => PBY[x.a.p].list[x.a.r])));
      caps.push({ max: 35, reason: T('מינוי שאינו אפשרי משפטית או שאינו ריאלי: ') + who.join(', '), src: Array.from(new Set([].concat(...gov.limited.map((x) => x.l.src)))) });
    }
    if (state.pm && gov.parties[state.pm] && gov.parties[state.pm].lvl === 2) caps.push({ max: 60, reason: T('ראש הממשלה לא היה מקבל חלוקה כזו עבור מפלגתו'), src: ns('alloc') });
    return caps;
  }

  function fullEvaluation() {
    const coal = analyzeCoalition();
    const dem = computeDemands();
    if (!dem) return { coal, dem: null, gov: null, overall: 0, caps: [] };
    const gov = evaluateGov(dem, coal);
    const caps = scoreCaps(coal, dem, gov);
    const base = Math.round(0.4 * coal.score + 0.6 * gov.score);
    const overall = Math.min.apply(null, [base].concat(caps.map((c) => c.max)));
    return { coal, dem, gov, overall, base, caps };
  }

  function verdict(score) {
    if (score >= 90) return { title: T('ממשלה מציאותית לחלוטין'), text: T('הסכמים כאלה באמת נחתמים. אפשר להזמין מונית לבית הנשיא.'), cls: 'good' };
    if (score >= 72) return { title: T('ממשלה סבירה'), text: T('עם קצת משא ומתן וכמה לילות לבנים – זה יכול לעבוד.'), cls: 'good' };
    if (score >= 50) return { title: T('על הנייר בלבד'), text: T('חלק מהשותפות היו קמות מהשולחן. קשה לראות את זה קורה.'), cls: 'warn' };
    if (score >= 30) return { title: T('מדע בדיוני פוליטי'), text: T('קווים אדומים נחצו, וחלוקת התיקים רחוקה מיחסי הכוחות.'), cls: 'bad' };
    return { title: T('פנטזיה מוחלטת'), text: T('הממשלה הזו לא הייתה שורדת את ההצבעה על הקמתה.'), cls: 'bad' };
  }
  const scoreCls = (s) => (s >= 72 ? 'good' : s >= 50 ? 'warn' : 'bad');

  /* ---------------- קוד שיתוף ---------------- */
  const B36 = (n) => n.toString(36);
  function encodeState() {
    const seats = PARTIES.map((p) => B36(seat(p.id)).padStart(2, '0')).join('');
    const coal = PARTIES.map((p) => state.coal[p.id] || 0).join('');
    const pm = state.pm ? B36(PBY[state.pm].idx) : '-';
    const asg = POSITIONS.map((pos) => {
      const a = state.assign[pos.id];
      return a ? B36(PBY[a.p].idx) + B36(a.r) : '--';
    }).join('');
    const raw = ['g1', state.pollId || '', seats, coal, pm, asg, encodeURIComponent(state.name || '')].join('~');
    return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeState(code) {
    try {
      let b = String(code).trim().replace(/-/g, '+').replace(/_/g, '/');
      while (b.length % 4) b += '=';
      const parts = atob(b).split('~');
      if (parts[0] !== 'g1' || parts.length < 6) return null;
      const pollId = parts[1];
      const seatsS = parts[2];
      const coalS = parts[3];
      const pmS = parts[4];
      const asgS = parts[5];
      const nameS = parts.slice(6).join('~');
      if (seatsS.length !== PARTIES.length * 2 || coalS.length !== PARTIES.length || asgS.length !== POSITIONS.length * 2) return null;
      const seats = {};
      let tot = 0;
      PARTIES.forEach((p, i) => {
        const n = parseInt(seatsS.substr(i * 2, 2), 36);
        if (n > 0) { seats[p.id] = n; tot += n; }
      });
      if (tot !== TOTAL_SEATS) return null;
      const coal = {};
      PARTIES.forEach((p, i) => { const c = +coalS[i]; if ((c === 1 || c === 2) && seats[p.id]) coal[p.id] = c; });
      const pmP = PARTIES[parseInt(pmS, 36)];
      const pm = pmP && coal[pmP.id] === 1 ? pmP.id : null;
      const assign = {};
      POSITIONS.forEach((pos, i) => {
        const s = asgS.substr(i * 2, 2);
        if (s === '--') return;
        const p = PARTIES[parseInt(s[0], 36)];
        const r = parseInt(s[1], 36);
        if (p && coal[p.id] === 1 && r >= 0 && r < p.list.length) assign[pos.id] = { p: p.id, r };
      });
      let name = '';
      try { name = decodeURIComponent(nameS).slice(0, 60); } catch (e) { name = ''; }
      return { pollId: POLLBY[pollId] ? pollId : null, seats, coal, pm, assign, name };
    } catch (e) {
      return null;
    }
  }

  function applyDecoded(d) {
    state.pollId = d.pollId;
    state.seats = d.seats;
    state.coal = d.coal;
    state.pm = d.pm;
    state.pmManual = !!d.pm && d.pm !== largestMember();
    state.assign = d.assign;
    state.name = d.name;
    const base = d.pollId ? POLLBY[d.pollId].seats : null;
    state.edited = !base || PARTIES.some((p) => (base[p.id] || 0) !== (d.seats[p.id] || 0));
    syncPM();
    purgeAssignments();
  }

  function shareLink() {
    return location.href.split('#')[0] + '#g=' + encodeState();
  }

  function setHash(code) {
    const h = code ? '#g=' + code : '';
    if ((location.hash || '') === h) return;
    ui.lastHash = h;
    try {
      history.replaceState(null, '', location.pathname + location.search + h);
    } catch (e) {
      try { location.replace(h || '#'); } catch (e2) { /* ignore */ }
    }
  }

  /* ---------------- שמירה מקומית ---------------- */
  const LS_KEY = 'gov-game-2026-v1';
  function save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ step: state.step, pollId: state.pollId, seats: state.seats, edited: state.edited, coal: state.coal, pm: state.pm, pmManual: state.pmManual, assign: state.assign, name: state.name }));
    } catch (e) { /* ignore */ }
  }
  function restore() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (!s || !s.seats || typeof s.seats !== 'object') return false;
      Object.assign(state, { pollId: s.pollId || null, seats: s.seats, edited: !!s.edited, coal: s.coal || {}, pm: s.pm || null, pmManual: !!s.pmManual, assign: s.assign || {}, name: s.name || '' });
      syncPM();
      purgeAssignments();
      state.step = clamp(+s.step || 1, 1, 4);
      while (state.step > 1 && !canGo(state.step)) state.step--;
      return true;
    } catch (e) { return false; }
  }

  /* ---------------- רכיבים גרפיים ---------------- */
  function textOn(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#14181f' : '#ffffff';
  }

  function chip(id, extra) {
    const p = PBY[id];
    return '<span class="pchip" style="--pc:' + p.color + ';--pt:' + textOn(p.color) + '">' + esc(p.short) + (extra != null ? ' <b>' + extra + '</b>' : '') + '</span>';
  }
  const dot = (id) => '<i class="pdot" style="background:' + PBY[id].color + '"></i>';

  /* תרשים חצי-עיגול של 120 המושבים. groups: [{id, n, mode: full|support|dim}] */
  function hemicycle(groups, centerBig, centerSmall) {
    const N = groups.reduce((s, g) => s + g.n, 0) || TOTAL_SEATS;
    const rows = 7;
    const R0 = 0.44;
    const R1 = 1;
    const radii = [];
    for (let i = 0; i < rows; i++) radii.push(R0 + ((R1 - R0) * i) / (rows - 1));
    const sumR = radii.reduce((a, b) => a + b, 0);
    const counts = radii.map((r) => Math.floor((N * r) / sumR));
    let diff = N - counts.reduce((a, b) => a + b, 0);
    for (let i = rows - 1; diff > 0; i = (i - 1 + rows) % rows) { counts[i]++; diff--; }
    const pts = [];
    radii.forEach((r, i) => {
      const n = counts[i];
      for (let k = 0; k < n; k++) {
        const t = n === 1 ? Math.PI / 2 : (Math.PI * k) / (n - 1);
        pts.push({ t, r, x: -r * Math.cos(t), y: -r * Math.sin(t) });
      }
    });
    pts.sort((a, b) => a.t - b.t || b.r - a.r);
    const dr = ((R1 - R0) / (rows - 1)) * 0.42;
    let out = '';
    let i = 0;
    groups.forEach((g) => {
      const p = PBY[g.id];
      for (let k = 0; k < g.n && i < pts.length; k++, i++) {
        const pt = pts[i];
        let style;
        if (g.mode === 'dim') style = 'fill:var(--seat-dim)';
        else if (g.mode === 'support') style = 'fill:' + p.color + ';fill-opacity:.35;stroke:' + p.color + ';stroke-width:.012';
        else style = 'fill:' + p.color;
        out += '<circle cx="' + pt.x.toFixed(4) + '" cy="' + pt.y.toFixed(4) + '" r="' + dr.toFixed(4) + '" style="' + style + '"><title>' + esc(p.name) + ' – ' + g.n + '</title></circle>';
      }
    });
    return T('<svg class="hemi-svg" viewBox="-1.08 -1.08 2.16 1.16" role="img" aria-label="מפת המושבים בכנסת">') + out +
      (centerBig != null ? '<text x="0" y="-0.12" class="hemi-big" text-anchor="middle">' + esc(centerBig) + '</text>' : '') +
      (centerSmall ? '<text x="0" y="-0.02" class="hemi-small" text-anchor="middle">' + esc(centerSmall) + '</text>' : '') +
      '</svg>';
  }

  function seatBar(ids, cls) {
    return '<div class="seatbar ' + (cls || '') + '">' + ids.map((id) =>
      '<span style="flex:' + seat(id) + ';background:' + PBY[id].color + '" title="' + esc(PBY[id].name) + ' ' + seat(id) + '"></span>').join('') + '</div>';
  }

  function scoreRing(score, size, label) {
    const r = 42;
    const c = 2 * Math.PI * r;
    const off = c * (1 - score / 100);
    return '<div class="ring ' + scoreCls(score) + '" style="--size:' + (size || 110) + 'px">' +
      '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="' + r + '" class="ring-bg"/>' +
      '<circle cx="50" cy="50" r="' + r + '" class="ring-fg" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '" transform="rotate(-90 50 50)"/></svg>' +
      '<div class="ring-txt"><b>' + score + '</b><span>' + esc(label || T('מציאותיות')) + '</span></div></div>';
  }

  function blocSums(seats) {
    const res = { bibi: 0, change: 0, arab: 0, right: 0 };
    PARTIES.forEach((p) => { res[p.bloc] += seats[p.id] || 0; });
    return res;
  }

  /* ---------------- ניווט ---------------- */
  const STEPS = [
    { n: 1, label: 'בחירת סקר' },
    { n: 2, label: 'הרכבת קואליציה' },
    { n: 3, label: 'חלוקת תיקים' },
    { n: 4, label: 'סיכום ושיתוף' }
  ];

  function canGo(n) {
    if (n <= 1) return true;
    if (!Object.keys(state.seats).length || totalSeatsNow() !== TOTAL_SEATS) return false;
    if (n === 2) return true;
    return analyzeCoalition().ok;
  }

  function goStep(n) {
    if (!canGo(n)) return;
    state.step = n;
    if (n >= 2) syncPM();
    if (n >= 3) purgeAssignments();
    if (n !== 4) state.fromShare = false;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderStepper() {
    $('#stepper').innerHTML = STEPS.map((s) => {
      const cls = s.n === state.step ? 'cur' : s.n < state.step ? 'done' : '';
      const dis = canGo(s.n) ? '' : ' disabled';
      return '<button class="step ' + cls + '" data-act="step" data-n="' + s.n + '"' + dis + '><span class="step-n">' + s.n + '</span><span class="step-l">' + T(s.label) + '</span></button>';
    }).join('<span class="step-sep" aria-hidden="true"></span>');
  }

  function render() {
    renderStepper();
    const app = $('#app');
    if (state.step === 1) app.innerHTML = renderStep1();
    else if (state.step === 2) app.innerHTML = renderStep2();
    else if (state.step === 3) app.innerHTML = renderStep3();
    else app.innerHTML = renderStep4();
    if (state.step === 4) {
      const code = encodeState();
      setHash(code);
    } else {
      setHash('');
    }
    save();
  }

  /* ================= שלב 1: סקר ================= */
  function renderStep1() {
    const sel = state.pollId ? POLLBY[state.pollId] : null;
    let html = '<section class="card intro">' +
      T('<h2>שלב 1 · בוחרים מפת מנדטים</h2>') +
      T('<p>הבחירות לכנסת ה-26 ייערכו ב-<b>27 באוקטובר 2026</b>. בחרו אחד מהסקרים האחרונים – הוא יקבע את יחסי הכוחות שמהם תרכיבו קואליציה ואחר כך ממשלה. אפשר גם לשנות את המנדטים ידנית.</p>') +
      '</section>';

    html += '<div class="poll-grid">' + POLLS.map((p) => {
      const b = blocSums(p.seats);
      const top = Object.entries(p.seats).sort((x, y) => y[1] - x[1])[0];
      const ids = PARTIES.map((x) => x.id).filter((id) => p.seats[id]);
      return '<button class="poll-card' + (p.id === state.pollId ? ' sel' : '') + (p.isAvg ? ' avg' : '') + '" data-act="poll" data-id="' + p.id + '">' +
        '<div class="poll-head"><span class="poll-outlet">' + esc(p.outlet) + '</span><span class="poll-date">' + esc(p.date) + '</span></div>' +
        '<div class="poll-sub">' + esc(p.pollster || T('סקר')) + (p.sample ? ' · ' + p.sample + T(' משיבים') : '') + '</div>' +
        '<div class="seatbar mini">' + ids.map((id) => '<span style="flex:' + p.seats[id] + ';background:' + PBY[id].color + '"></span>').join('') + '</div>' +
        T('<div class="poll-blocs"><span>גוש נתניהו <b>') + b.bibi + T('</b></span><span>גוש השינוי <b>') + b.change + T('</b></span><span>ערביות <b>') + b.arab + '</b></span>' + (b.right ? T('<span>אחרות <b>') + b.right + '</b></span>' : '') + '</div>' +
        T('<div class="poll-top">הגדולה: ') + esc(PBY[top[0]].short) + ' (' + top[1] + ')</div>' +
        '</button>';
    }).join('') + '</div>';

    if (sel) {
      const ids = active();
      const tot = totalSeatsNow();
      const b = blocSums(state.seats);
      const groups = ids.map((id) => ({ id, n: seat(id), mode: 'full' }));
      html += '<section class="card poll-detail" id="poll-detail">' +
        '<div class="detail-head"><div><h3>' + esc(sel.outlet) + ' · ' + esc(sel.date) + '</h3>' +
        '<p class="muted">' + (state.edited ? T('מפת מנדטים מותאמת אישית (על בסיס הסקר)') : (sel.isAvg ? esc(sel.note) : T('תוצאות הסקר'))) + '</p></div>' +
        '<div class="detail-actions"><button class="btn ghost" data-act="edit-seats">' + (ui.editSeats ? T('סיום עריכה') : T('✎ שינוי מנדטים')) + '</button>' +
        (state.edited ? T('<button class="btn ghost" data-act="reset-seats">↺ חזרה לסקר</button>') : '') + '</div></div>' +
        '<div class="detail-body"><div class="hemi">' + hemicycle(groups, tot, T('מנדטים')) + '</div>' +
        '<div class="seat-table">' + bySize(PARTIES.map((p) => p.id)).map((id) => PBY[id]).filter((p) => seat(p.id) > 0 || ui.editSeats).map((p) => {
          const n = seat(p.id);
          return '<div class="seat-row' + (n ? '' : ' zero') + '">' + dot(p.id) + '<span class="sr-name">' + esc(p.name) + '<small>' + esc(p.tag) + '</small></span>' +
            (ui.editSeats
              ? '<span class="stepper-ctl"><button data-act="seat" data-id="' + p.id + T('" data-d="1" aria-label="הוסף מנדט">+</button><b>') + n + '</b><button data-act="seat" data-id="' + p.id + T('" data-d="-1" aria-label="הורד מנדט"') + (n ? '' : ' disabled') + '>−</button></span>'
              : '<b class="sr-n">' + n + '</b>') +
            '</div>';
        }).join('') + '</div></div>' +
        '<div class="bloc-row"><span>' + dot('likud') + T('גוש נתניהו: <b>') + b.bibi + '</b></span><span>' + dot('yashar') + T('גוש השינוי: <b>') + b.change + '</b></span><span>' + dot('joint') + T('מפלגות ערביות: <b>') + b.arab + '</b></span>' + (b.right ? '<span>' + dot('amcha') + T('אחרות: <b>') + b.right + '</b></span>' : '') + '</div>' +
        (tot !== TOTAL_SEATS ? T('<div class="alert bad">סך המנדטים הוא ') + tot + T(' – צריך בדיוק 120 כדי להמשיך.</div>') : '') +
        (ui.editSeats ? T('<p class="muted small">שימו לב: אחוז החסימה (3.25%) שווה לכ-4 מנדטים. מפלגה עם 1–3 מנדטים אינה מציאותית.</p>') : '') +
        '<div class="actions"><button class="btn primary" data-act="to" data-n="2"' + (tot === TOTAL_SEATS ? '' : ' disabled') + T('>המשך להרכבת קואליציה ←</button></div>') +
        '</section>';
    }

    html += T('<section class="card load-box"><h3>קיבלתם ממשלה ששותפה איתכם?</h3>') +
      T('<p class="muted small">הדביקו כאן את הקישור או את קוד הממשלה כדי לצפות בה.</p>') +
      T('<div class="load-row"><input id="load-code" type="text" dir="ltr" placeholder="https://...#g=... או קוד" aria-label="קוד ממשלה"><button class="btn" data-act="load-code">טעינה</button></div></section>');
    return html;
  }

  function selectPoll(id) {
    if (state.pollId === id && !state.edited) {
      const el = $('#poll-detail');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const hasWork = Object.keys(state.coal).length || Object.keys(state.assign).length > 1;
    if (hasWork && !confirm(T('החלפת הסקר תאפס את הקואליציה ואת חלוקת התיקים. להמשיך?'))) return;
    state.pollId = id;
    state.seats = Object.assign({}, POLLBY[id].seats);
    state.edited = false;
    state.coal = {};
    state.pm = null;
    state.pmManual = false;
    state.assign = {};
    ui.editSeats = false;
    render();
    const el = $('#poll-detail');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ================= שלב 2: קואליציה ================= */
  const PRESETS = [
    { label: 'גוש נתניהו', members: ['likud', 'shas', 'utj', 'rzp', 'otzma'], pm: 'likud' },
    { label: 'גוש השינוי', members: ['yashar', 'together', 'yb', 'dem', 'reservists', 'bw'] },
    { label: 'גוש השינוי + תמיכה ערבית מבחוץ', members: ['yashar', 'together', 'yb', 'dem', 'reservists', 'bw'], support: ['raam', 'joint'] }
  ];

  function renderStep2() {
    syncPM();
    const coal = analyzeCoalition();
    const ids = active();
    const need = MAJORITY - coal.total;
    const groups = ids.map((id) => ({ id, n: seat(id), mode: state.coal[id] === 1 ? 'full' : state.coal[id] === 2 ? 'support' : 'dim' }));

    let html = T('<section class="card intro"><h2>שלב 2 · מרכיבים קואליציה</h2>') +
      T('<p>צרפו מפלגות עד שתגיעו ל-<b>61 מנדטים</b>. אפשר לצרף מפלגה כחברה בקואליציה (מקבלת תיקים) או כתומכת מבחוץ (נספרת לרוב, אבל לא מקבלת תיקים). המשחק יסמן קווים אדומים ומתיחויות על סמך הצהרות ראשי המפלגות. אפשר להמשיך גם בלי רוב – אבל ממשלה כזו תלויה בהימנעויות באופוזיציה, והציון יירד בהתאם.</p>') +
      T('<div class="presets"><span class="muted small">התחלה מהירה:</span>') + PRESETS.map((p, i) => '<button class="btn small ghost" data-act="preset" data-i="' + i + '">' + esc(T(p.label)) + '</button>').join('') +
      T('<button class="btn small ghost" data-act="clear-coal">ניקוי</button></div></section>');

    html += '<div class="layout"><div class="col-main">';
    html += '<section class="card coal-top">' +
      '<div class="coal-count"><div><span class="big-num">' + coal.total + T('</span><span class="muted"> / 61 מנדטים</span></div>') +
      '<div class="coal-status ' + (coal.total >= MAJORITY ? 'ok' : '') + '">' + (coal.total >= MAJORITY ? T('✓ יש רוב בכנסת') : T('חסרים ') + need + T(' מנדטים לרוב')) + '</div></div>' +
      '<div class="coal-bar">' + coal.mem.map((id) => '<span style="flex:' + seat(id) + ';background:' + PBY[id].color + '" title="' + esc(PBY[id].name) + '"></span>').join('') +
      coal.sup.map((id) => '<span class="sup" style="flex:' + seat(id) + ';--c:' + PBY[id].color + '" title="' + esc(PBY[id].name) + T(' (מבחוץ)"></span>')).join('') +
      '<span class="empty" style="flex:' + Math.max(0, TOTAL_SEATS - coal.total) + '"></span><i class="maj-mark"></i></div>' +
      '<div class="hemi">' + hemicycle(groups, coal.total, coal.sup.length ? T('כולל ') + coal.supSeats + T(' מבחוץ') : T('בקואליציה')) + '</div>' +
      '</section>';

    html += '<div class="party-grid">' + bySize(ids).map((id) => {
      const p = PBY[id];
      const c = state.coal[id] || 0;
      const isPM = state.pm === id;
      const piv = coal.pivotal.has(id);
      return '<div class="party-card c' + c + (isPM ? ' is-pm' : '') + '" style="--pc:' + p.color + ';--pt:' + textOn(p.color) + '" data-act="card-toggle" data-id="' + id + '">' +
        '<div class="pc-head"><div class="pc-name"><b>' + esc(p.name) + '</b><small>' + esc(p.tag) + '</small></div><div class="pc-seats">' + seat(id) + '</div></div>' +
        '<div class="pc-badges"><span class="badge bloc-' + p.bloc + '">' + esc(BLOCS[p.bloc].name) + '</span>' +
        (piv ? T('<span class="badge key" title="בלעדיה אין 61">הכרחית לרוב</span>') : '') +
        (isPM ? T('<span class="badge pm">★ ראש הממשלה</span>') : '') + '</div>' +
        T('<div class="seg" role="group" aria-label="מעמד ') + esc(p.name) + '">' +
        [T('אופוזיציה'), T('קואליציה'), T('תמיכה מבחוץ')].map((l, v) => '<button class="v' + v + (c === v ? ' on' : '') + '" data-act="coal" data-id="' + id + '" data-v="' + v + '"' + (v === 2 ? T(' title="נספרת לרוב, לא מקבלת תיקים"') : '') + '>' + l + '</button>').join('') +
        '</div>' +
        (c === 1 && !isPM ? '<button class="link-btn" data-act="pm" data-id="' + id + T('">☆ הצבה בראשות הממשלה</button>') : '') +
        '</div>';
    }).join('') + '</div>';
    html += '</div>';

    html += '<aside class="col-side" id="side"><section class="card sticky side-panel">' +
      '<div class="panel-score">' + scoreRing(coal.mem.length ? coal.score : 0, 84) +
      T('<div><h3>מציאותיות הקואליציה</h3><p class="muted small">ציון 100 = קואליציה ללא קווים אדומים או מתיחויות.</p></div></div>') +
      (state.pm ? T('<div class="pm-line">ראש הממשלה המיועד: ') + dot(state.pm) + '<b>' + esc(pmPerson()) + '</b> (' + esc(PBY[state.pm].short) + ')</div>' : T('<div class="pm-line muted">בחרו מפלגות לקואליציה</div>')) +
      '<ul class="issues">' + (coal.issues.length ? coal.issues.map(issueLi).join('') : '<li class="lvl-0">' + (coal.mem.length ? T('לא זוהו בעיות מיוחדות') : T('עדיין לא נבחרו מפלגות')) + '</li>') + '</ul>' +
      '<div class="actions stack"><button class="btn primary" data-act="to" data-n="3"' + (coal.ok ? '' : ' disabled') + '>' + (coal.ok && !coal.majority ? T('המשך בלי רוב') : T('המשך לחלוקת התיקים')) + ' ' + ARROW_NEXT() + '</button>' +
      (coal.ok && !coal.majority ? T('<p class="muted small center">חסרים ') + coal.missing + T(' מנדטים – אפשר להמשיך כממשלת מיעוט, אבל הציון יוגבל.</p>') : '') +
      T('<button class="btn ghost" data-act="to" data-n="1">→ חזרה לסקרים</button></div>') +
      '</section></aside></div>';
    html += '<button class="float-score ' + (coal.mem.length ? scoreCls(coal.score) : 'bad') + '" data-act="to-panel">' + coal.total + T('/61 · מציאותיות <b>') + (coal.mem.length ? coal.score : 0) + '</b></button>';
    return html;
  }

  function capsHTML(caps) {
    if (!caps || !caps.length) return '';
    return '<ul class="issues caps">' + caps.map((c) => T('<li class="lvl-2"><span class="ic">🔒</span><span><b>הציון מוגבל ל-') + c.max + ':</b> ' + esc(c.reason) + srcLinks(c.src) + '</span></li>').join('') + '</ul>';
  }

  /* קישורי מקור לכל הודעה. 'method:<section>' = הסבר בתוך המשחק (חלון "איך זה עובד?") */
  const METHOD_LABEL = { coal: 'הסבר: הקואליציה', alloc: 'הסבר: חלוקת התיקים', order: 'הסבר: הסדר הפנימי', score: 'הסבר: חישוב הציון' };
  function srcLinks(keys) {
    if (!keys || !keys.length) return '';
    return ' <span class="srcs">' + keys.map((k) => {
      if (k.indexOf('method:') === 0) {
        const sec = k.slice(7);
        return '<a class="src method" href="#" data-act="about" data-sec="' + esc(sec) + '">' + esc(METHOD_LABEL[sec] ? T(METHOD_LABEL[sec]) : T('הסבר')) + '</a>';
      }
      const src = SRC[k];
      if (!src) { console.warn('Missing source: ' + k); return ''; }
      return '<a class="src" href="' + esc(src.url) + '" target="_blank" rel="noopener" title="' + esc(src.label) + '">' + esc(src.pub) + (src.date ? ' ' + esc(src.date) : '') + '</a>';
    }).join('') + '</span>';
  }

  function issueLi(i) {
    const icon = i.lvl === 2 ? '⛔' : i.lvl === 1 ? '⚠️' : i.lvl === 0 ? 'ℹ️' : '✅';
    const label = i.label != null ? i.label : i.lvl === 2 ? T('קו אדום') : i.lvl === 1 ? T('מתיחות') : '';
    return '<li class="lvl-' + i.lvl + '"><span class="ic">' + icon + '</span><span>' + (label ? '<b>' + label + ':</b> ' : '') + esc(i.text) +
      (i.parties && i.parties.length ? ' <span class="chips">' + i.parties.filter((x) => PBY[x]).map((x) => chip(x)).join('') + '</span>' : '') + srcLinks(i.src) + '</span></li>';
  }

  function setCoal(id, v) {
    if (v === 0) delete state.coal[id];
    else state.coal[id] = v;
    if (state.pm === id && v !== 1) { state.pm = null; state.pmManual = false; }
    syncPM();
    render();
  }

  /* ================= שלב 3: חלוקת תיקים ================= */
  function holdingsMap() {
    const m = {};
    Object.entries(state.assign).forEach(([pos, a]) => { const k = a.p + ':' + a.r; (m[k] = m[k] || []).push(pos); });
    return m;
  }

  function personOptions(posId, dem, holds) {
    const cur = state.assign[posId];
    const curVal = cur ? cur.p + ':' + cur.r : '';
    let html = T('<option value="">— לא מאויש —</option>');
    bySize(dem.mem).forEach((id) => {
      const p = PBY[id];
      html += '<optgroup label="' + esc(p.name) + ' (' + seat(id) + T(' מנדטים)">');
      p.list.forEach((nm, r) => {
        const key = id + ':' + r;
        const h = (holds[key] || []).filter((x) => x !== posId);
        const lim = personLimit(id, r);
        const extra = (lim ? ' · ' + lim.tag : '') + (r + 1 > seat(id) ? T(' · לא נבחר/ה') : '') + (h.length ? T(' · כבר: ') + h.map((x) => POSBY[x].short).join(', ') : '');
        html += '<option value="' + key + '"' + (key === curVal ? ' selected' : '') + '>' + (r + 1) + '. ' + esc(nm) + esc(extra) + '</option>';
      });
      html += '</optgroup>';
    });
    return html;
  }

  function rowHint(posId, dem) {
    const a = state.assign[posId];
    if (posId === 'altpm' && !dem.rotation) {
      return '<span class="hint muted">' + (a ? T('חריג – אין רוטציה') : T('אופציונלי')) + '</span>';
    }
    const exp = dem.owner[posId];
    if (!exp) return '';
    const p = PBY[exp];
    if (a && a.p === exp) return T('<span class="hint ok" title="תואם את דרישות המפלגות">✓ ') + esc(p.short) + '</span>';
    return '<span class="hint' + (a ? ' off' : '') + T('" title="המפלגה שצפויה לדרוש את התפקיד">צפוי: <i style="background:') + p.color + '"></i>' + esc(p.short) + '</span>';
  }

  function posRow(pos, dem, holds) {
    const a = state.assign[pos.id];
    const pc = a ? PBY[a.p].color : 'transparent';
    if (pos.id === 'pm') {
      return '<div class="pos-row locked" data-row="pm" style="--pc:' + PBY[state.pm].color + '">' +
        '<div class="pos-name">' + esc(pos.name) + T('<small>נקבע בשלב הקואליציה</small></div>') +
        '<div class="pos-person">🔒 <b>' + esc(pmPerson()) + '</b> · ' + esc(PBY[state.pm].short) + '</div>' +
        '<div class="pos-hint"><span class="hint ok">✓ ' + esc(PBY[state.pm].short) + '</span></div></div>';
    }
    return '<div class="pos-row" data-row="' + pos.id + '" style="--pc:' + pc + '">' +
      '<div class="pos-name">' + esc(pos.name) + (pos.note ? '<small>' + esc(pos.note) + '</small>' : pos.upper ? T('<small>בינוני-בכיר (משקל 3)</small>') : '') + '</div>' +
      '<div class="pos-person"><select data-pos="' + pos.id + '" aria-label="' + esc(pos.name) + '">' + personOptions(pos.id, dem, holds) + '</select></div>' +
      '<div class="pos-hint">' + rowHint(pos.id, dem) + '</div></div>';
  }

  const TIER_INFO = {
    special: 'ראש הממשלה הוא מנהיג המפלגה המרכיבה. תפקיד ראש הממשלה החליפי רלוונטי רק בהסכם רוטציה.',
    top: 'שלושת התיקים הבכירים המסורתיים – ביטחון, אוצר וחוץ – ולצידם משרד המשפטים.',
    mid: 'משרדים גדולים ומשפיעים, וכן שני התפקידים הפרלמנטריים הנחשקים ביותר.',
    low: 'משרדים קטנים יותר – חשובים למפלגות כדי לתגמל את חבריהן ולקדם נושאי ליבה.'
  };

  function renderStep3() {
    const ev = fullEvaluation();
    const dem = ev.dem;
    const holds = holdingsMap();
    let html = T('<section class="card intro"><h2>שלב 3 · מחלקים את התיקים</h2>') +
      T('<p>מנו שרים לכל תפקיד – לאנשים ספציפיים, לא למפלגות. בצד מוצגות הדרישות של כל מפלגה לפי כוחה (בכל דרג, לפי חלקה בקואליציה). לפי המקובל, מס׳ 1 ברשימה מקבל את הדרישה הראשונה של מפלגתו, מס׳ 2 את השנייה, וכן הלאה.</p>') +
      T('<div class="presets"><button class="btn small" data-act="autofill" data-mode="all">✨ הצעת המערכת (חלוקה מלאה)</button>') +
      T('<button class="btn small ghost" data-act="autofill" data-mode="missing">השלמת תפקידים חסרים</button>') +
      T('<button class="btn small ghost" data-act="clear-gov">ניקוי</button></div></section>');

    html += '<div class="layout gov-layout"><div class="col-main">';
    ['special', 'top', 'mid', 'low'].forEach((tier) => {
      const list = POSITIONS.filter((p) => p.tier === tier);
      html += '<section class="card tier-card tier-' + tier + '"><div class="tier-head"><h3>' + TIERS[tier].name + ' <span class="muted">(' + list.length + ')</span></h3>' +
        '<p class="muted small">' + T(TIER_INFO[tier]) + (tier === 'mid' ? T(' משקל בחישוב: 2, ולמשרדים המסומנים כבינוניים-בכירים – 3.') : tier !== 'special' ? T(' משקל בחישוב: ') + TIER_W[tier] : '') + '</p></div>' +
        list.map((pos) => posRow(pos, dem, holds)).join('') + '</section>';
    });
    html += T('<div class="actions"><button class="btn ghost" data-act="to" data-n="2">→ חזרה לקואליציה</button><button class="btn primary" data-act="to" data-n="4">לסיכום ולשיתוף ←</button></div>');
    html += '</div>';
    html += '<aside class="col-side" id="side"><section class="card sticky side-panel" id="gov-panel">' + govPanel(ev) + '</section></aside></div>';
    html += '<button class="float-score ' + scoreCls(ev.overall) + T('" data-act="to-panel" id="float-score">מציאותיות: <b>') + ev.overall + '</b></button>';
    return html;
  }

  function govPanel(ev) {
    const { dem, gov, coal } = ev;
    let html = '<div class="panel-score">' + scoreRing(ev.overall, 84) +
      T('<div><h3>מדד המציאותיות</h3><div class="sub-scores"><span>קואליציה <b>') + coal.score + T('</b></span><span>חלוקת תיקים <b>') + gov.score + '</b></span></div>' +
      '<p class="muted small">' + esc(verdict(ev.overall).title) + '</p></div></div>';
    html += capsHTML(ev.caps);
    html += T('<h4 class="panel-h">דרישות המפלגות <span class="muted small">(קיבלה / דורשת)</span></h4>');
    html += '<div class="dem-list">' + bySize(dem.mem).map((id) => partyBlock(id, dem, gov, coal)).join('') + '</div>';
    if (gov.general.length) html += '<ul class="issues">' + gov.general.map(issueLi).join('') + '</ul>';
    html += T('<p class="muted tiny">ראשות הממשלה ורה״מ החליפי נספרים כתפקיד בכיר. ערך: בכיר=4, בינוני-בכיר=3, בינוני=2, זוטר=1.</p>');
    return html;
  }

  const STATUS = {
    0: { cls: 'good', label: 'מציאותי' },
    1: { cls: 'warn', label: 'בעייתי' },
    2: { cls: 'bad', label: 'לא מציאותי' }
  };

  function partyBlock(id, dem, gov, coal) {
    const p = PBY[id];
    const d = dem.D[id];
    const r = gov.parties[id];
    const st = STATUS[r.lvl];
    const open = ui.expanded.has(id);
    const cells = TIER_KEYS.map((t) => {
      const diff = r.g[t] - d[t];
      const cls = diff === 0 ? 'eq' : diff < 0 ? 'lt' : 'gt';
      return '<div class="cmp ' + cls + '"><span class="cmp-l">' + T(TIER_LABEL[t]) + '</span><span class="cmp-v"><b>' + r.g[t] + '</b>/' + d[t] + '</span></div>';
    }).join('');
    const barPct = clamp(Math.round(r.ratio * 50), 0, 100);
    let html = '<div class="dem-block ' + st.cls + (open ? ' open' : '') + '" style="--pc:' + p.color + '">' +
      '<button class="dem-head" data-act="expand" data-id="' + id + '" aria-expanded="' + open + '">' +
      '<span class="dem-name">' + dot(id) + '<b>' + esc(p.short) + '</b><span class="muted small"> ' + seat(id) + T(' מנד׳ · ') + Math.round(d.share * 100) + '%</span>' + (r.order.length ? T(' <span class="ord-flag" title="חריגות מהסדר הפנימי">⇅') + r.order.length + '</span>' : '') + '</span>' +
      '<span class="status ' + st.cls + '">' + T(st.label) + '</span></button>' +
      '<div class="cmp-row">' + cells + '</div>' +
      T('<div class="ratio-bar" title="ערך שקיבלה מתוך ערך הדרישה"><span style="width:') + barPct + '%"></span><i></i></div>';
    if (open) {
      html += '<div class="dem-detail">' +
        '<p class="small">' + esc(p.name) + ': ' + seat(id) + T(' מנדטים, ') + Math.round(d.share * 100) + T('% מהקואליציה ← דורשת ') +
        (d.top ? d.top + ' ' + (id === state.pm ? T('בכירים (כולל ראשות הממשלה)') : (dem.rotation && id === dem.big ? T('בכירים (כולל רה״מ חליפי)') : T('בכירים'))) + ', ' : '') + d.mid + T(' בינוניים ו-') + d.low + T(' זוטרים.') + (dem.holdouts.includes(id) ? T(' בהיותה הכרחית לרוב היא צפויה למיקוח קשוח ותדרוש ערך של ') + p.holdout.minValue + T(' לפחות (תיק בינוני-בכיר נוסף על חשבון תיק זוטר).') + srcLinks(p.holdout.src) : '') + (p.noTop ? T(' המפלגה אינה מתחרה על התיקים הבכירים – היא מעדיפה משרדים ספציפיים ואת חוק הפטור מגיוס.') + srcLinks(NOTICE_SRC.noTop) : '') + '</p>' +
        '<ul class="issues compact">' + r.notes.map(issueLi).join('') + r.order.map(issueLi).join('') + '</ul>' +
        T('<div class="roster"><div class="roster-h">הרשימה וסדר החלוקה הצפוי</div>') + rosterHTML(id, dem) + '</div>' +
        '</div>';
    }
    html += '</div>';
    return html;
  }

  function rosterHTML(id, dem) {
    const p = PBY[id];
    const byRank = expectedByRank(id, dem);
    const holds = holdingsMap();
    let maxR = Math.max(0, ...Object.keys(byRank).map((k) => +k + 1));
    Object.values(state.assign).forEach((a) => { if (a.p === id) maxR = Math.max(maxR, a.r + 1); });
    maxR = Math.min(p.list.length, maxR + 1);
    let html = '';
    for (let r = 0; r < maxR; r++) {
      const h = holds[id + ':' + r] || [];
      const exp = byRank[r] || [];
      const match = exp.length && exp.every((x) => h.includes(x));
      html += '<div class="roster-row' + (h.length ? ' has' : '') + (r + 1 > seat(id) ? ' out' : '') + '"><span class="rr-n">' + (r + 1) + '</span><span class="rr-name">' + esc(p.list[r]) + '</span>' +
        '<span class="rr-got">' + (h.length ? h.map((x) => POSBY[x].short).join(', ') : '<span class="muted">—</span>') + '</span>' +
        '<span class="rr-exp ' + (match ? 'ok' : '') + '">' + (exp.length ? (match ? '✓' : T('צפוי: ') + exp.map((x) => POSBY[x].short).join(' + ')) : '') + '</span></div>';
    }
    return html;
  }

  function updateStep3() {
    const ev = fullEvaluation();
    const dem = ev.dem;
    const holds = holdingsMap();
    $$('select[data-pos]').forEach((sel) => {
      const pos = sel.getAttribute('data-pos');
      sel.innerHTML = personOptions(pos, dem, holds);
      const row = sel.closest('.pos-row');
      const a = state.assign[pos];
      row.style.setProperty('--pc', a ? PBY[a.p].color : 'transparent');
      $('.pos-hint', row).innerHTML = rowHint(pos, dem);
    });
    $('#gov-panel').innerHTML = govPanel(ev);
    const fs = $('#float-score');
    if (fs) { fs.className = 'float-score ' + scoreCls(ev.overall); fs.innerHTML = T('מציאותיות: <b>') + ev.overall + '</b>'; }
    save();
  }

  /* ================= שלב 4: סיכום ושיתוף ================= */
  function govTitle() {
    if (state.name.trim()) return state.name.trim();
    return T('ממשלת {name}', { name: pmPerson() });
  }

  function shareText(ev) {
    const pm = PBY[state.pm];
    const lines = [];
    lines.push(T('🗳️ הרכבתי את הממשלה ה-38: ') + govTitle());
    lines.push(T('ראש הממשלה: ') + pmPerson() + ' (' + pm.short + ')');
    lines.push(T('קואליציה: ') + ev.coal.memSeats + T(' מנדטים') + (ev.coal.majority ? '' : T(' (ללא רוב)')) + ' – ' + bySize(ev.coal.mem).map((id) => PBY[id].short).join(', ') + (ev.coal.sup.length ? T(' | תמיכה מבחוץ: ') + ev.coal.sup.map((id) => PBY[id].short).join(', ') : ''));
    ['altpm', 'defense', 'finance', 'foreign', 'justice'].forEach((pid) => {
      const a = state.assign[pid];
      if (a) lines.push(POSBY[pid].short + ': ' + personName(a) + ' (' + PBY[a.p].short + ')');
    });
    lines.push(T('מדד מציאותיות: ') + ev.overall + '/100 – ' + verdict(ev.overall).title);
    return lines.join('\n');
  }

  function renderStep4() {
    const ev = fullEvaluation();
    const { coal, dem, gov } = ev;
    const v = verdict(ev.overall);
    const poll = state.pollId ? POLLBY[state.pollId] : null;
    const link = shareLink();
    const scoreClsOf = (n) => scoreCls(n);
    let html = '';
    if (state.fromShare) {
      html += T('<section class="card banner">👋 זו ממשלה ששותפה איתכם. אפשר לערוך אותה או להתחיל משחק משלכם.') +
        T('<div class="presets"><button class="btn small" data-act="to" data-n="3">עריכת הממשלה</button><button class="btn small ghost" data-act="new-game">משחק חדש</button></div></section>');
    }

    // ---------- כרטיס התוצאה: קואליציה ותפקידים מרכזיים + מדד המציאותיות ----------
    const base = Math.round(0.4 * coal.score + 0.6 * gov.score);
    const coalBar = '<div class="coal-bar static">' + bySize(coal.mem).map((id) => '<span style="flex:' + seat(id) + ';background:' + PBY[id].color + '" title="' + esc(PBY[id].name) + '"></span>').join('') +
      coal.sup.map((id) => '<span class="sup" style="flex:' + seat(id) + ';--c:' + PBY[id].color + '"></span>').join('') +
      '<span class="empty" style="flex:' + Math.max(0, TOTAL_SEATS - coal.total) + '"></span><i class="maj-mark"></i></div>';
    const coalChips = bySize(coal.mem).map((id) => chip(id, seat(id))).join('') + coal.sup.map((id) => chip(id, seat(id) + T(' מבחוץ'))).join('');
    const keyPost = (posId, cls) => {
      const a = state.assign[posId];
      return '<div class="kp ' + (cls || '') + '" style="--pc:' + (a ? PBY[a.p].color : 'var(--line)') + '"><span class="kp-pos">' + esc(POSBY[posId].short) + '</span>' +
        '<span class="kp-name">' + (a ? esc(personName(a)) : '<span class="muted">' + T('בידי ראש הממשלה') + '</span>') + '</span>' +
        (a ? '<span class="kp-party">' + esc(PBY[a.p].short) + '</span>' : '') + '</div>';
    };
    const miniBar = (label, weight, val) => '<div class="mb ' + scoreClsOf(val) + '"><div class="mb-head"><span>' + label + ' <span class="muted">· ' + weight + '</span></span><b>' + val + '</b></div>' +
      '<div class="bd-bar"><span style="width:' + Math.max(2, val) + '%"></span></div></div>';
    html += '<section class="card result-top ' + v.cls + '"><div class="rt-grid"><div class="rt-main">' +
      T('<div class="eyebrow">הממשלה ה-38 של מדינת ישראל</div>') +
      '<h2 id="gov-title">' + esc(govTitle()) + '</h2>' +
      (poll ? '<p class="muted small rt-poll">' + T('על בסיס ') + (poll.isAvg ? esc(poll.outlet) : T('סקר ') + esc(poll.outlet)) + ' (' + esc(poll.date) + ')' + (state.edited ? T(', עם התאמות') : '') + '</p>' : '') +
      '<div class="rt-block"><div class="rt-label">' + T('הקואליציה') + ' <b>' + coal.memSeats + '</b>/120 ' + T('מנדטים') +
      (coal.sup.length ? ' <span class="muted">+ ' + coal.supSeats + T(' מבחוץ') + '</span>' : '') +
      (coal.majority ? '' : ' · <b class="bad-text">' + T('אין רוב') + '</b>') + '</div>' + coalBar + '<div class="chips wrap">' + coalChips + '</div></div>' +
      '<div class="rt-block"><div class="rt-label">' + T('התפקידים המרכזיים') + '</div><div class="key-posts">' +
      keyPost('pm', 'kp-pm') + (state.assign.altpm ? keyPost('altpm', 'kp-pm') : '') +
      POSITIONS.filter((p) => p.tier === 'top').map((p) => keyPost(p.id)).join('') + '</div></div>' +
      '</div>' +
      '<aside class="rt-score-panel ' + v.cls + '">' +
      '<div class="rsp-title">' + T('מדד המציאותיות') + '</div>' +
      '<div class="rsp-sub muted">' + T('עד כמה הממשלה הזו מציאותית') + '</div>' +
      scoreRing(ev.overall, 140, T('מתוך 100')) +
      '<div class="rsp-verdict"><b>' + esc(v.title) + '</b><span>' + esc(v.text) + '</span></div>' +
      miniBar(T('מציאותיות הקואליציה'), '40%', coal.score) +
      miniBar(T('מציאותיות חלוקת התיקים'), '60%', gov.score) +
      '<div class="formula small"><span dir="ltr">0.4 × ' + coal.score + ' + 0.6 × ' + gov.score + ' = <b>' + base + '</b></span>' +
      (ev.overall < base ? ' ' + ARROW_NEXT() + ' <b class="bad-text">' + T('מוגבל ל-{max}', { max: ev.overall }) + '</b>' : '') +
      ' <a class="src method" href="#" data-act="about" data-sec="score">' + esc(T('הסבר: חישוב הציון')) + '</a></div>' +
      capsHTML(ev.caps) +
      '</aside></div></section>';

    // ---------- מה היה מפיל את הממשלה (בולט, מיד אחרי הציון) ----------
    const allIssues = keyIssues(ev);
    const reds = allIssues.filter((i) => i.lvl === 2);
    const tens = allIssues.filter((i) => i.lvl === 1);
    const SHOW_T = 5;
    html += '<section class="card issues-card' + (reds.length ? ' has-red' : tens.length ? ' has-warn' : ' all-good') + '">' +
      '<div class="ic-head"><h3>' + T('מה היה מפיל את הממשלה הזו?') + '</h3><div class="ic-counts">' +
      (reds.length ? '<span class="status bad">⛔ ' + (reds.length === 1 ? T('קו אדום אחד') : T('{n} קווים אדומים', { n: reds.length })) + '</span>' : '') +
      (tens.length ? '<span class="status warn">⚠️ ' + (tens.length === 1 ? T('מתיחות אחת') : T('{n} מתיחויות', { n: tens.length })) + '</span>' : '') + '</div></div>';
    if (!allIssues.length) {
      html += T('<p>✅ לא נמצאו בעיות משמעותיות. ממשלה יציבה (על הנייר).</p>');
    } else {
      if (reds.length) html += '<h4 class="ic-group bad-text">' + T('קווים אדומים ובעיות חמורות') + '</h4><ul class="issues">' + reds.map(issueLi).join('') + '</ul>';
      if (tens.length) {
        html += '<h4 class="ic-group warn-text">' + T('מתיחויות') + '</h4><ul class="issues">' + tens.slice(0, SHOW_T).map(issueLi).join('') + '</ul>';
        if (tens.length > SHOW_T) {
          html += '<details class="more-issues"><summary>' + (tens.length - SHOW_T === 1 ? T('הצגת מתיחות נוספת') : T('הצגת עוד {n} מתיחויות', { n: tens.length - SHOW_T })) + '</summary><ul class="issues">' + tens.slice(SHOW_T).map(issueLi).join('') + '</ul></details>';
        }
      }
    }
    html += '</section>';

    // ---------- חברי הממשלה ----------
    html += T('<section class="card"><h3>חברי הממשלה</h3><div class="gov-grid">');
    ['special', 'top', 'mid', 'low'].forEach((tier) => {
      const list = POSITIONS.filter((p) => p.tier === tier && (state.assign[p.id] || p.id !== 'altpm' || dem.rotation));
      if (!list.length) return;
      html += '<div class="gov-tier"><h4>' + TIERS[tier].name + '</h4>' + list.map((pos) => {
        const a = state.assign[pos.id];
        return '<div class="gov-item' + (pos.upper ? ' upper' : '') + '" style="--pc:' + (a ? PBY[a.p].color : 'var(--line)') + '"><span class="gi-pos">' + esc(pos.short) + '</span>' +
          (a ? '<span class="gi-name">' + esc(personName(a)) + '</span><span class="gi-party">' + esc(PBY[a.p].short) + '</span>'
            : T('<span class="gi-name muted">בידי ראש הממשלה</span><span></span>')) + '</div>';
      }).join('') + '</div>';
    });
    html += '</div></section>';

    // ---------- האם המפלגות קיבלו את המגיע להן ----------
    html += T('<section class="card"><h3>האם המפלגות קיבלו את המגיע להן?</h3><div class="table-wrap"><table class="fair">') +
      T('<thead><tr><th>מפלגה</th><th>מנדטים</th><th>בכירים</th><th>בינוניים</th><th>זוטרים</th><th>ערך</th><th>הערכה</th></tr></thead><tbody>') +
      bySize(dem.mem).map((id) => {
        const d = dem.D[id];
        const r = gov.parties[id];
        const st = STATUS[r.lvl];
        const cell = (t) => '<td class="' + (r.g[t] === d[t] ? '' : r.g[t] < d[t] ? 'lt' : 'gt') + '">' + r.g[t] + '<small>/' + d[t] + '</small></td>';
        return '<tr><td>' + dot(id) + esc(PBY[id].short) + '</td><td>' + seat(id) + '</td>' + cell('top') + cell('mid') + cell('low') +
          '<td>' + Math.round(r.ratio * 100) + '%</td><td><span class="status ' + st.cls + '">' + T(st.label) + '</span></td></tr>';
      }).join('') + T('</tbody></table></div><p class="muted tiny">המספר הקטן = מה שהמפלגה דורשת לפי כוחה. ערך = ערך התיקים שקיבלה ביחס לדרישה.</p></section>');

    // ---------- שיתוף (מלא) ----------
    html += T('<section class="card share-card"><h3>שיתוף התוצאה</h3>') +
      T('<label class="name-field">כינוי לממשלה (לא חובה): <input id="gov-name" type="text" maxlength="60" value="') + esc(state.name) + T('" placeholder="למשל: ממשלת האחדות הגדולה"></label>') +
      '<div class="share-btns">' +
      T('<button class="btn" data-act="share-native">📤 שיתוף</button>') +
      T('<button class="btn" data-act="copy-link">🔗 העתקת קישור</button>') +
      T('<button class="btn" data-act="copy-text">📋 העתקת סיכום</button>') +
      '<a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(shareText(ev) + '\n' + link) + '">WhatsApp</a>' +
      '<a class="btn" target="_blank" rel="noopener" href="https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(shareText(ev)) + '">Telegram</a>' +
      '<a class="btn" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText(ev).split('\n').slice(0, 2).concat([T('מציאותיות: ') + ev.overall + '/100']).join('\n')) + '&url=' + encodeURIComponent(link) + '">X</a>' +
      T('<button class="btn" data-act="download-img">🖼️ הורדת תמונה</button>') +
      '</div>' +
      T('<div class="code-row"><span class="muted small">קוד הממשלה:</span><input id="share-code" type="text" dir="ltr" readonly value="') + esc(encodeState()) + T('"><button class="btn small ghost" data-act="copy-code">העתקה</button></div>') +
      '</section>';

    html += T('<div class="actions"><button class="btn ghost" data-act="to" data-n="3">→ חזרה לחלוקת התיקים</button><button class="btn primary" data-act="new-game">משחק חדש</button></div>');
    return html;
  }

  /* כל הבעיות שעלולות להפיל את הממשלה, מהחמורה לקלה */
  function keyIssues(ev) {
    const { coal, dem, gov } = ev;
    const list = coal.issues.filter((i) => i.lvl >= 1)
      .concat(...bySize(dem.mem).map((id) => gov.parties[id].notes.filter((n) => n.lvl >= 1).map((n) => ({ lvl: n.lvl, text: PBY[id].short + ': ' + n.text, parties: [], src: n.src, penalty: 0 }))))
      .concat(...bySize(dem.mem).map((id) => gov.parties[id].order.filter((n) => n.lvl >= 1).map((n) => ({ lvl: n.lvl, text: PBY[id].short + ': ' + n.text, parties: [], src: n.src, penalty: 0 }))))
      .concat(gov.general.filter((i) => i.lvl >= 1));
    list.sort((a, b) => b.lvl - a.lvl || (b.penalty || 0) - (a.penalty || 0));
    return list;
  }

  /* ---------------- תמונה לשיתוף (Canvas) ---------------- */
  function drawShareImage() {
    const ev = fullEvaluation();
    const { coal, gov } = ev;
    const Wd = 1080;
    const M = 48;
    const CW = Wd - 2 * M;
    const PW = 350;                 // רוחב לוח הציון
    const MW = CW - PW - 26;        // רוחב העמודה הראשית
    const PO = MW + 26;             // תחילת לוח הציון (בקואורדינטות לוגיות)
    const rtl = LANG !== 'en';
    const F = rtl ? '"Rubik", "Heebo", "Segoe UI", "Arial Hebrew", Arial, sans-serif'
      : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const START = rtl ? 'right' : 'left';
    const END = rtl ? 'left' : 'right';
    const v = verdict(ev.overall);
    const scoreCol = (n) => (n >= 72 ? '#34c38f' : n >= 50 ? '#f5a524' : '#f0525b');
    const MUTED = '#9fb3e0';
    const SOFT = '#c9d5f2';

    const cv = document.createElement('canvas');
    cv.width = Wd;
    cv.height = 3200;
    const g = cv.getContext('2d');
    g.direction = rtl ? 'rtl' : 'ltr';

    // קואורדינטות לוגיות: o = מרחק מתחילת שורת התוכן (ימין בעברית, שמאל באנגלית)
    const X = (o) => (rtl ? Wd - M - o : M + o);
    const rect = (o, y, w, h, color) => { g.fillStyle = color; g.fillRect(rtl ? Wd - M - o - w : M + o, y, w, h); };
    const round = (o, y, w, h, r, color) => {
      const x = rtl ? Wd - M - o - w : M + o;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); g.fill();
    };
    const font = (w, sz) => { g.font = w + ' ' + sz + 'px ' + F; };
    const clip = (t, maxW) => {
      let str = String(t);
      if (g.measureText(str).width <= maxW) return str;
      while (str.length > 2 && g.measureText(str + '…').width > maxW) str = str.slice(0, -1);
      return str + '…';
    };
    const text = (t, o, y, w, sz, color, maxW, align) => {
      font(w, sz); g.fillStyle = color; g.textAlign = align || START;
      const str = maxW ? clip(t, maxW) : String(t);
      g.fillText(str, X(o), y);
      return g.measureText(str).width;
    };
    const fitText = (t, o, y, w, sz, color, maxW, align) => {
      let size = sz;
      font(w, size);
      while (g.measureText(t).width > maxW && size > 15) { size -= 2; font(w, size); }
      return text(t, o, y, w, size, color, maxW, align);
    };
    const dot = (o, y, r, color) => {
      g.beginPath(); g.arc(X(o), y, r, 0, Math.PI * 2);
      g.fillStyle = color; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.55)'; g.stroke();
    };
    const wrap = (t, maxW, w, sz, maxLines) => {
      font(w, sz);
      const words = String(t).split(' ');
      const lines = [];
      let cur = '';
      words.forEach((wd) => {
        const tryLine = cur ? cur + ' ' + wd : wd;
        if (g.measureText(tryLine).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = tryLine;
      });
      if (cur) lines.push(cur);
      if (lines.length > maxLines) {
        const keep = lines.slice(0, maxLines);
        keep[maxLines - 1] = clip(keep[maxLines - 1] + ' ' + lines.slice(maxLines).join(' '), maxW);
        return keep;
      }
      return lines;
    };
    const heading = (label, y, width) => {
      text(label, 0, y, '700', 22, MUTED);
      font('700', 22);
      const w = g.measureText(label).width + 16;
      rect(w, y - 8, (width || CW) - w, 1.5, 'rgba(159,179,224,.35)');
    };
    const pill = (label, o, y, color, sz) => {
      font('700', sz || 17);
      const w = g.measureText(label).width + 20;
      round(o, y - (sz || 17) - 6, w, (sz || 17) + 13, 7, color);
      text(label, o + 10, y, '700', sz || 17, '#fff');
      return w;
    };

    // ================= עמודה ראשית: כותרת, קואליציה, תפקידים מרכזיים =================
    const poll = state.pollId ? POLLBY[state.pollId] : null;
    text(T('מרכיבים ממשלה · הבחירות לכנסת ה-26'), 0, 66, '600', 21, MUTED, MW);
    fitText(govTitle(), 0, 120, '800', 46, '#ffffff', MW);
    if (poll) text(T('על בסיס ') + (poll.isAvg ? poll.outlet : T('סקר ') + poll.outlet) + ' (' + poll.date + ')' + (state.edited ? T(', עם התאמות') : ''), 0, 156, '400', 20, SOFT, MW);

    // הקואליציה
    let y = 208;
    let lw = text(T('הקואליציה') + ' ', 0, y, '700', 21, MUTED);
    g.direction = 'ltr';
    font('800', 26);
    const seatsTok = coal.memSeats + '/120';
    g.fillStyle = '#fff'; g.textAlign = START; g.fillText(seatsTok, X(lw), y);
    lw += g.measureText(seatsTok).width;
    g.direction = rtl ? 'rtl' : 'ltr';
    lw += text(' ' + T('מנדטים'), lw + 2, y, '600', 21, MUTED) + 2;
    if (coal.sup.length) lw += text(' + ' + coal.supSeats + T(' מבחוץ'), lw + 4, y, '600', 20, SOFT) + 4;
    if (!coal.majority) text(' · ' + T('אין רוב'), lw + 6, y, '800', 21, '#f0525b');
    y += 16;
    round(0, y, MW, 24, 8, 'rgba(255,255,255,.12)');
    let off = 0;
    bySize(coal.mem).forEach((id) => { const w = (MW * seat(id)) / TOTAL_SEATS; rect(off, y, w, 24, PBY[id].color); off += w; });
    g.globalAlpha = 0.45;
    coal.sup.forEach((id) => { const w = (MW * seat(id)) / TOTAL_SEATS; rect(off, y, w, 24, PBY[id].color); off += w; });
    g.globalAlpha = 1;
    const mo = (MW * MAJORITY) / TOTAL_SEATS;
    rect(mo - 1.5, y - 5, 3, 34, '#fff');
    text('61', mo, y + 46, '700', 15, '#fff', 0, 'center');
    y += 80;
    let lo = 0;
    bySize(coal.mem).concat(coal.sup).forEach((id) => {
      const label = PBY[id].short + ' ' + seat(id) + (state.coal[id] === 2 ? T(' (מבחוץ)') : '');
      font('600', 20);
      const w = g.measureText(label).width + 36;
      if (lo + w > MW) { lo = 0; y += 32; }
      dot(lo + 8, y - 7, 8, PBY[id].color);
      text(label, lo + 22, y, '600', 20, '#fff');
      lo += w;
    });

    // תפקידים מרכזיים
    y += 44;
    heading(T('התפקידים המרכזיים'), y, MW);
    y += 18;
    const card = (o, yy, w, h, posId, nameSize) => {
      const a = state.assign[posId] || null;
      round(o, yy, w, h, 12, 'rgba(255,255,255,.08)');
      rect(o, yy, 7, h, a ? PBY[a.p].color : 'rgba(255,255,255,.25)');
      text(POSBY[posId].short, o + 20, yy + 27, '600', 17, MUTED, w - 34);
      fitText(a ? personName(a) : T('בידי ראש הממשלה'), o + 20, yy + 27 + nameSize + 5, '800', nameSize, a ? '#fff' : MUTED, w - 34);
      if (a) text(PBY[a.p].short, o + 20, yy + h - 12, '500', 16, SOFT, w - 34);
    };
    if (state.assign.altpm) { const w = (MW - 12) / 2; card(0, y, w, 96, 'pm', 30); card(w + 12, y, w, 96, 'altpm', 30); }
    else card(0, y, MW, 96, 'pm', 34);
    y += 108;
    const tops = POSITIONS.filter((p) => p.tier === 'top');
    const tw = (MW - 12) / 2;
    tops.forEach((p, i) => card((i % 2) * (tw + 12), y + Math.floor(i / 2) * 102, tw, 92, p.id, 24));
    y += 2 * 102;
    const mainEnd = y;

    // ================= לוח מדד המציאותיות =================
    const pc = PO + PW / 2;         // מרכז הלוח
    let py = 74;
    text(T('מדד המציאותיות'), pc, py, '800', 26, '#fff', PW - 30, 'center');
    py += 28;
    text(T('עד כמה הממשלה הזו מציאותית'), pc, py, '400', 16, MUTED, PW - 30, 'center');
    py += 92;
    const rcx = X(pc);
    g.lineWidth = 16; g.lineCap = 'round';
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.arc(rcx, py, 70, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = scoreCol(ev.overall); g.beginPath();
    g.arc(rcx, py, 70, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.max(ev.overall, 1)) / 100); g.stroke();
    g.lineCap = 'butt';
    g.textAlign = 'center'; g.fillStyle = '#fff'; font('800', 54);
    g.fillText(String(ev.overall), rcx, py + 14);
    font('500', 16); g.fillStyle = SOFT; g.fillText(T('מתוך 100'), rcx, py + 40);
    py += 110;
    fitText(v.title, pc, py, '800', 26, scoreCol(ev.overall), PW - 30, 'center');
    py += 26;
    wrap(v.text, PW - 40, '400', 16, 2).forEach((ln) => { text(ln, pc, py, '400', 16, SOFT, 0, 'center'); py += 22; });
    py += 14;
    const mini = (label, weight, val) => {
      const lw2 = text(label, PO + 18, py, '700', 18, SOFT, PW - 100);
      text('· ' + weight, PO + 18 + lw2 + 6, py, '400', 15, MUTED);
      text(String(val), PO + PW - 18, py, '800', 22, scoreCol(val), 0, END);
      round(PO + 18, py + 9, PW - 36, 9, 4.5, 'rgba(255,255,255,.14)');
      if (val > 0) round(PO + 18, py + 9, Math.max(9, ((PW - 36) * val) / 100), 9, 4.5, scoreCol(val));
      py += 46;
    };
    mini(T('מציאותיות הקואליציה'), '40%', coal.score);
    mini(T('מציאותיות חלוקת התיקים'), '60%', gov.score);
    const base = Math.round(0.4 * coal.score + 0.6 * gov.score);
    g.direction = 'ltr';
    text('0.4 × ' + coal.score + ' + 0.6 × ' + gov.score + ' = ' + base, pc, py, '600', 17, SOFT, PW - 30, 'center');
    g.direction = rtl ? 'rtl' : 'ltr';
    if (ev.overall < base) { py += 24; text(T('מוגבל ל-{max}', { max: ev.overall }), pc, py, '800', 18, '#f0525b', PW - 30, 'center'); }
    py += 12;
    ev.caps.slice(0, 2).forEach((c) => {
      py += 30;
      pill(T('הציון מוגבל ל-{max}', { max: c.max }), PO + 18, py, '#f0525b', 16);
      py += 6;
      wrap(c.reason, PW - 36, '400', 15, 2).forEach((ln) => { py += 20; text(ln, PO + 18, py, '400', 15, SOFT); });
    });
    py += 22;
    const panelEnd = py;
    // רקע הלוח – מצויר מאחורי התוכן
    g.globalCompositeOperation = 'destination-over';
    round(PO, 36, PW, panelEnd - 36, 16, 'rgba(255,255,255,.07)');
    round(PO, 36, PW, 6, 3, scoreCol(ev.overall));
    g.globalCompositeOperation = 'source-over';

    // ================= מה היה מפיל את הממשלה =================
    y = Math.max(mainEnd, panelEnd) + 46;
    const issues = keyIssues(ev);
    const reds = issues.filter((i) => i.lvl === 2).length;
    const tens = issues.filter((i) => i.lvl === 1).length;
    text(T('מה היה מפיל את הממשלה הזו?'), 0, y, '800', 26, '#fff', CW - 330);
    let co = CW;
    if (tens) { font('700', 16); const lab = tens === 1 ? T('מתיחות אחת') : T('{n} מתיחויות', { n: tens }); const w = g.measureText(lab).width + 20; co -= w; pill(lab, co, y - 2, '#c9861a', 16); co -= 8; }
    if (reds) { font('700', 16); const lab = reds === 1 ? T('קו אדום אחד') : T('{n} קווים אדומים', { n: reds }); const w = g.measureText(lab).width + 20; co -= w; pill(lab, co, y - 2, '#d64550', 16); }
    y += 20;
    const shown = issues.slice(0, 4);
    if (!shown.length) {
      text('✓ ' + T('לא נמצאו בעיות משמעותיות'), 0, y + 26, '600', 22, '#34c38f');
      y += 44;
    }
    shown.forEach((it) => {
      const label = it.label != null ? it.label : it.lvl === 2 ? T('קו אדום') : T('מתיחות');
      const col = it.lvl === 2 ? '#f0525b' : '#f5a524';
      font('700', 17);
      const pw = Math.max(96, g.measureText(label).width + 22);
      const lines = wrap(it.text, CW - pw - 20, '400', 19, 2);
      const h = 18 + lines.length * 26;
      round(0, y, CW, h, 10, it.lvl === 2 ? 'rgba(240,82,91,.14)' : 'rgba(245,165,36,.11)');
      round(10, y + 9, pw - 12, 26, 7, col);
      text(label, 10 + (pw - 12) / 2, y + 28, '700', 16, '#fff', 0, 'center');
      lines.forEach((ln, k) => text(ln, pw + 10, y + 29 + k * 26, '400', 19, '#eef2fb'));
      y += h + 8;
    });
    if (issues.length > shown.length) {
      const n = issues.length - shown.length;
      text(n === 1 ? T('ועוד הערה אחת – ראו במשחק') : T('ועוד {n} הערות – ראו במשחק', { n }), 0, y + 20, '500', 18, MUTED);
      y += 30;
    }

    // ================= שאר חברי הממשלה =================
    y += 40;
    heading(T('שאר חברי הממשלה'), y);
    y += 14;
    const grid = (list, rowH, sz, highlight, cols) => {
      const cw = (CW - (cols - 1) * 20) / cols;
      const rows = Math.ceil(list.length / cols);
      list.forEach((p, i) => {
        const col = Math.floor(i / rows);
        const row = i % rows;
        const o = col * (cw + 20);
        const yy = y + row * rowH + sz;
        const a = state.assign[p.id] || null;
        dot(o + 7, yy - sz * 0.35, 6, a ? PBY[a.p].color : 'rgba(255,255,255,.2)');
        const up = highlight && p.upper;
        const lw3 = text(p.short + ':', o + 20, yy, up ? '800' : '600', sz, up ? '#ffd166' : MUTED, cw * 0.6);
        text(a ? personName(a) : '—', o + 20 + lw3 + 7, yy, '600', sz, a ? '#fff' : MUTED, cw - lw3 - 30);
      });
      y += rows * rowH;
    };
    text(TIERS.mid.name, 0, y + 20, '700', 19, SOFT);
    text('★ ' + T('בינוני-בכיר'), CW, y + 20, '600', 16, '#ffd166', 0, END);
    y += 30;
    grid(POSITIONS.filter((p) => p.tier === 'mid'), 34, 20, true, 2);
    y += 10;
    text(TIERS.low.name, 0, y + 20, '700', 19, SOFT);
    y += 28;
    grid(POSITIONS.filter((p) => p.tier === 'low'), 29, 18, false, 3);

    // ================= כותרת תחתונה =================
    y += 34;
    text(T('סימולציה לשם הנאה – אינה תחזית'), 0, y, '400', 17, '#7f93c4');
    const H = Math.max(1350, Math.ceil(y + 30));

    const out = document.createElement('canvas');
    out.width = Wd;
    out.height = H;
    const o2 = out.getContext('2d');
    const grd = o2.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#0a1a40');
    grd.addColorStop(1, '#14336f');
    o2.fillStyle = grd;
    o2.fillRect(0, 0, Wd, H);
    o2.drawImage(cv, 0, 0);
    return out;
  }

  function canvasBlob(cv) {
    return new Promise((res) => cv.toBlob((b) => res(b), 'image/png'));
  }

  async function downloadImage() {
    const cv = drawShareImage();
    const blob = await canvasBlob(cv);
    if (!blob) return toast(T('לא ניתן היה ליצור תמונה'));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-government-2026.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function nativeShare() {
    const ev = fullEvaluation();
    const text = shareText(ev);
    const url = shareLink();
    try {
      if (navigator.share) {
        const blob = await canvasBlob(drawShareImage());
        const file = blob ? new File([blob], 'my-government-2026.png', { type: 'image/png' }) : null;
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: govTitle(), text: text + '\n' + url, files: [file] });
        } else {
          await navigator.share({ title: govTitle(), text, url });
        }
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
    copy(text + '\n' + url, T('הסיכום והקישור הועתקו – אפשר להדביק בכל מקום'));
  }

  /* ---------------- כלים ---------------- */
  function copy(text, msg) {
    const done = () => toast(msg || T('הועתק!'));
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast(T('ההעתקה נכשלה – סמנו והעתיקו ידנית')); }
    ta.remove();
  }
  let toastT = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function openAbout(sec) {
    const m = $('#modal');
    $('#modal-body').innerHTML = aboutHTML();
    m.hidden = false;
    document.body.classList.add('modal-open');
    $('#modal .modal-close').focus();
    const target = sec && $('#sec-' + sec);
    if (target) {
      target.scrollIntoView({ block: 'start' });
      target.classList.add('flash');
    } else {
      $('.modal-box').scrollTop = 0;
    }
  }
  function closeModal() {
    $('#modal').hidden = true;
    document.body.classList.remove('modal-open');
  }

  function aboutHTML() {
    return T('<h2>איך זה עובד?</h2>') +
      T('<h3 id="sec-polls">1. הסקרים</h3><p>תשעת הסקרים האחרונים שפורסמו לקראת הבחירות לכנסת ה-26 (17.9–5.10.2026), כפי שרוכזו בוויקיפדיה, ולצידם שני ממוצעים: של כל הסקרים, ושל כל הסקרים מלבד ערוץ 14 ו-i24NEWS, שתוצאותיהם חריגות לעומת שאר הסקרים. בממוצעים, מפלגה נכללת אם עברה את אחוז החסימה ברוב הסקרים, ומקבלת לפחות 4 מנדטים. ניתן להתאים את המנדטים ידנית.</p>') +
      T('<h3 id="sec-coal">2. הקואליציה</h3><p>היעד הוא 61 מנדטים (חברות קואליציה + תומכות מבחוץ). אפשר להמשיך גם בלי רוב: בהצבעת האמון נדרש רוב מבין המצביעים, כך שממשלה של 60 צריכה הימנעות של ח״כ אחד מהאופוזיציה, ושל 59 – שלושה. ממשלה בלי רוב מוגבלת בציון: 55 כשחסר מנדט אחד, ו-15 נקודות פחות על כל מנדט נוסף. המשחק מסמן <b>קווים אדומים</b> (⛔ – סירוב מפורש לשבת יחד, מינוס 30) ו<b>מתיחויות</b> (⚠️ – תנאים סותרים או חיכוך, מינוס 10) על סמך הצהרות פומביות של ראשי המפלגות עד תחילת אוקטובר 2026. לכל הודעה מצורפים קישורים למקורות (בעדיפות למקורות בעברית). חלק מהסירובים מותנים: הנדל וגנץ הצהירו שלא ישלימו לנתניהו 61, ולכן הסירוב חל רק כשהם הכרחיים לרוב. תמיכה מבחוץ מקבלת עונש קטן יותר: רק הצהרה שעוסקת במפורש בהישענות על תמיכה (למשל סמוטריץ׳: ״לא מבפנים, לא מבחוץ, לא בהמנעות״) נחשבת לקו אדום גם לתמיכה מבחוץ; בשאר המקרים זו מתיחות, וההודעה מציינת שמדובר בהערכה. זו הערכה, לא נבואה.</p>') +
      T('<h3 id="sec-alloc">3. הדרישות</h3><p>36 תפקידים בשלושה דרגים, על בסיס משרדי הממשלה ה-37:</p><ul>') +
      T('<li><b>בכיר</b> (משקל 4): ביטחון, אוצר, חוץ, משפטים – וגם ראשות הממשלה עצמה.</li>') +
      T('<li><b>בינוני-בכיר</b> (משקל 3): פנים, חינוך, ביטחון לאומי, בריאות.</li>') +
      T('<li><b>בינוני</b> (משקל 2): תחבורה, כלכלה, בינוי ושיכון, רווחה, אנרגיה, יו״ר הכנסת ויו״ר ועדת הכספים.</li>') +
      T('<li><b>זוטר</b> (משקל 1): 19 משרדים נוספים.</li></ul>') +
      T('<p>בכל דרג התיקים מתחלקים יחסית למנדטים של מפלגות הקואליציה, בשיטת <b>ד׳הונדט</b> (תיק בכיר שמפלגה מקבלת נספר נגדה בחלוקת הדרג הבינוני, כדי שמפלגה שנותרה מחוץ לדרג הבכיר תפוצה; וכל מפלגה בקואליציה מקבלת לפחות תפקיד אחד) – אותה שיטה שעליה מבוססת חלוקת המנדטים בכנסת (באדר-עופר). ראשות הממשלה נספרת כתיק בכיר של המפלגה המרכיבה. המפלגות החרדיות אינן מתחרות על התיקים הבכירים – הן מעדיפות משרדים ספציפיים (פנים, בריאות, רווחה, שיכון, דתות, ירושלים, ועדת הכספים) ואת חוק הפטור מגיוס. אם ראש הממשלה אינו מהמפלגה הגדולה בקואליציה, המפלגה הגדולה תדרוש רוטציה (שימו לב: תפקיד ראש הממשלה החליפי מבוטל בחוק החל מהכנסת ה-26; במשחק הוא נשאר כדרך לייצג הסכם רוטציה). בכל תור, המפלגה בוחרת את התיק המועדף עליה מבין הפנויים (למשל ש״ס – פנים ובריאות, עוצמה יהודית – ביטחון לאומי, יהדות התורה – ועדת הכספים ושיכון).</p>') +
      T('<p>בבדיקה מול ממשלות העבר (2013, 2015, 2021, 2022) השיטה מתקרבת למדי לחלוקת התיקים הבכירים שהתקבלה בפועל.</p>') +
      T('<h3 id="sec-score">4. מדד המציאותיות</h3><ul>') +
      T('<li>לכל מפלגה מחושב ערך התפקידים שקיבלה מול ערך הדרישה. 80%–130% נחשב מציאותי (למפלגת ראש הממשלה: 85%–150%). מפלגה שמגיע לה תיק בכיר ולא קיבלה – בעייתי.</li>') +
      T('<li id="sec-order">הסדר הפנימי: מס׳ 1 מקבל את התפקיד הבכיר של המפלגה, ואחריו מס׳ 2 וכן הלאה. דילוגים והיפוכים גוררים הורדת נקודות.</li>') +
      T('<li>תפקידים לא מאוישים נשארים בידי ראש הממשלה ומורידים מעט נקודות.</li>') +
      T('<li>יתרון המכהן: הממשלה היוצאת ממשיכה לכהן עד שתקום ממשלה חדשה, ולכן הליכוד יכול להעדיף בחירות חוזרות על פני ממשלה שבה נתניהו אינו ראש הממשלה (קו אדום) או ממשלת אחדות בלי שותפיו החרדים (מתיחות).</li>') +
      T('<li>ממשלת מיעוט: אם לגוש של איזנקוט אין 61, יש לו תמריץ להקים ממשלת מיעוט בתמיכה ערבית מבחוץ כדי לשבור את יתרון המכהן של הליכוד. לכן התמיכה מבחוץ אינה נחשבת למתיחות מצד ישר! (איזנקוט לא שלל אותה), אך הקווים האדומים של בנט והנדל נשארים, והממשלה עדיין נחשבת פגיעה (ממשלת מיעוט).</li>') +
      T('<li>מיקוח קשוח: כשעוצמה יהודית הכרחית לרוב, היא צפויה לעמוד על ערך של 6 לפחות – תיק בכיר ותיק בינוני-בכיר, או שני תיקים בינוניים-בכירים (בן גביר פרש מהממשלה בינואר 2025 וחזר במרץ לאחר שקיבל את מבוקשו). פחות מזה – לא תחתום; הרבה יותר מזה – השותפות לא יסכימו.</li>') +
      T('<li>מגבלות אישיות: נתניהו, כנאשם, רשאי לכהן כראש ממשלה אך לא כשר (הלכת דרעי-פנחסי), ואינו צפוי להסכים לתפקיד אחר; דרעי נפסל מכהונת שר בבג״ץ (2023). מינוי כזה מגביל את הציון ל-35, ובחלוקה האוטומטית התיק הראשון של המפלגה עובר למס׳ 2.</li>') +
      T('<li>הציון הכולל: 40% מציאותיות הקואליציה + 60% חלוקת התיקים.</li>') +
      T('<li>תקרות: אם בקואליציה יושבות מפלגות שהצהירו שלא ישבו זו עם זו, הציון לא יעלה על 50. אם מפלגה שהכרחית לרוב לא הייתה חותמת על חלוקת התיקים – לא יעלה על 45. אם מפלגה קיבלה הרבה מעבר לכוחה, היא אמנם תחתום – אבל השותפות האחרות לא יסכימו, והציון לא יעלה על 60.</li></ul>') +
      T('<h3 id="sec-sources">מקורות</h3>') + SRC_GROUPS.map((g) => {
        const items = Object.keys(SRC).filter((k) => SRC[k].group === g.id);
        return items.length ? '<h4>' + esc(g.name) + '</h4><ul class="sources">' + items.map((k) => '<li><a href="' + esc(SRC[k].url) + '" target="_blank" rel="noopener">' + esc(SRC[k].pub) + (SRC[k].date ? ' (' + esc(SRC[k].date) + ')' : '') + '</a> – ' + esc(SRC[k].label) + '</li>').join('') + '</ul>' : '';
      }).join('') +
      T('<p class="muted small">המשחק הוא סימולציה לשם הנאה ולימוד. ההערכות מבוססות על הצהרות פומביות ועל תקדימים, ואינן מנבאות את תוצאות הבחירות או את הממשלה שתקום. הנתונים נכונים לתחילת אוקטובר 2026.</p>');
  }

  function loadCodeFrom(text) {
    const s = String(text || '').trim();
    if (!s) return false;
    const m = s.match(/[#&?]g=([A-Za-z0-9_\-]+)/);
    const code = m ? m[1] : s;
    const d = decodeState(code);
    if (!d) return false;
    applyDecoded(d);
    state.fromShare = true;
    state.step = 4;
    if (!analyzeCoalition().ok) state.step = 2;
    render();
    window.scrollTo({ top: 0 });
    return true;
  }

  function newGame() {
    if (state.step > 1 && !state.fromShare && !confirm(T('להתחיל משחק חדש? הממשלה הנוכחית תימחק.'))) return;
    Object.assign(state, { step: 1, pollId: null, seats: {}, coal: {}, pm: null, pmManual: false, assign: {}, name: '', fromShare: false, edited: false });
    ui.expanded.clear();
    ui.editSeats = false;
    render();
    window.scrollTo({ top: 0 });
  }

  /* ---------------- אירועים ---------------- */
  function onClick(e) {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const act = el.getAttribute('data-act');
    const id = el.getAttribute('data-id');
    switch (act) {
      case 'step':
      case 'to':
        goStep(+el.getAttribute('data-n'));
        break;
      case 'poll':
        selectPoll(id);
        break;
      case 'edit-seats':
        ui.editSeats = !ui.editSeats;
        render();
        break;
      case 'seat': {
        const d = +el.getAttribute('data-d');
        const n = clamp(seat(id) + d, 0, TOTAL_SEATS);
        if (n) state.seats[id] = n; else delete state.seats[id];
        state.edited = true;
        if (!n) delete state.coal[id];
        render();
        break;
      }
      case 'reset-seats':
        state.seats = Object.assign({}, POLLBY[state.pollId].seats);
        state.edited = false;
        Object.keys(state.coal).forEach((k) => { if (!state.seats[k]) delete state.coal[k]; });
        render();
        break;
      case 'coal':
        e.stopPropagation();
        setCoal(id, +el.getAttribute('data-v'));
        break;
      case 'card-toggle':
        if (e.target.closest('button')) return;
        setCoal(id, state.coal[id] === 1 ? 0 : 1);
        break;
      case 'pm':
        e.stopPropagation();
        state.pm = id;
        state.pmManual = id !== largestMember();
        render();
        break;
      case 'preset': {
        const p = PRESETS[+el.getAttribute('data-i')];
        state.coal = {};
        p.members.forEach((m) => { if (seat(m)) state.coal[m] = 1; });
        (p.support || []).forEach((m) => { if (seat(m)) state.coal[m] = 2; });
        state.pm = p.pm && seat(p.pm) ? p.pm : null;
        state.pmManual = !!state.pm && state.pm !== largestMember();
        syncPM();
        render();
        break;
      }
      case 'clear-coal':
        state.coal = {};
        state.pm = null;
        state.pmManual = false;
        render();
        break;
      case 'autofill': {
        const all = el.getAttribute('data-mode') === 'all';
        const filled = Object.keys(state.assign).filter((k) => k !== 'pm').length;
        if (all && filled && !confirm(T('החלוקה הקיימת תוחלף בהצעת המערכת. להמשיך?'))) return;
        autoFill(all);
        render();
        toast(all ? T('התיקים חולקו לפי דרישות המפלגות והסדר הפנימי') : T('התפקידים החסרים הושלמו'));
        break;
      }
      case 'clear-gov':
        if (!confirm(T('לנקות את כל המינויים?'))) return;
        state.assign = {};
        purgeAssignments();
        render();
        break;
      case 'expand':
        if (ui.expanded.has(id)) ui.expanded.delete(id); else ui.expanded.add(id);
        $('#gov-panel').innerHTML = govPanel(fullEvaluation());
        break;
      case 'to-panel': {
        const p = $('#side');
        if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
      case 'copy-link':
        copy(shareLink(), T('הקישור הועתק'));
        break;
      case 'copy-text':
        copy(shareText(fullEvaluation()) + '\n' + shareLink(), T('הסיכום הועתק'));
        break;
      case 'copy-code':
        copy(encodeState(), T('הקוד הועתק'));
        break;
      case 'share-native':
        nativeShare();
        break;
      case 'download-img':
        downloadImage();
        break;
      case 'load-code':
        if (!loadCodeFrom($('#load-code').value)) toast(T('הקוד אינו תקין'));
        break;
      case 'new-game':
        newGame();
        break;
      case 'lang':
        applyLang(LANG === 'en' ? 'he' : 'en');
        render();
        if (!$('#modal').hidden) $('#modal-body').innerHTML = aboutHTML();
        break;
      case 'about':
        e.preventDefault();
        openAbout(el.getAttribute('data-sec'));
        break;
      case 'close-modal':
        closeModal();
        break;
      default:
        break;
    }
  }

  function onChange(e) {
    const sel = e.target.closest('select[data-pos]');
    if (!sel) return;
    const pos = sel.getAttribute('data-pos');
    const v = sel.value;
    if (!v) delete state.assign[pos];
    else {
      const [p, r] = v.split(':');
      state.assign[pos] = { p, r: +r };
    }
    updateStep3();
  }

  function onInput(e) {
    if (e.target.id === 'gov-name') {
      state.name = e.target.value.slice(0, 60);
      const code = encodeState();
      const sc = $('#share-code');
      if (sc) sc.value = code;
      setHash(code);
      const h2 = $('#gov-title');
      if (h2) h2.textContent = govTitle();
      save();
    }
  }

  function onKey(e) {
    if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
    if (e.key === 'Enter' && e.target.id === 'load-code') {
      if (!loadCodeFrom(e.target.value)) toast(T('הקוד אינו תקין'));
    }
  }

  function onHashChange() {
    if (location.hash === ui.lastHash) return;
    const m = location.hash.match(/g=([A-Za-z0-9_\-]+)/);
    if (m && m[1] !== encodeState()) loadCodeFrom(m[1]);
  }

  /* ---------------- אתחול ---------------- */
  function init() {
    applyLang(LANG);
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHashChange);
    $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
    const m = location.hash.match(/g=([A-Za-z0-9_\-]+)/);
    if (m && loadCodeFrom(m[1])) return;
    if (!restore()) state.step = 1;
    render();
  }

  // חשיפה לבדיקות
  globalThis.GovGame = { applyLang, T, missingT, state, analyzeCoalition, computeDemands, evaluateGov, fullEvaluation, autoFill, encodeState, decodeState, applyDecoded, syncPM, purgeAssignments, expectedSlots, POLLS, POLLBY };

  if (typeof document !== 'undefined' && document.getElementById('app')) init();
})();
