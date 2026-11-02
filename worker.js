// HAREMAYA exam bot v4
// Admin panel unlocked by password. Group link shown only to approved students.
// Students can buy or renew any time. One screen per chat, typed messages get a new reply at the bottom.

const ADMIN_DEFAULT_PASSWORD = '88';
const DAY = 86400000;

const DEFAULT_TRACKS = {
  natural: {
    name: '🧪 Natural Science / ተፈጥሮ ሳይንስ',
    subjects: [
      { key: 'math', name: 'Mathematics / ሂሳብ', sample: '' },
      { key: 'physics', name: 'Physics / ፊዚክስ', sample: '' },
      { key: 'chemistry', name: 'Chemistry / ኬሚስትሪ', sample: '' },
      { key: 'biology', name: 'Biology / ባዮሎጂ', sample: '' },
    ],
  },
  social: {
    name: '🌍 Social Science / ማህበራዊ ሳይንስ',
    subjects: [
      { key: 'geography', name: 'Geography / ጂኦግራፊ', sample: '' },
      { key: 'history', name: 'History / ታሪክ', sample: '' },
      { key: 'civics', name: 'Civics / ሲቪክስ', sample: '' },
      { key: 'english', name: 'English / እንግሊዝኛ', sample: '' },
    ],
  },
};

// ---------- student text (English and Amharic) ----------
const T = {
  en: {
    welcome: '👋 <b>Welcome to HAREMAYA Exam Prep</b>',
    choose_track: '🎓 <b>Choose your track</b>',
    choose_lang: '🌐 <b>Choose your language</b>\nቋንቋ ይምረጡ',
    access: '💳 Access: <b>{price}</b> for <b>{days}</b> days',
    pay: '💳 <b>Payment</b>\n━━━━━━━━━━━━━━\nTrack: <b>{track}</b>\nAmount: <b>{price}</b> for {days} days\n\n{info}\n━━━━━━━━━━━━━━\n📸 Send your payment screenshot here.',
    received: '✅ <b>Screenshot received.</b>\nAn admin will confirm your payment shortly.',
    under_review: '⏳ Your payment is under review.',
    send_shot: '📸 Please send a payment screenshot.',
    granted: '🎉 <b>Access granted</b>\nTrack: <b>{track}</b>\nValid until: <b>{date}</b>',
    join_hint: 'Tap the button below to join. Your request is approved automatically.',
    link_ready: '🔗 <b>Your group link</b>\nTrack: <b>{track}</b>\nValid until: <b>{date}</b>\n\nTap the button below to join.',
    link_none: '🔒 You need active access first.',
    link_wait: '⏳ Your link is being prepared. Please try again in a moment.',
    no_access: '🔒 No active access to this group. Tap Buy access first.',
    expired: '⌛ Your access has ended. Tap Buy access to renew.',
    rejected: '❌ Payment not confirmed. Please send a clear screenshot.',
    samples_pick: '🎁 <b>Free samples</b>\nChoose a track to preview.',
    samples_subjects: '🎁 <b>{track}</b>\nChoose a subject.',
    sample_none: 'No sample has been added for this subject yet.',
    status_none: '❌ No active access.',
    status_pending: '⏳ Payment under review ({track}).',
    status_awaiting: '📸 Waiting for your screenshot ({track}).',
    status_active: '✅ Active until <b>{date}</b> ({track}).',
    btn_buy: '💳 Buy access',
    btn_samples: '🎁 Free samples',
    btn_link: '🔗 My group link',
    btn_status: '📊 My status',
    btn_lang: '🌐 Language',
    btn_join: '🔗 Join group',
    btn_back: '⬅️ Back',
    btn_menu: '🏠 Main menu',
  },
  am: {
    welcome: '👋 <b>እንኳን ወደ ሃረማያ ፈተና ዝግጅት በደህና መጡ</b>',
    choose_track: '🎓 <b>ትራክዎን ይምረጡ</b>',
    choose_lang: '🌐 <b>ቋንቋ ይምረጡ</b>\nChoose your language',
    access: '💳 መዳረሻ: <b>{price}</b> ለ<b>{days}</b> ቀናት',
    pay: '💳 <b>ክፍያ</b>\n━━━━━━━━━━━━━━\nትራክ: <b>{track}</b>\nመጠን: <b>{price}</b> ለ{days} ቀናት\n\n{info}\n━━━━━━━━━━━━━━\n📸 ከከፈሉ በኋላ የክፍያ ፎቶውን እዚህ ይላኩ።',
    received: '✅ <b>ፎቶዎ ደርሶናል።</b>\nአስተዳዳሪ ክፍያውን በቅርቡ ያረጋግጣል።',
    under_review: '⏳ ክፍያዎ እየተረጋገጠ ነው።',
    send_shot: '📸 እባክዎ የክፍያ ፎቶ ይላኩ።',
    granted: '🎉 <b>መዳረሻ ተሰጥቶዎታል</b>\nትራክ: <b>{track}</b>\nእስከ: <b>{date}</b>',
    join_hint: 'ለመቀላቀል ከታች ያለውን ቁልፍ ይጫኑ። ጥያቄዎ በራሱ ይጸድቃል።',
    link_ready: '🔗 <b>የቡድን ሊንክ</b>\nትራክ: <b>{track}</b>\nእስከ: <b>{date}</b>\n\nለመቀላቀል ከታች ያለውን ቁልፍ ይጫኑ።',
    link_none: '🔒 መጀመሪያ ገቢር መዳረሻ ያስፈልጋል።',
    link_wait: '⏳ ሊንክዎ እየተዘጋጀ ነው። ትንሽ ቆይተው እንደገና ይሞክሩ።',
    no_access: '🔒 ለዚህ ቡድን ገቢር መዳረሻ የለዎትም። መጀመሪያ መዳረሻ ይግዙ።',
    expired: '⌛ መዳረሻዎ ተጠናቋል። ለማደስ መዳረሻ ይግዙ።',
    rejected: '❌ ክፍያ አልተረጋገጠም። እባክዎ ግልጽ ፎቶ ይላኩ።',
    samples_pick: '🎁 <b>ነጻ ናሙናዎች</b>\nለማየት ትራክ ይምረጡ።',
    samples_subjects: '🎁 <b>{track}</b>\nትምህርት ይምረጡ።',
    sample_none: 'ለዚህ ትምህርት ገና ናሙና አልተጨመረም።',
    status_none: '❌ ገቢር መዳረሻ የለም።',
    status_pending: '⏳ ክፍያ እየተረጋገጠ ነው ({track})።',
    status_awaiting: '📸 ፎቶዎን በመጠበቅ ላይ ({track})።',
    status_active: '✅ ገቢር እስከ <b>{date}</b> ({track})።',
    btn_buy: '💳 መዳረሻ ግዛ',
    btn_samples: '🎁 ነጻ ናሙናዎች',
    btn_link: '🔗 የቡድን ሊንክ',
    btn_status: '📊 ሁኔታ',
    btn_lang: '🌐 ቋንቋ',
    btn_join: '🔗 ቡድኑን ይቀላቀሉ',
    btn_back: '⬅️ ተመለስ',
    btn_menu: '🏠 ዋና ምናሌ',
  },
};

// ---------- basic helpers ----------
const now = () => Date.now();
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const fmtDate = (ms) => new Date(ms).toISOString().slice(0, 10);
const isActive = (u) => u.status === 'active' && u.expires > now();

// t('en', 'granted', { track, date }) fills {track} and {date}, escaping the values
function t(lang, key, vars = {}) {
  let s = (T[lang] && T[lang][key]) || T.en[key] || key;
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(esc(v));
  return s;
}

function API(env, method, body) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((r) => r.json())
    .then((j) => {
      if (!j.ok && !/not modified/i.test(j.description || '')) console.log(method, j.description);
      return j;
    });
}

const send = (env, chat_id, text, extra = {}) =>
  API(env, 'sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });

// Sends a brand-new message and remembers it as this chat's current screen
async function newScreen(env, chat, text, markup) {
  const r = await API(env, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML', reply_markup: markup });
  if (r.ok) await env.EXAM_KV.put(`scr:${chat}`, String(r.result.message_id));
  return r;
}

// Edits the chat's current screen in place. Sends a new one only if editing fails.
async function screen(env, chat, text, markup) {
  const mid = await env.EXAM_KV.get(`scr:${chat}`);
  if (mid) {
    const r = await API(env, 'editMessageText', {
      chat_id: chat,
      message_id: Number(mid),
      text,
      parse_mode: 'HTML',
      reply_markup: markup,
    });
    if (r.ok || /not modified/i.test(r.description || '')) return r;
  }
  return newScreen(env, chat, text, markup);
}

// Removes the current screen so the next reply appears at the bottom of the chat
async function clearScreen(env, chat) {
  const mid = await env.EXAM_KV.get(`scr:${chat}`);
  if (mid) await API(env, 'deleteMessage', { chat_id: chat, message_id: Number(mid) });
  await env.EXAM_KV.delete(`scr:${chat}`);
}

// ---------- menus ----------
// Group link and status show only to students with active access
const menuMarkup = (lang, showLink) => {
  const rows = [[
    { text: t(lang, 'btn_buy'), callback_data: 'buy' },
    { text: t(lang, 'btn_samples'), callback_data: 'samp' },
  ]];
  rows.push(
    showLink
      ? [{ text: t(lang, 'btn_link'), callback_data: 'link' }, { text: t(lang, 'btn_status'), callback_data: 'status' }]
      : [{ text: t(lang, 'btn_status'), callback_data: 'status' }]
  );
  rows.push([{ text: t(lang, 'btn_lang'), callback_data: 'lang' }]);
  return { inline_keyboard: rows };
};

const menuFor = (lang, u) => menuMarkup(lang, isActive(u));

const backMenu = (lang) => ({
  inline_keyboard: [[{ text: t(lang, 'btn_menu'), callback_data: 'menu' }]],
});

const LANG_PICKER = {
  inline_keyboard: [[
    { text: '🇬🇧 English', callback_data: 'lang:en' },
    { text: '🇪🇹 አማርኛ', callback_data: 'lang:am' },
  ]],
};

const trackMarkup = (cfg, lang, prefix, back) => ({
  inline_keyboard: [
    ...Object.entries(cfg.tracks).map(([k, v]) => [{ text: v.name, callback_data: `${prefix}:${k}` }]),
    [{ text: t(lang, 'btn_back'), callback_data: back }],
  ],
});

const ADMIN_MENU = {
  inline_keyboard: [
    [{ text: '📥 Pending payments', callback_data: 'a:pending' }, { text: '📊 Stats', callback_data: 'a:stats' }],
    [{ text: '🔎 Find user', callback_data: 'a:find' }, { text: '📢 Broadcast', callback_data: 'a:broadcast' }],
    [{ text: '➕ Grant access', callback_data: 'a:grant' }, { text: '⛔ Revoke access', callback_data: 'a:revoke' }],
    [{ text: '💰 Price', callback_data: 'a:price' }, { text: '⏳ Access days', callback_data: 'a:days' }],
    [{ text: '💳 Payment info', callback_data: 'a:pay' }, { text: '🏫 Group IDs', callback_data: 'a:groups' }],
    [{ text: '📚 Subjects', callback_data: 'a:subjects' }, { text: '🎁 Samples', callback_data: 'a:samp' }],
    [{ text: '✍️ Welcome text', callback_data: 'a:welcome' }, { text: '👮 Admins', callback_data: 'a:admins' }],
  ],
};
const ADMIN_BACK = { inline_keyboard: [[{ text: '⬅️ Back to panel', callback_data: 'a:home' }]] };
const ADMIN_CANCEL = { inline_keyboard: [[{ text: '✖ Cancel', callback_data: 'a:home' }]] };
const HOME_ONLY = { inline_keyboard: [[{ text: '🏠 Main menu', callback_data: 'menu' }]] };

const adminScreen = (env, chat, notice = '') =>
  screen(
    env,
    chat,
    `🛠 <b>Admin panel</b>\n━━━━━━━━━━━━━━\n${notice || 'Choose what to manage.'}`,
    ADMIN_MENU
  );

// ---------- admin login ----------
const adminPass = (env) => String(env.ADMIN_PASSWORD || ADMIN_DEFAULT_PASSWORD);
const isAuthed = async (env, uid) => (await env.EXAM_KV.get(`auth:${uid}`)) === '1';

async function tryLogin(env, chat, uid, pass) {
  await env.EXAM_KV.delete(`adm:${uid}`);
  if (String(pass).trim() !== adminPass(env)) {
    return screen(env, chat, '❌ Wrong password.', HOME_ONLY);
  }
  await env.EXAM_KV.put(`auth:${uid}`, '1', { expirationTtl: 43200 }); // 12 hours
  return adminScreen(env, chat, '✅ Logged in. Session lasts 12 hours. Send /logout to end it.');
}

// ---------- settings (saved in KV, editable from the admin panel) ----------
function defaultConfig(env) {
  return {
    price: env.PRICE,
    accessDays: Number(env.ACCESS_DAYS) || 30,
    paymentInfo: env.PAYMENT_INFO,
    welcome: { en: '', am: '' },
    groups: { natural: String(env.GROUP_NATURAL), social: String(env.GROUP_SOCIAL) },
    admins: [],
    tracks: structuredClone(DEFAULT_TRACKS),
  };
}

async function getConfig(env) {
  const saved = await env.EXAM_KV.get('config', 'json');
  if (!saved) return defaultConfig(env);
  return { welcome: { en: '', am: '' }, ...saved };
}

const saveConfig = (env, cfg) => env.EXAM_KV.put('config', JSON.stringify(cfg));
const superAdmins = (env) => String(env.ADMIN_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
// Chat IDs that receive payment cards. They still need to log in to press buttons.
const allAdmins = (env, cfg) => [...new Set([...superAdmins(env), ...cfg.admins.map(String)])];
const validTrack = (cfg, key) => Object.prototype.hasOwnProperty.call(cfg.tracks, key);
const trackLabel = (cfg, key) => (key && validTrack(cfg, key) ? cfg.tracks[key].name : 'No track yet');
const findSubject = (cfg, track, key) =>
  validTrack(cfg, track) ? cfg.tracks[track].subjects.find((s) => s.key === key) : undefined;

async function notifyAdmins(env, cfg, text) {
  for (const a of allAdmins(env, cfg)) await send(env, a, esc(text));
}

// ---------- users ----------
// flow: none | awaiting_proof | pending   (where the user is in the payment process)
// status: active | expired | none         (whether access is currently granted)
async function getUser(env, id) {
  const u = (await env.EXAM_KV.get(`user:${id}`, 'json')) || {};
  if (u.flow === undefined) {
    // Migrate records saved by earlier versions of the bot
    u.flow = u.status === 'pending' ? 'pending' : u.status === 'awaiting_proof' ? 'awaiting_proof' : 'none';
    if (u.status === 'pending' || u.status === 'awaiting_proof' || !u.status) {
      u.status = u.expires > now() ? 'active' : 'none';
    }
  }
  return { status: 'none', flow: 'none', ...u };
}

const putUser = (env, id, u) => env.EXAM_KV.put(`user:${id}`, JSON.stringify(u));

async function allUsers(env) {
  const out = [];
  let cursor;
  do {
    const page = await env.EXAM_KV.list({ prefix: 'user:', cursor });
    for (const k of page.keys) {
      const u = await getUser(env, k.name.slice('user:'.length));
      out.push({ id: k.name.slice('user:'.length), ...u });
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out;
}

function statusLine(cfg, u, lang) {
  const track = u.track && validTrack(cfg, u.track) ? cfg.tracks[u.track].name : '-';
  if (isActive(u)) return t(lang, 'status_active', { date: fmtDate(u.expires), track });
  if (u.flow === 'pending') return t(lang, 'status_pending', { track });
  if (u.flow === 'awaiting_proof') return t(lang, 'status_awaiting', { track });
  return t(lang, 'status_none');
}

// ---------- invite links ----------
// A new link is created for each approved payment. The old one is revoked.
async function newLink(env, cfg, uid, track) {
  const gid = String(cfg.groups[track]);
  const r = await API(env, 'createChatInviteLink', {
    chat_id: gid,
    creates_join_request: true,
    name: `m${uid}`.slice(0, 32),
  });
  if (!r.ok) {
    await notifyAdmins(
      env,
      cfg,
      `⚠️ Could not create an invite link for ${cfg.tracks[track].name} (group ${gid}).\nTelegram says: ${r.description}\n\nCheck that the bot is in that group as an admin with "Invite users via link".`
    );
    return null;
  }
  return r.result.invite_link;
}

async function dropLink(env, user) {
  if (user.link && user.link.url) {
    await API(env, 'revokeChatInviteLink', { chat_id: user.link.gid, invite_link: user.link.url });
  }
}

// Returns the user's current link, creating one if they don't have one for their group
async function ensureLink(env, cfg, uid) {
  const user = await getUser(env, uid);
  const gid = String(cfg.groups[user.track]);
  if (user.link && user.link.url && user.link.gid === gid) return user.link.url;
  await dropLink(env, user);
  const url = await newLink(env, cfg, uid, user.track);
  if (url) await putUser(env, uid, { ...user, link: { url, gid } });
  return url;
}

// ---------- student screens ----------
async function showWelcome(env, cfg, chat, uid) {
  const user = await getUser(env, uid);
  const lang = user.lang || 'en';
  const custom = cfg.welcome && cfg.welcome[lang];
  const tracks = Object.values(cfg.tracks).map((x) => `• ${x.name}`).join('\n');
  const body = custom
    ? esc(custom)
    : `${t(lang, 'welcome')}\n\n${t(lang, 'choose_track')}\n${tracks}`;
  return screen(
    env,
    chat,
    `${body}\n\n${t(lang, 'access', { price: cfg.price, days: cfg.accessDays })}\n\n${statusLine(cfg, user, lang)}`,
    menuFor(lang, user)
  );
}

async function showBuy(env, cfg, chat, uid) {
  const user = await getUser(env, uid);
  const lang = user.lang || 'en';
  if (user.flow === 'pending') return screen(env, chat, t(lang, 'under_review'), menuFor(lang, user));
  return screen(env, chat, t(lang, 'choose_track'), trackMarkup(cfg, lang, 'trk', 'menu'));
}

async function chooseTrack(env, cfg, chat, uid, picked) {
  if (!validTrack(cfg, picked)) return;
  const user = await getUser(env, uid);
  const lang = user.lang || 'en';
  if (user.flow === 'pending') return screen(env, chat, t(lang, 'under_review'), menuFor(lang, user));
  // Renewals stay on the track the student already has
  const track = isActive(user) && validTrack(cfg, user.track) ? user.track : picked;
  await putUser(env, uid, { ...user, track, flow: 'awaiting_proof' });
  return screen(
    env,
    chat,
    t(lang, 'pay', { track: cfg.tracks[track].name, price: cfg.price, days: cfg.accessDays, info: cfg.paymentInfo }),
    backMenu(lang)
  );
}

async function submitProof(env, cfg, msg, user) {
  const uid = String(msg.from.id);
  const lang = user.lang || 'en';
  await putUser(env, uid, { ...user, flow: 'pending' });
  const name = esc(msg.from.first_name || 'User');
  const kind = isActive(user) ? ' (RENEWAL)' : '';

  for (const a of allAdmins(env, cfg)) {
    await API(env, 'forwardMessage', { chat_id: a, from_chat_id: msg.chat.id, message_id: msg.message_id });
    await send(env, a, `🧾 Payment from <b>${name}</b> (<code>${uid}</code>)${kind}\nTrack: ${esc(trackLabel(cfg, user.track))}\nPrice: ${esc(cfg.price)}`, {
      reply_markup: {
        inline_keyboard: [[
          { text: `✅ Approve ${cfg.accessDays}d`, callback_data: `ok:${uid}` },
          { text: '❌ Reject', callback_data: `no:${uid}` },
        ]],
      },
    });
  }
  return screen(env, msg.chat.id, t(lang, 'received'), menuFor(lang, { ...user, flow: 'pending' }));
}

// Only students with active access get a link
async function showLink(env, cfg, chat, uid) {
  const user = await getUser(env, uid);
  const lang = user.lang || 'en';
  if (!isActive(user) || !validTrack(cfg, user.track)) {
    return screen(env, chat, t(lang, 'link_none'), menuFor(lang, user));
  }
  const url = await ensureLink(env, cfg, uid);
  if (!url) return screen(env, chat, t(lang, 'link_wait'), backMenu(lang));
  return screen(
    env,
    chat,
    t(lang, 'link_ready', { track: cfg.tracks[user.track].name, date: fmtDate(user.expires) }),
    { inline_keyboard: [[{ text: t(lang, 'btn_join'), url }], [{ text: t(lang, 'btn_menu'), callback_data: 'menu' }]] }
  );
}

async function showSamplePicker(env, cfg, chat, uid) {
  const lang = (await getUser(env, uid)).lang || 'en';
  return screen(env, chat, t(lang, 'samples_pick'), trackMarkup(cfg, lang, 'sp', 'menu'));
}

async function showSubjectPicker(env, cfg, chat, uid, track) {
  if (!validTrack(cfg, track)) return;
  const lang = (await getUser(env, uid)).lang || 'en';
  const rows = cfg.tracks[track].subjects.map((s) => [{ text: s.name, callback_data: `ss:${track}:${s.key}` }]);
  rows.push([{ text: t(lang, 'btn_back'), callback_data: 'samp' }]);
  return screen(env, chat, t(lang, 'samples_subjects', { track: cfg.tracks[track].name }), { inline_keyboard: rows });
}

async function showSample(env, cfg, chat, uid, track, key) {
  const lang = (await getUser(env, uid)).lang || 'en';
  const s = findSubject(cfg, track, key);
  if (!s) return;
  const body = s.sample
    ? `🎁 <b>${esc(s.name)}</b>\n━━━━━━━━━━━━━━\n${esc(s.sample)}`
    : `🎁 <b>${esc(s.name)}</b>\n━━━━━━━━━━━━━━\n${t(lang, 'sample_none')}`;
  return screen(env, chat, body, {
    inline_keyboard: [
      [{ text: t(lang, 'btn_back'), callback_data: `sp:${track}` }],
      [{ text: t(lang, 'btn_menu'), callback_data: 'menu' }],
    ],
  });
}

// ---------- access control ----------
// Returns 'ok' or 'no_track'. Renewals add days to the current end date.
async function grantAccess(env, cfg, uid, days) {
  const user = await getUser(env, uid);
  if (!user.track || !validTrack(cfg, user.track)) return 'no_track';

  const lang = user.lang || 'en';
  const expires = Math.max(now(), user.expires || 0) + days * DAY;
  await dropLink(env, user);
  const url = await newLink(env, cfg, uid, user.track);
  const link = url ? { url, gid: String(cfg.groups[user.track]) } : null;
  await putUser(env, uid, { ...user, status: 'active', flow: 'none', expires, link });

  const body = t(lang, 'granted', { track: cfg.tracks[user.track].name, date: fmtDate(expires) });
  const r = url
    ? await newScreen(env, uid, `${body}\n\n${t(lang, 'join_hint')}`, {
        inline_keyboard: [[{ text: t(lang, 'btn_join'), url }], [{ text: t(lang, 'btn_menu'), callback_data: 'menu' }]],
      })
    : await newScreen(env, uid, `${body}\n\n${t(lang, 'link_wait')}`, menuMarkup(lang, true));

  if (!r.ok) {
    await notifyAdmins(env, cfg, `⚠️ Access granted to ${uid}, but the bot could not message them. They must press /start in the bot first.`);
  }
  return 'ok';
}

async function revokeAccess(env, cfg, uid) {
  const user = await getUser(env, uid);
  await dropLink(env, user);
  await putUser(env, uid, { ...user, status: 'expired', expires: 0, link: null });
  if (user.track && validTrack(cfg, user.track)) {
    const gid = String(cfg.groups[user.track]);
    await API(env, 'banChatMember', { chat_id: gid, user_id: Number(uid) });
    await API(env, 'unbanChatMember', { chat_id: gid, user_id: Number(uid), only_if_banned: true });
  }
  const lang = user.lang || 'en';
  await newScreen(env, uid, t(lang, 'expired'), menuMarkup(lang, false));
}

async function expireMembers(env) {
  const cfg = await getConfig(env);
  for (const u of await allUsers(env)) {
    if (u.status === 'active' && u.expires <= now()) await revokeAccess(env, cfg, u.id);
  }
}

const grantMsg = (r, id) => (r === 'ok' ? `✅ Access granted to ${esc(id)}` : `⚠️ ${esc(id)} has no track yet.`);

// ---------- payment decisions (buttons on the admin card) ----------
async function resolveCard(env, q, text) {
  if (!q.message) return null;
  return API(env, 'editMessageText', {
    chat_id: q.message.chat.id,
    message_id: q.message.message_id,
    text,
    parse_mode: 'HTML',
  });
}

async function handlePayment(env, cfg, q, action, uid) {
  const user = await getUser(env, uid);
  const by = esc(q.from.first_name || 'admin');
  if (user.flow !== 'pending') return resolveCard(env, q, `ℹ️ Already handled. User: ${esc(uid)}`);

  if (action === 'ok') {
    const r = await grantAccess(env, cfg, uid, cfg.accessDays);
    if (r !== 'ok') return resolveCard(env, q, `⚠️ ${esc(uid)} has no track yet.`);
    return resolveCard(env, q, `✅ <b>Approved</b> by ${by}\nUser: ${esc(uid)}`);
  }

  await putUser(env, uid, { ...user, flow: 'none' });
  const lang = user.lang || 'en';
  await screen(env, uid, t(lang, 'rejected'), menuFor(lang, user));
  return resolveCard(env, q, `❌ <b>Rejected</b> by ${by}\nUser: ${esc(uid)}`);
}

// ---------- admin screens ----------
async function userCard(env, cfg, id) {
  const u = await getUser(env, id);
  return {
    text: `👤 <b>User</b> <code>${esc(id)}</code>\n━━━━━━━━━━━━━━\nName: ${esc(u.name || '-')}\nTrack: ${esc(trackLabel(cfg, u.track))}\n${statusLine(cfg, u, 'en')}`,
    markup: {
      inline_keyboard: [
        [
          { text: `✅ Grant ${cfg.accessDays}d`, callback_data: `a:gq:${id}` },
          { text: '⛔ Revoke', callback_data: `a:rq:${id}` },
        ],
        [{ text: '⬅️ Back to panel', callback_data: 'a:home' }],
      ],
    },
  };
}

async function subjectScreen(env, chat, cfg, track) {
  const rows = cfg.tracks[track].subjects.map((s) => [
    { text: `🗑 ${s.name}`, callback_data: `a:subdel:${track}:${s.key}` },
  ]);
  rows.push([
    { text: '➕ Add subject', callback_data: `a:subadd:${track}` },
    { text: '✏️ Rename track', callback_data: `a:tname:${track}` },
  ]);
  rows.push([{ text: '⬅️ Back to panel', callback_data: 'a:home' }]);
  return screen(env, chat, `📚 <b>${esc(cfg.tracks[track].name)}</b>\nTap a subject to remove it.`, { inline_keyboard: rows });
}

async function adminCallback(env, cfg, q, [op, x, y]) {
  const chat = q.from.id;

  const ask = async (step, text, extra = {}) => {
    await env.EXAM_KV.put(`adm:${chat}`, JSON.stringify({ step, ...extra }), { expirationTtl: 1800 });
    return screen(env, chat, text, ADMIN_CANCEL);
  };

  switch (op) {
    case 'home':
      await env.EXAM_KV.delete(`adm:${chat}`);
      return adminScreen(env, chat);

    case 'pending': {
      const list = (await allUsers(env)).filter((u) => u.flow === 'pending');
      if (!list.length) return screen(env, chat, '✅ No pending payments.', ADMIN_BACK);
      for (const u of list.slice(0, 20)) {
        await send(env, chat, `🧾 <b>${esc(u.name || 'User')}</b> (<code>${esc(u.id)}</code>)\nTrack: ${esc(trackLabel(cfg, u.track))}`, {
          reply_markup: {
            inline_keyboard: [[
              { text: `✅ Approve ${cfg.accessDays}d`, callback_data: `ok:${u.id}` },
              { text: '❌ Reject', callback_data: `no:${u.id}` },
            ]],
          },
        });
      }
      return screen(env, chat, `🧾 ${list.length} pending payment(s) are shown above.`, ADMIN_BACK);
    }

    case 'stats': {
      const users = await allUsers(env);
      const c = (f) => users.filter(f).length;
      return screen(
        env,
        chat,
        `📊 <b>Statistics</b>\n━━━━━━━━━━━━━━\n👥 Users: ${users.length}\n✅ Active: ${c((u) => isActive(u))}\n⏳ Pending: ${c((u) => u.flow === 'pending')}\n📸 Awaiting screenshot: ${c((u) => u.flow === 'awaiting_proof')}`,
        ADMIN_BACK
      );
    }

    case 'find':
      return ask('find', '🔎 Send the Telegram ID of the user.');
    case 'grant':
      return ask('grant', '➕ Send the ID and optional days.\nExample: <code>123456789 30</code>');
    case 'revoke':
      return ask('revoke', '⛔ Send the Telegram ID to revoke.');
    case 'broadcast':
      return ask('broadcast', '📢 Send the message to all users.');

    case 'gq': {
      const r = await grantAccess(env, cfg, x, cfg.accessDays);
      return screen(env, chat, grantMsg(r, x), ADMIN_BACK);
    }
    case 'rq':
      await revokeAccess(env, cfg, x);
      return screen(env, chat, '🚫 Revoked.', ADMIN_BACK);

    case 'price':
      return ask('price', `💰 Current price: <b>${esc(cfg.price)}</b>\nSend the new price.`);
    case 'days':
      return ask('days', `⏳ Current: <b>${cfg.accessDays} days</b>\nSend the new number of days.`);
    case 'pay':
      return ask('pay', `💳 Current payment info:\n${esc(cfg.paymentInfo)}\n\nSend the new text.`);

    case 'groups':
      return screen(
        env,
        chat,
        `🏫 <b>Group IDs</b>\n━━━━━━━━━━━━━━\n🧪 Natural: <code>${esc(cfg.groups.natural)}</code>\n🌍 Social: <code>${esc(cfg.groups.social)}</code>`,
        {
          inline_keyboard: [
            [
              { text: '✏️ Natural', callback_data: 'a:setg:natural' },
              { text: '✏️ Social', callback_data: 'a:setg:social' },
            ],
            [{ text: '⬅️ Back to panel', callback_data: 'a:home' }],
          ],
        }
      );
    case 'setg':
      if (!validTrack(cfg, x)) return;
      return ask(`group_${x}`, `Send the new group ID for ${esc(cfg.tracks[x].name)} (starts with -100).`);

    case 'subjects':
      return screen(env, chat, '📚 <b>Subjects</b>\nChoose a track.', {
        inline_keyboard: [
          ...Object.entries(cfg.tracks).map(([k, v]) => [{ text: v.name, callback_data: `a:subj:${k}` }]),
          [{ text: '⬅️ Back to panel', callback_data: 'a:home' }],
        ],
      });
    case 'subj':
      if (!validTrack(cfg, x)) return;
      return subjectScreen(env, chat, cfg, x);
    case 'subadd':
      if (!validTrack(cfg, x)) return;
      return ask(
        'subject_add',
        'Send: <code>key | Display name</code>\nExample: <code>biology | Biology / ባዮሎጂ</code>\nThe key must match the folder name you use in the group.',
        { track: x }
      );
    case 'tname':
      if (!validTrack(cfg, x)) return;
      return ask('tname', `Send the new name for this track.\nCurrent: ${esc(cfg.tracks[x].name)}`, { track: x });
    case 'subdel':
      if (!validTrack(cfg, x)) return;
      cfg.tracks[x].subjects = cfg.tracks[x].subjects.filter((s) => s.key !== y);
      await saveConfig(env, cfg);
      return subjectScreen(env, chat, cfg, x);

    case 'samp':
      return screen(env, chat, '🎁 <b>Samples</b>\nChoose a track.', {
        inline_keyboard: [
          ...Object.entries(cfg.tracks).map(([k, v]) => [{ text: v.name, callback_data: `a:samt:${k}` }]),
          [{ text: '⬅️ Back to panel', callback_data: 'a:home' }],
        ],
      });
    case 'samt':
      if (!validTrack(cfg, x)) return;
      return screen(env, chat, `🎁 <b>${esc(cfg.tracks[x].name)}</b>\n✅ sample added · ➖ no sample yet`, {
        inline_keyboard: [
          ...cfg.tracks[x].subjects.map((s) => [{ text: `${s.sample ? '✅' : '➖'} ${s.name}`, callback_data: `a:sams:${x}:${s.key}` }]),
          [{ text: '⬅️ Back', callback_data: 'a:samp' }],
        ],
      });
    case 'sams': {
      const s = findSubject(cfg, x, y);
      if (!s) return;
      return screen(
        env,
        chat,
        `🎁 <b>${esc(s.name)}</b>\n━━━━━━━━━━━━━━\n${s.sample ? esc(s.sample) : '<i>No sample yet.</i>'}`,
        {
          inline_keyboard: [
            [
              { text: '✏️ Set sample', callback_data: `a:samset:${x}:${y}` },
              { text: '🗑 Clear', callback_data: `a:samclr:${x}:${y}` },
            ],
            [{ text: '⬅️ Back', callback_data: `a:samt:${x}` }],
          ],
        }
      );
    }
    case 'samset':
      if (!findSubject(cfg, x, y)) return;
      return ask('sample_set', 'Send the sample for this subject.\nYou can send text or a link to a group topic (t.me/...).', { track: x, key: y });
    case 'samclr': {
      const s = findSubject(cfg, x, y);
      if (s) {
        s.sample = '';
        await saveConfig(env, cfg);
      }
      return adminCallback(env, cfg, q, ['sams', x, y]);
    }

    case 'welcome':
      return screen(
        env,
        chat,
        `✍️ <b>Welcome text</b>\n━━━━━━━━━━━━━━\n🇬🇧 English:\n${esc(cfg.welcome?.en || '(default)')}\n\n🇪🇹 Amharic:\n${esc(cfg.welcome?.am || '(default)')}`,
        {
          inline_keyboard: [
            [
              { text: '✏️ English', callback_data: 'a:welc:en' },
              { text: '✏️ Amharic', callback_data: 'a:welc:am' },
            ],
            [{ text: '♻️ Reset to default', callback_data: 'a:welc:reset' }],
            [{ text: '⬅️ Back to panel', callback_data: 'a:home' }],
          ],
        }
      );
    case 'welc':
      if (x === 'reset') {
        cfg.welcome = { en: '', am: '' };
        await saveConfig(env, cfg);
        return adminScreen(env, chat, '♻️ Welcome text reset to default.');
      }
      if (x !== 'en' && x !== 'am') return;
      return ask(`welcome_${x}`, `Send the new welcome text (${x === 'en' ? 'English' : 'Amharic'}).\nLine breaks are kept.`);

    case 'admins': {
      const rows = superAdmins(env).map((id) => [{ text: `👑 ${id} (owner)`, callback_data: 'a:home' }]);
      for (const id of cfg.admins) rows.push([{ text: `🗑 ${id}`, callback_data: `a:admdel:${id}` }]);
      rows.push([{ text: '➕ Add admin', callback_data: 'a:admadd' }]);
      rows.push([{ text: '⬅️ Back to panel', callback_data: 'a:home' }]);
      return screen(env, chat, '👮 <b>Admins</b>\nChat IDs that receive payment cards. Owners cannot be removed here.', { inline_keyboard: rows });
    }
    case 'admadd':
      return ask('admin_add', 'Send the Telegram ID of the new admin.');
    case 'admdel':
      if (superAdmins(env).includes(x)) return screen(env, chat, '⚠️ Owners cannot be removed here.', ADMIN_BACK);
      cfg.admins = cfg.admins.filter((id) => id !== x);
      await saveConfig(env, cfg);
      return adminScreen(env, chat, `🗑 Removed admin ${esc(x)}`);

    default:
      return adminScreen(env, chat);
  }
}

// ---------- admin typed input ----------
async function adminInput(env, cfg, msg, st) {
  const chat = msg.chat.id;
  const text = (msg.text || '').trim();
  await env.EXAM_KV.delete(`adm:${msg.from.id}`);

  const back = (x) => screen(env, chat, x, ADMIN_BACK);
  const home = (x = '') => adminScreen(env, chat, x);

  switch (st.step) {
    case 'find': {
      const c = await userCard(env, cfg, text.split(/\s+/)[0]);
      return screen(env, chat, c.text, c.markup);
    }
    case 'grant': {
      const [id, days] = text.split(/\s+/);
      if (!id) return back('Send an ID.');
      const r = await grantAccess(env, cfg, id, Number(days) > 0 ? Number(days) : cfg.accessDays);
      return home(grantMsg(r, id));
    }
    case 'revoke':
      await revokeAccess(env, cfg, text.split(/\s+/)[0]);
      return home('🚫 Revoked.');
    case 'broadcast': {
      let n = 0;
      for (const u of await allUsers(env)) {
        const r = await send(env, Number(u.id), esc(text));
        if (r.ok) n++;
      }
      return home(`📢 Sent to ${n} users.`);
    }

    case 'price':
      cfg.price = text;
      break;
    case 'days': {
      const n = Number(text);
      if (!(n > 0)) return back('Send a number greater than 0.');
      cfg.accessDays = n;
      break;
    }
    case 'pay':
      cfg.paymentInfo = text;
      break;
    case 'group_natural':
    case 'group_social':
      cfg.groups[st.step.slice(6)] = text;
      break;

    case 'subject_add': {
      const m = text.match(/^([a-z0-9_-]+)\s*\|\s*(.+)$/i);
      if (!m) return back('Format: key | Display name');
      if (!validTrack(cfg, st.track)) return back('Unknown track.');
      const key = m[1].toLowerCase();
      if (cfg.tracks[st.track].subjects.some((s) => s.key === key)) return back('That key already exists.');
      cfg.tracks[st.track].subjects.push({ key, name: m[2].trim(), sample: '' });
      break;
    }
    case 'tname':
      if (!validTrack(cfg, st.track)) return back('Unknown track.');
      cfg.tracks[st.track].name = text;
      break;
    case 'sample_set': {
      const s = findSubject(cfg, st.track, st.key);
      if (!s) return back('Subject not found.');
      s.sample = text.slice(0, 2000);
      break;
    }
    case 'welcome_en':
    case 'welcome_am':
      cfg.welcome = { en: '', am: '', ...(cfg.welcome || {}) };
      cfg.welcome[st.step.slice(8)] = text;
      break;

    case 'admin_add': {
      const id = text.split(/\s+/)[0];
      if (!/^\d+$/.test(id)) return back('Send a numeric Telegram ID.');
      if (!cfg.admins.includes(id)) cfg.admins.push(id);
      break;
    }

    default:
      return home();
  }

  await saveConfig(env, cfg);
  return home('✅ Saved.');
}

// ---------- messages ----------
async function onMessage(msg, env) {
  if (msg.chat.type !== 'private') return;

  const cfg = await getConfig(env);
  const uid = String(msg.from.id);
  const chat = msg.chat.id;
  const text = (msg.text || '').trim();
  const cmd = text.split(/\s+/)[0].toLowerCase().split('@')[0];
  const args = text.split(/\s+/).slice(1);
  const user = await getUser(env, uid);
  const lang = user.lang || 'en';
  const authed = await isAuthed(env, uid);

  // Replies go to the bottom of the chat
  await clearScreen(env, chat);

  // Admin password step
  const st = await env.EXAM_KV.get(`adm:${uid}`, 'json');
  if (st && !cmd.startsWith('/')) {
    if (st.step === 'login') return tryLogin(env, chat, uid, text);
    if (authed) return adminInput(env, cfg, msg, st);
    await env.EXAM_KV.delete(`adm:${uid}`);
  }
  if (cmd.startsWith('/')) await env.EXAM_KV.delete(`adm:${uid}`);

  if (cmd === '/start') {
    await putUser(env, uid, { ...user, name: msg.from.first_name || user.name || '' });
    if (!user.lang) return screen(env, chat, T.en.choose_lang, LANG_PICKER);
    return showWelcome(env, cfg, chat, uid);
  }

  if (cmd === '/admin') {
    if (args[0]) return tryLogin(env, chat, uid, args[0]);
    if (authed) return adminScreen(env, chat);
    await env.EXAM_KV.put(`adm:${uid}`, JSON.stringify({ step: 'login' }), { expirationTtl: 600 });
    return screen(env, chat, '🔐 <b>Admin login</b>\nSend the admin password.', ADMIN_CANCEL);
  }

  if (cmd === '/logout') {
    await env.EXAM_KV.delete(`auth:${uid}`);
    return screen(env, chat, '👋 Logged out of the admin panel.', menuFor(lang, user));
  }

  if (authed && cmd === '/grant' && args[0]) {
    const r = await grantAccess(env, cfg, args[0], Number(args[1]) > 0 ? Number(args[1]) : cfg.accessDays);
    return adminScreen(env, chat, grantMsg(r, args[0]));
  }
  if (authed && cmd === '/revoke' && args[0]) {
    await revokeAccess(env, cfg, args[0]);
    return adminScreen(env, chat, `🚫 Revoked ${esc(args[0])}`);
  }

  if (!user.lang) return screen(env, chat, T.en.choose_lang, LANG_PICKER);

  if (cmd === '/menu') return showWelcome(env, cfg, chat, uid);
  if (cmd === '/buy') return showBuy(env, cfg, chat, uid);
  if (cmd === '/samples') return showSamplePicker(env, cfg, chat, uid);
  if (cmd === '/status') return screen(env, chat, statusLine(cfg, user, lang), menuFor(lang, user));
  if (cmd === '/link') return showLink(env, cfg, chat, uid);
  if (cmd === '/lang') return screen(env, chat, T.en.choose_lang, LANG_PICKER);

  // Payment screenshots
  if (user.flow === 'awaiting_proof' && (msg.photo || msg.document)) {
    return submitProof(env, cfg, msg, user);
  }
  if (user.flow === 'pending') return screen(env, chat, t(lang, 'under_review'), menuFor(lang, user));
  if (user.flow === 'awaiting_proof') return screen(env, chat, t(lang, 'send_shot'), backMenu(lang));

  return showWelcome(env, cfg, chat, uid);
}

// ---------- buttons ----------
async function onCallback(q, env) {
  const cfg = await getConfig(env);
  const fromId = String(q.from.id);
  const chat = q.from.id;
  const p = (q.data || '').split(':');
  const action = p[0];
  const a1 = p[1];
  const a2 = p[2];

  // Admin-only actions need the admin password session
  if (action === 'a' || action === 'ok' || action === 'no') {
    if (!(await isAuthed(env, fromId))) {
      return API(env, 'answerCallbackQuery', {
        callback_query_id: q.id,
        text: 'Admin only. Send /admin, then the password.',
        show_alert: true,
      });
    }
    await API(env, 'answerCallbackQuery', { callback_query_id: q.id });
    if (action === 'a') return adminCallback(env, cfg, q, [a1, a2, p[3]]);
    return handlePayment(env, cfg, q, action, a1);
  }

  await API(env, 'answerCallbackQuery', { callback_query_id: q.id });

  switch (action) {
    case 'menu':
      return showWelcome(env, cfg, chat, fromId);
    case 'buy':
      return showBuy(env, cfg, chat, fromId);
    case 'trk':
      return chooseTrack(env, cfg, chat, fromId, a1);
    case 'samp':
      return showSamplePicker(env, cfg, chat, fromId);
    case 'sp':
      return showSubjectPicker(env, cfg, chat, fromId, a1);
    case 'ss':
      return showSample(env, cfg, chat, fromId, a1, a2);
    case 'link':
      return showLink(env, cfg, chat, fromId);
    case 'status': {
      const user = await getUser(env, fromId);
      return screen(env, chat, statusLine(cfg, user, user.lang || 'en'), menuFor(user.lang || 'en', user));
    }
    case 'lang': {
      if (a1 === 'en' || a1 === 'am') {
        const user = await getUser(env, fromId);
        await putUser(env, fromId, { ...user, lang: a1 });
        return showWelcome(env, cfg, chat, fromId);
      }
      return screen(env, chat, T.en.choose_lang, LANG_PICKER);
    }
    default:
      return;
  }
}

// ---------- group join requests ----------
// Only lets someone in if they have active access to THIS group's track.
async function onJoinRequest(req, env) {
  const cfg = await getConfig(env);
  const uid = String(req.from.id);
  const user = await getUser(env, uid);
  const lang = user.lang || 'en';
  const ok = isActive(user) && validTrack(cfg, user.track) && String(cfg.groups[user.track]) === String(req.chat.id);

  await API(env, ok ? 'approveChatJoinRequest' : 'declineChatJoinRequest', {
    chat_id: req.chat.id,
    user_id: req.from.id,
  });
  if (!ok) {
    await screen(env, req.user_chat_id || req.from.id, t(lang, 'no_access'), menuFor(lang, user));
  }
}

// ---------- entry points ----------
export default {
  async fetch(req, env) {
    if (req.method !== 'POST') return new Response('HAREMAYA exam bot is running');
    if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) {
      return new Response('Forbidden', { status: 403 });
    }
    const update = await req.json();
    try {
      if (update.message) await onMessage(update.message, env);
      else if (update.callback_query) await onCallback(update.callback_query, env);
      else if (update.chat_join_request) await onJoinRequest(update.chat_join_request, env);
    } catch (e) {
      console.log(e.stack || e);
    }
    return new Response('ok');
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(expireMembers(env));
  },
};
