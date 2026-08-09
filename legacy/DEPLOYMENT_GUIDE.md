# Production X — GitHub Pages Deployment Guide
## productionx.in → GitHub Pages (Free Hosting)

---

## WHAT YOU'LL HAVE AFTER THIS GUIDE
- productionx.in live on the internet
- Free hosting forever via GitHub Pages
- SSL certificate (https://) — automatic and free
- Booking form that opens WhatsApp with pre-filled message
- Total cost: ₹0

---

## STEP 1 — Create a GitHub Account
1. Go to https://github.com
2. Click "Sign Up"
3. Use: username = **productionxin** (or similar)
4. Email: info@productionx.in
5. Complete verification and sign in

---

## STEP 2 — Create the Repository
1. Once logged in, click the **"+"** icon (top right) → "New repository"
2. Repository name: **productionxin.github.io**
   *(Must be exactly: yourusername.github.io)*
3. Set to **Public**
4. Do NOT check "Add a README"
5. Click **"Create repository"**

---

## STEP 3 — Upload Your Files
1. On the new repository page, click **"uploading an existing file"**
2. Drag and drop ALL 4 files at once:
   - `index.html`
   - `style.css`
   - `script.js`
   - `CNAME`
3. At the bottom, in the commit message box, type: `Launch Production X website`
4. Click **"Commit changes"**
5. Wait 30 seconds for files to upload

---

## STEP 4 — Enable GitHub Pages
1. In your repository, click **"Settings"** (top menu)
2. Scroll down to **"Pages"** in the left sidebar
3. Under "Source", select **"Deploy from a branch"**
4. Branch: select **"main"**
5. Folder: select **"/ (root)"**
6. Click **"Save"**
7. Wait 2–3 minutes — GitHub will show a green banner:
   *"Your site is live at https://productionxin.github.io"*

---

## STEP 5 — Connect productionx.in (GoDaddy)

### 5A — In GitHub (already done via CNAME file)
The CNAME file in your repository already tells GitHub to use productionx.in.
No action needed here.

### 5B — In GoDaddy DNS Settings
1. Log in to https://godaddy.com
2. Click your name (top right) → "My Products"
3. Find productionx.in → click **"DNS"**
4. You'll see a list of DNS records

### Delete any existing A records pointing to GoDaddy parking:
- Find any "A" record with name "@" → click the trash icon → Delete

### Add these 4 new A records (GitHub's IPs):
Click "Add" for each one:

| Type | Name | Value          | TTL  |
|------|------|----------------|------|
| A    | @    | 185.199.108.153 | 1 Hour |
| A    | @    | 185.199.109.153 | 1 Hour |
| A    | @    | 185.199.110.153 | 1 Hour |
| A    | @    | 185.199.111.153 | 1 Hour |

### Add 1 CNAME record for www:
| Type  | Name | Value                      | TTL    |
|-------|------|----------------------------|--------|
| CNAME | www  | productionxin.github.io    | 1 Hour |

5. Click **"Save"** after each record

---

## STEP 6 — Enable HTTPS in GitHub
1. Go back to GitHub → your repository → Settings → Pages
2. Wait 10–15 minutes for DNS to propagate
3. Check the box **"Enforce HTTPS"** (appears once DNS is verified)
4. Your site is now live at https://productionx.in ✓

---

## STEP 7 — Test Everything
Open these URLs and confirm they all load:
- https://productionx.in ✓
- https://www.productionx.in ✓
- https://productionxin.github.io ✓

Test the booking form:
- Fill in all fields
- Click "Book My Free Call"
- WhatsApp should open with the pre-filled message

---

## HOW THE BOOKING FORM WORKS
The form does NOT need a backend server. When submitted:
1. It collects: Name, Brand, Phone, Email, Service, Budget, Message
2. Shows a success screen on the website
3. Automatically opens WhatsApp with all details pre-filled
4. The prospect's message arrives in your WhatsApp inbox instantly

To change the WhatsApp number:
- Open `script.js`
- Find: `wa.me/919391926846`
- Replace with your number in international format

---

## HOW TO UPDATE THE WEBSITE LATER
To change any content:
1. Go to github.com → your repository
2. Click the file you want to edit (index.html, style.css, etc.)
3. Click the pencil icon (Edit)
4. Make your changes
5. Click "Commit changes"
6. Site updates in 1–2 minutes automatically

---

## ADDING YOUR PORTFOLIO VIDEOS
When you have a showreel or client videos:
1. Upload to YouTube or Vimeo (keep Vimeo private/unlisted)
2. In `index.html`, find the verticals section
3. Add your embed code inside the vertical cards

Example Vimeo embed:
```html
<iframe src="https://player.vimeo.com/video/YOUR_VIDEO_ID"
  frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
```

---

## SEO — What's Already Done
The website already includes:
- Meta title and description for Google
- Open Graph tags for social sharing
- Proper heading hierarchy (H1, H2, H3)
- Semantic HTML structure
- Mobile-responsive design
- Fast loading (no heavy frameworks)

For local SEO, also:
1. Claim productionx.in on Google Search Console (free)
   → https://search.google.com/search-console
2. Create/update Google Business Profile
   → https://business.google.com

---

## TROUBLESHOOTING

**Site not loading after 30 mins:**
- DNS propagation can take up to 24 hours
- Use https://dnschecker.org to check if productionx.in is pointing to GitHub

**HTTPS not working:**
- Wait 15–30 mins after enabling in GitHub Settings
- Make sure all 4 A records are added correctly in GoDaddy

**Booking form opens blank WhatsApp:**
- The phone number in script.js must be in international format
- Format: 919391926846 (no +, no spaces)

**Files not updating:**
- Hard refresh the browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- GitHub Pages can take 1–5 minutes to rebuild after changes

---

## ESTIMATED TIMELINE
| Step | Time |
|------|------|
| Create GitHub account | 5 min |
| Upload files | 5 min |
| Enable GitHub Pages | 2 min |
| Add GoDaddy DNS records | 10 min |
| DNS propagation | 15 min – 24 hours |
| **Total to live website** | **~30 min** |

---

## COST BREAKDOWN
| Item | Cost |
|------|------|
| GitHub Pages hosting | ₹0 / month |
| SSL certificate (HTTPS) | ₹0 / month |
| productionx.in domain (GoDaddy, already owned) | Already paid |
| **Total monthly cost** | **₹0** |

---

*Production X Creative — productionx.in*
*Built on GitHub Pages. Every frame earns its place.*
