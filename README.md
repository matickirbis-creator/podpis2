# Ordinacija – PDF s šumniki (UTF-8)

Ta verzija v PDF vgrajuje **Noto Sans** (TTF) preko `fontkit`, zato pravilno prikaže **č, š, ž**.
Pisave se prenesejo v strežniški funkciji (Vercel) preko HTTP.

### Spreminjanje URL-jev pisav (po želji)
Lahko dodaš ENV spremenljivki:
- `FONT_URL_REGULAR` – URL do Regular TTF
- `FONT_URL_BOLD` – URL do Bold TTF
