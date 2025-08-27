# Vprašalnik FDI – podpis → PDF → e-mail (SMTP)

Ta verzija uporablja **Gmail SMTP (Nodemailer)** in vključuje:
- natančne izjave v PDF (brez DA/NE), prelom besedila, večji logo, skaliranje podpisa, nova stran po potrebi;
- polje **Email** ni obvezno;
- dodan podpis v vsebino e-pošte: "Lep pozdrav, Antonio Koderman.";
- po oddaji redirect na `/uspeh` z gumbom "Izpolni nov obrazec".

## ENV
SMTP_USER=matic.kirbis@gmail.com
SMTP_PASS=<gmail_app_password>
FROM_EMAIL=matic.kirbis@gmail.com
DOCTOR_EMAIL=ebamatic@gmail.com
NEXT_PUBLIC_LOGO_URL=https://novapriloznost.si/wp-content/uploads/2023/01/Untitled-design95-150x150.png
LOGO_URL=https://novapriloznost.si/wp-content/uploads/2023/01/Untitled-design95-150x150.png
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
