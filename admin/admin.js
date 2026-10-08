/* Portfolio Studio — edits content.json and publishes it to GitHub Pages.
   The access token stays in this browser only (never in the website files). */
import { SOCIAL_TYPES } from "../assets/js/icons.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));
const store = {
  get(k, session) { try { return (session ? sessionStorage : localStorage).getItem(k); } catch { return null; } },
  set(k, v, session) { try { (session ? sessionStorage : localStorage).setItem(k, v); } catch { /* storage blocked */ } },
  del(k) { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch { /* ignore */ } },
};
const DRAFT_KEY = "nafees_cms_draft", AUTH_KEY = "nafees_cms_auth", INBOX_KEY = "nafees_cms_inbox_key";

/* ---------------- icons (stroke) ---------------- */
const I = {
  grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/>',
  box: '<path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 13h5l1 3h6l1-3h5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>', down: '<path d="M12 5v14M5 12l7 7 7-7"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/>',
  chev: '<path d="M6 9l6 6 6-6"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', check: '<path d="m5 12 4.5 4.5L19 7"/>',
  wa: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.3z"/>', refresh: '<path d="M20 11a8 8 0 0 0-14.9-4M4 4v4h4M4 13a8 8 0 0 0 14.9 4M20 20v-4h-4"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
};
const ic = (n) => `<svg viewBox="0 0 24 24">${I[n] || ""}</svg>`;

/* ---------------- schema: what can be edited ---------------- */
const head = (base) => [
  { k: "eyebrow", label: "Small label", hint: "e.g. 02 — Research" },
  { k: "title", label: "Heading" },
  { k: "highlight", label: "Gradient part of heading" },
];
const tl = [
  { k: "when", label: "Dates", hint: "e.g. Jan 2026 — present" }, { k: "title", label: "Role" },
  { k: "org", label: "Organisation", full: true }, { k: "text", label: "Description (optional)", type: "textarea", full: true },
  { k: "highlight", label: "Highlight this entry", type: "toggle" },
];
const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { sep: "Content" },
  { id: "profile", label: "Profile & hero", icon: "user", sub: "Your name, roles, intro text, photo and CV", groups: [
    { title: "Identity", path: ["profile"], fields: [
      { k: "firstName", label: "First name" }, { k: "lastName", label: "Last name (gradient)" },
      { k: "location", label: "Location" }, { k: "photo", label: "Photo (transparent cut-out works best)", type: "image" },
      { k: "cv", label: "CV file (PDF)", type: "file", accept: ".pdf,application/pdf", full: true } ] },
    { title: "Hero section", path: ["profile"], fields: [
      { k: "showAvailability", label: "Show availability badge", type: "toggle" }, { k: "availability", label: "Availability text" },
      { k: "roles", label: "Roles (shown with · between)", type: "tags", full: true },
      { k: "lead", label: "Intro paragraph", type: "textarea", hint: "Wrap words in **double stars** to make them bold", full: true },
      { k: "typingPrefix", label: "Typing line prefix" }, { k: "typing", label: "Typing words (rotate)", type: "tags" },
      { k: "primaryCta", label: "Main button text" }, { k: "secondaryCta", label: "CV button text" } ] },
    { title: "Floating labels around the 3D network", desc: "Up to 4. Turn on ‘live’ for an animated decreasing value.", path: ["hud"], type: "list", max: 4, titleKey: "label",
      blank: { label: "label", value: "", live: false }, fields: [{ k: "label", label: "Label" }, { k: "value", label: "Value" }, { k: "live", label: "Live animated value", type: "toggle" }] },
    { title: "Highlight numbers", desc: "The 4 boxes under the hero.", path: ["stats"], type: "list", max: 4, titleKey: "value", subKey: "label",
      blank: { value: "1", label: "Something worth highlighting" }, fields: [{ k: "value", label: "Big value", hint: "Numbers count up automatically" }, { k: "label", label: "Description" }] },
  ] },
  { id: "socials", label: "Social links", icon: "link", sub: "Shown as icons in the hero, contact, menu and footer", groups: [
    { title: "Links", path: ["socials"], type: "list", titleKey: "label", subKey: "url", blank: { type: "website", label: "Website", url: "https://" },
      fields: [{ k: "type", label: "Icon", type: "select", options: SOCIAL_TYPES }, { k: "label", label: "Name" }, { k: "url", label: "URL", type: "url", full: true }] },
  ] },
  { id: "about", label: "About", icon: "info", sub: "Bio, floating chips and model card", groups: [
    { title: "Heading & bio", path: ["about"], fields: [...head(), { k: "titleEnd", label: "Heading ending" }, { k: "bio", label: "Bio", type: "textarea", full: true, hint: "**bold** supported" },
      { k: "chips", label: "Chips around your photo (max 3)", type: "tags", full: true }, { k: "cardFile", label: "Card file name" }, { k: "cardVersion", label: "Card version" }] },
    { title: "Model card rows", path: ["about", "modelCard"], type: "list", titleKey: "key", subKey: "value", blank: { key: "key", value: "value" },
      fields: [{ k: "key", label: "Key" }, { k: "value", label: "Value" }] },
  ] },
  { id: "research", label: "Research", icon: "book", sub: "Papers, ongoing research and datasets", groups: [
    { title: "Section heading", path: ["research"], fields: [...head(), { k: "lead", label: "Intro", type: "textarea", full: true }] },
    { title: "Papers", path: ["research", "papers"], type: "list", titleKey: "title", subKey: "status",
      blank: { status: "Accepted", venue: "", title: "New paper", authors: "**Nafees Al Mahadi**", summary: "", tags: [], abstract: "", link: "", gaugeValue: "", gaugeLabel: "accuracy", gaugeColor: "cyan", metrics: [] },
      fields: [{ k: "title", label: "Title", full: true }, { k: "status", label: "Status badge" }, { k: "venue", label: "Venue · place · date" },
        { k: "authors", label: "Authors", full: true, hint: "Put your name in **double stars** to highlight it" },
        { k: "summary", label: "Summary", type: "textarea", full: true }, { k: "tags", label: "Tags", type: "tags", full: true },
        { k: "abstract", label: "Abstract (expandable)", type: "textarea", full: true }, { k: "link", label: "Paper link (DOI / IEEE Xplore)", type: "url", full: true },
        { k: "gaugeValue", label: "Ring value (0–100, empty = hide)", type: "number" }, { k: "gaugeLabel", label: "Ring label" },
        { k: "gaugeColor", label: "Ring colour", type: "select", options: ["cyan", "pink", "violet", "green", "amber"] },
        { k: "metrics", label: "Key results", type: "list", titleKey: "key", subKey: "value", blank: { key: "Metric", value: "0" }, fields: [{ k: "key", label: "Name" }, { k: "value", label: "Value" }], full: true }] },
    { title: "In progress & datasets", path: ["research", "ongoing"], type: "list", titleKey: "title", subKey: "status", blank: { kind: "wip", status: "In progress", title: "New topic", text: "", url: "" },
      fields: [{ k: "kind", label: "Type", type: "select", options: ["wip", "data", "done"] }, { k: "status", label: "Badge text" }, { k: "title", label: "Title", full: true },
        { k: "text", label: "Description", type: "textarea", full: true }, { k: "url", label: "Link (optional)", type: "url", full: true }] },
  ] },
  { id: "projects", label: "Projects", icon: "box", sub: "Add, reorder and edit project cards", groups: [
    { title: "Section heading", path: ["projects"], fields: head() },
    { title: "Projects", desc: "Order here = order on the site. ‘feature’ and ‘tall’ make bigger cards.", path: ["projects", "items"], type: "list", titleKey: "title", subKey: "meta",
      blank: { title: "New project", meta: "Personal · 2026", live: false, description: "", tags: [], url: "", linkLabel: "", art: "brain", image: "", categories: ["web"], size: "normal" },
      fields: [{ k: "title", label: "Title" }, { k: "meta", label: "Small line (type · dates)" }, { k: "description", label: "Description", type: "textarea", full: true },
        { k: "tags", label: "Tech tags", type: "tags", full: true }, { k: "url", label: "Link (optional)", type: "url" }, { k: "linkLabel", label: "Link text" },
        { k: "art", label: "Card artwork", type: "select", options: ["image", "logo", "brain", "ecg", "shop", "chat", "cards", "invoice", "bars"] },
        { k: "size", label: "Card size", type: "select", options: ["normal", "wide", "tall", "feature", "full"] },
        { k: "image", label: "Image (for ‘image’ or ‘logo’ artwork)", type: "image", full: true },
        { k: "categories", label: "Filters", type: "checks", options: [["ai", "AI & Health"], ["web", "Web apps"], ["venture", "Ventures"]] },
        { k: "live", label: "Show ‘Live’ badge", type: "toggle" }] },
  ] },
  { id: "experience", label: "Experience", icon: "brief", sub: "Work, leadership and education", groups: [
    { title: "Section heading", path: ["experience"], fields: head() },
    { title: "Work & ventures", path: ["experience", "work"], type: "list", titleKey: "title", subKey: "org", blank: { when: "", title: "New role", org: "", text: "", highlight: false }, fields: tl },
    { title: "Leadership", path: ["experience", "leadership"], type: "list", titleKey: "title", subKey: "org", blank: { when: "", title: "New role", org: "", text: "", highlight: false }, fields: tl },
    { title: "Education", path: ["experience", "education"], type: "list", titleKey: "title", subKey: "label", blank: { label: "", title: "New entry", text: "" },
      fields: [{ k: "label", label: "Small label (degree · year)" }, { k: "title", label: "Title" }, { k: "text", label: "Institution", full: true }] },
  ] },
  { id: "skills", label: "Skills", icon: "cpu", sub: "The neural-network skills diagram", groups: [
    { title: "Section heading", path: ["skills"], fields: [...head(), { k: "lead", label: "Intro", full: true }] },
    { title: "Layers", desc: "Each layer is a column of the network.", path: ["skills", "layers"], type: "list", titleKey: "name", blank: { name: "new layer", style: "plain", items: [] },
      fields: [{ k: "name", label: "Layer name" }, { k: "style", label: "Style", type: "select", options: ["plain", "ai", "out"] }, { k: "items", label: "Skills", type: "tags", full: true }] },
  ] },
  { id: "contact", label: "Contact", icon: "phone", sub: "Email, WhatsApp, form topics and message database", groups: [
    { title: "Section text", path: ["contact"], fields: [...head(), { k: "lead", label: "Intro", type: "textarea", full: true }] },
    { title: "Contact details", path: ["contact"], fields: [
      { k: "email", label: "Email" }, { k: "whatsapp", label: "WhatsApp number (digits with country code)" },
      { k: "whatsappDisplay", label: "WhatsApp number as shown" }, { k: "whatsappMessage", label: "Pre-filled WhatsApp message" },
      { k: "topics", label: "Form topics", type: "tags", full: true },
      { k: "messageApiUrl", label: "Message database URL (Google Apps Script /exec link)", type: "url", full: true } ] },
  ] },
  { id: "seo", label: "SEO & footer", icon: "globe", sub: "How you appear on Google and in shared links", groups: [
    { title: "Search engines", path: ["meta"], fields: [{ k: "title", label: "Page title", full: true, hint: "Aim for under 65 characters" }, { k: "description", label: "Description", type: "textarea", full: true, hint: "Aim for 140–160 characters" }, { k: "siteUrl", label: "Site URL", type: "url", full: true }] },
    { title: "Footer", path: ["footer"], fields: [{ k: "tagline", label: "Footer tagline", full: true }] },
  ] },
  { sep: "Inbox" },
  { id: "messages", label: "Messages", icon: "inbox", sub: "Messages sent from your contact form" },
  { id: "settings", label: "Settings", icon: "cog", sub: "Connection, backups and help" },
];

/* ---------------- state ---------------- */
const S = { auth: null, offline: false, published: null, draft: null, sha: null, view: "dashboard", open: new Set(), inbox: null };
const getAt = (path) => path.reduce((o, k) => (o == null ? o : o[k]), S.draft);
function setAt(path, value) {
  let o = S.draft;
  for (let i = 0; i < path.length - 1; i++) { if (o[path[i]] == null) o[path[i]] = typeof path[i + 1] === "number" ? [] : {}; o = o[path[i]]; }
  o[path[path.length - 1]] = value;
  changed();
}
let saveT;
function changed() {
  clearTimeout(saveT);
  saveT = setTimeout(() => store.set(DRAFT_KEY, JSON.stringify(S.draft)), 250);
  updateStatus();
}
const isDirty = () => JSON.stringify(S.draft) !== JSON.stringify(S.published);
function updateStatus() {
  const pill = $("[data-status]"), dirty = isDirty();
  pill.textContent = dirty ? "Unpublished changes" : "Live site is up to date";
  pill.classList.toggle("dirty", dirty);
  $("[data-publish]").disabled = !dirty && !S.offline;
}

/* ---------------- GitHub API ---------------- */
const b64encode = (str) => { const bytes = new TextEncoder().encode(str); let bin = ""; bytes.forEach((b) => (bin += String.fromCharCode(b))); return btoa(bin); };
const b64decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0)));
async function gh(path, opts = {}) {
  const { repo, token } = S.auth;
  const r = await fetch(`https://api.github.com/repos/${repo}/${path}`, {
    ...opts, headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", ...(opts.headers || {}) },
  });
  if (!r.ok) { const e = new Error((await r.json().catch(() => ({}))).message || r.statusText); e.status = r.status; throw e; }
  return r.status === 204 ? null : r.json();
}
async function fetchContent() {
  const f = await gh(`contents/content.json?ref=${encodeURIComponent(S.auth.branch)}`);
  S.sha = f.sha;
  return JSON.parse(b64decode(f.content));
}
async function putFile(path, base64, message, sha) {
  return gh(`contents/${path}`, { method: "PUT", body: JSON.stringify({ message, content: base64, branch: S.auth.branch, ...(sha ? { sha } : {}) }) });
}

/* ---------------- login ---------------- */
async function start(auth, offline = false) {
  S.auth = auth; S.offline = offline;
  try {
    S.published = offline ? await (await fetch(`../content.json?v=${Date.now()}`, { cache: "no-store" })).json() : await fetchContent();
  } catch (e) {
    throw new Error(e.status === 401 ? "That token was rejected. Check it and try again." : e.status === 404 ? "Repository or content.json not found. Check the repository name and branch." : "Could not load content: " + e.message);
  }
  S.draft = clone(S.published);
  const saved = store.get(DRAFT_KEY);
  $("[data-login]").hidden = true; $("[data-app]").hidden = false;
  $("[data-conn]").textContent = offline ? "Offline mode" : `${auth.repo} · ${auth.branch}`;
  $("[data-conn]").classList.toggle("off", offline);
  $("[data-publish-label]").textContent = offline ? "Download file" : "Publish";
  buildMenu(); go("dashboard"); updateStatus();
  if (saved && saved !== JSON.stringify(S.published)) {
    if (await confirmBox("Restore unpublished changes?", "You have edits saved on this device that aren’t live yet. Continue where you left off?", "Restore")) {
      S.draft = JSON.parse(saved); go(S.view); updateStatus();
    } else store.del(DRAFT_KEY);
  }
}
$("[data-login-form]").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target, btn = $("[data-login-btn]"), err = $("[data-login-err]");
  const auth = { repo: f.repo.value.trim().replace(/^https:\/\/github.com\//, "").replace(/\/$/, ""), branch: f.branch.value.trim() || "main", token: f.token.value.trim() };
  err.textContent = ""; btn.classList.add("loading");
  try {
    await start(auth);
    store.set(AUTH_KEY, JSON.stringify(auth), !f.remember.checked);
  } catch (ex) { err.textContent = ex.message; }
  finally { btn.classList.remove("loading"); }
});
$("[data-offline]").addEventListener("click", () => start({ repo: "", branch: "", token: "" }, true).catch((e) => toast(e.message, true)));
$("[data-logout]").addEventListener("click", async () => {
  if (isDirty() && !(await confirmBox("Sign out?", "Your unpublished edits stay saved on this device.", "Sign out"))) return;
  store.del(AUTH_KEY); location.reload();
});
(() => { // auto sign-in
  const a = store.get(AUTH_KEY) || store.get(AUTH_KEY, true);
  if (a) start(JSON.parse(a)).catch(() => store.del(AUTH_KEY));
})();

/* ---------------- navigation ---------------- */
function buildMenu() {
  const unread = S.inbox ? S.inbox.filter((m) => m.status === "New").length : 0;
  $("[data-menu]").innerHTML = SECTIONS.map((s) => s.sep ? `<p class="sep">${s.sep}</p>` :
    `<button type="button" data-go="${s.id}" class="${S.view === s.id ? "on" : ""}">${ic(s.icon)}<span>${s.label}</span>${s.id === "messages" && unread ? `<span class="badge">${unread}</span>` : ""}</button>`).join("");
}
$("[data-menu]").addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });
$("[data-side-toggle]").addEventListener("click", () => $("[data-side]").classList.toggle("open"));
function go(id) {
  S.view = id;
  const sec = SECTIONS.find((s) => s.id === id);
  $("[data-title]").textContent = sec.label; $("[data-subtitle]").textContent = sec.sub || "";
  $$("[data-go]").forEach((b) => b.classList.toggle("on", b.dataset.go === id));
  $("[data-side]").classList.remove("open");
  const c = $("[data-content]");
  if (id === "dashboard") c.innerHTML = dashboard();
  else if (id === "messages") renderMessages();
  else if (id === "settings") c.innerHTML = settings();
  else { c.innerHTML = ""; sec.groups.forEach((g) => c.appendChild(group(g))); }
  window.scrollTo(0, 0);
}

/* ---------------- form builder ---------------- */
function group(g) {
  const el = document.createElement("section");
  el.className = "group glass";
  el.innerHTML = `<div class="group-head"><div><h3>${esc(g.title)}</h3>${g.desc ? `<p>${esc(g.desc)}</p>` : ""}</div></div>`;
  if (g.type === "list") el.appendChild(list(g.path, g));
  else el.appendChild(fieldsGrid(g.fields, g.path));
  return el;
}
function fieldsGrid(fields, base) {
  const grid = document.createElement("div"); grid.className = "grid";
  fields.forEach((f) => grid.appendChild(field(f, [...base, f.k])));
  return grid;
}
function field(f, path) {
  const wrap = document.createElement("div");
  wrap.className = "fld" + (f.full || f.type === "textarea" || f.type === "tags" || f.type === "list" ? " full" : "");
  const val = getAt(path);
  const label = `<span>${esc(f.label)}</span>`;
  const hint = f.hint ? `<small class="hint">${esc(f.hint)}</small>` : "";
  switch (f.type) {
    case "textarea":
      wrap.innerHTML = `${label}<textarea rows="${f.k === "abstract" ? 6 : 4}">${esc(val)}</textarea>${hint}`;
      $("textarea", wrap).addEventListener("input", (e) => setAt(path, e.target.value)); break;
    case "number":
      wrap.innerHTML = `${label}<input type="number" step="any" value="${esc(val)}">${hint}`;
      $("input", wrap).addEventListener("input", (e) => setAt(path, e.target.value === "" ? "" : Number(e.target.value))); break;
    case "select":
      wrap.innerHTML = `${label}<select>${f.options.map((o) => `<option ${o === val ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>${hint}`;
      $("select", wrap).addEventListener("change", (e) => { setAt(path, e.target.value); refreshTitles(); }); break;
    case "toggle":
      wrap.className = "fld";
      wrap.innerHTML = `<span>&nbsp;</span><label class="switch"><input type="checkbox" ${val ? "checked" : ""}><i></i>${esc(f.label)}</label>`;
      $("input", wrap).addEventListener("change", (e) => setAt(path, e.target.checked)); break;
    case "checks":
      wrap.innerHTML = `${label}<div class="checks">${f.options.map(([v, l]) => `<label class="check"><input type="checkbox" value="${v}" ${(val || []).includes(v) ? "checked" : ""}> ${esc(l)}</label>`).join("")}</div>`;
      wrap.addEventListener("change", () => setAt(path, $$("input:checked", wrap).map((i) => i.value))); break;
    case "tags": return tagsField(f, path, wrap);
    case "image": case "file": return uploadField(f, path, wrap);
    case "list": wrap.innerHTML = `<span>${esc(f.label)}</span>`; const sub = document.createElement("div"); sub.className = "sub"; sub.appendChild(list(path, f)); wrap.appendChild(sub); return wrap;
    default:
      wrap.innerHTML = `${label}<input type="${f.type === "url" ? "url" : "text"}" value="${esc(val)}" spellcheck="${f.type === "url" ? "false" : "true"}">${hint}`;
      $("input", wrap).addEventListener("input", (e) => { setAt(path, e.target.value); refreshTitles(); });
  }
  return wrap;
}
function tagsField(f, path, wrap) {
  const draw = () => {
    const vals = getAt(path) || [];
    wrap.innerHTML = `<span>${esc(f.label)}<em>Enter to add</em></span><div class="tags-in">${vals.map((v, i) => `<span class="tag">${esc(v)}<button type="button" data-rm="${i}" aria-label="Remove ${esc(v)}">${ic("x")}</button></span>`).join("")}<input placeholder="Type and press Enter…"></div>${f.hint ? `<small class="hint">${esc(f.hint)}</small>` : ""}`;
    const input = $("input", wrap);
    input.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === ",") && input.value.trim()) { e.preventDefault(); setAt(path, [...(getAt(path) || []), input.value.trim()]); draw(); $("input", wrap).focus(); }
      else if (e.key === "Backspace" && !input.value && vals.length) { setAt(path, vals.slice(0, -1)); draw(); $("input", wrap).focus(); }
    });
    input.addEventListener("blur", () => { if (input.value.trim()) { setAt(path, [...(getAt(path) || []), input.value.trim()]); draw(); } });
  };
  wrap.addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { const v = [...(getAt(path) || [])]; v.splice(+b.dataset.rm, 1); setAt(path, v); draw(); } });
  draw();
  return wrap;
}
function uploadField(f, path, wrap) {
  const isImg = f.type === "image";
  const prev = (v) => (v ? `../${String(v).replace(/^\//, "")}` : "");
  wrap.className = "fld full";
  wrap.innerHTML = `<span>${esc(f.label)}</span><div class="img-fld">${isImg ? `<div class="img-prev" style="background-image:url('${esc(prev(getAt(path)))}')"></div>` : `<div class="img-prev" style="display:grid;place-items:center">${ic("book")}</div>`}
    <div class="row"><input type="text" value="${esc(getAt(path))}" placeholder="assets/…" spellcheck="false"><label class="btn btn-ghost">${ic("upload")}<span>Upload</span><input type="file" hidden accept="${f.accept || "image/png,image/jpeg,image/webp,image/gif"}"></label></div></div>`;
  const text = $('input[type="text"]', wrap), file = $('input[type="file"]', wrap), box = $(".img-prev", wrap);
  text.addEventListener("input", () => { setAt(path, text.value); if (isImg) box.style.backgroundImage = `url('${prev(text.value)}')`; });
  file.addEventListener("change", async () => {
    const fl = file.files[0]; if (!fl) return;
    if (S.offline) { toast("Uploading needs a GitHub connection. Sign in with a token to upload files.", true); return; }
    const okType = isImg ? /^image\/(png|jpeg|webp|gif)$/.test(fl.type) : fl.type === "application/pdf";
    if (!okType) { toast(isImg ? "Use a PNG, JPG, WEBP or GIF image." : "Use a PDF file.", true); return; }
    if (fl.size > (isImg ? 4 : 8) * 1024 * 1024) { toast(`File is too large (max ${isImg ? 4 : 8} MB).`, true); return; }
    const ext = fl.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = fl.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "file";
    const dest = `assets/uploads/${Date.now()}-${name}.${ext}`;
    const label = $("label.btn", wrap); label.classList.add("loading");
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(fl); });
      await putFile(dest, b64, `Upload ${fl.name} via Studio`);
      text.value = dest; setAt(path, dest);
      if (isImg) box.style.backgroundImage = `url('${URL.createObjectURL(fl)}')`;
      toast("Uploaded ✓ Publish to use it on the live site.");
    } catch (e) { toast("Upload failed: " + e.message, true); }
    finally { label.classList.remove("loading"); file.value = ""; }
  });
  return wrap;
}
function list(path, g) {
  const box = document.createElement("div");
  const draw = () => {
    const arr = getAt(path) || [];
    box.innerHTML = `<div class="items">${arr.map((it, i) => {
      const key = path.join(".") + "." + i, open = S.open.has(key);
      return `<div class="item ${open ? "open" : ""}" data-i="${i}" data-key="${esc(key)}">
        <div class="item-head" data-toggle><span class="num">${String(i + 1).padStart(2, "0")}</span><span class="ttl" data-ttl>${esc(it[g.titleKey] || "Untitled")}${g.subKey && it[g.subKey] ? `<small>${esc(String(it[g.subKey]).slice(0, 60))}</small>` : ""}</span>
          <button class="icon-btn" type="button" data-act="up" title="Move up" ${i === 0 ? "disabled" : ""}>${ic("up")}</button>
          <button class="icon-btn" type="button" data-act="down" title="Move down" ${i === arr.length - 1 ? "disabled" : ""}>${ic("down")}</button>
          <button class="icon-btn" type="button" data-act="dup" title="Duplicate">${ic("copy")}</button>
          <button class="icon-btn danger" type="button" data-act="del" title="Delete">${ic("trash")}</button>
          <span class="chev">${ic("chev")}</span></div>
        <div class="item-body"></div></div>`;
    }).join("")}</div>${!g.max || arr.length < g.max ? `<button class="add" type="button" data-add>${ic("plus")} Add ${esc((g.label || g.title || "item").toLowerCase().replace(/s$/, ""))}</button>` : ""}`;
    $$(".item.open", box).forEach((el) => $(".item-body", el).appendChild(fieldsGrid(g.fields, [...path, +el.dataset.i])));
  };
  box.addEventListener("click", async (e) => {
    const act = e.target.closest("[data-act]"), item = e.target.closest(".item");
    if (e.target.closest("[data-add]")) {
      const arr = [...(getAt(path) || []), clone(g.blank)]; setAt(path, arr); S.open.add(path.join(".") + "." + (arr.length - 1)); draw(); return;
    }
    if (!item) return;
    const i = +item.dataset.i, arr = [...(getAt(path) || [])];
    if (act) {
      e.stopPropagation();
      if (act.dataset.act === "up" && i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      if (act.dataset.act === "down" && i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
      if (act.dataset.act === "dup") arr.splice(i + 1, 0, clone(arr[i]));
      if (act.dataset.act === "del") { if (!(await confirmBox("Delete this item?", `“${arr[i][g.titleKey] || "Untitled"}” will be removed when you publish.`, "Delete"))) return; arr.splice(i, 1); }
      S.open.clear(); setAt(path, arr); draw(); return;
    }
    if (e.target.closest("[data-toggle]")) { const k = item.dataset.key; S.open.has(k) ? S.open.delete(k) : S.open.add(k); draw(); }
  });
  draw();
  return box;
}
function refreshTitles() { // keep collapsed item titles in sync while typing
  $$(".item.open").forEach((el) => {
    const ttl = $("[data-ttl]", el), first = $(".item-body input[type=text]", el);
    if (ttl && first && first.value) ttl.childNodes[0].textContent = first.value;
  });
}

/* ---------------- dashboard & settings ---------------- */
function dashboard() {
  const d = S.draft, p = d.profile;
  const n = (a) => (a || []).length;
  const card = (v, l, go) => `<div class="stat glass" data-go="${go}"><b>${v}</b><span>${l}</span></div>`;
  const sc = (go, icn, t, s) => `<button class="shortcut" type="button" data-go="${go}"><span class="ic">${ic(icn)}</span><span><b>${t}</b><small>${s}</small></span></button>`;
  return `<div class="hello glass"><img src="../${esc(p.photo)}" alt=""><div><h3>Welcome back, ${esc(p.firstName)} 👋</h3><p>Edit any section, press <b>Preview</b> to check it, then <b>Publish</b>. Your site updates in about a minute.</p></div></div>
    <div class="stats">${card(n(d.research?.papers), "Papers", "research")}${card(n(d.projects?.items), "Projects", "projects")}${card(n(d.experience?.work) + n(d.experience?.leadership), "Experience entries", "experience")}${card(S.inbox ? S.inbox.filter((m) => m.status === "New").length : "–", "New messages", "messages")}</div>
    <section class="group glass"><div class="group-head"><div><h3>Quick edits</h3><p>Jump straight to what you change most.</p></div></div>
      <div class="shortcuts">${sc("profile", "user", "Hero & photo", "Name, roles, intro, CV")}${sc("projects", "box", "Add a project", "Cards, images, links")}${sc("research", "book", "Research", "Papers & ongoing work")}${sc("socials", "link", "Social links", "LinkedIn, GitHub, …")}${sc("contact", "phone", "Contact", "WhatsApp, email, form")}${sc("messages", "inbox", "Read messages", "From your contact form")}</div></section>
    <section class="group glass"><div class="group-head"><div><h3>How publishing works</h3></div></div>
      <ol class="steps"><li>Your edits save automatically on this device as a draft.</li><li><b>Preview</b> opens your site with the draft, visible only to you.</li><li><b>Publish</b> sends the changes to GitHub. The live site updates in about 1 minute.</li></ol></section>`;
}
function settings() {
  return `<section class="group glass"><div class="group-head"><div><h3>Connection</h3><p>${S.offline ? "Offline mode: Publish downloads content.json, which you upload to GitHub yourself." : `Connected to <b>${esc(S.auth.repo)}</b> on branch <b>${esc(S.auth.branch)}</b>.`}</p></div></div>
      <button class="btn btn-ghost" type="button" data-act-set="reload">${ic("refresh")} Reload published content</button></section>
    <section class="group glass"><div class="group-head"><div><h3>Message inbox key</h3><p>The secret ADMIN_KEY you set in your Apps Script (see apps-script/README-messages.md). Stored only on this device.</p></div></div>
      <div class="grid"><label class="fld full"><span>Admin key</span><input type="password" data-inbox-key value="${esc(store.get(INBOX_KEY) || "")}" spellcheck="false"></label></div>
      <p style="margin-top:12px"><button class="btn btn-ghost" type="button" data-act-set="savekey">${ic("check")} Save key</button></p></section>
    <section class="group glass"><div class="group-head"><div><h3>Backup</h3><p>Download or restore everything on your site as one file.</p></div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-ghost" type="button" data-act-set="export">${ic("down")} Export content.json</button>
      <label class="btn btn-ghost">${ic("upload")} Import content.json<input type="file" accept="application/json,.json" hidden data-import></label>
      <button class="btn btn-danger" type="button" data-act-set="discard">${ic("trash")} Discard unpublished changes</button></div></section>`;
}
$("[data-content]").addEventListener("click", async (e) => {
  const g = e.target.closest("[data-go]"); if (g && !g.closest(".menu")) { go(g.dataset.go); return; }
  const a = e.target.closest("[data-act-set]"); if (!a) return;
  const act = a.dataset.actSet;
  if (act === "export") download(S.draft);
  if (act === "savekey") { store.set(INBOX_KEY, $("[data-inbox-key]").value.trim()); S.inbox = null; toast("Key saved"); }
  if (act === "discard" && (await confirmBox("Discard changes?", "All unpublished edits will be lost.", "Discard"))) { S.draft = clone(S.published); store.del(DRAFT_KEY); updateStatus(); toast("Changes discarded"); }
  if (act === "reload") { try { S.published = S.offline ? S.published : await fetchContent(); toast("Reloaded"); updateStatus(); } catch (er) { toast(er.message, true); } }
});
$("[data-content]").addEventListener("change", async (e) => {
  if (!e.target.matches("[data-import]")) return;
  try { const data = JSON.parse(await e.target.files[0].text()); if (!data.profile || !data.contact) throw new Error("This doesn’t look like a portfolio content file."); S.draft = data; changed(); toast("Imported. Review it, then Publish."); }
  catch (er) { toast(er.message, true); }
});
function download(data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = "content.json"; a.click(); URL.revokeObjectURL(a.href);
}

/* ---------------- messages inbox ---------------- */
async function inboxCall(body) {
  const url = S.draft.contact?.messageApiUrl, key = store.get(INBOX_KEY);
  if (!url) throw new Error("NO_URL"); if (!key) throw new Error("NO_KEY");
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ ...body, key }) });
  const out = await r.json();
  if (!out.ok) throw new Error(out.error || "Request failed");
  return out;
}
let filterSt = "All", query = "";
async function renderMessages(refresh = false) {
  const c = $("[data-content]");
  if (!S.inbox || refresh) {
    c.innerHTML = `<div class="empty">${ic("refresh")}Loading messages…</div>`;
    try { S.inbox = (await inboxCall({ action: "list" })).messages; buildMenu(); }
    catch (e) {
      const how = e.message === "NO_URL" ? "Add your message database URL in <b>Contact</b> first." : e.message === "NO_KEY" ? "Add your admin key in <b>Settings</b> first." : esc(e.message);
      c.innerHTML = `<section class="group glass"><div class="empty">${ic("inbox")}<p><b>Inbox not connected.</b><br>${how}</p><p class="muted">Setup guide: apps-script/README-messages.md</p></div></section>`;
      return;
    }
  }
  const rows = S.inbox.filter((m) => (filterSt === "All" || m.status === filterSt) && (!query || JSON.stringify(m).toLowerCase().includes(query)));
  c.innerHTML = `<div class="msg-tools"><label class="fld"><input type="search" placeholder="Search messages…" value="${esc(query)}" data-q></label>
      <div class="seg" data-seg>${["All", "New", "Replied", "Archived"].map((s) => `<button type="button" class="${s === filterSt ? "on" : ""}" data-st="${s}">${s}</button>`).join("")}</div>
      <button class="btn btn-ghost" type="button" data-refresh>${ic("refresh")}<span>Refresh</span></button></div>
    <div class="msgs">${rows.length ? rows.map((m) => {
      const wa = m.phone ? `https://wa.me/${String(m.phone).replace(/\D/g, "")}` : "";
      return `<article class="msg"><div class="msg-top"><b>${esc(m.name)}</b><span class="muted">${esc(m.email)}${m.phone ? " · " + esc(m.phone) : ""}</span><span class="muted">${esc(m.topic)} · ${esc(new Date(m.received).toLocaleString())}</span><span class="st ${esc(m.status)}">${esc(m.status)}</span></div>
        <p>${esc(m.message)}</p>
        <div class="msg-actions"><a class="btn btn-primary" href="mailto:${esc(m.email)}?subject=${encodeURIComponent("Re: " + m.topic)}">${ic("mail")} Reply by email</a>
        ${wa ? `<a class="btn btn-ghost" href="${esc(wa)}" target="_blank" rel="noopener">${ic("wa")} WhatsApp</a>` : ""}
        ${m.status !== "Replied" ? `<button class="btn btn-ghost" type="button" data-mark="Replied" data-row="${m.row}">${ic("check")} Mark replied</button>` : ""}
        ${m.status !== "Archived" ? `<button class="btn btn-ghost" type="button" data-mark="Archived" data-row="${m.row}">Archive</button>` : ""}</div></article>`;
    }).join("") : `<div class="empty glass group">${ic("inbox")}<p>No messages here yet.</p></div>`}</div>`;
}
$("[data-content]").addEventListener("input", (e) => { if (e.target.matches("[data-q]")) { query = e.target.value.toLowerCase(); clearTimeout(window._qt); window._qt = setTimeout(() => { renderMessages(); const q = $("[data-q]"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }, 250); } });
$("[data-content]").addEventListener("click", async (e) => {
  const st = e.target.closest("[data-st]"); if (st) { filterSt = st.dataset.st; renderMessages(); return; }
  if (e.target.closest("[data-refresh]")) { renderMessages(true); return; }
  const mk = e.target.closest("[data-mark]");
  if (mk) {
    mk.classList.add("loading");
    try { await inboxCall({ action: "status", row: +mk.dataset.row, status: mk.dataset.mark }); const m = S.inbox.find((x) => x.row === +mk.dataset.row); if (m) m.status = mk.dataset.mark; buildMenu(); renderMessages(); toast("Updated"); }
    catch (er) { toast(er.message, true); mk.classList.remove("loading"); }
  }
});

/* ---------------- preview & publish ---------------- */
$("[data-preview]").addEventListener("click", () => { store.set(DRAFT_KEY, JSON.stringify(S.draft)); window.open("../?preview=1", "_blank", "noopener"); });
$("[data-publish]").addEventListener("click", async () => {
  if (S.offline) { download(S.draft); toast("Downloaded. Upload content.json to your GitHub repository to publish."); return; }
  if (!(await confirmBox("Publish changes?", "Your live website will update in about a minute.", "Publish"))) return;
  const btn = $("[data-publish]"); btn.classList.add("loading");
  const body = b64encode(JSON.stringify(S.draft, null, 2) + "\n");
  try {
    try { await putFile("content.json", body, "Update portfolio content via Studio", S.sha); }
    catch (e) { if (e.status !== 409 && e.status !== 422) throw e; const f = await gh(`contents/content.json?ref=${encodeURIComponent(S.auth.branch)}`); S.sha = f.sha; await putFile("content.json", body, "Update portfolio content via Studio", S.sha); }
    const f = await gh(`contents/content.json?ref=${encodeURIComponent(S.auth.branch)}`); S.sha = f.sha;
    S.published = clone(S.draft); store.del(DRAFT_KEY); updateStatus();
    toast("Published ✓ Live in about a minute.");
  } catch (e) { toast("Publish failed: " + e.message, true); }
  finally { btn.classList.remove("loading"); }
});
addEventListener("beforeunload", (e) => { if (S.draft && isDirty() && !S.offline) { e.preventDefault(); } });
addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "s" && S.draft) { e.preventDefault(); store.set(DRAFT_KEY, JSON.stringify(S.draft)); toast("Draft saved on this device"); } });

/* ---------------- ui helpers ---------------- */
function toast(msg, bad = false) {
  const t = document.createElement("div"); t.className = "toast" + (bad ? " bad" : ""); t.textContent = msg;
  $("[data-toasts]").appendChild(t); setTimeout(() => t.remove(), 4200);
}
function confirmBox(title, text, yes = "Confirm") {
  return new Promise((res) => {
    const m = $("[data-modal]");
    $("[data-modal-title]").textContent = title; $("[data-modal-text]").textContent = text; $("[data-modal-yes]").textContent = yes;
    m.hidden = false; $("[data-modal-yes]").focus();
    const done = (v) => { m.hidden = true; res(v); };
    $("[data-modal-yes]").onclick = () => done(true); $("[data-modal-no]").onclick = () => done(false);
    m.onclick = (e) => { if (e.target === m) done(false); };
  });
}
