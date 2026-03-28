# NAYA — System Architecture

> "GitHub for experiences." Users describe AI-powered features in natural language. Naya generates working overlay widgets that run on top of any existing app.

---

## 1. High-Level System Map

```
+-------------------------------------------------------+
|                    NAYA PLATFORM                       |
|                                                       |
|  +------------------+    +------------------------+   |
|  |   Web Dashboard  |    |  Browser Extension     |   |
|  |   (Next.js 14)   |    |  (Overlay Injector)    |   |
|  +--------+---------+    +----------+-------------+   |
|           |                         |                 |
|  +--------v-------------------------v-------------+   |
|  |            Feature Runtime Engine              |   |
|  |  (sandbox, lifecycle, permissions, rendering)  |   |
|  +--------+---------------------------------------+   |
|           |                                           |
|  +--------v---------------------------------------+   |
|  |           AI Generation Pipeline               |   |
|  |  (prompt -> code -> validate -> deploy)        |   |
|  +--------+---------------------------------------+   |
|           |                                           |
|  +--------v---------------------------------------+   |
|  |           Community Platform                   |   |
|  |  (marketplace, polls, forks, deployments)      |   |
|  +--------+---------------------------------------+   |
|           |                                           |
|  +--------v---------------------------------------+   |
|  |           Data Layer (Supabase)                |   |
|  |  (auth, db, storage, realtime, edge functions) |   |
|  +------------------------------------------------+  |
+-------------------------------------------------------+
```

---

## 2. App Shell — Next.js 14 App Router

### Route Structure

```
src/app/
  layout.tsx              # Root layout, global styles, font loading
  page.tsx                # Landing / feature creation prompt
  globals.css             # Nothing-inspired theme

  create/
    page.tsx              # Feature creation studio
    [id]/
      page.tsx            # Edit existing feature

  explore/
    page.tsx              # Community feature marketplace
    [category]/
      page.tsx            # Filtered by target app

  feature/
    [id]/
      page.tsx            # Feature detail, install, fork
      polls/
        page.tsx          # Active polls for this feature

  community/
    page.tsx              # Community hub
    [id]/
      page.tsx            # Specific community

  profile/
    [id]/
      page.tsx            # User profile, reputation, created features

  api/
    features/
      route.ts            # CRUD features
      [id]/
        route.ts          # Single feature operations
        fork/
          route.ts        # Fork a feature
        deploy/
          route.ts        # Deploy to overlay
    generate/
      route.ts            # AI generation endpoint
      validate/
        route.ts          # Validate generated code
    community/
      route.ts            # Community CRUD
      [id]/
        polls/
          route.ts        # Poll operations
    device/
      capabilities/
        route.ts          # Device capability detection
    overlay/
      config/
        route.ts          # Overlay configuration
      inject/
        route.ts          # Generate injection payload
```

### Middleware

- `src/middleware.ts` — Auth gate, rate limiting headers, device capability sniffing via UA.

---

## 3. Feature Runtime Engine

The runtime is the core of Naya. It takes user-described features and turns them into sandboxed, injectable widgets.

### 3.1 Feature Lifecycle

```
DRAFT -> GENERATING -> VALIDATING -> READY -> DEPLOYED -> ARCHIVED
  |         |              |           |         |
  |         v              v           |         v
  |      [AI Pipeline]  [Sandbox]      |    [Live on target app]
  |                                    |
  +--- user edits prompt ------------->+
```

### 3.2 Sandbox Architecture

Every generated feature runs inside a **sandboxed iframe** with a strict CSP:

```
Sandbox Container
+--------------------------------------------+
|  iframe (sandbox="allow-scripts")          |
|  +--------------------------------------+  |
|  |  Feature Widget                      |  |
|  |  - Rendered React component          |  |
|  |  - Scoped CSS (no style leakage)     |  |
|  |  - MessagePort for host comms        |  |
|  +--------------------------------------+  |
+--------------------------------------------+
     |                            ^
     | postMessage (structured)   | postMessage (response)
     v                            |
+--------------------------------------------+
|  Host Runtime                              |
|  - Permission broker                       |
|  - DOM query proxy (read-only by default)  |
|  - Network request proxy (allowlisted)     |
|  - State persistence (localStorage scoped) |
+--------------------------------------------+
```

### 3.3 Permission Model

Features declare required permissions. Users approve before deployment:

| Permission         | Description                          | Risk Level |
|--------------------|--------------------------------------|------------|
| `dom:read`         | Read content from target page        | Low        |
| `dom:write`        | Modify target page DOM               | High       |
| `network:fetch`    | Make HTTP requests to allowlisted URLs| Medium    |
| `storage:local`    | Persist data in scoped localStorage  | Low        |
| `clipboard:read`   | Read clipboard                       | Medium     |
| `clipboard:write`  | Write to clipboard                   | Low        |
| `notification`     | Show browser notifications           | Low        |

### 3.4 Runtime API (exposed to features via MessagePort)

```typescript
interface NayaRuntimeAPI {
  // DOM access (proxied, permission-gated)
  queryPage(selector: string): Promise<SerializedElement[]>;
  getPageText(): Promise<string>;
  getPageMetadata(): Promise<Record<string, string>>;

  // State
  getState(key: string): Promise<unknown>;
  setState(key: string, value: unknown): Promise<void>;

  // Network
  fetch(url: string, options?: RequestInit): Promise<Response>;

  // UI
  resize(width: number, height: number): void;
  close(): void;
  minimize(): void;

  // Inter-feature communication
  broadcast(channel: string, data: unknown): void;
  onBroadcast(channel: string, handler: (data: unknown) => void): void;
}
```

---

## 4. Overlay System — Browser Extension

The overlay system is a browser extension that injects Naya feature widgets on top of target websites.

### 4.1 Extension Architecture

```
extension/
  manifest.json          # MV3 manifest
  background/
    service-worker.ts    # Feature registry, lifecycle management
  content/
    injector.ts          # DOM injection, overlay positioning
    bridge.ts            # Page <-> extension message bridge
    runtime.ts           # Feature sandbox host runtime
  popup/
    index.html           # Quick feature toggle UI
  options/
    index.html           # Full settings page
```

### 4.2 Injection Flow

```
1. User navigates to target app (e.g., instagram.com)
2. Content script checks feature registry for matching targetApp rules
3. For each matching feature:
   a. Create overlay container at configured position
   b. Spawn sandboxed iframe with feature code
   c. Establish MessagePort bridge
   d. Feature renders inside iframe
   e. Host runtime brokers all permission-gated operations
4. Overlay manager handles z-index stacking, drag, resize, minimize
```

### 4.3 Overlay Positioning

```typescript
type OverlayPosition =
  | { type: 'fixed'; anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; offset: { x: number; y: number } }
  | { type: 'relative'; selector: string; placement: 'above' | 'below' | 'left' | 'right' }
  | { type: 'floating'; defaultPosition: { x: number; y: number }; draggable: true }
  | { type: 'sidebar'; side: 'left' | 'right'; width: number }
  | { type: 'fullscreen'; }
```

### 4.4 Trigger System

Features activate based on configurable triggers:

- **Page load** — activate when target URL matches
- **Element presence** — activate when a specific DOM element appears
- **Keyboard shortcut** — user-defined hotkey
- **Context menu** — right-click option
- **Selection** — activate when user selects text
- **Scheduled** — activate on interval (e.g., auto-check every 5 min)

---

## 5. Community Platform

### 5.1 Feature Marketplace

Every published feature gets a detail page with:
- Live preview (sandboxed demo)
- Install count, reputation score, fork count
- Version history with diffs
- User reviews and ratings
- "Fork" button that clones to user's workspace
- Compatibility badges (target apps, device requirements)

### 5.2 Polls & Collective Deployment

Communities can propose feature deployments to all members:

```
1. Member proposes a feature for community-wide deployment
2. Poll is created with configurable deadline (default 48h)
3. Members vote: approve / reject / suggest-changes
4. If threshold reached (default >60% approve), feature auto-deploys
5. Any member can opt-out individually post-deployment
```

### 5.3 Fork Model

Forking a feature creates a full copy under the forker's account:
- Original creator gets attribution and reputation points
- Fork maintains a link to the upstream feature
- Fork can submit "pull requests" back to the original
- Divergence indicator shows how far fork has drifted

### 5.4 Reputation System

```
Action                              Points
--------------------------------------------
Create a feature                    +10
Feature gets installed (per user)   +1
Feature gets forked                 +5
Win a community poll                +3
Contribute to a fork (merged PR)    +7
Feature flagged as harmful          -20
```

---

## 6. AI Generation Pipeline

### 6.1 Pipeline Stages

```
User Prompt
    |
    v
[1. Prompt Engineering]
    - Extract intent, target app, desired behavior
    - Identify required permissions
    - Determine UI requirements
    |
    v
[2. Code Generation]
    - Generate React component (TSX)
    - Generate scoped CSS
    - Generate overlay configuration
    - Generate permission manifest
    |
    v
[3. Validation]
    - Static analysis (no eval, no inline scripts)
    - Permission audit (only declared permissions used)
    - Size budget check (<100KB bundled)
    - Sandbox compatibility check
    |
    v
[4. Preview]
    - Render in sandbox with mock target page
    - User reviews and iterates
    |
    v
[5. Deployment]
    - Bundle and minify
    - Upload to feature registry
    - Push to extension via service worker update
```

### 6.2 Generation Prompt Template

```
System: You are Naya, a feature overlay generator. You create React components
that run inside a sandboxed iframe overlaying a target website.

Constraints:
- Output a single React functional component (TSX)
- Use only the NayaRuntimeAPI for page interaction
- No external dependencies beyond React
- All styles must be inline or CSS-in-JS (no global styles)
- Component must handle loading, error, and empty states
- Must be responsive to overlay container size
- Maximum 500 lines of code

Target App: {targetApp}
User Request: {userPrompt}
Device Capabilities: {deviceCapabilities}

Generate the feature component:
```

### 6.3 Iterative Refinement

Users can refine generated features through conversation:
- "Make the fact-check results more compact"
- "Add a confidence score to each claim"
- "Change the trigger to only activate on posts with links"

Each refinement generates a diff that's applied to the existing code, preserving working functionality.

---

## 7. Device Capability Detection

### 7.1 Detection Method

```typescript
async function detectCapabilities(): Promise<DeviceCapability> {
  return {
    gpu: await detectGPU(),          // WebGL renderer string + benchmark
    ram: navigator.deviceMemory,     // Device Memory API (GB)
    npu: await detectNPU(),          // WebNN API availability
    browser: detectBrowser(),        // UA parsing + feature detection
    screenSize: {
      width: window.screen.width,
      height: window.screen.height,
      dpr: window.devicePixelRatio,
    },
  };
}
```

### 7.2 Capability Tiers

| Tier     | RAM   | GPU           | Features Allowed                    |
|----------|-------|---------------|-------------------------------------|
| Minimal  | <4GB  | Integrated    | Text-only overlays, basic layout    |
| Standard | 4-8GB | Mid-range     | Full overlays, animations, charts   |
| Power    | >8GB  | Dedicated/NPU | On-device AI inference, video proc  |

Features declare a minimum tier. The runtime warns users if their device is below the requirement.

---

## 8. Data Models

### 8.1 Supabase Schema

```sql
-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  avatar_url text,
  reputation integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Features
create table features (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  code text not null,
  creator_id uuid references users(id) on delete cascade,
  status text check (status in ('draft','generating','validating','ready','deployed','archived')) default 'draft',
  target_app text not null,
  overlay_config jsonb not null default '{}',
  permissions text[] default '{}',
  version integer default 1,
  forked_from uuid references features(id),
  votes integer default 0,
  forks_count integer default 0,
  installs integer default 0,
  min_capability_tier text check (min_capability_tier in ('minimal','standard','power')) default 'minimal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Communities
create table communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  creator_id uuid references users(id) on delete cascade,
  member_count integer default 1,
  created_at timestamptz default now()
);

-- Community Memberships
create table community_members (
  community_id uuid references communities(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('member','moderator','admin')) default 'member',
  joined_at timestamptz default now(),
  primary key (community_id, user_id)
);

-- Polls
create table polls (
  id uuid primary key default gen_random_uuid(),
  feature_id uuid references features(id) on delete cascade,
  community_id uuid references communities(id) on delete cascade,
  proposer_id uuid references users(id) on delete cascade,
  status text check (status in ('active','passed','rejected','expired')) default 'active',
  approve_count integer default 0,
  reject_count integer default 0,
  threshold_percent integer default 60,
  deadline timestamptz not null,
  created_at timestamptz default now()
);

-- Poll Votes
create table poll_votes (
  poll_id uuid references polls(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  vote text check (vote in ('approve','reject','suggest_changes')) not null,
  comment text,
  created_at timestamptz default now(),
  primary key (poll_id, user_id)
);

-- Deployed Features (per user)
create table deployed_features (
  user_id uuid references users(id) on delete cascade,
  feature_id uuid references features(id) on delete cascade,
  overlay_config_override jsonb,
  deployed_at timestamptz default now(),
  primary key (user_id, feature_id)
);

-- Community Deployed Features
create table community_deployed_features (
  community_id uuid references communities(id) on delete cascade,
  feature_id uuid references features(id) on delete cascade,
  poll_id uuid references polls(id),
  deployed_at timestamptz default now(),
  primary key (community_id, feature_id)
);
```

### 8.2 Supabase Row Level Security

- Users can only modify their own data
- Features are publicly readable, writable only by creator
- Community admins/moderators can manage community settings
- Poll votes are write-once per user per poll
- Deployed features are per-user, only self-modifiable

### 8.3 Realtime Subscriptions

- Poll vote counts (live updates during active polls)
- Community feature deployments (notify members)
- Feature status changes (generation pipeline progress)

---

## 9. API Routes

### Features API

| Method | Route                          | Description                    |
|--------|--------------------------------|--------------------------------|
| GET    | `/api/features`                | List features (paginated, filterable) |
| POST   | `/api/features`                | Create new feature             |
| GET    | `/api/features/[id]`           | Get feature detail             |
| PATCH  | `/api/features/[id]`           | Update feature                 |
| DELETE | `/api/features/[id]`           | Delete feature                 |
| POST   | `/api/features/[id]/fork`      | Fork a feature                 |
| POST   | `/api/features/[id]/deploy`    | Deploy feature to user overlay |

### AI Generation API

| Method | Route                          | Description                    |
|--------|--------------------------------|--------------------------------|
| POST   | `/api/generate`                | Generate feature from prompt   |
| POST   | `/api/generate/validate`       | Validate generated code        |

### Community API

| Method | Route                              | Description                |
|--------|------------------------------------|----------------------------|
| GET    | `/api/community`                   | List communities           |
| POST   | `/api/community`                   | Create community           |
| GET    | `/api/community/[id]`              | Get community detail       |
| POST   | `/api/community/[id]/polls`        | Create poll                |
| POST   | `/api/community/[id]/polls/[pid]/vote` | Vote on poll          |

### Device API

| Method | Route                          | Description                    |
|--------|--------------------------------|--------------------------------|
| POST   | `/api/device/capabilities`     | Submit device capabilities     |

### Overlay API

| Method | Route                          | Description                    |
|--------|--------------------------------|--------------------------------|
| GET    | `/api/overlay/config`          | Get user's overlay config      |
| POST   | `/api/overlay/inject`          | Get injection payload for URL  |

---

## 10. Security Model

### Generated Code Restrictions
- No `eval()`, `Function()`, or dynamic code execution
- No `document.cookie` access
- No `window.opener` or `window.parent` access beyond MessagePort
- No inline event handlers in HTML strings
- CSP: `script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src https:`

### Rate Limiting
- AI generation: 10 requests/hour per user (free tier), 100/hour (pro)
- API: 100 requests/minute per user
- Overlay injection: no limit (cached locally)

### Content Moderation
- Generated code is scanned for malicious patterns before deployment
- Community-reported features are reviewed and can be suspended
- Automated checks for credential harvesting, phishing UI, crypto mining

---

## 11. Performance Budget

| Metric                    | Target        |
|---------------------------|---------------|
| Dashboard TTI             | <2s           |
| Feature generation        | <10s          |
| Overlay injection         | <100ms        |
| Feature widget render     | <200ms        |
| Extension memory overhead | <50MB         |
| Feature bundle size       | <100KB        |

---

## 12. Tech Stack Summary

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | Next.js 14, React 18, TypeScript  |
| Styling        | Tailwind CSS, Framer Motion       |
| State          | Zustand                           |
| Backend        | Supabase (Auth, DB, Storage, RT)  |
| AI             | OpenAI GPT-4 / GPT-4o            |
| Extension      | Chrome MV3, TypeScript            |
| Hosting        | Vercel (dashboard), Supabase Edge |
| Monitoring     | Vercel Analytics, Sentry          |
