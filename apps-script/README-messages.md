# Contact form database (Google Sheets): free, no card

Messages from your website's contact form are saved in a Google Sheet (your database).
You get an email for each one, and you can read and manage them in the admin Studio.
Setup takes about 5 minutes and you only do it once.

1. Go to **sheets.google.com** (signed in as nafeesalmahadi007@gmail.com) and create a **Blank** sheet.
   Name it **Portfolio Messages**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete everything in the editor and paste the whole of **Code.gs** from this folder.
4. On the line `const ADMIN_KEY = 'CHANGE-ME-...'`, replace the text with your own long secret phrase,
   for example `nafees-inbox-7f3k9q2m-2026`. Click **Save** 💾.
5. Click **Deploy → New deployment**:
   - Click the ⚙ gear next to "Select type" and choose **Web app**
   - Execute as: **Me** · Who has access: **Anyone**
   - Click **Deploy**, then **Authorize access** and choose your Google account.
     If Google warns "Google hasn't verified this app", click **Advanced → Go to (unsafe) → Allow**.
     That's expected, because it's your own script.
6. Copy the **Web app URL** (it ends with `/exec`).
7. Open your **Studio** (yoursite/admin):
   - **Contact** → paste the URL into "Message database URL" → **Publish**
   - **Settings** → paste your ADMIN_KEY into "Message inbox key" → **Save key**
8. Send a test message from your live website. You'll see it in **Studio → Messages**,
   in the Google Sheet, and in your Gmail.

If you change Code.gs later, go to **Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy**.
The URL stays the same.
