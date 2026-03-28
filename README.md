# NAYA

**The Feature Layer for Every App.**

Naya lets you describe a feature in plain language, generate it with AI, and deploy it as an overlay on any app you use. Instagram, YouTube, Gmail — anything. Think of it as GitHub for experiences: fork features from the community, vote on what ships next, and collectively deploy the capabilities apps should've had from day one.

---

![NAYA Screenshot](docs/screenshot.png)

---

## Stack

- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS
- **Animation** — Framer Motion
- **State** — Zustand + Immer
- **AI** — OpenAI
- **UI Primitives** — Radix UI
- **Icons** — Lucide React

## Getting Started

```bash
npm install
npx convex dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

```bash
vercel deploy
```

Set your environment variables in the Vercel dashboard. See `.env.example` for required keys.

## License

MIT
