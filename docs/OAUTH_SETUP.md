# Google OAuth 2.0 Integration & Setup Guide
## AI by Faraz — Agentic Lead Engine

This guide walks through configuring Google OAuth 2.0 credentials for:
1. **Gmail Outreach Agent (Agent 07)** — Secure, compliant email sending, thread tracking, and bounce detection.
2. **Google Sheets Integration** — Continuous two-way synchronization of 12 distinct CRM tabs.

---

## Step 1: Create a Project in Google Cloud Console
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and select **New Project**.
3. Name your project: `AI-by-Faraz-Lead-Engine`.
4. Click **Create** and ensure the project is active.

---

## Step 2: Enable Required Google APIs
From the **APIs & Services > Library** menu, search for and enable the following:
- **Gmail API** (`gmail.googleapis.com`)
- **Google Sheets API** (`sheets.googleapis.com`)
- **Google Drive API** (`drive.googleapis.com`)
- **Places API (New)** (Optional for Agent 02 lead discovery)
- **Custom Search API** (Optional for web research)

---

## Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **User Type**:
   - **Internal** (if using Google Workspace for your agency).
   - **External** (if testing or using standard personal accounts).
3. Fill in the App details:
   - **App Name**: `AI by Faraz Lead Engine`
   - **User support email**: `faraz@aibyfaraz.com`
   - **Developer contact information**: `faraz@aibyfaraz.com`
4. On the **Scopes** page, add the following authorized scopes:
   - `https://www.googleapis.com/auth/gmail.send` (Send outreach emails)
   - `https://www.googleapis.com/auth/gmail.modify` (Track replies, reads, and bounces)
   - `https://www.googleapis.com/auth/spreadsheets` (Read and write to Google Sheets)
   - `https://www.googleapis.com/auth/drive.file` (Create/access CRM spreadsheets)
5. Under **Test Users**, add your authorized Gmail account(s).

---

## Step 4: Generate OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Application Type: **Web application**.
4. Name: `Agentic Lead Engine Web Client`.
5. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://your-vercel-domain.vercel.app`
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google`
7. Click **Create** and download your Client Secret JSON.

---

## Step 5: Environment Variable Configuration
Add the client credentials to your `.env.local` or directly within the **Settings & Integrations** UI panel:

```env
GMAIL_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="GOCSPX-your-client-secret"
GOOGLE_SHEETS_ID="your-12-tab-spreadsheet-id"
```

---

## Anti-Spam & Legal Compliance (CASL, CAN-SPAM, GDPR)
The Agent 07 outreach module incorporates the following automated compliance safeguards:
- **Human-In-The-Loop Approval**: Emails require review in the Approval Queue before sending.
- **Physical Address Header**: Appends your registered commercial physical address.
- **One-Click Unsubscribe**: Includes standardized unsubscribe headers and reply-stop monitors.
- **Suppression List**: Prevents duplicate sends to unsubscribed or bounced domains.
- **Rate Limiting**: Daily sending quota defaulted to 50 emails/day to preserve domain reputation.
