# HEP-QuickWrite

KI-gestützte Fachberichte für Heilerziehungspflege und Ergotherapie.

## Features

- 🤖 **KI-gestützte Berichterstellung** — Professionelle Fachberichte in Sekunden
- 📋 **ICF-konforme Dokumentation** — Nach internationalen Standards
- 💬 **Leichte Sprache** — Vereinfachte Dokumentation für Betroffene
- 🌙 **Dark/Light Mode** — Augenschonend bei Nachtarbeit
- 📱 **Responsive Design** — Funktioniert auf Desktop, Tablet & Mobile
- 🔐 **DSGVO-konform** — Datenschutzsichere Speicherung
- 📄 **PDF-Export** — Direktes Herunterladen als PDF
- 🎯 **Freemium Modell** — 3 kostenlose Berichte zum Starten

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Clerk
- **AI:** Google Gemini API
- **Payment:** Stripe

## Setup

```bash
# 1. Repository klonen
git clone https://github.com/Niklash9112/hep-quickwrite.git
cd hep-quickwrite

# 2. Dependencies installieren
npm install

# 3. Environment Variablen konfigurieren
cp .env.example .env.local
# .env.local editieren:
# - GOOGLE_API_KEY (für Gemini AI)
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - STRIPE_SECRET_KEY (optional, für Payments)

# 4. Development Server starten
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Vercel (Empfohlen)

```bash
npm i -g vercel
vercel
```

### Environment Variables

| Variable | Beschreibung | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini API Key | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Auth Key | ✅ |
| `CLERK_SECRET_KEY` | Clerk Secret | ✅ |
| `STRIPE_SECRET_KEY` | Stripe für Payments | ⭕ |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook | ⭕ |

## Dokumentationstypen

1. **Fachbericht (ICF)** — Vollständiger Bericht nach ICF-Kriterien
2. **Tagesdokumentation** — Kompakte Tageszusammenfassung
3. **Leichte Sprache** — Vereinfachte Version (B1-Niveau)

## Lizenz

MIT

---

Built with ❤️ für alle, die jeden Tag da sind.
