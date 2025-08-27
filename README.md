# Vprašalnik FDI – obrazec + podpis → PDF → e-mail (Gmail SMTP)

Ta verzija uporablja **Gmail SMTP (Nodemailer)** za pošiljanje PDF priponk.

## ENV (Vercel → Settings → Environment Variables)
SMTP_USER=matic.kirbis@gmail.com
SMTP_PASS=your_gmail_app_password   # Uporabi App Password (glej spodaj)
FROM_EMAIL=matic.kirbis@gmail.com
DOCTOR_EMAIL=ebamatic@gmail.com
NEXT_PUBLIC_LOGO_URL=https://novapriloznost.si/wp-content/uploads/2023/01/Untitled-design95-150x150.png
LOGO_URL=https://novapriloznost.si/wp-content/uploads/2023/01/Untitled-design95-150x150.png

# (opcijsko)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

## Gmail App Password
1. Vklopi 2‑korakno preverjanje pri Google računu.
2. Na https://myaccount.google.com/apppasswords ustvari **App password** (izberi "Mail" in "Other").
3. Ustvarjeni 16-mestni gesel vpiši v `SMTP_PASS`.

## Opombe
- Pošiljamo na: `DOCTOR_EMAIL` (fallback na ebamatic@gmail.com), e‑mail ordinacije iz obrazca, in e‑mail pacienta (če je podan). Prejemnike deduplikiramo.
- PDF vsebuje večji logotip, pravilno prelomljeno besedilo, točne izjave in skaliran podpis, dodan marker **Build: v7-smtp**.
