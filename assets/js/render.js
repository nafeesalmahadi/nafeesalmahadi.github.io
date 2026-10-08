/* Builds every section of the page from content.json */
import { icon } from "./icons.js";

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); // **bold**
const safeUrl = (u) => { const s = String(u || "").trim(); return /^(https?:|mailto:|tel:|#|\/|assets\/)/i.test(s) && !/^javascript:/i.test(s) ? esc(s) : ""; };
const ext = (u) => (/^https?:/i.test(u || "") ? ' target="_blank" rel="noopener"' : "");
const slot = (name) => document.querySelector(`[data-slot="${name}"]`);
const put = (name, html) => { const el = slot(name); if (el) el.innerHTML = html; };
const head = (h, cls = "") => `${h.eyebrow ? `<p class="eyebrow">${esc(h.eyebrow)}</p>` : ""}<h2 class="h2 ${cls}">${esc(h.title)} ${h.highlight ? `<span class="grad">${esc(h.highlight)}</span>` : ""}${h.titleEnd ? " " + esc(h.titleEnd) : ""}</h2>${h.lead ? `<p class="lead">${fmt(h.lead)}</p>` : ""}`;
const socialHref = (s) => s.type === "email" && !/^mailto:/.test(s.url) ? `mailto:${s.url}` : s.type === "whatsapp" && !/^https?:/.test(s.url) ? `https://wa.me/${String(s.url).replace(/\D/g, "")}` : s.url;
const socials = (list, size = 18) => (list || []).filter((s) => s.url).map((s) => `<a class="soc" href="${safeUrl(socialHref(s))}"${ext(socialHref(s))} aria-label="${esc(s.label || s.type)}" title="${esc(s.label || s.type)}">${icon(s.type, size)}</a>`).join("");

const ART = {
  logo: (p) => `<div class="p-art art-logo"><img src="${safeUrl(p.image)}" alt="${esc(p.title)} logo" loading="lazy"><i></i><i></i><i></i></div>`,
  image: (p) => `<div class="p-art art-img"><img src="${safeUrl(p.image)}" alt="${esc(p.title)}" loading="lazy"></div>`,
  ecg: () => `<div class="p-art art-ecg"><svg viewBox="0 0 300 90"><path d="M0 45h70l12-26 16 52 14-38 10 12h178"/></svg></div>`,
  shop: () => `<div class="p-art art-shop"><div class="shop"><i></i><i></i><i></i></div></div>`,
  chat: () => `<div class="p-art art-chat"><div class="bubbles"><i></i><i></i><i></i></div></div>`,
  cards: () => `<div class="p-art art-cards"><div class="stack"><i></i><i></i><i></i></div></div>`,
  invoice: () => `<div class="p-art art-invoice"><div class="inv"><i></i><i></i><i></i><i></i></div></div>`,
  bars: () => `<div class="p-art art-bars"><div class="bars">${[40, 62, 48, 80, 58, 90, 70].map((h) => `<i style="--h:${h}%"></i>`).join("")}</div></div>`,
  brain: () => `<div class="p-art art-brain"><div class="nn">${Array.from({ length: 12 }, () => "<i></i>").join("")}</div></div>`,
};
const GAUGE = { cyan: ["#22d3ee", "#8b5cf6"], pink: ["#f472b6", "#8b5cf6"], violet: ["#a78bfa", "#22d3ee"], green: ["#34d399", "#22d3ee"], amber: ["#fbbf24", "#f472b6"] };

export function render(c) {
  const p = c.profile, ct = c.contact;
  document.title = c.meta?.title || document.title;
  const md = document.querySelector('meta[name="description"]'); if (md && c.meta?.description) md.content = c.meta.description;
  document.querySelectorAll("[data-logo-text]").forEach((el) => (el.innerHTML = `${esc(p.firstName)}<b>${esc(p.lastName)}</b>`));
  const wa = `https://wa.me/${String(ct.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(ct.whatsappMessage || "")}`;
  const mail = `mailto:${ct.email}?subject=${encodeURIComponent("Hello " + p.firstName)}`;

  /* hero */
  put("hud", (c.hud || []).slice(0, 4).map((h, i) => `<span class="hud hd${i + 1}">${i === 0 && !h.value ? "<i></i>" : ""}${esc(h.label)}${h.value ? ` <b ${h.live ? "data-loss" : ""}>${esc(h.value)}</b>` : ""}</span>`).join(""));
  put("hero", `
    ${p.showAvailability ? `<p class="chip reveal"><span class="dot"></span>${esc(p.availability)}</p>` : ""}
    <h1 class="hero-title reveal"><span class="t1">${esc(p.firstName)}</span><span class="t2">${esc(p.lastName)}</span></h1>
    <p class="hero-role reveal">${(p.roles || []).map(esc).join(" <i>·</i> ")}</p>
    <p class="hero-lead reveal">${fmt(p.lead)}</p>
    ${p.typing?.length ? `<p class="typer mono reveal"><span class="prompt">&gt;_</span> ${esc(p.typingPrefix)} <span class="type" data-type="${esc(p.typing.join("|"))}">${esc(p.typing[0])}</span></p>` : ""}
    <div class="hero-cta reveal">
      <a class="btn btn-primary" href="#research">${esc(p.primaryCta || "View research")} ${icon("arrow", 16)}</a>
      ${p.cv ? `<a class="btn btn-ghost" href="${safeUrl(p.cv)}" download>${icon("download", 16)} ${esc(p.secondaryCta || "Download CV")}</a>` : ""}
    </div>
    <div class="socials hero-social reveal">${socials(c.socials)}</div>`);
  put("stats", (c.stats || []).map((s) => `<div class="tick"><b>${/^\d+(\.\d+)?$/.test(s.value) ? `<span data-count="${esc(s.value)}" data-dec="${(s.value.split(".")[1] || "").length}">${esc(s.value)}</span>` : esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join(""));

  /* about */
  const a = c.about;
  const chipCls = ["o1", "o2", "o3"];
  put("about", `
    <div class="about-visual reveal">
      <div class="halo" aria-hidden="true"><i></i><i></i><i></i></div>
      <img class="portrait" src="${safeUrl(p.photo)}" alt="${esc(p.firstName + " " + p.lastName)}" loading="lazy">
      ${(a.chips || []).slice(0, 3).map((t, i) => `<span class="orbit-chip ${chipCls[i]} glass">${esc(t)}</span>`).join("")}
      <div class="id-card glass"><img src="assets/img/logo.svg" width="30" height="30" alt=""><div><b>${esc(p.firstName + " " + p.lastName)}</b><span>${esc(p.location)}</span></div><span class="live"><i></i>online</span></div>
    </div>
    <div class="about-text">
      <div class="reveal">${head(a)}</div>
      <p class="lead reveal">${fmt(a.bio)}</p>
      <div class="model-card glass reveal">
        <div class="mc-head mono"><span>${esc(a.cardFile)}</span><span class="tag">${esc(a.cardVersion)}</span></div>
        <dl>${(a.modelCard || []).map((r) => `<div><dt>${esc(r.key)}</dt><dd>${fmt(r.value)}</dd></div>`).join("")}</dl>
      </div>
    </div>`);

  /* research */
  const r = c.research;
  put("research-head", head(r));
  put("papers", (r.papers || []).map((pp) => {
    const [c1, c2] = GAUGE[pp.gaugeColor] || GAUGE.cyan;
    const v = Math.max(0, Math.min(100, Number(pp.gaugeValue) || 0));
    return `<article class="paper glass reveal">
      <div class="paper-top"><span class="status ok"><i></i>${esc(pp.status)}</span><span class="venue mono">${esc(pp.venue)}</span></div>
      <div class="paper-grid">
        <div class="paper-main">
          <h3>${pp.link ? `<a href="${safeUrl(pp.link)}"${ext(pp.link)}>${esc(pp.title)}</a>` : esc(pp.title)}</h3>
          <p class="authors">${fmt(pp.authors)}</p>
          <p>${fmt(pp.summary)}</p>
          <ul class="tags">${(pp.tags || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          ${pp.abstract ? `<details><summary>Abstract</summary><p>${fmt(pp.abstract)}</p></details>` : ""}
        </div>
        <div class="paper-stats">
          ${pp.gaugeValue ? `<div class="gauge" data-gauge style="--v:${v};--c1:${c1};--c2:${c2}"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"/><circle class="arc" cx="60" cy="60" r="50"/></svg><div><b>${esc(pp.gaugeValue)}%</b><span>${esc(pp.gaugeLabel)}</span></div></div>` : ""}
          <ul class="kv">${(pp.metrics || []).map((m) => `<li><span>${esc(m.key)}</span><b>${esc(m.value)}</b></li>`).join("")}</ul>
        </div>
      </div></article>`;
  }).join(""));
  put("ongoing", (r.ongoing || []).map((o) => {
    const inner = `<span class="status ${o.kind === "data" ? "data" : o.kind === "done" ? "ok" : "wip"}"><i></i>${esc(o.status)}</span><h3>${esc(o.title)}</h3><p>${fmt(o.text)}</p>${o.url ? `<span class="more">Open ↗</span>` : ""}`;
    return o.url ? `<a class="glass mini link reveal" href="${safeUrl(o.url)}"${ext(o.url)}>${inner}</a>` : `<div class="glass mini reveal">${inner}</div>`;
  }).join(""));

  /* projects */
  const pr = c.projects;
  put("projects-head", head(pr));
  put("projects", (pr.items || []).map((it) => {
    const art = (ART[it.art] || ART.brain)(it);
    const body = `${art}<div class="p-body">
      <p class="p-meta mono">${esc(it.meta)}${it.live ? ' · <em class="live-dot">Live</em>' : ""}</p>
      <h3>${esc(it.title)}</h3><p>${fmt(it.description)}</p>
      <ul class="tags">${(it.tags || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      ${it.url ? `<span class="more">${esc(it.linkLabel || "Open")} ↗</span>` : ""}</div>`;
    const cls = `card size-${esc(it.size || "normal")} glass reveal`;
    const cats = esc((it.categories || []).join(" "));
    return it.url ? `<a class="${cls}" data-cat="${cats}" href="${safeUrl(it.url)}"${ext(it.url)}>${body}</a>` : `<article class="${cls}" data-cat="${cats}">${body}</article>`;
  }).join(""));

  /* experience */
  const x = c.experience;
  put("experience-head", head(x));
  const tl = (list) => `<ol class="tl">${(list || []).map((e) => `<li class="reveal"><div class="tl-dot${e.highlight ? " hot" : ""}"></div><div class="glass tl-card"><span class="when mono">${esc(e.when)}</span><h4>${esc(e.title)}</h4><p class="org">${esc(e.org)}</p>${e.text ? `<p>${fmt(e.text)}</p>` : ""}</div></li>`).join("")}</ol>`;
  put("experience", `
    <div class="xp-col"><h3 class="xp-title mono reveal">work &amp; ventures</h3>${tl(x.work)}</div>
    <div class="xp-col"><h3 class="xp-title mono reveal">leadership</h3>${tl(x.leadership)}
      <h3 class="xp-title mono reveal">education</h3>
      <div class="edu">${(x.education || []).map((e) => `<div class="glass edu-card reveal"><span class="mono">${esc(e.label)}</span><h4>${esc(e.title)}</h4><p>${esc(e.text)}</p></div>`).join("")}</div>
    </div>`);

  /* skills */
  const sk = c.skills;
  put("skills-head", head(sk));
  put("skills", (sk.layers || []).map((l) => `<div class="layer"><p class="mono">${esc(l.name)}</p>${(l.items || []).map((i) => `<button class="node ${l.style === "ai" ? "ai" : l.style === "out" ? "out" : ""}" type="button">${esc(i)}</button>`).join("")}</div>`).join(""));

  /* contact */
  put("contact-info", `${head(ct)}
    <div class="quick">
      <a class="quick-btn wa-btn" href="${esc(wa)}" target="_blank" rel="noopener">${icon("whatsapp", 26)}<span><small>Chat on WhatsApp</small><b>${esc(ct.whatsappDisplay || ct.whatsapp)}</b></span></a>
      <a class="quick-btn mail-btn" href="${esc(mail)}">${icon("email", 26)}<span><small>Send an email</small><b>${esc(ct.email)}</b></span></a>
    </div>
    <div class="socials contact-socials">${socials(c.socials)}</div>`);
  put("topics", (ct.topics || []).map((t) => `<option>${esc(t)}</option>`).join(""));
  put("drawer-cta", `<a class="btn btn-primary" href="${esc(wa)}" target="_blank" rel="noopener">${icon("whatsapp", 18)} WhatsApp</a><a class="btn btn-ghost" href="${esc(mail)}">${icon("email", 18)} Email</a>`);
  put("socials-drawer", socials(c.socials, 20));
  put("socials-footer", socials(c.socials, 18));
  put("footer-tag", esc(c.footer?.tagline || ""));
  put("footer-name", esc(p.firstName + " " + p.lastName));
  put("footer-loc", esc(p.location));
  put("dock", `<a class="dock-btn mail" href="${esc(mail)}" aria-label="Send an email">${icon("email", 26)}<span>Email</span></a><a class="dock-btn wa" href="${esc(wa)}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${icon("whatsapp", 26)}<span>WhatsApp</span></a>`);
}
