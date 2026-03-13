# SMTP Email Sender

Reliable fallback email path that does not depend on Google OAuth CLI tokens.

## Why this exists
Google OAuth tokens for `gog`/Gmail can expire or be revoked. SMTP with stable credentials (for example a Gmail app password or a dedicated SMTP provider) is often more reliable for sending.

## Supported providers
- Gmail with App Password
- Outlook / Microsoft 365 SMTP
- Fastmail
- Zoho
- SMTP2GO / Mailgun / other SMTP providers with standard SMTP

## Environment variables
Set these before sending:

```bash
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USERNAME="your-account@gmail.com"
export SMTP_PASSWORD="your-app-password"
export SMTP_FROM="your-account@gmail.com"
export SMTP_STARTTLS="true"
```

## Recommended secret file location
Do **not** store SMTP secrets in the workspace `secrets/` folder if it is root-owned or not writable from the current session.
Use a user-writable private path instead:

```bash
/home/mat/.openclaw/local-secrets/hal-smtp.env
```

Then load it with:

```bash
set -a
source /home/mat/.openclaw/local-secrets/hal-smtp.env
set +a
```

## Examples
### Simple email
```bash
python3 /home/mat/.openclaw/workspace/tools/email-smtp/send_email.py \
  --to "someone@example.com" \
  --subject "Test email" \
  --body "Hello from HAL"
```

### Email with file attachment
```bash
python3 /home/mat/.openclaw/workspace/tools/email-smtp/send_email.py \
  --to "someone@example.com" \
  --subject "Mission Control instructions" \
  --body "Attached is the setup document." \
  --attach /home/mat/.openclaw/workspace/mission-control/Mission-Control-LAN-Setup.txt
```

## Gmail app password setup
If you want to keep using Gmail but avoid OAuth instability:
1. Turn on 2-Step Verification for the Gmail account.
2. Create an App Password in Google Account security settings.
3. Use:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USERNAME=<gmail address>`
   - `SMTP_PASSWORD=<16-char app password>`

## Recommendation
Best practical path: use a dedicated sender account and app-password / SMTP credentials for HAL, rather than relying on interactive Gmail OAuth tokens.
