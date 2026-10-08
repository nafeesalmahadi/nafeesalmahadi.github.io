# Nafees Al Mahadi: Portfolio + Studio (admin panel)

A medium-dark glass portfolio with a live 3D neural network, plus **Studio**, an admin panel where you edit
everything and publish with one click. Plain HTML/CSS/JS: no server, hosted free on GitHub Pages.

## 1 · Run it in VS Code
- Install the **Live Server** extension, right-click `index.html` and choose **Open with Live Server**,
- or in the terminal: `python -m http.server 8000`, then open http://localhost:8000
- The admin panel is at http://localhost:8000/admin/ (use **Work offline** on your computer)

Don't double-click index.html. The site loads its content and 3D through a local server.

## 2 · Put it online (GitHub Pages, free)
1. On GitHub, create a **public** repository named exactly **nafeesalmahadi.github.io**
2. **Add file → Upload files**, drag in everything inside this folder, then **Commit changes**
3. **Settings → Pages**: Deploy from a branch → **main** / **(root)** → Save
4. Live in about 2 minutes at **https://nafeesalmahadi.github.io**

## 3 · Edit your site with Studio
Open **https://nafeesalmahadi.github.io/admin/**

First time only, create a GitHub access token:
1. GitHub → your photo → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
2. Name: `portfolio-studio` · Expiration: your choice (e.g. 1 year)
3. Repository access: **Only select repositories → nafeesalmahadi.github.io**
4. Permissions → Repository permissions → **Contents: Read and write**
5. Generate, copy the token, and paste it into Studio. Tick "Remember me" only on your own device.

Then:
- Edit any section: profile, hero, social links, about, research, projects, experience, skills, contact, SEO.
- Upload images and your CV directly.
- **Preview** shows your unpublished changes (only to you).
- **Publish** updates the live site in about a minute.
- **Messages** shows everything sent through your contact form (after step 4).

The token is stored only in your browser. It is never written into your website files.
If you ever lose your device, delete the token on GitHub (Settings → Developer settings).

## 4 · Turn on the message database (5 minutes)
Follow **apps-script/README-messages.md**. Messages are saved to a Google Sheet, you get an email for
each one, and you can read and manage them in **Studio → Messages**. The WhatsApp and Email buttons always work.

## Files
| What | Where |
|---|---|
| All text & settings (edited by Studio) | `content.json` |
| Admin panel | `admin/` |
| Design (colours at the top) | `assets/css/style.css` |
| 3D neural network | `assets/js/network3d.js` |
| Message database script | `apps-script/Code.gs` |
