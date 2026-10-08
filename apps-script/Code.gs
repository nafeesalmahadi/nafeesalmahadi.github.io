/**
 * Portfolio messages → Google Sheet database + email alerts + admin inbox.
 * Setup: see README-messages.md. Free, no card needed.
 */
const SHEET_NAME = 'Messages';
const NOTIFY_EMAIL = 'nafeesalmahadi007@gmail.com';
// Secret for the admin inbox. Change this to a long random phrase and enter the same value
// in the Studio → Settings → "Message inbox key". Never share it.
const ADMIN_KEY = 'CHANGE-ME-to-a-long-random-secret';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.action === 'list' || data.action === 'status') return admin(data);
    return saveMessage(data);
  } catch (err) {
    return json({ ok: false, error: 'Server error. Please try WhatsApp or email.' });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function saveMessage(data) {
  if (data.website) return json({ ok: true });            // spam bot filled the hidden field
  const clean = (v, n) => String(v || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, n);
  const name = clean(data.name, 80), email = clean(data.email, 120), phone = clean(data.phone, 30);
  const topic = clean(data.topic, 60) || 'General', message = clean(data.message, 2000);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 5) {
    return json({ ok: false, error: 'Please add your name, a valid email and a message.' });
  }
  const cache = CacheService.getScriptCache();               // 5 messages per email per hour
  const key = 'rl_' + email.toLowerCase();
  const count = Number(cache.get(key) || 0);
  if (count >= 5) return json({ ok: false, error: 'Too many messages. Please try again later.' });
  cache.put(key, String(count + 1), 3600);

  const safe = (v) => (/^[=+\-@]/.test(v) ? "'" + v : v);   // block spreadsheet formula injection
  sheet().appendRow([new Date(), safe(name), safe(email), safe(phone), safe(topic), safe(message), 'New']);
  MailApp.sendEmail({
    to: NOTIFY_EMAIL, replyTo: email,
    subject: '[Portfolio] ' + topic + ' — ' + name,
    body: 'New message from your portfolio\n\nName: ' + name + '\nEmail: ' + email + '\nPhone: ' + (phone || '-') +
          '\nTopic: ' + topic + '\n\n' + message + '\n\nAll messages: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  });
  return json({ ok: true });
}

function admin(data) {
  if (ADMIN_KEY.indexOf('CHANGE-ME') === 0 || String(data.key || '') !== ADMIN_KEY) {
    Utilities.sleep(800);                                    // slow down guessing
    return json({ ok: false, error: 'Wrong admin key.' });
  }
  const s = sheet();
  if (data.action === 'status') {
    const row = Number(data.row), status = ['New', 'Replied', 'Archived'].indexOf(data.status) >= 0 ? data.status : 'New';
    if (row >= 2 && row <= s.getLastRow()) s.getRange(row, 7).setValue(status);
    return json({ ok: true });
  }
  const last = s.getLastRow();
  if (last < 2) return json({ ok: true, messages: [] });
  const first = Math.max(2, last - 499);                     // newest 500
  const values = s.getRange(first, 1, last - first + 1, 7).getValues();
  const messages = values.map((r, i) => ({
    row: first + i, received: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
    name: String(r[1]).replace(/^'/, ''), email: String(r[2]).replace(/^'/, ''), phone: String(r[3]).replace(/^'/, ''),
    topic: String(r[4]).replace(/^'/, ''), message: String(r[5]).replace(/^'/, ''), status: String(r[6] || 'New'),
  })).reverse();
  return json({ ok: true, messages: messages });
}

function doGet() { return json({ ok: true, service: 'portfolio-messages' }); }

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET_NAME);
  if (!s) {
    s = ss.insertSheet(SHEET_NAME);
    s.appendRow(['Received', 'Name', 'Email', 'Phone', 'Topic', 'Message', 'Status']);
    s.setFrozenRows(1);
    s.getRange('A1:G1').setFontWeight('bold');
  }
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
