/* Nafees Al Mahadi — portfolio: load content.json, render, then wire up interactions */
import { render } from "./render.js";
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let CFG = {};

async function loadContent() {
  // ?preview shows the unpublished draft saved by the admin panel on this device
  if (new URLSearchParams(location.search).has("preview")) {
    try { const d = localStorage.getItem("nafees_cms_draft"); if (d) return JSON.parse(d); } catch { /* ignore */ }
  }
  const r = await fetch(`content.json?v=${Date.now()}`, { cache: "no-store" });
  if (!r.ok) throw new Error("content.json " + r.status);
  return r.json();
}

try {
  const content = await loadContent();
  render(content);
  CFG = { messageApiUrl: content.contact.messageApiUrl, email: content.contact.email, whatsapp: String(content.contact.whatsapp).replace(/\D/g, "") };
  if (new URLSearchParams(location.search).has("preview")) document.body.insertAdjacentHTML("afterbegin", '<div class="preview-bar">Preview of your unpublished draft · <a href="./">view live site</a></div>');
} catch (e) {
  console.error(e);
  document.querySelector('[data-slot="hero"]').innerHTML = '<h1 class="hero-title">Nafees <span class="grad">Al Mahadi</span></h1><p class="hero-lead">Content could not be loaded. Please refresh the page.</p>';
}
document.querySelector("[data-boot]")?.classList.add("gone");

/* toast */
const toastEl = $(".toast"); let tt;
const toast = (m) => { toastEl.textContent = m; toastEl.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove("show"), 3800); };

/* nav, progress */
const nav = $("[data-nav]"), bar = $(".progress span");
const onScroll = () => {
  nav.classList.toggle("scrolled", scrollY > 24);
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.setProperty("--p", h > 0 ? scrollY / h : 0);
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();
const links = $$(".links a");
const secIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.dataset.link === e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
links.forEach((l) => { const s = document.getElementById(l.dataset.link); if (s) secIO.observe(s); });

/* drawer */
const burger = $("[data-burger]"), drawer = $("[data-drawer]");
const setDrawer = (open) => { drawer.hidden = !open; burger.setAttribute("aria-expanded", String(open)); burger.setAttribute("aria-label", open ? "Close menu" : "Open menu"); document.body.style.overflow = open ? "hidden" : ""; };
burger.addEventListener("click", () => setDrawer(drawer.hidden));
drawer.addEventListener("click", (e) => { if (e.target.closest("a")) setDrawer(false); });
addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) setDrawer(false); });
addEventListener("resize", () => { if (innerWidth > 1080 && !drawer.hidden) setDrawer(false); });

/* reveal + gauges */
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  $$("[data-gauge]", e.target).forEach((g) => g.classList.add("in"));
  io.unobserve(e.target);
}), { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
$$(".reveal").forEach((el) => {
  const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  const i = sibs.indexOf(el);
  if (i > 0) el.style.setProperty("--d", `${Math.min(i, 6) * 0.07}s`);
  io.observe(el);
});

/* count-up */
const cIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return; cIO.unobserve(e.target);
  const el = e.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
  if (reduce) return;
  const t0 = performance.now();
  const run = (t) => { const p = Math.min((t - t0) / 1500, 1); el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec); if (p < 1) requestAnimationFrame(run); };
  requestAnimationFrame(run);
}), { threshold: 0.6 });
$$("[data-count]").forEach((el) => cIO.observe(el));

/* typewriter */
const typeEl = $("[data-type]");
if (typeEl && !reduce) {
  const words = typeEl.dataset.type.split("|"); let w = 0, i = words[0].length, del = true;
  const tick = () => {
    i += del ? -1 : 1; typeEl.textContent = words[w].slice(0, i);
    let wait = del ? 32 : 65;
    if (!del && i === words[w].length) { del = true; wait = 1900; }
    else if (del && i === 0) { del = false; w = (w + 1) % words.length; wait = 280; }
    setTimeout(tick, wait);
  };
  setTimeout(tick, 2400);
}

/* project filter */
const filter = $("[data-filter]");
filter?.addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  $$("button", filter).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", String(x === b)); });
  const f = b.dataset.f;
  $$("[data-projects] .card").forEach((c) => {
    const show = f === "all" || c.dataset.cat.split(" ").includes(f);
    c.classList.toggle("hide", !show); if (show) c.classList.add("in");
  });
});

/* skills network wires */
const net = $("[data-net]"), wires = $("[data-wires]");
function drawWires() {
  if (!net || getComputedStyle(wires).display === "none") return;
  const box = net.getBoundingClientRect();
  wires.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  const layers = $$(".layer", net).map((l) => $$(".node", l));
  let html = "";
  for (let k = 0; k < layers.length - 1; k++) layers[k].forEach((a, i) => layers[k + 1].forEach((b, j) => {
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    html += `<line x1="${ra.right - box.left}" y1="${ra.top - box.top + ra.height / 2}" x2="${rb.left - box.left}" y2="${rb.top - box.top + rb.height / 2}" data-a="${k}-${i}" data-b="${k + 1}-${j}"/>`;
  }));
  wires.innerHTML = html;
  layers.forEach((ns, k) => ns.forEach((n, i) => (n.dataset.id = `${k}-${i}`)));
}
function light(id, on) {
  $$("line", wires).forEach((l) => { if (l.dataset.a === id || l.dataset.b === id) l.classList.toggle("lit", on); });
  const ids = new Set($$("line.lit", wires).flatMap((l) => [l.dataset.a, l.dataset.b]));
  $$(".node", net).forEach((n) => n.classList.toggle("lit", on && ids.has(n.dataset.id) && n.dataset.id !== id));
}
if (net) {
  drawWires(); new ResizeObserver(drawWires).observe(net); document.fonts?.ready.then(drawWires);
  $$(".node", net).forEach((n) => {
    ["pointerenter", "focus"].forEach((ev) => n.addEventListener(ev, () => light(n.dataset.id, true)));
    ["pointerleave", "blur"].forEach((ev) => n.addEventListener(ev, () => light(n.dataset.id, false)));
  });
}

/* contact form → Google Sheets database (Apps Script) */
const form = $("[data-form]");
if (form) {
  const msg = $("[data-form-msg]", form), btn = $("[data-submit]", form);
  const setMsg = (t, kind) => { msg.textContent = t; msg.className = `form-msg ${kind || ""}`; };
  const field = (n) => form.elements[n];
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    $$(".f.bad", form).forEach((f) => f.classList.remove("bad"));
    const data = {
      name: field("name").value.trim(), email: field("email").value.trim(), phone: field("phone").value.trim(),
      topic: field("topic").value, message: field("message").value.trim(), website: field("website").value,
      page: location.href, sentAt: new Date().toISOString(),
    };
    const bad = [];
    if (data.name.length < 2) bad.push("name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) bad.push("email");
    if (data.message.length < 5) bad.push("message");
    if (bad.length) { bad.forEach((n) => field(n).closest(".f").classList.add("bad")); setMsg("Please add your name, a valid email and a short message.", "err"); field(bad[0]).focus(); return; }

    const text = `Hi Nafees, I'm ${data.name} (${data.email}${data.phone ? ", " + data.phone : ""}).\nTopic: ${data.topic}\n\n${data.message}`;
    if (!CFG.messageApiUrl) { // no database connected yet → email fallback
      location.href = `mailto:${CFG.email}?subject=${encodeURIComponent(data.topic + " — " + data.name)}&body=${encodeURIComponent(text)}`;
      setMsg("Opening your email app…", "ok"); return;
    }
    btn.classList.add("loading"); btn.disabled = true; setMsg("");
    try {
      const r = await fetch(CFG.messageApiUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
      const out = await r.json().catch(() => ({ ok: r.ok }));
      if (!out.ok) throw new Error(out.error || "Could not send");
      const wa = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
      form.innerHTML = `<div class="sent"><div class="tick-ic">✓</div><h3>Message received</h3><p>Thank you, ${data.name.replace(/[<>&"]/g, "")}. I’ll reply to ${data.email.replace(/[<>&"]/g, "")} soon.</p><a class="btn btn-ghost" href="${wa}" target="_blank" rel="noopener">Also send on WhatsApp</a></div>`;
      toast("Message sent ✓");
    } catch (err) {
      setMsg("Couldn’t send right now. Please use the WhatsApp or Email buttons instead.", "err");
    } finally { btn.classList.remove("loading"); btn.disabled = false; }
  });
}

const y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
