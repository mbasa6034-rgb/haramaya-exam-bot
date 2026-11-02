// HAREMAYA exam bot: payments, access control, and admin panel.
// Exam files are NOT stored or sent by the bot. Admins upload them into the groups.

const DEFAULT_TRACKS = {
  natural: {
    name: '🧪 Natural Science / ተፈጥሮ ሳይንስ',
    subjects: [
      { key: 'math', name: 'Mathematics / ሂሳብ' },
      { key: 'physics', name: 'Physics / ፊዚክስ' },
      { key: 'chemistry', name: 'Chemistry / ኬሚስትሪ' },
      { key: 'biology', name: 'Biology / ባዮሎጂ' },
    ],
  },
  social: {
    name: '🌍 Social Science / ማህበራዊ ሳይንስ',
    subjects: [
      { key: 'geography', name: 'Geography / ጂኦግራፊ' },
      { key: 'history', name: 'History / ታሪክ' },
      { key: 'civics', name: 'Civics / ሲቪክስ' },
      { key: 'english', name: 'English / እንግሊዝኛ' },
    ],
  },
};

const MENU = {
  inline_keyboard: [
    [{ text: '💳 Buy access / ግዛ', callback_data: 'buy' }],
    [{ text: '🔗 My group link / የቡድን ሊንክ', callback_data: 'link' }],
    [{ text: '📊 My status / ሁኔታ', callback_data: 'status' }],
  ],
};

const ADMIN_MENU = {
  inline_keyboard: [
    [{ text: '📥 Pending payments', callback_data: 'a:pending' }],
    [{ text: '🔎 Find user', callback_data: 'a:find' }, { text: '📊 Stats', callback_data: 'a:stats' }],
    [{ text: '➕ Grant access', callback_data: 'a:grant' }, { text: '⛔ Revoke access', callback_data: 'a:revoke' }],
    [{ text: '📢 Broadcast', callback_data: 'a:broadcast' }],
    [{ text: '💰 Price', callback_data: 'a:price' }, { text: '⏳ Access days', callback_data: 'a:days' }],
    [{ text: '📱 Payment info', callback_data: 'a:pay' }, { text: '🏫 Group IDs', callback_data: 'a:groups' }],
    [{ text: '📚 Subjects', callback_data: 'a:subjects' }, { text: '👮 Admins', callback_data: 'a:admins' }],
    [{ text: '🔄 Clear invite links', callback_data: 'a:clearlinks' }],
  ],
};

const BACK = { inline_keyboard: [[{ text: '⬅️ Back to panel', callback_data: 'a:home' }]] };
const CANCEL = { inline_keyboard: [[{ text: '✖ Cancel', callback_data: 'a:cancel' }]] };

// ---------- basic helpers ----------
const now = () => Date.now();
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const fmtDate = (ms) => new Date(ms).toISOString().slice(0, 10);

function API(env, method, body) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((r) => r.json())
    .then((j) => {
      if (!j.ok) console.log(method, j.description);
      return j;
    });
}

const send = (env, chat_id, text, extra = {}) =>
  API(env, 'sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });

// ---------- settings (saved in KV, editable from the panel) ----------
function defaultConfig(env) {
  return {
    price: env.PRICE,
    accessDays: Number(env.ACCESS_DAYS) || 30,
    paymentInfo: env.PAYMENT_INFO,
    groups: { natural: String(env.GROUP_NATURAL), social: String(env.GROUP_SOCIAL) },
    admins: [],
    tracks: structuredClone(DEFAULT_TRACKS),
  };
}

async function getConfig(env) {
  return (await env.EXAM_KV.get('config', 'json')) || defaultConfig(env);
}

const saveConfig = (env, cfg) => env.EXAM_KV.put('config', JSON.stringify(cfg));
const superAdmins = (env) => env.ADMIN_IDS.split(',').map((s) => s.trim()).filter(Boolean);
const allAdmins = (env, cfg) => [...new Set([...superAdmins(env), ...cfg.admins.map(String)])];
const validTrack = (cfg, t) => Object.prototype.hasOwnProperty.call(cfg.tracks, t);
const trackName = (cfg, t) => (t && validTrack(cfg, t) ? cfg.tracks[t].name : 'No track yet');

// ---------- users ----------
const getUser = async (env, id) => (await env.EXAM_KV.get(`user:${id}`, 'json')) || { status: 'none' };
const putUser = (env, id, u) => env.EXAM_KV.put(`user:${id}`, JSON.stringify(u));
const isActive = (u) => u.status === 'active' && u.expires > now();

async function allUsers(env) {
  const out = [];
  let cursor;
  do {
    const page = await env.EXAM_KV.list({ prefix: 'user:', cursor });
    for (const k of page.keys) {
      const u = await env.EXAM_KV.get(k.name, 'json');
      if (u) out.push({ id: k.name.slice('user:'.length), ...u });
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out;
}

function statusText(cfg, u) {
  const track = u.track && validTrack(cfg, u.track) ? ` (${cfg.tracks[u.track].name})` : '';
  if (isActive(u)) return `✅ Active until ${fmtDate(u.expires)}${track} / ገቢር ነው`;
  if (u.status === 'pending') return `⏳ Payment under review${track} / ክፍያዎ እየተረጋገጠ ነው`;
  if (u.status === 'awaiting_proof') return `📸 Send your payment screenshot${track} / የክፍያ ፎቶ ይላኩ`;
  return '❌ No active access. Tap Buy access. / ምንም ገቢር መዳረሻ የለም።';
}

// ---------- group invite links (one per track, cached) ----------
async function groupLink(env, cfg, track) {
  const gid = String(cfg.groups[track]);
  const key = `link:${track}:${gid}`;
  let link = await env.EXAM_KV.get(key);
  if (!link) {
    const r = await API(env, 'createChatInviteLink', {
      chat_id: gid,
      creates_join_request: true,
      name: `HAREMAYA ${track}`.slice(0, 32),
    });
    if (!r.ok) return null;
    link = r.result.invite_link;
    await env.EXAM_KV.put(key, link);
  }
  return link;
}

// ---------- student flow ----------
const trackPicker = (cfg) => ({
  inline_keyboard: Object.keys(cfg.tracks).map((k) => [{ text: cfg.tracks[k].name, callback_data: `trk:${k}` }]),
});

function paymentText(cfg, track) {
  return (
    `💳 <b>Payment / ክፍያ</b>\nTrack: <b>${esc(cfg.tracks[track].name)}</b>\n` +
    `Amount: <b>${esc(cfg.price)}</b> for ${cfg.accessDays} days\n\n${esc(cfg.paymentInfo)}\n\n` +
    `📸 Send the screenshot here after paying. / ከከፈሉ በኋላ ፎቶውን እዚህ ይላኩ።`
  );
}

async function startBuy(env, cfg, chat_id, uid, user) {
  if (isActive(user) || user.status === 'pending') return send(env, chat_id, statusText(cfg, user));
  return send(env, chat_id, '🎓 Choose your track / ትራክዎን ይምረጡ', { reply_markup: trackPicker(cfg) });
}

async function sendMyLink(env, cfg, chat_id, uid) {
  const user = await getUser(env, uid);
  if (!isActive(user) || !validTrack(cfg, user.track)) {
    return send(env, chat_id, '🔒 Buy access first. / መጀመሪያ መዳረሻ ይግዙ።', { reply_markup: MENU });
  }
  const link = await groupLink(env, cfg, user.track);
  return send(env, chat_id,
    `🔗 <b>${esc(cfg.tracks[user.track].name)}</b>\n${link || 'Admin will send your link soon.'}\n\n` +
    `Valid until / እስከ: <b>${fmtDate(user.expires)}</b>`);
}

async function submitProof(env, cfg, msg, user) {
  const uid = String(msg.from.id);
  await putUser(env, uid, { ...user, status: 'pending' });
  const name = esc(msg.from.first_name || 'User');
  const track = esc(trackName(cfg, user.track));

  for (const admin of allAdmins(env, cfg)) {
    await API(env, 'forwardMessage', { chat_id: admin, from_chat_id: msg.chat.id, message_id: msg.message_id });
    await send(env, admin, `🧾 Payment from <b>${name}</b> (<code>${uid}</code>)\nTrack: ${track}`, {
      reply_markup: {
        inline_keyboard: [[
          { text: `✅ Approve ${cfg.accessDays}d`, callback_data: `ok:${uid}` },
          { text: '❌ Reject', callback_data: `no:${uid}` },
        ]],
      },
    });
  }
  return send(env, msg.chat.id, '✅ Received. Admin will confirm soon. / ደርሶናል። በቅርቡ ይረጋገጣል።');
}

// ---------- access control ----------
async function grantAccess(env, cfg, uid, days) {
  const user = await getUser(env, uid);
  if (!user.track || !validTrack(cfg, user.track)) return false;

  const expires = now() + days * 86400000;
  await putUser(env, uid, { ...user, status: 'active', expires });
  const link = await groupLink(env, cfg, user.track);
  await send(env, uid,
    `🎉 <b>Access granted! / መዳረሻ ተሰጥቶዎታል!</b>\nTrack: <b>${esc(cfg.tracks[user.track].name)}</b>\n` +
    `Valid until: <b>${fmtDate(expires)}</b>\n\nJoin here (approved automatically):\n${link || 'Admin will send your link soon.'}`);
  return true;
}

async function revokeAccess(env, cfg, uid) {
  const user = await getUser(env, uid);
  await putUser(env, uid, { ...user, status: 'expired', expires: 0 });
  if (user.track && validTrack(cfg, user.track)) {
    const gid = String(cfg.groups[user.track]);
    await API(env, 'banChatMember', { chat_id: gid, user_id: Number(uid) });
    await API(env, 'unbanChatMember', { chat_id: gid, user_id: Number(uid), only_if_banned: true });
  }
  await send(env, uid, '⌛ Your access has ended. Tap Buy access to renew. / መዳረሻዎ ተጠናቋል።');
}

async function expireMembers(env) {
  const cfg = await getConfig(env);
  for (const u of await allUsers(env)) {
    if (u.status === 'active' && u.expires <= now()) await revokeAccess(env, cfg, u.id);
  }
}

// ---------- admin panel: text input ----------
async function showUser(env, cfg, chat, id) {
  const u = await getUser(env, id);
  return send(env, chat, `👤 <code>${esc(id)}</code>\n${esc(u.name || '')}\n${statusText(cfg, u)}`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: `✅ Grant ${cfg.accessDays}d`, callback_data: `a:gq:${id}` },
          { text: '⛔ Revoke', callback_data: `a:rq:${id}` },
        ],
        [{ text: '⬅️ Back to panel', callback_data: 'a:home' }],
      ],
    },
  });
}

async function broadcast(env, text) {
  let sent = 0;
  for (const u of await allUsers(env)) {
    const r = await send(env, Number(u.id), esc(text));
    if (r.ok) sent++;
  }
  return sent;
}

async function adminInput(env, cfg, msg, state) {
  const chat = msg.chat.id;
  const text = (msg.text || '').trim();
  await env.EXAM_KV.delete(`adm:${msg.from.id}`);

  const home = (t) => send(env, chat, t, { reply_markup: ADMIN_MENU });
  const bad = (t) => send(env, chat, t, { reply_markup: BACK });

  switch (state.step) {
    case 'find':
      return showUser(env, cfg, chat, text.split(/\s+/)[0]);

    case 'grant': {
      const [id, days] = text.split(/\s+/);
      if (!id) return bad('Send an ID.');
      const ok = await grantAccess(env, cfg, id, Number(days) > 0 ? Number(days) : cfg.accessDays);
      return home(ok ? `✅ Granted ${esc(id)}` : '⚠️ This user has no track yet. They must pick one with Buy access first.');
    }

    case 'revoke':
      await revokeAccess(env, cfg, text.split(/\s+/)[0]);
      return home('🚫 Revoked.');

    case 'broadcast': {
      const n = await broadcast(env, text);
      return home(`📢 Sent to ${n} users.`);
    }

    case 'price':
      cfg.price = text;
      break;

    case 'days': {
      const n = Number(text);
      if (!(n > 0)) return bad('Send a number greater than 0.');
      cfg.accessDays = n;
      break;
    }

    case 'pay':
      cfg.paymentInfo = text;
      break;

    case 'group_natural':
    case 'group_social':
      cfg.groups[state.step.slice('group_'.length)] = text;
      break;

    case 'subject_add': {
      const m = text.match(/^([a-z0-9_-]+)\s*\|\s*(.+)$/i);
      if (!m) return bad('Format: key | Display name');
      if (!validTrack(cfg, state.track)) return bad('Unknown track.');
      const key = m[1].toLowerCase();
      const subjects = cfg.tracks[state.track].subjects;
      if (subjects.some((s) => s.key === key)) return bad('That key already exists.');
      subjects.push({ key, name: m[2].trim() });
      break;
    }

    case 'admin_add': {
      const id = text.split(/\s+/)[0];
      if (!/^\d+$/.test(id)) return bad('Send a numeric Telegram ID.');
      if (!cfg.admins.includes(id)) cfg.admins.push(id);
      break;
    }

    default:
      return home('🛠 Admin panel');
  }

  await saveConfig(env, cfg);
  return home('✅ Saved.');
}

// ---------- admin panel: buttons ----------
async function showSubjects(env, chat, cfg, track) {
  const rows = cfg.tracks[track].subjects.map((s) => [
    { text: `🗑 ${s.name}`, callback_data: `a:subdel:${track}:${s.key}` },
  ]);
  rows.push([{ text: '➕ Add subject', callback_data: `a:subadd:${track}` }]);
  rows.push([{ text: '⬅️ Back to panel', callback_data: 'a:home' }]);
  return send(env, chat, `📚 <b>${esc(cfg.tracks[track].name)}</b>\nTap a subject to remove it.`, {
    reply_markup: { inline_keyboard: rows },
  });
}

async function adminCallback(q, env, cfg) {
  const chat = q.from.id;
  const [, op, a1, a2] = q.data.split(':');

  const ask = async (step, text, extra = {}) => {
    await env.EXAM_KV.put(`adm:${chat}`, JSON.stringify({ step, ...extra }), { expirationTtl: 1800 });
    return send(env, chat, text, { reply_markup: CANCEL });
  };

  switch (op) {
    case 'home':
    case 'cancel':
      await env.EXAM_KV.delete(`adm:${chat}`);
      return send(env, chat, '🛠 Admin panel', { reply_markup: ADMIN_MENU });

    case 'pending': {
      const list = (await allUsers(env)).filter((u) => u.status === 'pending');
      if (!list.length) return send(env, chat, '✅ No pending payments.', { reply_markup: BACK });
      for (const u of list.slice(0, 20)) {
        await send(env, chat, `🧾 <b>${esc(u.name || 'User')}</b> (<code>${u.id}</code>)\nTrack: ${esc(trackName(cfg, u.track))}`, {
          reply_markup: {
            inline_keyboard: [[
              { text: `✅ Approve ${cfg.accessDays}d`, callback_data: `ok:${u.id}` },
              { text: '❌ Reject', callback_data: `no:${u.id}` },
            ]],
          },
        });
      }
      return;
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
      const ok = await grantAccess(env, cfg, a1, cfg.accessDays);
      return send(env, chat, ok ? `✅ Granted ${esc(a1)}` : '⚠️ No track yet.', { reply_markup: BACK });
    }

    case 'rq':
      await revokeAccess(env, cfg, a1);
      return send(env, chat, '🚫 Revoked.', { reply_markup: BACK });

    case 'price':
      return ask('price', `💰 Current price: <b>${esc(cfg.price)}</b>\nSend the new price.`);

    case 'days':
      return ask('days', `⏳ Current: <b>${cfg.accessDays} days</b>\nSend the new number of days.`);

    case 'pay':
      return ask('pay', `📱 Current payment info:\n${esc(cfg.paymentInfo)}\n\nSend the new text.`);

    case 'groups':
      return send(env, chat,
        `🏫 <b>Groups</b>\n🧪 Natural: <code>${esc(cfg.groups.natural)}</code>\n🌍 Social: <code>${esc(cfg.groups.social)}</code>`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Set Natural', callback_data: 'a:setg:natural' },
                { text: 'Set Social', callback_data: 'a:setg:social' },
              ],
              [{ text: '⬅️ Back to panel', callback_data: 'a:home' }],
            ],
          },
        });

    case 'setg':
      if (!validTrack(cfg, a1)) return;
      return ask(`group_${a1}`, `Send the new group ID for ${esc(a1)} (starts with -100).`);

    case 'subjects':
      return send(env, chat, '📚 Choose a track', {
        reply_markup: {
          inline_keyboard: [
            ...Object.keys(cfg.tracks).map((k) => [{ text: cfg.tracks[k].name, callback_data: `a:subj:${k}` }]),
            [{ text: '⬅️ Back to panel', callback_data: 'a:home' }],
          ],
        },
      });

    case 'subj':
      if (!validTrack(cfg, a1)) return;
      return showSubjects(env, chat, cfg, a1);

    case 'subadd':
      if (!validTrack(cfg, a1)) return;
      return ask('subject_add',
        'Send: <code>key | Display name</code>\nExample: <code>biology | Biology / ባዮሎጂ</code>\n' +
        'The key must match the folder name you use in the group topics.', { track: a1 });

    case 'subdel': {
      if (!validTrack(cfg, a1)) return;
      cfg.tracks[a1].subjects = cfg.tracks[a1].subjects.filter((s) => s.key !== a2);
      await saveConfig(env, cfg);
      await send(env, chat, `🗑 Removed <code>${esc(a2)}</code>`);
      return showSubjects(env, chat, cfg, a1);
    }

    case 'admins': {
      const rows = superAdmins(env).map((id) => [{ text: `👑 ${id} (owner)`, callback_data: 'a:home' }]);
      for (const id of cfg.admins) rows.push([{ text: `🗑 ${id}`, callback_data: `a:admdel:${id}` }]);
      rows.push([{ text: '➕ Add admin', callback_data: 'a:admadd' }]);
      rows.push([{ text: '⬅️ Back to panel', callback_data: 'a:home' }]);
      return send(env, chat, '👮 <b>Admins</b>\nTap an ID to remove it. Owners cannot be removed.', {
        reply_markup: { inline_keyboard: rows },
      });
    }

    case 'admadd':
      return ask('admin_add', 'Send the Telegram ID of the new admin.');

    case 'admdel':
      if (superAdmins(env).includes(a1)) return send(env, chat, '⚠️ Owners cannot be removed here.', { reply_markup: BACK });
      cfg.admins = cfg.admins.filter((id) => id !== a1);
      await saveConfig(env, cfg);
      return send(env, chat, `🗑 Removed admin ${esc(a1)}`, { reply_markup: BACK });

    case 'stats': {
      const users = await allUsers(env);
      const count = (fn) => users.filter(fn).length;
      return send(env, chat,
        `📊 <b>Stats</b>\n👥 Users: ${users.length}\n✅ Active: ${count(isActive)}\n` +
        `⏳ Pending: ${count((u) => u.status === 'pending')}\n📸 Awaiting screenshot: ${count((u) => u.status === 'awaiting_proof')}`,
        { reply_markup: BACK });
    }

    case 'clearlinks': {
      const list = await env.EXAM_KV.list({ prefix: 'link:' });
      for (const k of list.keys) await env.EXAM_KV.delete(k.name);
      return send(env, chat, '🔄 Invite links cleared. New links are created on the next approval or link request.', { reply_markup: BACK });
    }

    default:
      return send(env, chat, '🛠 Admin panel', { reply_markup: ADMIN_MENU });
  }
}

// ---------- messages ----------
async function onMessage(msg, env) {
  if (msg.chat.type !== 'private') return;

  const cfg = await getConfig(env);
  const uid = String(msg.from.id);
  const chat_id = msg.chat.id;
  const text = (msg.text || '').trim();
  const parts = text.split(/\s+/);
  const cmd = parts[0].toLowerCase().split('@')[0];
  const user = await getUser(env, uid);
  const admin = allAdmins(env, cfg).includes(uid);

  if (cmd.startsWith('/')) {
    await env.EXAM_KV.delete(`adm:${uid}`);
  } else if (admin) {
    const st = await env.EXAM_KV.get(`adm:${uid}`, 'json');
    if (st) return adminInput(env, cfg, msg, st);
  }

  if (cmd === '/start') {
    await putUser(env, uid, { ...user, name: msg.from.first_name || '' });
    return send(env, chat_id,
      `👋 <b>Welcome to HAREMAYA Exam Prep / እንኳን ደህና መጡ!</b>\n\n` +
      `Tap Buy access, then pick your track:\n${Object.values(cfg.tracks).map((t) => t.name).join('  •  ')}\n\n` +
      `💳 Access: <b>${esc(cfg.price)}</b> for ${cfg.accessDays} days`,
      { reply_markup: MENU });
  }
  if (admin && (cmd === '/admin' || cmd === '/cancel')) {
    return send(env, chat_id, '🛠 Admin panel', { reply_markup: ADMIN_MENU });
  }
  if (cmd === '/buy') return startBuy(env, cfg, chat_id, uid, user);
  if (cmd === '/status') return send(env, chat_id, statusText(cfg, user));
  if (cmd === '/link') return sendMyLink(env, cfg, chat_id, uid);

  if (admin && cmd === '/grant' && parts[1]) {
    const ok = await grantAccess(env, cfg, parts[1], Number(parts[2]) > 0 ? Number(parts[2]) : cfg.accessDays);
    return send(env, chat_id, ok ? `✅ Granted to ${esc(parts[1])}` : '⚠️ That user has no track yet.');
  }
  if (admin && cmd === '/revoke' && parts[1]) {
    await revokeAccess(env, cfg, parts[1]);
    return send(env, chat_id, `🚫 Revoked ${esc(parts[1])}`);
  }

  if (user.status === 'awaiting_proof' && (msg.photo || msg.document)) {
    return submitProof(env, cfg, msg, user);
  }
  if (user.status === 'awaiting_proof') {
    return send(env, chat_id, '📸 Please send a payment screenshot. / እባክዎ የክፍያ ፎቶ ይላኩ።');
  }

  return send(env, chat_id, 'Use the menu below. / ከታች ያለውን ምናሌ ይጠቀሙ።', { reply_markup: MENU });
}

// ---------- button presses ----------
async function onCallback(q, env) {
  const cfg = await getConfig(env);
  const [action, arg] = (q.data || '').split(':');
  const fromId = String(q.from.id);
  const chat_id = q.from.id;

  // Admin panel
  if (action === 'a') {
    if (!allAdmins(env, cfg).includes(fromId)) {
      return API(env, 'answerCallbackQuery', { callback_query_id: q.id, text: 'Not allowed', show_alert: true });
    }
    await API(env, 'answerCallbackQuery', { callback_query_id: q.id });
    return adminCallback(q, env, cfg);
  }

  // Student menu
  if (action === 'buy') {
    await API(env, 'answerCallbackQuery', { callback_query_id: q.id });
    return startBuy(env, cfg, chat_id, fromId, await getUser(env, fromId));
  }
  if (action === 'status') {
    await API(env, 'answerCallbackQuery', { callback_query_id: q.id });
    return send(env, chat_id, statusText(cfg, await getUser(env, fromId)));
  }
  if (action === 'link') {
    await API(env, 'answerCallbackQuery', { callback_query_id: q.id });
    return sendMyLink(env, cfg, chat_id, fromId);
  }

  // Track chosen before paying
  if (action === 'trk') {
    await API(env, 'answerCallbackQuery', { callback_query_id: q.id });
    if (!validTrack(cfg, arg)) return;
    const user = await getUser(env, fromId);
    if (isActive(user) || user.status === 'pending') return send(env, chat_id, statusText(cfg, user));
    await putUser(env, fromId, { ...user, track: arg, status: 'awaiting_proof' });
    return send(env, chat_id, paymentText(cfg, arg));
  }

  // Payment approve / reject (admins only)
  if (action === 'ok' || action === 'no') {
    if (!allAdmins(env, cfg).includes(fromId)) {
      return API(env, 'answerCallbackQuery', { callback_query_id: q.id, text: 'Not allowed', show_alert: true });
    }
    await API(env, 'answerCallbackQuery', { callback_query_id: q.id });
    if (action === 'ok') {
      const ok = await grantAccess(env, cfg, arg, cfg.accessDays);
      return send(env, chat_id, ok ? `✅ Approved ${arg}` : `⚠️ ${arg} has no track.`);
    }
    const user = await getUser(env, arg);
    await putUser(env, arg, { ...user, status: 'none' });
    await send(env, arg, '❌ Payment not confirmed. Send a clear screenshot. / ክፍያ አልተረጋገጠም። ግልጽ ፎቶ ይላኩ።');
    return send(env, chat_id, `❌ Rejected ${arg}`);
  }
}

// ---------- group join requests ----------
// Only lets someone in if they have active access to THIS group's track.
async function onJoinRequest(req, env) {
  const cfg = await getConfig(env);
  const uid = String(req.from.id);
  const user = await getUser(env, uid);
  const ok = isActive(user) && validTrack(cfg, user.track) && String(cfg.groups[user.track]) === String(req.chat.id);

  await API(env, ok ? 'approveChatJoinRequest' : 'declineChatJoinRequest', {
    chat_id: req.chat.id,
    user_id: req.from.id,
  });
  if (!ok) {
    await send(env, req.user_chat_id || req.from.id,
      '🔒 No active access to this group. Send /buy. / ለዚህ ቡድን ገቢር መዳረሻ የለዎትም።');
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
