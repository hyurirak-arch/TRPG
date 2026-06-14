const { useState, useEffect, useRef } = React;

// ============================================================
// CONSTANTS
// ============================================================

const COC6_SKILLS = [
  { key: 'accounting',     label: '経理',           base: 10 },
  { key: 'anthropology',   label: '人類学',         base: 1  },
  { key: 'archaeology',    label: '考古学',         base: 1  },
  { key: 'art',            label: '芸術',           base: 5  },
  { key: 'climb',          label: '登攀',           base: 40 },
  { key: 'conceal',        label: '隠す',           base: 15 },
  { key: 'creditRating',   label: '信用',           base: 15 },
  { key: 'cthulhuMythos',  label: 'クトゥルフ神話', base: 0  },
  { key: 'dodge',          label: '回避',           base: 'DEX×2' },
  { key: 'driveAuto',      label: '運転',           base: 20 },
  { key: 'elecRepair',     label: '電気修理',       base: 10 },
  { key: 'fastTalk',       label: '言いくるめ',     base: 5  },
  { key: 'firstAid',       label: '応急手当',       base: 30 },
  { key: 'history',        label: '歴史',           base: 20 },
  { key: 'jump',           label: '跳躍',           base: 25 },
  { key: 'library',        label: '図書館',         base: 25 },
  { key: 'listen',         label: '聞き耳',         base: 25 },
  { key: 'locksmith',      label: '鍵開け',         base: 1  },
  { key: 'martialArts',    label: '武道',           base: 1  },
  { key: 'medicine',       label: '医学',           base: 5  },
  { key: 'naturalHistory', label: '博物学',         base: 10 },
  { key: 'navigate',       label: 'ナビゲート',     base: 10 },
  { key: 'occult',         label: 'オカルト',       base: 5  },
  { key: 'persuade',       label: '説得',           base: 15 },
  { key: 'photography',    label: '写真術',         base: 10 },
  { key: 'psychology',     label: '心理学',         base: 5  },
  { key: 'ride',           label: '乗馬',           base: 5  },
  { key: 'spotHidden',     label: '目星',           base: 25 },
  { key: 'swim',           label: '水泳',           base: 25 },
  { key: 'track',          label: '追跡',           base: 10 },
];

const OCC_FORMULAS = [
  { key: 'EDU20',      label: 'EDU×20（標準）',   calc: a => a.EDU * 20 },
  { key: 'EDU10INT10', label: 'EDU×10＋INT×10',   calc: a => a.EDU*10 + a.INT*10 },
  { key: 'EDU10STR10', label: 'EDU×10＋STR×10',   calc: a => a.EDU*10 + a.STR*10 },
  { key: 'EDU10DEX10', label: 'EDU×10＋DEX×10',   calc: a => a.EDU*10 + a.DEX*10 },
  { key: 'EDU10APP10', label: 'EDU×10＋APP×10',   calc: a => a.EDU*10 + a.APP*10 },
  { key: 'INT20',      label: 'INT×20',            calc: a => a.INT * 20 },
];

const ABILITY_ROLL = {
  STR: '3d6', CON: '3d6', SIZ: '2d6+6',
  DEX: '3d6', APP: '3d6', INT: '2d6+6',
  POW: '3d6', EDU: '3d6+3',
};

const DEFAULT_SKILLS = COC6_SKILLS.reduce((acc, s) => {
  acc[s.key] = typeof s.base === 'number' ? s.base : 0;
  return acc;
}, {});

function createCharacter(override) {
  return {
    id: uid(),
    name: '名無しの探索者', furigana: '', age: '', birthday: '',
    occupation: '', degree: '', origin: '',
    appearance: '', personality: '', background: '',
    occupationFormula: 'EDU20',
    abilities: { STR: 10, CON: 10, SIZ: 10, DEX: 10, APP: 10, INT: 10, POW: 10, EDU: 10 },
    currentHP: 10, currentMP: 10, currentSAN: 50,
    temporaryInsanity: false, indefiniteInsanity: false,
    skills: { ...DEFAULT_SKILLS },
    customSkills: [],
    bonuses: { HP: 0, MP: 0, STR: 0, CON: 0, SIZ: 0, DEX: 0, APP: 0, INT: 0, POW: 0, EDU: 0, skills: [] },
    weapons: [], equipment: [], imageData: null, sketchData: null,
    ...(override || {}),
  };
}

function createGroup(override) {
  return {
    id: uid(),
    name: '新しいセッション', gm: '', description: '',
    story: '', sessionLog: '',
    members: [],
    createdAt: new Date().toISOString(),
    ...(override || {}),
  };
}

const CREATURES = [
  { nameJP: 'クトゥルフ', nameEN: 'Cthulhu', STR: 100, CON: 100, SIZ: 500, DEX: 6, HP: 300,
    attack: '踏みつぶし（1d100+1d100）、触手（4d10）', sanLoss: '1d10/1d100',
    flavor: '偉大なるクトゥルフが眠りから目覚めし時、人類の終焉は近い。深海都市ルルイエより、その死の夢が全人類を蝕む。' },
  { nameJP: 'ナイアルラトホテップ', nameEN: 'Nyarlathotep', STR: 80, CON: 80, SIZ: 65, DEX: 60, HP: 80,
    attack: '触手（3d6）、念動力（特殊）', sanLoss: '1d6/1d20',
    flavor: '千の姿を持つ使者。外なる神々と人間の橋渡しを担うが、その意図は常に残酷な悪戯に満ちている。' },
  { nameJP: 'ハスター', nameEN: 'Hastur', STR: 75, CON: 75, SIZ: 80, DEX: 55, HP: 75,
    attack: '触手（4d6）', sanLoss: '1d6/1d20',
    flavor: '口にするだけで呼び寄せてしまう名を持つ神。黄の印と黄衣の王の名と共に伝わる禁忌の存在。' },
  { nameJP: 'ショゴス', nameEN: 'Shoggoth', STR: 80, CON: 40, SIZ: 50, DEX: 8, HP: 45,
    attack: '体当たり（3d6）、擬似眼・口での攻撃', sanLoss: '1d6/1d20',
    flavor: '古のものに奴隷として造られた無定形生命体。「イア！ショゴス！」その叫びは地の底に響き渡る。' },
  { nameJP: 'ディープ・ワン', nameEN: 'Deep One', STR: 14, CON: 14, SIZ: 14, DEX: 12, HP: 14,
    attack: '爪（1d6）、武器（ダメージ通り）', sanLoss: '0/1d6',
    flavor: '海底都市イハ＝ントレイに棲む両生類的存在。人間との混血を重ね、海岸の集落に密かに潜む。' },
  { nameJP: 'ミ＝ゴ', nameEN: 'Mi-Go', STR: 12, CON: 12, SIZ: 8, DEX: 13, HP: 10,
    attack: '鋏（1d6）、爪（1d4）', sanLoss: '0/1d6',
    flavor: '菌類と甲殻類を合わせたような宇宙人。高度な外科技術で脳を摘出・保存し、宇宙を旅させる。' },
  { nameJP: 'ハウンド・オブ・ティンダロス', nameEN: 'Hound of Tindalos', STR: 30, CON: 10, SIZ: 12, DEX: 18, HP: 11,
    attack: '舌（1d6+毒）、爪（1d4+1d4）', sanLoss: '1d3/1d20',
    flavor: '時間の隅（角）から現れる存在。過去へ遡った者を追い続ける永遠の狩人。壁の角を塗り潰せ。' },
  { nameJP: 'バイアクヘー', nameEN: 'Byakhee', STR: 15, CON: 13, SIZ: 13, DEX: 13, HP: 13,
    attack: 'クロウ（1d6）、角（1d3）、噛みつき（1d3）', sanLoss: '0/1d6',
    flavor: 'ハスターに仕える星間を飛翔する生物。騎乗して宇宙を渡ることも可能だが、生還は保証されない。' },
  { nameJP: 'グール', nameEN: 'Ghoul', STR: 14, CON: 14, SIZ: 11, DEX: 15, HP: 12,
    attack: '爪（1d6）、噛みつき（1d4+感染）', sanLoss: '0/1d6',
    flavor: '墓地で死体を喰らう鬼。かつては人間だったとも言われるが、今や地下の暗闇に完全に適応している。' },
  { nameJP: 'ナイトガウント', nameEN: 'Night-Gaunt', STR: 16, CON: 16, SIZ: 13, DEX: 15, HP: 14,
    attack: 'くすぐり（対象を無力化）', sanLoss: '0/1d6',
    flavor: '夢の国を守る無貌の黒い存在。顔には何もない。その沈黙の笑いは夢見る者の心を静かに壊す。' },
  { nameJP: 'スター・スポーン', nameEN: 'Star Spawn of Cthulhu', STR: 60, CON: 50, SIZ: 50, DEX: 8, HP: 55,
    attack: '触手（5d6）、踏みつぶし（2d6）', sanLoss: '1d6/1d20',
    flavor: 'クトゥルフの同族にして僕。太古の昔、地球に降り立ち、水生生物と戦争を繰り広げた。' },
  { nameJP: 'フライング・ポリプ', nameEN: 'Flying Polyp', STR: 60, CON: 40, SIZ: 40, DEX: 10, HP: 40,
    attack: '風の拳（3d6）、気圧攻撃（特殊）', sanLoss: '1d6/1d20',
    flavor: '半透明で部分的にしか見えない存在。風を操り古代の地球文明を滅ぼした。今も地下深くに潜む。' },
];

const MADNESS_CARDS = [
  { title: '激しい振戦',     desc: '全身が激しく震え、手足の制御を失う。1d10ラウンドの間、行動が著しく困難になる。' },
  { title: '昏睡',           desc: '突如として意識を失い倒れ込む。1d10時間後に目覚めるが、前後の記憶が曖昧になる。' },
  { title: '過食衝動',       desc: '目の前のものを手当たり次第に食べようとする。食べ物でないものにも無意識に手を伸ばす。' },
  { title: '幻聴',           desc: '意味不明な囁き声が聞こえ続ける。深海の奥底から届くような声が耳を離れない。' },
  { title: '恐怖症の発症',   desc: '直前に見た何かに対して激しい恐怖症が生まれる。以後それを見るとパニックに陥る。' },
  { title: '強迫行為',       desc: '特定の行動（数を数える、扉を何度も確認するなど）を止められなくなる。' },
  { title: '一時的健忘',     desc: '過去1d10時間の記憶が完全に失われる。自分が何をしていたかまったく思い出せない。' },
  { title: 'ヒステリー発作', desc: '泣き喚き、叫び続ける。自分でも止められず、周囲の注目を集めてしまう。' },
  { title: '解離状態',       desc: '自分が誰なのか、ここがどこなのかが分からなくなる。別の人格が現れることもある。' },
  { title: '被害妄想',       desc: '誰かに監視・追跡されていると確信する。仲間さえも敵の手先に見えてしまう。' },
  { title: '異言',           desc: '意味不明な言語（神話的なものかもしれない）を話し続ける。通常の言葉は話せない。' },
  { title: '一時的盲目',     desc: '突如として視界が失われる。1d10ラウンド後に回復するが、恐怖の記憶は残る。' },
  { title: '逃走衝動',       desc: '目の前の恐怖から逃れるためにひたすら走り続ける。制止しようとする者にも攻撃する。' },
  { title: '昏迷',           desc: '呆然と立ち尽くし、周囲に一切反応しなくなる。1d10分後にようやく我に返る。' },
  { title: '攻撃衝動',       desc: '最も近くにいる存在（仲間も含む）を突然攻撃し始める。止めるには物理的な拘束が必要だ。' },
];

const WEAPON_PRESETS = [
  { cat: '近接', items: [
    { name: '素手',         skill: '素手',           damage: '1d3+db',    attacks: '1', ammo: '', malfunction: '', memo: '' },
    { name: 'ナイフ',       skill: 'ナイフ',         damage: '1d4+2',     attacks: '1', ammo: '', malfunction: '', memo: '' },
    { name: 'こん棒',       skill: 'こん棒',         damage: '1d8+db',    attacks: '1', ammo: '', malfunction: '', memo: '' },
    { name: '斧',           skill: '斧',             damage: '1d8+2+db',  attacks: '1', ammo: '', malfunction: '', memo: '' },
    { name: '日本刀',       skill: '刀剣',           damage: '1d10+1+db', attacks: '1', ammo: '', malfunction: '', memo: '' },
    { name: 'スピア',       skill: '槍',             damage: '1d8+1+db',  attacks: '1', ammo: '', malfunction: '', memo: '' },
  ]},
  { cat: '拳銃', items: [
    { name: '.22拳銃',       skill: '拳銃', damage: '1d6',    attacks: '1', ammo: '9',  malfunction: '99',  memo: '' },
    { name: '.32拳銃',       skill: '拳銃', damage: '1d8',    attacks: '1', ammo: '6',  malfunction: '99',  memo: '' },
    { name: '.38リボルバー', skill: '拳銃', damage: '1d10',   attacks: '1', ammo: '6',  malfunction: '99',  memo: '' },
    { name: '.45オート',     skill: '拳銃', damage: '1d10+2', attacks: '1', ammo: '7',  malfunction: '99',  memo: '' },
    { name: '9mmルガー',     skill: '拳銃', damage: '1d10',   attacks: '1', ammo: '8',  malfunction: '99',  memo: '' },
  ]},
  { cat: '長物', items: [
    { name: 'ショットガン',    skill: 'ショットガン',   damage: '4d6/2d6', attacks: '1', ammo: '2',  malfunction: '100', memo: '近/遠' },
    { name: 'ライフル',        skill: 'ライフル',       damage: '2d6+4',   attacks: '1', ammo: '5',  malfunction: '99',  memo: '' },
    { name: 'トミーガン',      skill: 'サブマシンガン', damage: '1d10+2',  attacks: '3', ammo: '30', malfunction: '96',  memo: '' },
    { name: 'ウィンチェスター', skill: 'ライフル',      damage: '2d6+1',   attacks: '1', ammo: '7',  malfunction: '99',  memo: '' },
  ]},
];

// ============================================================
// UTILITIES
// ============================================================

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function parseDice(expr) {
  const str = expr.trim().replace(/\s+/g, '');
  if (!str) return null;
  // Tokenize: supports "2d6+1d4+3", "3d6-2", "d100" etc.
  const tokenRe = /([+-]?)(\d*d\d+|\d+)/gi;
  const tokens = [];
  let m;
  while ((m = tokenRe.exec(str)) !== null) {
    tokens.push({ sign: m[1] === '-' ? -1 : 1, part: m[2].toLowerCase() });
  }
  if (tokens.length === 0) return null;
  let total = 0, rolls = [];
  for (const { sign, part } of tokens) {
    if (part.includes('d')) {
      const dm = part.match(/^(\d*)d(\d+)$/);
      if (!dm) return null;
      const count = Math.max(1, Math.min(100, parseInt(dm[1] || '1')));
      const sides = Math.max(1, Math.min(10000, parseInt(dm[2])));
      for (let i = 0; i < count; i++) {
        const r = Math.ceil(Math.random() * sides);
        rolls.push(r);
        total += sign * r;
      }
    } else {
      total += sign * parseInt(part);
    }
  }
  return { rolls, total, formula: str };
}

function judgeRoll(roll, skillPct) {
  const s = parseInt(skillPct);
  if (isNaN(s) || s < 0) return null;
  if (roll === 1) return { label: 'クリティカル！', cls: 'roll-critical' };
  if ((s < 50 && roll >= 96) || roll === 100) return { label: 'ファンブル！', cls: 'roll-fumble' };
  if (roll > s) return { label: '失敗', cls: 'roll-fail' };
  if (roll <= Math.floor(s / 5)) return { label: 'イマジナリー！', cls: 'roll-critical' };
  if (roll <= Math.floor(s / 2)) return { label: '困難成功', cls: 'roll-hard' };
  return { label: '通常成功', cls: 'roll-success' };
}

function fmt2(n) { return n < 10 ? '0' + n : '' + n; }
function nowTime() { const d = new Date(); return fmt2(d.getHours()) + ':' + fmt2(d.getMinutes()) + ':' + fmt2(d.getSeconds()); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function calcMaxStats(abilities) {
  return {
    maxHP:  Math.max(1, Math.floor((abilities.CON + abilities.SIZ) / 2)),
    maxMP:  Math.max(1, abilities.POW),
    maxSAN: Math.max(1, abilities.POW * 5),
  };
}

function calcDmgBonus(str, siz) {
  const n = str + siz;
  if (n <= 12) return '−1d6';
  if (n <= 16) return '−1d4';
  if (n <= 24) return '0';
  if (n <= 32) return '+1d4';
  if (n <= 40) return '+1d6';
  if (n <= 56) return '+2d6';
  if (n <= 72) return '+3d6';
  return '+4d6';
}

// ---- Sharing ----
function encodeData(obj) {
  try {
    return btoa(
      encodeURIComponent(JSON.stringify(obj))
        .replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))
    );
  } catch { return ''; }
}

function decodeData(b64) {
  try {
    return JSON.parse(
      decodeURIComponent(
        atob(b64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
      )
    );
  } catch { return null; }
}

function buildShareText(kind, displayName, data) {
  return (
    '━━━━━━━━━━━━━━━━━━━━━━\n' +
    'CoC6 ' + kind + '【' + displayName + '】\n' +
    '━━━━━━━━━━━━━━━━━━━━━━\n' +
    '[COC6DATA]' + encodeData(data) + '\n' +
    '━━━━━━━━━━━━━━━━━━━━━━\n' +
    'CoC6ツールの「インポート」に貼り付けてください。'
  );
}

function parseShareText(text) {
  if (!text || !text.trim()) return null;
  const m = text.match(/\[COC6DATA\]([A-Za-z0-9+/=]+)/);
  if (m) return decodeData(m[1]);
  try { return JSON.parse(text.trim()); } catch {}
  try { return decodeData(text.trim()); } catch {}
  return null;
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy'); document.body.removeChild(ta);
  return Promise.resolve();
}

function charToMember(char) {
  const { imageData, ...snapshot } = char;
  const { maxHP, maxMP, maxSAN } = calcMaxStats(char.abilities);
  return {
    id: uid(), name: char.name || '名無し',
    snapshot,
    hp: char.currentHP ?? maxHP,
    mp: char.currentMP ?? maxMP,
    san: char.currentSAN ?? maxSAN,
    maxHP, maxMP, maxSAN,
    memo: '',
  };
}

// ============================================================
// GLOBAL CSS
// ============================================================

const GLOBAL_CSS = `
  /* ===== CSS VARIABLES ===== */
  :root {
    --bg:#0a0a0f; --bg2:#111118; --bg3:#0d0d14;
    --tx:#d4c9a8; --tx2:#c8b888; --tx3:#8a7a60;
    --ac:#c9a84c; --pac:#4a3e20;
    --re:#8b1a1a; --re2:#c42828; --re-b:#3a0a0a; --re-bg:#160808;
    --gr:#3d9a68; --gr-b:#1a3a1a; --gr-bg:#081408;
    --bl:#4a7aaa; --bl-b:#1a2a4a; --bl-bg:#0a0e1a;
    --bd:#302848; --bd2:#3e3458; --scr:#2d4a3e;
    --pb:#181810; --head:#070710;
  }
  :root[data-theme="light"] {
    --bg:#f5f0e4; --bg2:#ece6d4; --bg3:#e6e0ce;
    --tx:#231a08; --tx2:#6a5840; --tx3:#9a8a68;
    --ac:#8b6010; --pac:#c8a840;
    --re:#8b1a1a; --re2:#b02020; --re-b:#d09080; --re-bg:#f5e8e8;
    --gr:#2a7a50; --gr-b:#90c0a0; --gr-bg:#e8f5ee;
    --bl:#2a5a8a; --bl-b:#90aad0; --bl-bg:#e8eef8;
    --bd:#c8b890; --bd2:#b8a878; --scr:#a89870;
    --pb:#e8e0c8; --head:#ede5d0;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background-color: var(--bg); color: var(--tx); font-family: 'Special Elite', cursive; min-height: 100vh; overflow-x: hidden; }
  body::after {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9998;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.3; mix-blend-mode: overlay;
  }
  [data-theme="light"] body::after { opacity: 0.12; mix-blend-mode: multiply; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--scr); border-radius: 3px; }

  input, textarea, select {
    font-family: 'Special Elite', cursive; background: var(--bg3); color: var(--tx);
    border: 1px solid var(--bd2); border-radius: 3px; padding: 6px 10px;
    outline: none; font-size: 13px; line-height: 1.4; transition: border-color 0.2s; vertical-align: middle;
  }
  input:focus, textarea:focus, select:focus { border-color: var(--ac); }
  input[type=number] { -moz-appearance: textfield; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { opacity: 0.3; }
  select { cursor: pointer; } select option { background: var(--bg2); }

  button { font-family: 'Special Elite', cursive; cursor: pointer; border: none; border-radius: 3px; transition: all 0.15s; font-size: 13px; line-height: 1.4; vertical-align: middle; }

  .tab-btn { background: transparent; color: var(--tx2); border: 1px solid var(--bd2); padding: 8px 16px; font-size: 12px; letter-spacing: 0.06em; font-family: 'Cinzel', serif; border-radius: 3px 3px 0 0; border-bottom: none; white-space: nowrap; }
  .tab-btn:hover { color: var(--ac); border-color: var(--pac); background: var(--bg3); }
  .tab-btn.active { color: var(--ac); background: var(--bg2); border-color: var(--pac); border-bottom: 2px solid var(--ac); }

  .btn-primary { background: var(--pb); color: var(--ac); border: 1px solid var(--pac); padding: 7px 16px; }
  .btn-primary:hover { background: var(--bg2); border-color: var(--ac); transform: translateY(-1px); }
  .btn-primary:active { transform: scale(0.97); }

  .btn-danger { background: var(--re-bg); color: var(--re); border: 1px solid var(--re-b); padding: 5px 10px; font-size: 12px; }
  .btn-danger:hover { color: var(--re2); border-color: var(--re); }

  .btn-ghost { background: transparent; color: var(--tx2); border: 1px solid var(--bd2); padding: 5px 10px; font-size: 12px; }
  .btn-ghost:hover { color: var(--tx); border-color: var(--tx3); }

  .btn-green { background: var(--gr-bg); color: var(--gr); border: 1px solid var(--gr-b); padding: 7px 14px; font-size: 12px; }
  .btn-green:hover { border-color: var(--gr); }

  .btn-share { background: var(--bl-bg); color: var(--bl); border: 1px solid var(--bl-b); padding: 5px 12px; font-size: 12px; }
  .btn-share:hover { border-color: var(--bl); }

  .btn-theme { background: var(--bg3); color: var(--tx2); border: 1px solid var(--bd2); padding: 5px 12px; font-size: 12px; border-radius: 3px; }
  .btn-theme:hover { color: var(--ac); border-color: var(--pac); }

  .section-title { font-family: 'Cinzel', serif; color: var(--ac); font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid var(--bd); padding-bottom: 8px; margin-bottom: 14px; }
  .card { background: var(--bg2); border: 1px solid var(--bd); border-radius: 4px; padding: 16px; margin-bottom: 14px; }

  .tab-bar { display: flex; gap: 4px; flex-wrap: wrap; padding: 0 16px; border-bottom: 1px solid var(--bd); }

  .abilities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 8px; }
  .skills-grid    { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 5px; }
  .creature-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  .info-grid      { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0 14px; }
  .session-grid   { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }
  .member-grid    { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }

  .creature-card { background: var(--bg2); border: 1px solid var(--bd); border-radius: 4px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
  .creature-card:hover { border-color: var(--pac); box-shadow: 0 0 14px rgba(201,168,76,0.07); }

  .char-tab { background: var(--bg3); color: var(--tx2); border: 1px solid var(--bd2); padding: 5px 12px; font-size: 12px; border-radius: 3px; white-space: nowrap; }
  .char-tab:hover { color: var(--ac); border-color: var(--pac); }
  .char-tab.active { color: var(--ac); background: var(--pb); border-color: var(--pac); }

  .group-tab { background: var(--bl-bg); color: var(--bl); border: 1px solid var(--bl-b); padding: 5px 12px; font-size: 12px; border-radius: 3px; white-space: nowrap; }
  .group-tab:hover { border-color: var(--bl); }
  .group-tab.active { background: var(--bl-bg); border-color: var(--bl); font-weight: bold; }

  .weapon-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; padding: 8px; background: var(--bg3); border: 1px solid var(--bd); border-radius: 3px; margin-bottom: 6px; }
  .equip-row  { display: flex; gap: 6px; align-items: center; padding: 6px 8px; background: var(--bg3); border: 1px solid var(--bd); border-radius: 3px; margin-bottom: 5px; }
  .custom-skill-row { display: flex; gap: 6px; align-items: center; padding: 5px 8px; background: var(--bg3); border: 1px solid var(--bd); border-radius: 3px; margin-bottom: 5px; }

  .share-box { background: var(--bl-bg); border: 1px solid var(--bl-b); border-radius: 4px; padding: 14px; margin-top: 10px; }
  .import-box { background: var(--gr-bg); border: 1px solid var(--gr-b); border-radius: 4px; padding: 14px; margin-top: 10px; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 9999; overflow: auto; padding: 20px; display: flex; align-items: flex-start; justify-content: center; }
  .modal-inner { background: var(--bg2); border: 1px solid var(--pac); border-radius: 6px; padding: 24px; width: 100%; max-width: 780px; margin: auto; }

  .sketch-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; padding: 8px; background: var(--bg3); border-radius: 3px; border: 1px solid var(--bd); }

  @keyframes eldritch-reveal { 0% { opacity:0;transform:scale(1.6) rotate(-4deg);letter-spacing:0.5em;filter:blur(6px); } 50% { opacity:0.7;filter:blur(1px); } 75% { transform:scale(1.04) rotate(0.5deg);filter:blur(0); } 100% { opacity:1;transform:scale(1) rotate(0);letter-spacing:normal;filter:blur(0); } }
  @keyframes flicker { 0%,18%,20%,24%,54%,56%,100% { opacity:1; } 19%,22%,55% { opacity:0.15; } }
  @keyframes turn-pulse { 0%,100% { box-shadow:0 0 0 0 rgba(201,168,76,0.5); } 50% { box-shadow:0 0 0 8px rgba(201,168,76,0); } }
  @keyframes madness-in { 0% { opacity:0;transform:translateY(-8px) scale(0.97); } 100% { opacity:1;transform:translateY(0) scale(1); } }
  @keyframes header-glow { 0%,100% { text-shadow:0 0 18px rgba(201,168,76,0.25); } 50% { text-shadow:0 0 30px rgba(201,168,76,0.45), 0 0 60px rgba(201,168,76,0.1); } }
  @keyframes random-flash { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes slide-in { from { opacity:0;transform:translateY(-6px); } to { opacity:1;transform:translateY(0); } }

  .roll-result-anim { animation: eldritch-reveal 0.75s ease-out forwards; }
  .roll-fumble-anim { animation: flicker 0.35s ease-in-out 3; }
  .roll-critical-anim { animation: flicker 0.28s ease-in-out 4; }
  .madness-anim { animation: madness-in 0.35s ease-out; }
  .current-turn-row { animation: turn-pulse 1.5s ease-in-out infinite; }
  .app-title { animation: header-glow 4s ease-in-out infinite; }
  .random-flash { animation: random-flash 0.15s ease-in-out 4; }
  .slide-in { animation: slide-in 0.2s ease-out; }

  @media (max-width: 640px) {
    .abilities-grid { grid-template-columns: 1fr 1fr; }
    .skills-grid    { grid-template-columns: 1fr; }
    .creature-grid  { grid-template-columns: 1fr; }
    .info-grid      { grid-template-columns: 1fr 1fr; }
    .session-grid   { grid-template-columns: 1fr; }
    .member-grid    { grid-template-columns: 1fr; }
    .tab-btn        { padding: 6px 10px; font-size: 11px; }
    .card           { padding: 12px; }
  }
  @media (max-width: 380px) { .abilities-grid { grid-template-columns: 1fr; } .info-grid { grid-template-columns: 1fr; } }
`;

// ============================================================
// LEAF COMPONENTS
// ============================================================

const LBL = { display: 'block', fontSize: 12, color: 'var(--tx2)', marginBottom: 4, letterSpacing: '0.1em', fontFamily: "'Cinzel', serif", textTransform: 'uppercase' };

function LabeledInput({ label, value, onChange, type, placeholder, style }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={LBL}>{label}</label>
      <input type={type || 'text'} value={value} onChange={onChange} placeholder={placeholder} style={{ width: '100%', ...style }} />
    </div>
  );
}

function LabeledTextarea({ label, value, onChange, placeholder, rows }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={LBL}>{label}</label>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows || 3} style={{ width: '100%', resize: 'vertical', lineHeight: 1.6 }} />
    </div>
  );
}

function AbilityRow({ label, value, onChange, flash }) {
  return (
    <div className={flash ? 'random-flash' : ''}
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 3, padding: '5px 10px' }}>
      <span style={{ fontFamily: "'Cinzel', serif", color: 'var(--ac)', fontSize: 13, width: 32, flexShrink: 0 }}>{label}</span>
      <input type="number" min="0" max="99" value={value} onChange={onChange}
        style={{ width: 50, textAlign: 'center', fontSize: 15, padding: '4px 6px', lineHeight: '1.4' }} />
      <span style={{ color: 'var(--tx3)', fontSize: 11, flexShrink: 0 }}>×5</span>
      <span style={{ color: 'var(--tx)', fontSize: 14, minWidth: 28, textAlign: 'right' }}>{value * 5}</span>
    </div>
  );
}

function StatTracker({ label, current, max, color, onDecrement, onIncrement }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const barColor = pct <= 25 ? 'var(--re)' : pct <= 50 ? 'var(--ac)' : color;
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid ' + color + '44', borderRadius: 4, padding: '9px 12px', flex: '1 1 100px', minWidth: 95 }}>
      <div style={{ fontFamily: "'Cinzel', serif", color, fontSize: 10, letterSpacing: '0.1em', marginBottom: 7, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        <button onClick={onDecrement} style={{ background: 'var(--re-bg)', color: 'var(--re)', border: '1px solid var(--re-b)', width: 24, height: 24, fontSize: 15, borderRadius: 3, lineHeight: 1, fontFamily: 'monospace', flexShrink: 0 }}>−</button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <span style={{ fontSize: 18, color: 'var(--tx)', fontFamily: "'Cinzel', serif" }}>{current}</span>
          <span style={{ fontSize: 10, color: 'var(--tx3)' }}>/{max}</span>
        </div>
        <button onClick={onIncrement} style={{ background: 'var(--gr-bg)', color: 'var(--gr)', border: '1px solid var(--gr-b)', width: 24, height: 24, fontSize: 15, borderRadius: 3, lineHeight: 1, fontFamily: 'monospace', flexShrink: 0 }}>＋</button>
      </div>
      <div style={{ height: 3, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: barColor, transition: 'width 0.3s, background 0.3s' }} />
      </div>
    </div>
  );
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handle = () => copyText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  return (
    <button className="btn-share" onClick={handle} style={{ minWidth: 80 }}>
      {copied ? '✓ コピー済' : (label || '📋 コピー')}
    </button>
  );
}

// ============================================================
// SKETCH CANVAS (手書きメモ)
// ============================================================

function SketchCanvas({ data, onChange }) {
  const canvasRef   = useRef(null);
  const drawingRef  = useRef(false);
  const lastPosRef  = useRef(null);
  const penRef      = useRef({ color: '#231a08', size: 2, eraser: false });
  const [penColor,  setPenColor]  = useState('#231a08');
  const [penSize,   setPenSize]   = useState(2);
  const [eraser,    setEraser]    = useState(false);
  const PAPER = '#f8f5ee';

  // sync state → ref (avoids stale closures in draw handlers)
  penRef.current = { color: penColor, size: penSize, eraser };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (data) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = data;
    }
  }, []); // mount only — data is captured from closure at mount

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  const startDraw = (e) => {
    if (e.touches) e.preventDefault();
    drawingRef.current = true;
    lastPosRef.current = getPos(e);
  };
  const doDraw = (e) => {
    if (e.touches) e.preventDefault();
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e), last = lastPosRef.current || pos;
    const p = penRef.current;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = p.eraser ? PAPER : p.color;
    ctx.lineWidth   = p.eraser ? p.size * 4 : p.size;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke();
    lastPosRef.current = pos;
  };
  const endDraw = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPosRef.current = null;
    if (canvasRef.current) onChange(canvasRef.current.toDataURL('image/png'));
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').fillStyle = PAPER;
    canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  const PEN_COLORS = ['#231a08','#c42828','#2a5a8a','#2a7a50','#8b6010','#6a2a7a'];
  const SIZES = [1, 2, 4, 8];

  return (
    <div>
      <div className="sketch-toolbar">
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {PEN_COLORS.map(c => (
            <button key={c} onClick={() => { setPenColor(c); setEraser(false); }}
              style={{ width: 20, height: 20, borderRadius: '50%', background: c, padding: 0, flexShrink: 0,
                border: !eraser && penColor === c ? '2px solid var(--ac)' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--tx2)' }}>太さ:</span>
          {SIZES.map(s => (
            <button key={s} onClick={() => { setPenSize(s); setEraser(false); }}
              style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                background: penSize === s && !eraser ? 'var(--bg2)' : 'transparent',
                border: '1px solid var(--bd2)', borderRadius: 3, padding: 0 }}>
              <div style={{ width: Math.min(s * 2.5, 14), height: Math.min(s * 2.5, 14), borderRadius: '50%', background: 'var(--tx)' }} />
            </button>
          ))}
        </div>
        <button onClick={() => setEraser(e => !e)}
          style={{ fontSize: 11, padding: '3px 10px', background: eraser ? 'var(--pb)' : 'transparent',
            color: eraser ? 'var(--ac)' : 'var(--tx2)', border: '1px solid ' + (eraser ? 'var(--pac)' : 'var(--bd2)'), borderRadius: 3, cursor: 'pointer' }}>
          消しゴム
        </button>
        <button onClick={clearCanvas}
          style={{ fontSize: 11, padding: '3px 10px', background: 'transparent', color: 'var(--re)', border: '1px solid var(--re-b)', borderRadius: 3, cursor: 'pointer' }}>
          クリア
        </button>
        {data && <span style={{ fontSize: 10, color: 'var(--tx3)' }}>✓ 保存済</span>}
      </div>
      <canvas ref={canvasRef} width={800} height={380}
        onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={endDraw}
        style={{ width: '100%', touchAction: 'none', cursor: eraser ? 'cell' : 'crosshair',
          border: '1px solid var(--bd)', borderRadius: 3, display: 'block', background: PAPER }} />
    </div>
  );
}

// ============================================================
// CHARACTER MANAGEMENT PANEL
// ============================================================

function CharacterPanel({ characters, activeId, onSelect, onAdd, onDuplicate, onDelete, onImport }) {
  const [panel, setPanel]         = useState(null); // 'share' | 'import'
  const [importText, setImportText] = useState('');
  const [importErr, setImportErr]   = useState('');
  const active = characters.find(c => c.id === activeId) || characters[0];

  const shareText = active
    ? buildShareText('探索者', active.name || '名無し', (({ imageData, ...rest }) => rest)(active))
    : '';

  const handleImport = () => {
    const data = parseShareText(importText);
    if (!data || !data.abilities) { setImportErr('有効なキャラクターデータが見つかりません'); return; }
    onImport({ ...data, id: uid(), imageData: null });
    setImportText(''); setImportErr(''); setPanel(null);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Cinzel', serif", color: 'var(--tx2)', fontSize: 11, letterSpacing: '0.1em', flexShrink: 0 }}>探索者:</span>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
          {characters.map(c => (
            <button key={c.id} className={'char-tab' + (c.id === activeId ? ' active' : '')}
              onClick={() => { onSelect(c.id); setPanel(null); }}>
              {c.name || '名無し'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flexShrink: 0 }}>
          <button className="btn-primary" onClick={onAdd} style={{ fontSize: 12, padding: '5px 12px' }}>＋ 新規</button>
          <button className="btn-ghost" onClick={onDuplicate} style={{ fontSize: 12 }}>複製</button>
          {characters.length > 1 && <button className="btn-danger" onClick={() => onDelete(activeId)} style={{ fontSize: 12 }}>削除</button>}
          <button className="btn-share" onClick={() => setPanel(panel === 'share' ? null : 'share')} style={{ fontSize: 12 }}>📤 共有</button>
          <button className="btn-green" onClick={() => setPanel(panel === 'import' ? null : 'import')} style={{ fontSize: 12 }}>📥 インポート</button>
        </div>
      </div>

      {active && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--tx3)' }}>
          {active.occupation && <span>{active.occupation}</span>}
          {active.age && <span>　{active.age}歳</span>}
          {active.origin && <span>　{active.origin}出身</span>}
        </div>
      )}

      {panel === 'share' && active && (
        <div className="share-box slide-in">
          <div style={{ fontSize: 11, color: 'var(--bl)', marginBottom: 8, fontFamily: "'Cinzel', serif", letterSpacing: '0.06em' }}>
            📤 このテキストをLINEなどで送ってください（画像は除外）
          </div>
          <textarea readOnly value={shareText} rows={5}
            style={{ width: '100%', fontSize: 11, fontFamily: 'monospace', background: 'var(--bg)', color: 'var(--bl)', border: '1px solid var(--bl-b)', resize: 'none' }}
            onClick={e => e.target.select()} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <CopyButton text={shareText} label="📋 コピー" />
            <button className="btn-ghost" onClick={() => setPanel(null)} style={{ fontSize: 12 }}>閉じる</button>
          </div>
        </div>
      )}

      {panel === 'import' && (
        <div className="import-box slide-in">
          <div style={{ fontSize: 11, color: 'var(--gr)', marginBottom: 8, fontFamily: "'Cinzel', serif", letterSpacing: '0.06em' }}>
            📥 共有テキストを貼り付けてインポート
          </div>
          <textarea value={importText} onChange={e => { setImportText(e.target.value); setImportErr(''); }}
            placeholder="━━━ CoC6 探索者... のテキストを貼り付け ━━━" rows={5}
            style={{ width: '100%', fontSize: 11, fontFamily: 'monospace', resize: 'none' }} />
          {importErr && <div style={{ color: 'var(--re2)', fontSize: 12, marginTop: 4 }}>{importErr}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn-green" onClick={handleImport} style={{ fontSize: 12 }}>インポートする</button>
            <button className="btn-ghost" onClick={() => { setPanel(null); setImportText(''); setImportErr(''); }} style={{ fontSize: 12 }}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CHARACTER DETAIL MODAL (read-only, for GM view)
// ============================================================

function CharDetailModal({ member, onClose }) {
  if (!member) return null;
  const char = member.snapshot;
  const { abilities } = char;
  const { maxHP, maxMP, maxSAN } = calcMaxStats(abilities);
  const dmgBonus = calcDmgBonus(abilities.STR, abilities.SIZ);
  const boostedSkills = COC6_SKILLS.filter(skill => {
    const base = skill.base === 'DEX×2' ? abilities.DEX * 2 : (typeof skill.base === 'number' ? skill.base : 0);
    return (char.skills[skill.key] ?? base) > base || skill.key === 'cthulhuMythos';
  });

  return (
    <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Cinzel', serif", color: 'var(--ac)', fontSize: 20, marginBottom: 4 }}>{char.name}</h2>
            <div style={{ fontSize: 13, color: 'var(--tx2)' }}>
              {[char.furigana, char.occupation, char.age && char.age + '歳', char.origin].filter(Boolean).join('　/　')}
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 18, padding: '4px 10px' }}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="section-title">能力値</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(abilities).map(([ab, val]) => (
              <div key={ab} style={{ textAlign: 'center', background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 3, padding: '6px 12px', minWidth: 54 }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, color: 'var(--tx2)' }}>{ab}</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--ac)' }}>{val}</div>
                <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{val*5}%</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--tx2)' }}>
          {[['最大HP', maxHP, 'var(--gr)'], ['最大MP', maxMP, 'var(--bl)'], ['最大SAN', maxSAN, 'var(--ac)'], ['DB', dmgBonus, 'var(--ac)']].map(([l,v,c]) => (
            <span key={l}>{l}: <span style={{ color: c }}>{v}</span></span>
          ))}
        </div>

        {boostedSkills.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div className="section-title">注目技能（基本値より高いもの）</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {boostedSkills.map(skill => {
                const base = skill.base === 'DEX×2' ? abilities.DEX * 2 : (typeof skill.base === 'number' ? skill.base : 0);
                const cur = char.skills[skill.key] ?? base;
                return (
                  <span key={skill.key} style={{ background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 2, padding: '3px 8px', fontSize: 11 }}>
                    {skill.label} <span style={{ color: 'var(--ac)' }}>{cur}%</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {(char.appearance || char.personality || char.background) && (
          <div style={{ marginBottom: 16 }}>
            <div className="section-title">背景・性格</div>
            {[['外見', char.appearance], ['性格', char.personality], ['背景', char.background]].map(([l, v]) =>
              v ? <div key={l} style={{ marginBottom: 8, fontSize: 12, lineHeight: 1.6 }}><span style={{ color: 'var(--tx2)', fontSize: 10, fontFamily: "'Cinzel', serif" }}>{l}　</span>{v}</div> : null
            )}
          </div>
        )}

        {char.weapons && char.weapons.length > 0 && (
          <div>
            <div className="section-title">武器</div>
            {char.weapons.map(w => (
              <div key={w.id} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--bd)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--ac)', minWidth: 80 }}>{w.name}</span>
                {w.skill && <span style={{ color: 'var(--tx2)' }}>技能: {w.skill}</span>}
                {w.damage && <span>ダメージ: {w.damage}</span>}
                {w.memo && <span style={{ color: 'var(--tx3)' }}>— {w.memo}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TAB 1: CHARACTER SHEET
// ============================================================

function CharacterSheet({ character, onChange }) {
  const [randomFlash, setRandomFlash] = useState(null);
  const [showPreset,  setShowPreset]  = useState(false);
  const fileRef = useRef(null);

  const set = (field, val) => onChange(prev => ({ ...prev, [field]: val }));
  const setAbility = (key, raw) => onChange(prev => ({ ...prev, abilities: { ...prev.abilities, [key]: Math.max(0, parseInt(raw) || 0) } }));
  const setSkill   = (key, raw) => onChange(prev => ({ ...prev, skills: { ...prev.skills, [key]: Math.max(0, parseInt(raw) || 0) } }));

  const handleRandom = () => {
    const newAbs = {};
    Object.keys(ABILITY_ROLL).forEach(ab => { const r = parseDice(ABILITY_ROLL[ab]); newAbs[ab] = r ? r.total : 10; });
    const maxs = calcMaxStats(newAbs);
    onChange(prev => ({ ...prev, abilities: newAbs, currentHP: maxs.maxHP, currentMP: maxs.maxMP, currentSAN: maxs.maxSAN }));
    setRandomFlash(Date.now());
    setTimeout(() => setRandomFlash(null), 800);
  };

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('2MB以下の画像を選択してください'); return; }
    const reader = new FileReader();
    reader.onload = ev => onChange(prev => ({ ...prev, imageData: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const { abilities, currentHP, currentMP, currentSAN, skills, weapons = [], equipment = [] } = character;
  const bonuses = character.bonuses || { HP: 0, MP: 0, STR: 0, CON: 0, SIZ: 0, DEX: 0, APP: 0, INT: 0, POW: 0, EDU: 0, skills: [] };
  const setBonus = (key, val) => onChange(prev => ({ ...prev, bonuses: { ...(prev.bonuses||{}), [key]: val } }));
  const addBonusSkill = () => onChange(prev => ({ ...prev, bonuses: { ...(prev.bonuses||{}), skills: [...((prev.bonuses||{}).skills||[]), { id: uid(), label: '', value: 0 }] } }));
  const upBonusSkill  = (id, f, v) => onChange(prev => ({ ...prev, bonuses: { ...(prev.bonuses||{}), skills: ((prev.bonuses||{}).skills||[]).map(s => s.id===id ? {...s,[f]:v} : s) } }));
  const delBonusSkill = (id) => onChange(prev => ({ ...prev, bonuses: { ...(prev.bonuses||{}), skills: ((prev.bonuses||{}).skills||[]).filter(s => s.id!==id) } }));

  const { maxHP: baseMaxHP, maxMP: baseMaxMP, maxSAN } = calcMaxStats(abilities);
  const maxHP = baseMaxHP + (bonuses.HP || 0);
  const maxMP = baseMaxMP + (bonuses.MP || 0);
  const dmgBonus = calcDmgBonus(abilities.STR, abilities.SIZ);
  const occFormula = OCC_FORMULAS.find(f => f.key === character.occupationFormula) || OCC_FORMULAS[0];

  const occTotal = occFormula.calc(abilities);
  const intTotal = abilities.INT * 10;
  const usedSkillPoints = COC6_SKILLS.reduce((total, skill) => {
    const base = skill.base === 'DEX×2' ? abilities.DEX * 2 : (typeof skill.base === 'number' ? skill.base : 0);
    const cur = skills[skill.key] !== undefined ? skills[skill.key] : base;
    return total + Math.max(0, cur - base);
  }, 0) + (character.customSkills||[]).reduce((total, sk) => total + (sk.value||0), 0);
  const remainingPoints = occTotal + intTotal - usedSkillPoints;

  const addWeapon = () => onChange(prev => ({ ...prev, weapons: [...(prev.weapons||[]), { id: uid(), name:'', skill:'', damage:'', attacks:'1', ammo:'', malfunction:'', memo:'' }] }));
  const upWeapon  = (id, f, v) => onChange(prev => ({ ...prev, weapons: (prev.weapons||[]).map(w => w.id===id ? {...w,[f]:v} : w) }));
  const delWeapon = (id) => onChange(prev => ({ ...prev, weapons: (prev.weapons||[]).filter(w => w.id!==id) }));
  const addEquip  = () => onChange(prev => ({ ...prev, equipment: [...(prev.equipment||[]), { id: uid(), name:'', qty:'1', memo:'' }] }));
  const upEquip   = (id, f, v) => onChange(prev => ({ ...prev, equipment: (prev.equipment||[]).map(e => e.id===id ? {...e,[f]:v} : e) }));
  const delEquip  = (id) => onChange(prev => ({ ...prev, equipment: (prev.equipment||[]).filter(e => e.id!==id) }));
  const addCustomSkill = () => onChange(prev => ({ ...prev, customSkills: [...(prev.customSkills||[]), { id: uid(), label:'', value: 0 }] }));
  const upCustomSkill  = (id, f, v) => onChange(prev => ({ ...prev, customSkills: (prev.customSkills||[]).map(s => s.id===id ? {...s,[f]:v} : s) }));
  const delCustomSkill = (id) => onChange(prev => ({ ...prev, customSkills: (prev.customSkills||[]).filter(s => s.id!==id) }));

  return (
    <div style={{ padding: '0 20px 20px', maxWidth: 940, margin: '0 auto' }}>

      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0 }}>
            <div onClick={() => fileRef.current && fileRef.current.click()}
              style={{ width: 88, height: 108, background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ac)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bd2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bd2)'}>
              {character.imageData
                ? <img src={character.imageData} alt="portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ textAlign: 'center', color: 'var(--tx3)', fontSize: 11, lineHeight: 1.5, padding: 8 }}><div style={{ fontSize: 22, marginBottom: 4 }}>👤</div>画像を<br/>追加</div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
            {character.imageData && <button className="btn-ghost" onClick={() => onChange(prev => ({...prev, imageData: null}))} style={{ width: '100%', marginTop: 4, fontSize: 10, padding: '3px 0' }}>削除</button>}
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ marginBottom: 6 }}>
              <label style={LBL}>探索者名</label>
              <input value={character.name} onChange={e => set('name', e.target.value)} placeholder="名前を入力..." style={{ width: '100%', fontSize: 17, padding: '6px 10px' }} />
            </div>
            <div>
              <label style={LBL}>ふりがな</label>
              <input value={character.furigana||''} onChange={e => set('furigana', e.target.value)} placeholder="ふりがな" style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignSelf: 'flex-end' }}>
            {[['DB', dmgBonus, 'var(--ac)'], ['職業P', occFormula.calc(abilities), 'var(--gr)'], ['趣味P', abilities.INT*10, 'var(--bl)'], ['SAN上限', maxSAN, 'var(--ac)']].map(([l,v,c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 3, padding: '6px 10px', minWidth: 52 }}>
                <div style={{ fontSize: 9, color: 'var(--tx2)', fontFamily: "'Cinzel', serif", marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 14, color: c, fontFamily: "'Cinzel', serif" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card">
        <div className="section-title">基本情報</div>
        <div className="info-grid">
          <LabeledInput label="年齢" value={character.age||''} onChange={e => set('age', e.target.value)} type="number" placeholder="歳" />
          <LabeledInput label="誕生日" value={character.birthday||''} onChange={e => set('birthday', e.target.value)} placeholder="例: 1920/04/15" />
          <LabeledInput label="職業" value={character.occupation||''} onChange={e => set('occupation', e.target.value)} placeholder="探偵、医師..." />
          <LabeledInput label="学位" value={character.degree||''} onChange={e => set('degree', e.target.value)} placeholder="博士、修士..." />
          <LabeledInput label="出身地" value={character.origin||''} onChange={e => set('origin', e.target.value)} placeholder="都市・国名..." />
          <div style={{ marginBottom: 10 }}>
            <label style={LBL}>職業P計算式</label>
            <select value={character.occupationFormula||'EDU20'} onChange={e => set('occupationFormula', e.target.value)} style={{ width: '100%' }}>
              {OCC_FORMULAS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="card">
        <div className="section-title">外見・性格・背景</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0 14px' }}>
          <LabeledTextarea label="外見" value={character.appearance||''} onChange={e => set('appearance', e.target.value)} placeholder="容姿、服装、特徴..." rows={3} />
          <LabeledTextarea label="性格・信条" value={character.personality||''} onChange={e => set('personality', e.target.value)} placeholder="性格、信念、行動原理..." rows={3} />
          <LabeledTextarea label="背景・経歴" value={character.background||''} onChange={e => set('background', e.target.value)} placeholder="生い立ち、重要な出来事..." rows={3} />
        </div>
      </div>

      {/* Abilities */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <div className="section-title" style={{ marginBottom: 0, border: 'none', paddingBottom: 0 }}>能力値<span style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'inherit', marginLeft: 8 }}>（右列 = ×5 基本技能値）</span></div>
          <button className="btn-green" onClick={handleRandom} style={{ fontSize: 12 }}>🎲 ランダム決定</button>
        </div>
        <div className="abilities-grid">
          {Object.keys(ABILITY_ROLL).map(ab => (
            <AbilityRow key={ab} label={ab} value={abilities[ab]} flash={!!randomFlash} onChange={e => setAbility(ab, e.target.value)} />
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--tx3)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {Object.entries(ABILITY_ROLL).map(([ab, f]) => <span key={ab}><span style={{ color: 'var(--tx3)' }}>{ab}:</span> {f}</span>)}
        </div>
      </div>

      {/* Derived */}
      <div className="card">
        <div className="section-title">副次能力値</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <StatTracker label="HP 耐久力" current={currentHP} max={maxHP} color="var(--gr)"
            onDecrement={() => set('currentHP', clamp(currentHP-1,0,maxHP))} onIncrement={() => set('currentHP', clamp(currentHP+1,0,maxHP))} />
          <StatTracker label="MP マジック" current={currentMP} max={maxMP} color="var(--bl)"
            onDecrement={() => set('currentMP', clamp(currentMP-1,0,maxMP))} onIncrement={() => set('currentMP', clamp(currentMP+1,0,maxMP))} />
          <StatTracker label="SAN 正気度" current={currentSAN} max={maxSAN} color="var(--ac)"
            onDecrement={() => set('currentSAN', clamp(currentSAN-1,0,maxSAN))} onIncrement={() => set('currentSAN', clamp(currentSAN+1,0,maxSAN))} />
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: 'var(--tx2)', marginBottom: 10 }}>
          {[['最大HP',maxHP,'(CON+SIZ)÷2'],['最大MP',maxMP,'POW'],['最大SAN',maxSAN,'POW×5'],['DB',dmgBonus,'STR+SIZ']].map(([l,v,f]) => (
            <span key={l}><span style={{ fontFamily: "'Cinzel', serif", fontSize: 10 }}>{l}: </span><span style={{ color: 'var(--ac)' }}>{v}</span><span style={{ color: 'var(--tx3)', fontSize: 10 }}> {f}</span></span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[['一時的狂気','temporaryInsanity'],['不定の狂気','indefiniteInsanity']].map(([lbl,key]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--tx2)' }}>
              <input type="checkbox" checked={character[key]||false} onChange={e => set(key, e.target.checked)} style={{ width:14,height:14,accentColor:'var(--re)',padding:0 }} />
              {lbl}
            </label>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div className="section-title" style={{ marginBottom: 0, border: 'none', paddingBottom: 0 }}>
            技能リスト <span style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'inherit', textTransform: 'none' }}>基本値 → 現在値</span>
          </div>
          <button className="btn-primary" onClick={addCustomSkill} style={{ fontSize: 12, padding: '5px 12px' }}>＋ 技能追加</button>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, marginBottom: 14, padding: '6px 10px', background: 'var(--bg3)', borderRadius: 3, border: '1px solid var(--bd)', alignItems: 'center' }}>
          <span style={{ color: 'var(--tx3)' }}>職業P: <span style={{ color: 'var(--gr)', fontFamily: "'Cinzel', serif" }}>{occTotal}</span></span>
          <span style={{ color: 'var(--tx3)' }}>趣味P: <span style={{ color: 'var(--bl)', fontFamily: "'Cinzel', serif" }}>{intTotal}</span></span>
          <span style={{ color: 'var(--tx3)', marginLeft: 'auto' }}>配分済み: <span style={{ color: remainingPoints < 0 ? 'var(--re2)' : 'var(--ac)', fontFamily: "'Cinzel', serif" }}>{usedSkillPoints}</span><span style={{ color: 'var(--tx3)' }}> / {occTotal + intTotal}</span></span>
          <span style={{ color: 'var(--tx3)' }}>残り: <span style={{ color: remainingPoints < 0 ? 'var(--re2)' : 'var(--gr)', fontFamily: "'Cinzel', serif" }}>{remainingPoints}</span></span>
        </div>
        <div className="skills-grid">
          {COC6_SKILLS.map(skill => {
            const base = skill.base === 'DEX×2' ? abilities.DEX * 2 : skill.base;
            const cur  = skills[skill.key] !== undefined ? skills[skill.key] : (typeof base === 'number' ? base : 0);
            return (
              <div key={skill.key} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 3, padding: '4px 8px' }}>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--tx)' }}>{skill.label}</span>
                <span style={{ fontSize: 11, color: 'var(--tx3)', width: 26, textAlign: 'right', flexShrink: 0 }}>{base}</span>
                <input type="number" min="0" max="99" value={cur} onChange={e => setSkill(skill.key, e.target.value)}
                  style={{ width: 46, textAlign: 'center', padding: '3px 4px', fontSize: 14, lineHeight: '1.4' }} />
              </div>
            );
          })}
        </div>
        {(character.customSkills||[]).length > 0 && (
          <div style={{ borderTop: '1px solid var(--bd)', marginTop: 10, paddingTop: 10 }}>
            <div className="skills-grid">
              {(character.customSkills||[]).map(sk => (
                <div key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 3, padding: '4px 8px' }}>
                  <input value={sk.label} onChange={e => upCustomSkill(sk.id,'label',e.target.value)}
                    placeholder="技能名…" style={{ flex: 1, fontSize: 12, background: 'transparent', border: 'none', outline: 'none', color: 'var(--tx)', padding: 0 }} />
                  <input type="number" min="0" max="99" value={sk.value} onChange={e => upCustomSkill(sk.id,'value',Math.max(0,parseInt(e.target.value)||0))}
                    style={{ width: 44, textAlign: 'center', padding: '3px 4px', fontSize: 13, lineHeight: '1.4' }} />
                  <button onClick={() => delCustomSkill(sk.id)}
                    style={{ background: 'transparent', color: 'var(--tx3)', border: 'none', fontSize: 12, cursor: 'pointer', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weapons */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="section-title" style={{ marginBottom: 0, border: 'none', paddingBottom: 0 }}>武器・攻撃</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-ghost" onClick={() => setShowPreset(s => !s)} style={{ fontSize: 12 }}>📋 プリセット</button>
            <button className="btn-primary" onClick={addWeapon} style={{ fontSize: 12, padding: '5px 12px' }}>＋ 追加</button>
          </div>
        </div>
        {showPreset && (
          <div className="slide-in" style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 4, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--tx2)', marginBottom: 10, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>追加する武器を選択</div>
            {WEAPON_PRESETS.map(cat => (
              <div key={cat.cat} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', marginBottom: 5 }}>{cat.cat}</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {cat.items.map(w => (
                    <button key={w.name} className="btn-ghost"
                      onClick={() => onChange(prev => ({ ...prev, weapons: [...(prev.weapons||[]), { id: uid(), ...w }] }))}
                      style={{ fontSize: 12, padding: '4px 10px' }}>
                      {w.name}
                      <span style={{ fontSize: 10, color: 'var(--tx3)', marginLeft: 5 }}>{w.damage}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn-ghost" onClick={() => setShowPreset(false)} style={{ fontSize: 11, marginTop: 4 }}>閉じる</button>
          </div>
        )}
        {weapons.length === 0 && <div style={{ color: 'var(--tx3)', fontSize: 12, textAlign: 'center', padding: '10px 0' }}>武器が登録されていません</div>}
        {weapons.map(w => (
          <div key={w.id} className="weapon-row">
            <input value={w.name}        onChange={e => upWeapon(w.id,'name',e.target.value)}        placeholder="武器名"  style={{ flex: '2 1 90px', minWidth: 70 }} />
            <input value={w.skill}       onChange={e => upWeapon(w.id,'skill',e.target.value)}       placeholder="技能"    style={{ flex: '1.2 1 65px', minWidth: 55 }} />
            <input value={w.damage}      onChange={e => upWeapon(w.id,'damage',e.target.value)}      placeholder="1d6"     style={{ flex: '1 1 50px', minWidth: 45 }} />
            <input value={w.attacks}     onChange={e => upWeapon(w.id,'attacks',e.target.value)}     placeholder="1"       style={{ flex: '0.5 1 28px', minWidth: 28, textAlign: 'center' }} />
            <input value={w.ammo}        onChange={e => upWeapon(w.id,'ammo',e.target.value)}        placeholder="残弾"    style={{ flex: '0.8 1 38px', minWidth: 35 }} />
            <input value={w.malfunction} onChange={e => upWeapon(w.id,'malfunction',e.target.value)} placeholder="故障#"   style={{ flex: '0.8 1 38px', minWidth: 35 }} />
            <input value={w.memo}        onChange={e => upWeapon(w.id,'memo',e.target.value)}        placeholder="メモ"    style={{ flex: '1.5 1 70px', minWidth: 55 }} />
            <button className="btn-danger" onClick={() => delWeapon(w.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* Equipment */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="section-title" style={{ marginBottom: 0, border: 'none', paddingBottom: 0 }}>所持品・装備</div>
          <button className="btn-primary" onClick={addEquip} style={{ fontSize: 12, padding: '5px 12px' }}>＋ 追加</button>
        </div>
        {equipment.length === 0 && <div style={{ color: 'var(--tx3)', fontSize: 12, textAlign: 'center', padding: '10px 0' }}>所持品が登録されていません</div>}
        {equipment.map(e => (
          <div key={e.id} className="equip-row">
            <input value={e.name} onChange={ev => upEquip(e.id,'name',ev.target.value)} placeholder="アイテム名" style={{ flex: '2 1 90px', minWidth: 70 }} />
            <span style={{ fontSize: 11, color: 'var(--tx2)' }}>×</span>
            <input type="number" value={e.qty} onChange={ev => upEquip(e.id,'qty',ev.target.value)} placeholder="1" style={{ width: 44, textAlign: 'center' }} />
            <input value={e.memo} onChange={ev => upEquip(e.id,'memo',ev.target.value)} placeholder="メモ" style={{ flex: '3 1 110px', minWidth: 80 }} />
            <button className="btn-danger" onClick={() => delEquip(e.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* Temporary Bonuses */}
      <div className="card">
        <div className="section-title">一時的ボーナス</div>
        <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 12 }}>アイテム・呪文などによる一時的な増加分を記録します</div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          {[['HP', 'var(--gr)'], ['MP', 'var(--bl)']].map(([key, col]) => (
            <div key={key} style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 3, padding: '8px 12px', minWidth: 110 }}>
              <div style={{ fontSize: 10, color: col, fontFamily: "'Cinzel', serif", marginBottom: 5 }}>{key} ボーナス</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13, color: 'var(--tx3)' }}>+</span>
                <input type="number" min="0" value={bonuses[key]||0} onChange={e => setBonus(key, Math.max(0, parseInt(e.target.value)||0))}
                  style={{ width: 54, textAlign: 'center', padding: '4px 6px', fontSize: 14 }} />
                {(bonuses[key]||0) > 0 && <span style={{ fontSize: 11, color: col }}>→ {key==='HP' ? maxHP : maxMP}</span>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--tx2)', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em', marginBottom: 8 }}>能力値ボーナス</div>
          <div className="abilities-grid">
            {Object.keys(ABILITY_ROLL).map(ab => (
              <div key={ab} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 3, padding: '5px 10px' }}>
                <span style={{ fontFamily: "'Cinzel', serif", color: 'var(--ac)', fontSize: 12, width: 32, flexShrink: 0 }}>{ab}</span>
                <span style={{ fontSize: 11, color: 'var(--tx3)' }}>+</span>
                <input type="number" min="0" value={bonuses[ab]||0} onChange={e => setBonus(ab, Math.max(0, parseInt(e.target.value)||0))}
                  style={{ width: 40, textAlign: 'center', padding: '3px 5px', fontSize: 13 }} />
                {(bonuses[ab]||0) > 0 && <span style={{ fontSize: 11, color: 'var(--gr)', marginLeft: 2 }}>{abilities[ab]} → <span style={{ fontFamily: "'Cinzel', serif" }}>{abilities[ab] + (bonuses[ab]||0)}</span></span>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--tx2)', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>技能ボーナス</div>
            <button className="btn-primary" onClick={addBonusSkill} style={{ fontSize: 11, padding: '3px 10px' }}>＋ 追加</button>
          </div>
          {(bonuses.skills||[]).length === 0 && <div style={{ fontSize: 12, color: 'var(--tx3)', textAlign: 'center', padding: '8px 0' }}>技能ボーナスなし</div>}
          <div className="skills-grid">
            {(bonuses.skills||[]).map(sk => (
              <div key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 3, padding: '4px 8px' }}>
                <input value={sk.label} onChange={e => upBonusSkill(sk.id,'label',e.target.value)}
                  placeholder="技能名…" style={{ flex: 1, fontSize: 12, background: 'transparent', border: 'none', outline: 'none', color: 'var(--tx)', padding: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--tx3)' }}>+</span>
                <input type="number" min="0" value={sk.value||0} onChange={e => upBonusSkill(sk.id,'value',Math.max(0,parseInt(e.target.value)||0))}
                  style={{ width: 44, textAlign: 'center', padding: '3px 4px', fontSize: 13 }} />
                <button onClick={() => delBonusSkill(sk.id)}
                  style={{ background: 'transparent', color: 'var(--tx3)', border: 'none', fontSize: 12, cursor: 'pointer', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sketch Memo */}
      <div className="card">
        <div className="section-title">手書きメモ</div>
        <SketchCanvas key={character.id} data={character.sketchData}
          onChange={v => set('sketchData', v)} />
      </div>
    </div>
  );
}

// ============================================================
// TAB 2: DICE ROLLER
// ============================================================

const J_COLORS = { 'roll-critical':'var(--ac)', 'roll-hard':'var(--gr)', 'roll-success':'var(--gr)', 'roll-fail':'var(--tx2)', 'roll-fumble':'var(--re2)' };

function DiceRoller() {
  const [diceCount,  setDiceCount]  = useState(1);
  const [rollResult, setRollResult] = useState(null);
  const [customExpr, setCustomExpr] = useState('');
  const [customErr,  setCustomErr]  = useState('');
  const [skillPct,   setSkillPct]   = useState('');
  const [history,    setHistory]    = useState([]);

  const push = (entry) => setHistory(prev => [entry, ...prev].slice(0, 10));
  const doRoll = (formula, label) => {
    const r = parseDice(formula);
    if (!r) { setCustomErr('無効な形式です（例：3d6+5）'); return; }
    setCustomErr('');
    const entry = { id: Date.now(), formula: r.formula, rolls: r.rolls, total: r.total, label: label||'', time: nowTime(), judgment: null };
    setRollResult(entry); push(entry);
  };
  const doSkillCheck = () => {
    const s = parseInt(skillPct);
    if (isNaN(s)||s<0||s>100) { setCustomErr('技能値は0〜100で入力してください'); return; }
    setCustomErr('');
    const roll = Math.ceil(Math.random() * 100);
    const j = judgeRoll(roll, s);
    const entry = { id: Date.now(), formula: 'd100', rolls: [roll], total: roll, label: '技能判定('+s+'%)', time: nowTime(), judgment: j };
    setRollResult(entry); push(entry);
  };
  const n = Math.max(1, Math.min(20, diceCount));
  const resultColor = rollResult ? (rollResult.judgment ? (J_COLORS[rollResult.judgment.cls]||'var(--tx)') : 'var(--ac)') : 'var(--ac)';

  return (
    <div style={{ padding: '16px 20px', maxWidth: 800, margin: '0 auto' }}>
      <div className="card">
        <div className="section-title">クイックロール</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 3, padding: '5px 10px' }}>
            <span style={{ fontSize: 11, color: 'var(--tx2)', fontFamily: "'Cinzel', serif" }}>個数:</span>
            <input type="number" min="1" max="20" value={diceCount} onChange={e => setDiceCount(Math.max(1,Math.min(20,parseInt(e.target.value)||1)))}
              style={{ width: 44, textAlign: 'center', padding: '3px 5px', lineHeight: '1.4' }} />
          </div>
          {[4,6,8,10,12,20,100].map(d => (
            <button key={d} className="btn-primary" onClick={() => doRoll(n+'d'+d, n+'d'+d)}
              style={{ fontFamily: "'Cinzel', serif", padding: '7px 13px', fontSize: 13 }}>{n}d{d}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">カスタムロール</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={LBL}>ダイス記法</label>
            <input value={customExpr} onChange={e => setCustomExpr(e.target.value)} onKeyDown={e => e.key==='Enter'&&doRoll(customExpr)} placeholder="3d6+5" style={{ width: 150 }} />
          </div>
          <button className="btn-primary" onClick={() => doRoll(customExpr)}>ロール</button>
        </div>
        {customErr && <div style={{ color: 'var(--re2)', fontSize: 12, marginTop: 8 }}>{customErr}</div>}
      </div>

      <div className="card">
        <div className="section-title">技能判定（d100）</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 10 }}>
          <div>
            <label style={LBL}>技能値 (%)</label>
            <input type="number" min="0" max="100" value={skillPct} onChange={e => setSkillPct(e.target.value)} onKeyDown={e => e.key==='Enter'&&doSkillCheck()} placeholder="例: 65" style={{ width: 100 }} />
          </div>
          <button className="btn-primary" onClick={doSkillCheck}>判定</button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--tx3)', lineHeight: 1.9 }}>
          <span style={{ color: 'var(--ac)' }}>イマジナリー</span>: ≤値÷5　<span style={{ color: 'var(--gr)' }}>困難成功</span>: ≤値÷2　<span style={{ color: 'var(--gr)' }}>通常成功</span>: ≤値　<span style={{ color: 'var(--re2)' }}>ファンブル</span>: 96〜100(値&lt;50)/100(値≥50)
        </div>
      </div>

      {rollResult && (
        <div className="card" key={rollResult.id}>
          <div className="section-title">結果</div>
          <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
            {rollResult.label && <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 10 }}>{rollResult.label}</div>}
            <div className={'roll-result-anim' + (rollResult.judgment ? (' '+(rollResult.judgment.cls==='roll-fumble'?'roll-fumble-anim':rollResult.judgment.cls==='roll-critical'?'roll-critical-anim':'')) : '')}
              style={{ fontSize: 72, fontFamily: "'Cinzel', serif", color: resultColor, lineHeight: 1 }}>{rollResult.total}</div>
            {rollResult.rolls.length > 1 && <div style={{ fontSize: 12, color: 'var(--tx2)', marginTop: 8 }}>[{rollResult.rolls.join(', ')}]</div>}
            {rollResult.judgment && <div style={{ fontSize: 22, fontFamily: "'Cinzel', serif", color: J_COLORS[rollResult.judgment.cls]||'var(--tx)', marginTop: 14, letterSpacing: '0.1em' }}>{rollResult.judgment.label}</div>}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card">
          <div className="section-title">ロール履歴（直近10件）</div>
          {history.map((entry, i) => (
            <div key={entry.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'5px 10px', borderRadius:3, fontSize:12, background:i===0?'var(--bg3)':'transparent', border:'1px solid '+(i===0?'var(--bd)':'transparent') }}>
              <span style={{ color:'var(--tx3)', width:56, flexShrink:0, fontSize:10 }}>{entry.time}</span>
              <span style={{ color:'var(--tx2)', width:58, flexShrink:0, fontSize:11 }}>{entry.formula}</span>
              <span style={{ fontFamily:"'Cinzel', serif", color:'var(--ac)', fontSize:16, width:38, textAlign:'right', flexShrink:0 }}>{entry.total}</span>
              {entry.judgment && <span style={{ color:J_COLORS[entry.judgment.cls]||'var(--tx2)', fontSize:11 }}>{entry.judgment.label}</span>}
              {entry.label && !entry.judgment && <span style={{ color:'var(--tx2)', fontSize:11 }}>{entry.label}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB 3: SESSION MANAGER
// ============================================================

function SessionManager({ sessionNotes, setSessionNotes, npcs, setNpcs }) {
  const [newNpcName,  setNewNpcName]  = useState('');
  const [initList,    setInitList]    = useState([]);
  const [newInitName, setNewInitName] = useState('');
  const [newInitVal,  setNewInitVal]  = useState('');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [madnessCard, setMadnessCard] = useState(null);
  const [madnessKey,  setMadnessKey]  = useState(0);

  const addNpc  = () => { if (!newNpcName.trim()) return; setNpcs(prev => [...prev, { id: uid(), name: newNpcName.trim(), hp: '', memo: '' }]); setNewNpcName(''); };
  const upNpc   = (id,f,v) => setNpcs(prev => prev.map(n => n.id===id ? {...n,[f]:v} : n));
  const delNpc  = (id) => setNpcs(prev => prev.filter(n => n.id!==id));
  const addInit = () => { if (!newInitName.trim()) return; setInitList(prev => [...prev, {id:uid(),name:newInitName.trim(),value:parseInt(newInitVal)||0}].sort((a,b)=>b.value-a.value)); setNewInitName(''); setNewInitVal(''); setCurrentTurn(0); };
  const nextTurn = () => { if (initList.length>0) setCurrentTurn(prev => (prev+1)%initList.length); };
  const delInit  = (id) => setInitList(prev => { const next=prev.filter(e=>e.id!==id); setCurrentTurn(t=>next.length>0?Math.min(t,next.length-1):0); return next; });

  return (
    <div style={{ padding: '16px 20px', maxWidth: 960, margin: '0 auto' }}>
      <div className="card">
        <div className="section-title">セッションノート</div>
        <textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} placeholder="セッションの出来事、重要な情報、謎のメモ..."
          style={{ width: '100%', minHeight: 140, resize: 'vertical', lineHeight: 1.7 }} />
        <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--tx3)', marginTop: 4 }}>自動保存中</div>
      </div>
      <div className="session-grid">
        <div className="card" style={{ margin: 0 }}>
          <div className="section-title">NPC・登場人物</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <input value={newNpcName} onChange={e => setNewNpcName(e.target.value)} onKeyDown={e => e.key==='Enter'&&addNpc()} placeholder="NPC名を入力..." style={{ flex: 1 }} />
            <button className="btn-primary" onClick={addNpc}>追加</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {npcs.length===0 && <div style={{ color:'var(--tx3)', fontSize:12, textAlign:'center', padding:'16px 0' }}>NPCが登録されていません</div>}
            {npcs.map(npc => (
              <div key={npc.id} style={{ background:'var(--bg3)', border:'1px solid var(--bd)', borderRadius:3, padding:'8px 10px' }}>
                <div style={{ display:'flex', gap:6, marginBottom:6, alignItems:'center' }}>
                  <input value={npc.name} onChange={e => upNpc(npc.id,'name',e.target.value)} style={{ flex:1 }} placeholder="名前" />
                  <span style={{ fontSize:10, color:'var(--tx2)' }}>HP</span>
                  <input type="number" value={npc.hp} onChange={e => upNpc(npc.id,'hp',e.target.value)} style={{ width:50,textAlign:'center' }} placeholder="—" />
                  <button className="btn-danger" onClick={() => delNpc(npc.id)}>✕</button>
                </div>
                <input value={npc.memo} onChange={e => upNpc(npc.id,'memo',e.target.value)} placeholder="メモ（状態・特徴など）" style={{ width:'100%', fontSize:12 }} />
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <div className="section-title">イニシアチブ</div>
          <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
            <input value={newInitName} onChange={e => setNewInitName(e.target.value)} placeholder="名前" style={{ flex:1, minWidth:80 }} />
            <input type="number" value={newInitVal} onChange={e => setNewInitVal(e.target.value)} onKeyDown={e => e.key==='Enter'&&addInit()} placeholder="値" style={{ width:56,textAlign:'center' }} />
            <button className="btn-primary" onClick={addInit}>追加</button>
          </div>
          {initList.length>0 && <div style={{ display:'flex', gap:6, marginBottom:10 }}>
            <button className="btn-primary" onClick={nextTurn} style={{ fontSize:12 }}>▶ 次のターン</button>
            <button className="btn-ghost" onClick={() => {setInitList([]);setCurrentTurn(0);}} style={{ fontSize:12 }}>クリア</button>
          </div>}
          <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:280, overflowY:'auto' }}>
            {initList.length===0 && <div style={{ color:'var(--tx3)', fontSize:12, textAlign:'center', padding:'16px 0' }}>イニシアチブが未設定です</div>}
            {initList.map((entry,i) => (
              <div key={entry.id} className={i===currentTurn?'current-turn-row':''} style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:3,background:i===currentTurn?'var(--pb)':'var(--bg3)',border:'1px solid '+(i===currentTurn?'var(--ac)':'var(--bd)') }}>
                <span style={{ fontSize:i===currentTurn?14:11, color:i===currentTurn?'var(--ac)':'var(--tx3)', width:16, flexShrink:0 }}>{i===currentTurn?'▶':(i+1)}</span>
                <span style={{ flex:1, fontSize:13, color:i===currentTurn?'var(--ac)':'var(--tx)' }}>{entry.name}</span>
                <span style={{ fontFamily:"'Cinzel', serif", color:'var(--tx2)', fontSize:14, width:32, textAlign:'right' }}>{entry.value}</span>
                <button className="btn-ghost" onClick={() => delInit(entry.id)} style={{ padding:'2px 7px', fontSize:11 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 0 }}>
        <div className="section-title">一時的狂気</div>
        <div style={{ display:'flex', gap:14, alignItems:'flex-start', flexWrap:'wrap' }}>
          <button onClick={() => {setMadnessCard(MADNESS_CARDS[Math.floor(Math.random()*MADNESS_CARDS.length)]);setMadnessKey(k=>k+1);}}
            style={{ background:'var(--re-bg)',color:'var(--re2)',border:'1px solid var(--re-b)',padding:'10px 22px',fontSize:14,letterSpacing:'0.05em',fontFamily:"'Cinzel', serif",borderRadius:3,cursor:'pointer',flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--re)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--re-b)';}}>
            ☠ 狂気カードを引く
          </button>
          {madnessCard && <div key={madnessKey} className="madness-anim" style={{ flex:'1 1 240px',background:'var(--re-bg)',border:'1px solid var(--re-b)',borderRadius:4,padding:'12px 16px' }}>
            <div style={{ fontFamily:"'Cinzel', serif",color:'var(--re2)',fontSize:15,marginBottom:8,letterSpacing:'0.06em' }}>{madnessCard.title}</div>
            <div style={{ fontSize:13,color:'var(--tx)',lineHeight:1.75 }}>{madnessCard.desc}</div>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB 4: GROUP MANAGER
// ============================================================

function GroupManager({ groups, setGroups, localCharacters }) {
  const [activeGroupId, setActiveGroupId] = useState(() => {
    try { return localStorage.getItem('coc6-active-group') || null; } catch { return null; }
  });
  const [viewingMember, setViewingMember] = useState(null);
  const [showAddLocal,  setShowAddLocal]  = useState(false);
  const [showImportMember, setShowImportMember] = useState(false);
  const [memberImportText, setMemberImportText] = useState('');
  const [memberImportErr,  setMemberImportErr]  = useState('');
  const [showGroupImport, setShowGroupImport] = useState(false);
  const [groupImportText, setGroupImportText] = useState('');
  const [groupImportErr,  setGroupImportErr]  = useState('');

  useEffect(() => { try { localStorage.setItem('coc6-active-group', activeGroupId || ''); } catch {} }, [activeGroupId]);

  const activeGroup = groups.find(g => g.id === activeGroupId) || groups[0] || null;

  const upGroup = (updater) => setGroups(prev => prev.map(g => g.id === activeGroup.id ? (typeof updater === 'function' ? updater(g) : {...g,...updater}) : g));

  const addGroup = () => {
    const ng = createGroup();
    setGroups(prev => [...prev, ng]);
    setActiveGroupId(ng.id);
  };

  const delGroup = (id) => {
    setGroups(prev => {
      const next = prev.filter(g => g.id !== id);
      if (id === activeGroupId) setActiveGroupId(next.length > 0 ? next[0].id : null);
      return next;
    });
  };

  const addLocalMember = (char) => {
    upGroup(prev => ({ ...prev, members: [...prev.members, charToMember(char)] }));
    setShowAddLocal(false);
  };

  const importMember = () => {
    const data = parseShareText(memberImportText);
    if (!data || !data.abilities) { setMemberImportErr('有効なキャラクターデータが見つかりません'); return; }
    upGroup(prev => ({ ...prev, members: [...prev.members, charToMember(data)] }));
    setMemberImportText(''); setMemberImportErr(''); setShowImportMember(false);
  };

  const upMember = (mid, field, val) => upGroup(prev => ({ ...prev, members: prev.members.map(m => m.id===mid ? {...m,[field]:val} : m) }));
  const delMember = (mid) => upGroup(prev => ({ ...prev, members: prev.members.filter(m => m.id!==mid) }));

  const importGroup = () => {
    const data = parseShareText(groupImportText);
    if (!data || !Array.isArray(data.members)) { setGroupImportErr('有効なグループデータが見つかりません'); return; }
    const ng = { ...data, id: uid() };
    setGroups(prev => [...prev, ng]);
    setActiveGroupId(ng.id);
    setGroupImportText(''); setGroupImportErr(''); setShowGroupImport(false);
  };

  const groupShareText = activeGroup ? buildShareText('グループ', activeGroup.name, activeGroup) : '';

  return (
    <div style={{ padding: '16px 20px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Group selector */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Cinzel', serif", color: 'var(--bl)', fontSize: 11, letterSpacing: '0.1em', flexShrink: 0 }}>セッション:</span>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
            {groups.map(g => (
              <button key={g.id} className={'group-tab' + (g.id === activeGroupId ? ' active' : '')} onClick={() => setActiveGroupId(g.id)}>
                {g.name || '無名のセッション'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={addGroup} style={{ fontSize: 12, padding: '5px 12px' }}>＋ 新規</button>
            {activeGroup && groups.length > 1 && <button className="btn-danger" onClick={() => delGroup(activeGroup.id)} style={{ fontSize: 12 }}>削除</button>}
            <button className="btn-share" onClick={() => setShowGroupImport(s => !s)} style={{ fontSize: 12 }}>📥 インポート</button>
          </div>
        </div>

        {showGroupImport && (
          <div className="import-box slide-in">
            <div style={{ fontSize: 11, color: 'var(--gr)', marginBottom: 8, fontFamily: "'Cinzel', serif" }}>📥 グループ共有テキストを貼り付け</div>
            <textarea value={groupImportText} onChange={e => { setGroupImportText(e.target.value); setGroupImportErr(''); }}
              placeholder="━━━ CoC6 グループ... のテキストを貼り付け ━━━" rows={4} style={{ width: '100%', fontSize: 11, fontFamily: 'monospace', resize: 'none' }} />
            {groupImportErr && <div style={{ color: 'var(--re2)', fontSize: 12, marginTop: 4 }}>{groupImportErr}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn-green" onClick={importGroup} style={{ fontSize: 12 }}>インポートする</button>
              <button className="btn-ghost" onClick={() => { setShowGroupImport(false); setGroupImportText(''); setGroupImportErr(''); }} style={{ fontSize: 12 }}>閉じる</button>
            </div>
          </div>
        )}
      </div>

      {!activeGroup && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--tx3)', fontFamily: "'Cinzel', serif", letterSpacing: '0.1em' }}>
          — ＋ 新規 でセッションを作成してください —
        </div>
      )}

      {activeGroup && (
        <>
          {/* Group Info */}
          <div className="card">
            <div className="section-title">セッション情報</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0 14px' }}>
              <LabeledInput label="セッション名" value={activeGroup.name} onChange={e => upGroup({ name: e.target.value })} placeholder="セッション名..." />
              <LabeledInput label="GM（ゲームマスター）" value={activeGroup.gm||''} onChange={e => upGroup({ gm: e.target.value })} placeholder="GMの名前..." />
            </div>
            <LabeledTextarea label="概要・設定" value={activeGroup.description||''} onChange={e => upGroup({ description: e.target.value })} placeholder="シナリオの概要、世界設定、注意事項など..." rows={3} />
            <LabeledTextarea label="ストーリー・セッションログ" value={activeGroup.story||''} onChange={e => upGroup({ story: e.target.value })} placeholder="セッション中の出来事、発見した情報、重要なシーン..." rows={5} />
          </div>

          {/* Members */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <div className="section-title" style={{ marginBottom: 0, border: 'none', paddingBottom: 0 }}>
                メンバー <span style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'inherit', textTransform: 'none' }}>（{activeGroup.members.length}人）</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-green" onClick={() => { setShowAddLocal(s=>!s); setShowImportMember(false); }} style={{ fontSize: 12 }}>
                  ＋ ローカルから追加
                </button>
                <button className="btn-share" onClick={() => { setShowImportMember(s=>!s); setShowAddLocal(false); }} style={{ fontSize: 12 }}>
                  📥 テキストから追加
                </button>
              </div>
            </div>

            {showAddLocal && localCharacters.length > 0 && (
              <div className="import-box slide-in" style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--gr)', marginBottom: 8, fontFamily: "'Cinzel', serif" }}>追加する探索者を選択:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {localCharacters.map(c => (
                    <button key={c.id} className="btn-primary" onClick={() => addLocalMember(c)} style={{ fontSize: 12 }}>
                      {c.name || '名無し'}
                    </button>
                  ))}
                </div>
                <button className="btn-ghost" onClick={() => setShowAddLocal(false)} style={{ fontSize: 11, marginTop: 8 }}>閉じる</button>
              </div>
            )}

            {showImportMember && (
              <div className="import-box slide-in" style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--bl)', marginBottom: 8, fontFamily: "'Cinzel', serif" }}>📥 プレイヤーから受け取った探索者テキストを貼り付け:</div>
                <textarea value={memberImportText} onChange={e => { setMemberImportText(e.target.value); setMemberImportErr(''); }}
                  placeholder="━━━ CoC6 探索者: ... のテキストを貼り付け ━━━" rows={4} style={{ width: '100%', fontSize: 11, fontFamily: 'monospace', resize: 'none' }} />
                {memberImportErr && <div style={{ color: 'var(--re2)', fontSize: 12, marginTop: 4 }}>{memberImportErr}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn-green" onClick={importMember} style={{ fontSize: 12 }}>追加する</button>
                  <button className="btn-ghost" onClick={() => { setShowImportMember(false); setMemberImportText(''); setMemberImportErr(''); }} style={{ fontSize: 12 }}>閉じる</button>
                </div>
              </div>
            )}

            {activeGroup.members.length === 0 && !showAddLocal && !showImportMember && (
              <div style={{ color: 'var(--tx3)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
                メンバーがいません。ローカルから追加するか、プレイヤーから共有テキストを受け取って追加してください。
              </div>
            )}

            <div className="member-grid">
              {activeGroup.members.map(member => (
                <div key={member.id} style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 4, padding: '14px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontFamily: "'Cinzel', serif", color: 'var(--ac)', fontSize: 15 }}>{member.name}</div>
                      {member.snapshot.occupation && <div style={{ fontSize: 11, color: 'var(--tx2)', marginTop: 2 }}>{member.snapshot.occupation}{member.snapshot.age ? '　' + member.snapshot.age + '歳' : ''}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      <button className="btn-ghost" onClick={() => setViewingMember(member)} style={{ fontSize: 11 }}>詳細</button>
                      <button className="btn-danger" onClick={() => delMember(member.id)}>✕</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <StatTracker label="HP" current={member.hp} max={member.maxHP} color="var(--gr)"
                      onDecrement={() => upMember(member.id,'hp',clamp(member.hp-1,0,member.maxHP))}
                      onIncrement={() => upMember(member.id,'hp',clamp(member.hp+1,0,member.maxHP))} />
                    <StatTracker label="MP" current={member.mp} max={member.maxMP} color="var(--bl)"
                      onDecrement={() => upMember(member.id,'mp',clamp(member.mp-1,0,member.maxMP))}
                      onIncrement={() => upMember(member.id,'mp',clamp(member.mp+1,0,member.maxMP))} />
                    <StatTracker label="SAN" current={member.san} max={member.maxSAN} color="var(--ac)"
                      onDecrement={() => upMember(member.id,'san',clamp(member.san-1,0,member.maxSAN))}
                      onIncrement={() => upMember(member.id,'san',clamp(member.san+1,0,member.maxSAN))} />
                  </div>

                  <div>
                    <label style={{ ...LBL, marginBottom: 3 }}>GM メモ</label>
                    <input value={member.memo} onChange={e => upMember(member.id,'memo',e.target.value)}
                      placeholder="状態、メモ、秘密情報..." style={{ width: '100%', fontSize: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Share */}
          <div className="card">
            <div className="section-title">グループ共有</div>
            <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 12, lineHeight: 1.7 }}>
              グループ全体（メンバーのキャラデータ・ストーリー・ログ含む）をテキストにエクスポートします。<br/>
              受け取った側は「📥 インポート」に貼り付けることでグループを復元できます。
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <CopyButton text={groupShareText} label="📋 グループをコピー" />
            </div>
            <textarea readOnly value={groupShareText} rows={4} onClick={e => e.target.select()}
              style={{ width: '100%', marginTop: 10, fontSize: 10, fontFamily: 'monospace', background: 'var(--bg)', color: 'var(--bl)', border: '1px solid var(--bl-b)', resize: 'none' }} />
          </div>
        </>
      )}

      {viewingMember && <CharDetailModal member={viewingMember} onClose={() => setViewingMember(null)} />}
    </div>
  );
}

// ============================================================
// TAB 5: BESTIARY
// ============================================================

function Bestiary() {
  const [q, setQ] = useState('');
  const filtered = CREATURES.filter(c => c.nameJP.includes(q) || c.nameEN.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ padding: '16px 20px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ fontSize: 12, color: 'var(--tx2)', background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 3, padding: '9px 14px', marginBottom: 14, lineHeight: 1.9 }}>
        <span style={{ color: 'var(--ac)' }}>⚠</span> このデータはChaosium社 CoC 6版ルールブック等の学習情報をもとにAIが生成した参考値です。数値は公式資料（<span style={{ fontStyle: 'italic', color: 'var(--tx)' }}>Malleus Monstrorum</span> 等）と異なる場合があります。ゲームでご使用の際は必ず公式資料でご確認ください。
      </div>
      <div style={{ marginBottom: 18 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="神話生物を検索（日本語・英語）..." style={{ width: '100%', maxWidth: 420, padding: '8px 14px', fontSize: 14 }} />
      </div>
      <div className="creature-grid">
        {filtered.map(c => (
          <div key={c.nameEN} className="creature-card">
            <div style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--bd)', padding: '12px 16px' }}>
              <div style={{ fontFamily: "'Cinzel', serif", color: 'var(--ac)', fontSize: 16, letterSpacing: '0.04em' }}>{c.nameJP}</div>
              <div style={{ color: 'var(--tx3)', fontSize: 11, marginTop: 2, letterSpacing: '0.1em' }}>{c.nameEN}</div>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {[['STR',c.STR],['CON',c.CON],['SIZ',c.SIZ],['DEX',c.DEX],['HP',c.HP]].map(([s,v]) => (
                  <div key={s} style={{ textAlign:'center',minWidth:42 }}>
                    <div style={{ fontFamily:"'Cinzel', serif",fontSize:9,color:'var(--tx2)' }}>{s}</div>
                    <div style={{ fontFamily:"'Cinzel', serif",fontSize:16,color:'var(--tx)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:6 }}><span style={{ fontSize:10,color:'var(--tx2)',fontFamily:"'Cinzel', serif" }}>攻撃  </span><span style={{ fontSize:12,color:'var(--tx)' }}>{c.attack}</span></div>
              <div style={{ marginBottom:10 }}><span style={{ fontSize:10,color:'var(--tx2)',fontFamily:"'Cinzel', serif" }}>SAN減少  </span><span style={{ fontSize:13,color:'var(--re2)',fontFamily:"'Cinzel', serif" }}>{c.sanLoss}</span></div>
              <div style={{ fontSize:11,color:'var(--tx2)',fontStyle:'italic',lineHeight:1.7,borderTop:'1px solid var(--bd)',paddingTop:10 }}>{c.flavor}</div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length===0 && <div style={{ textAlign:'center',color:'var(--tx3)',padding:'60px 0',fontFamily:"'Cinzel', serif",letterSpacing:'0.12em',fontSize:13 }}>— 該当する神話生物は見つかりませんでした —</div>}
    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================

const TABS = [
  { key: 'character', label: '探索者シート' },
  { key: 'dice',      label: 'ダイスロール' },
  { key: 'session',   label: 'セッション管理' },
  { key: 'group',     label: 'グループ' },
  { key: 'bestiary',  label: '神話生物図鑑' },
];

function App() {
  const [activeTab, setActiveTab] = useState('character');
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('coc6-theme') || 'dark'; } catch { return 'dark'; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('coc6-theme', theme); } catch {}
  }, [theme]);

  const [characters, setCharacters] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('coc6-characters')); if (Array.isArray(s)&&s.length>0) return s; } catch {}
    return [createCharacter()];
  });
  const [activeCharId, setActiveCharId] = useState(() => { try { return localStorage.getItem('coc6-active-char')||null; } catch { return null; } });

  const [groups, setGroups] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('coc6-groups')); if (Array.isArray(s)&&s.length>0) return s; } catch {}
    return [createGroup({ name: '最初のセッション' })];
  });

  const [sessionNotes, setSessionNotes] = useState(() => localStorage.getItem('coc6-session-notes')||'');
  const [npcs, setNpcs] = useState(() => { try { return JSON.parse(localStorage.getItem('coc6-npcs'))||[]; } catch { return []; } });

  const activeChar = characters.find(c => c.id === activeCharId) || characters[0];

  const updateChar = (updater) =>
    setCharacters(prev => prev.map(c => c.id===activeChar.id ? (typeof updater==='function'?updater(c):{...c,...updater}) : c));

  const addChar = () => { const nc=createCharacter(); setCharacters(prev=>[...prev,nc]); setActiveCharId(nc.id); };
  const dupChar = () => { const dup={...activeChar,id:uid(),name:activeChar.name+'（コピー）',skills:{...activeChar.skills},weapons:[...(activeChar.weapons||[])],equipment:[...(activeChar.equipment||[])]}; setCharacters(prev=>[...prev,dup]); setActiveCharId(dup.id); };
  const delChar = (id) => setCharacters(prev => {
    const next=prev.filter(c=>c.id!==id);
    if (next.length===0) { const nc=createCharacter(); setActiveCharId(nc.id); return [nc]; }
    if (id===activeChar.id) setActiveCharId(next[0].id);
    return next;
  });
  const importChar = (data) => { const nc={...data,id:uid()}; setCharacters(prev=>[...prev,nc]); setActiveCharId(nc.id); };

  useEffect(()=>{ try{localStorage.setItem('coc6-characters',JSON.stringify(characters));}catch{} },[characters]);
  useEffect(()=>{ if(activeChar) localStorage.setItem('coc6-active-char',activeChar.id); },[activeChar]);
  useEffect(()=>{ try{localStorage.setItem('coc6-groups',JSON.stringify(groups));}catch{} },[groups]);
  useEffect(()=>{ try{localStorage.setItem('coc6-session-notes',sessionNotes);}catch{} },[sessionNotes]);
  useEffect(()=>{ try{localStorage.setItem('coc6-npcs',JSON.stringify(npcs));}catch{} },[npcs]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div style={{ minHeight: '100vh' }}>
        <header style={{ background: 'linear-gradient(180deg, var(--head) 0%, var(--bg) 100%)', borderBottom: '1px solid var(--bd)', padding: '14px 20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h1 className="app-title" style={{ fontFamily: "'Cinzel', serif", color: 'var(--ac)', fontSize: 'clamp(13px, 2.6vw, 20px)', letterSpacing: '0.18em', fontWeight: 400 }}>
              ✦ CALL OF CTHULHU — 6th Edition ✦
            </h1>
            <button className="btn-theme" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              style={{ fontSize: 12, padding: '5px 12px', flexShrink: 0 }}>
              {theme === 'dark' ? '☀ ライト' : '🌙 ダーク'}
            </button>
          </div>
          <nav className="tab-bar">
            {TABS.map(tab => (
              <button key={tab.key} className={'tab-btn'+(activeTab===tab.key?' active':'')} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <main style={{ paddingTop: 16 }}>
          {activeTab === 'character' && (
            <div style={{ maxWidth: 940, margin: '0 auto', padding: '0 20px' }}>
              <CharacterPanel
                characters={characters} activeId={activeChar?.id}
                onSelect={setActiveCharId} onAdd={addChar} onDuplicate={dupChar}
                onDelete={delChar} onImport={importChar} />
            </div>
          )}
          {activeTab === 'character' && activeChar && <CharacterSheet character={activeChar} onChange={updateChar} />}
          {activeTab === 'dice'      && <DiceRoller />}
          {activeTab === 'session'   && <SessionManager sessionNotes={sessionNotes} setSessionNotes={setSessionNotes} npcs={npcs} setNpcs={setNpcs} />}
          {activeTab === 'group'     && <GroupManager groups={groups} setGroups={setGroups} localCharacters={characters} />}
          {activeTab === 'bestiary'  && <Bestiary />}
        </main>
      </div>
    </>
  );
}

// ============================================================
// MOUNT
// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
