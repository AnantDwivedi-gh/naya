import { Feature, FeatureCategory, PaginatedResponse, OverlayCode, TriggerCondition, IntegrationHook } from "./types";

// ---------------------------------------------------------------------------
// In-memory data store (swap to Supabase by replacing this implementation)
// ---------------------------------------------------------------------------

const features = new Map<string, Feature>();

// Seed data
const seedFeatures: Feature[] = [
  {
    id: "feat_001",
    name: "Instagram Fact Checker",
    description:
      "Overlays fact-check badges on Instagram posts by cross-referencing claims with trusted databases. Highlights misleading captions and provides verified context.",
    targetApp: "instagram.com",
    category: "fact-checker",
    authorId: "user_001",
    authorName: "VerifyBot",
    code: {
      html: `<div id="naya-fact-checker" class="naya-overlay">\n  <div class="naya-badge" data-status="unknown">\n    <span class="naya-badge-icon"></span>\n    <span class="naya-badge-label">Checking...</span>\n  </div>\n  <div class="naya-detail-panel hidden">\n    <h3 class="naya-panel-title">Fact Check Result</h3>\n    <div class="naya-verdict"></div>\n    <ul class="naya-sources"></ul>\n    <button class="naya-close-btn">Close</button>\n  </div>\n</div>`,
      css: `.naya-overlay { position: fixed; z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }\n.naya-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 12px; cursor: pointer; background: #f0f0f0; border: 1px solid #ddd; transition: all 0.2s; }\n.naya-badge[data-status="verified"] { background: #d4edda; border-color: #28a745; }\n.naya-badge[data-status="misleading"] { background: #f8d7da; border-color: #dc3545; }\n.naya-badge[data-status="unverified"] { background: #fff3cd; border-color: #ffc107; }\n.naya-badge-icon::before { content: "\\1F50D"; }\n.naya-detail-panel { position: absolute; top: 100%; left: 0; width: 300px; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); margin-top: 8px; }\n.naya-detail-panel.hidden { display: none; }\n.naya-panel-title { margin: 0 0 12px; font-size: 14px; font-weight: 600; }\n.naya-sources { list-style: none; padding: 0; margin: 8px 0; }\n.naya-sources li { padding: 4px 0; font-size: 12px; color: #666; }\n.naya-close-btn { background: none; border: 1px solid #ddd; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }`,
      js: `(function() {\n  const overlay = document.getElementById("naya-fact-checker");\n  const badge = overlay.querySelector(".naya-badge");\n  const panel = overlay.querySelector(".naya-detail-panel");\n  const verdict = overlay.querySelector(".naya-verdict");\n  const sources = overlay.querySelector(".naya-sources");\n\n  badge.addEventListener("click", () => panel.classList.toggle("hidden"));\n  overlay.querySelector(".naya-close-btn").addEventListener("click", () => panel.classList.add("hidden"));\n\n  function checkPost(postElement) {\n    const text = postElement.querySelector('[data-testid="post-caption"]')?.textContent || "";\n    if (!text) return;\n    badge.dataset.status = "verified";\n    badge.querySelector(".naya-badge-label").textContent = "Verified";\n    verdict.textContent = "This post appears factually accurate.";\n    sources.innerHTML = "<li>Source: Associated Press</li><li>Source: Reuters Fact Check</li>";\n  }\n\n  const observer = new MutationObserver((mutations) => {\n    for (const m of mutations) {\n      for (const node of m.addedNodes) {\n        if (node.nodeType === 1 && node.matches && node.matches("article")) checkPost(node);\n      }\n    }\n  });\n  observer.observe(document.body, { childList: true, subtree: true });\n})();`,
    },
    triggerConditions: [
      { type: "url-match", value: "https://www.instagram.com/*", description: "Activates on Instagram pages" },
      { type: "element-present", value: "article", description: "Waits for post articles to load" },
    ],
    integrationHooks: [
      { type: "dom-observer", target: "article", description: "Monitors new posts appearing in feed" },
      { type: "api-call", target: "fact-check-api", description: "Queries fact-check database" },
    ],
    permissions: ["dom-read", "network-request"],
    tags: ["fact-check", "misinformation", "social-media", "instagram"],
    forkCount: 42,
    deployCount: 1580,
    upvotes: 312,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-11-15T10:30:00Z",
    updatedAt: "2026-02-20T14:15:00Z",
  },
  {
    id: "feat_002",
    name: "Twitter Thread Summarizer",
    description:
      "Collapses long Twitter/X threads into concise key-point summaries. Uses NLP to extract the main arguments and presents them in a clean overlay card.",
    targetApp: "x.com",
    category: "content-enhancer",
    authorId: "user_002",
    authorName: "ThreadWise",
    code: {
      html: `<div id="naya-thread-summary" class="naya-overlay">\n  <button class="naya-summarize-btn">Summarize Thread</button>\n  <div class="naya-summary-card hidden">\n    <h3>Thread Summary</h3>\n    <ul class="naya-key-points"></ul>\n    <p class="naya-tweet-count"></p>\n    <button class="naya-dismiss">Dismiss</button>\n  </div>\n</div>`,
      css: `.naya-summarize-btn { background: #1d9bf0; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; }\n.naya-summarize-btn:hover { background: #1a8cd8; }\n.naya-summary-card { background: white; border: 1px solid #e1e8ed; border-radius: 16px; padding: 20px; max-width: 400px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }\n.naya-summary-card.hidden { display: none; }\n.naya-summary-card h3 { margin: 0 0 12px; font-size: 16px; }\n.naya-key-points { padding-left: 20px; margin: 0 0 12px; }\n.naya-key-points li { margin-bottom: 8px; font-size: 14px; line-height: 1.4; color: #333; }\n.naya-tweet-count { font-size: 12px; color: #888; margin: 0 0 12px; }\n.naya-dismiss { background: #f0f0f0; border: none; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; }`,
      js: `(function() {\n  const el = document.getElementById("naya-thread-summary");\n  const btn = el.querySelector(".naya-summarize-btn");\n  const card = el.querySelector(".naya-summary-card");\n  const points = el.querySelector(".naya-key-points");\n  const count = el.querySelector(".naya-tweet-count");\n\n  btn.addEventListener("click", () => {\n    const tweets = document.querySelectorAll('[data-testid="tweetText"]');\n    const texts = Array.from(tweets).map(t => t.textContent);\n    const keyPoints = texts.slice(0, 5).map(t => t.substring(0, 120) + "...");\n    points.innerHTML = keyPoints.map(p => "<li>" + p + "</li>").join("");\n    count.textContent = texts.length + " tweets in thread";\n    card.classList.remove("hidden");\n    btn.style.display = "none";\n  });\n\n  el.querySelector(".naya-dismiss").addEventListener("click", () => {\n    card.classList.add("hidden");\n    btn.style.display = "";\n  });\n})();`,
    },
    triggerConditions: [
      { type: "url-match", value: "https://x.com/*/status/*", description: "Activates on tweet detail pages" },
      { type: "element-present", value: '[data-testid="tweetText"]', description: "Waits for tweet content" },
    ],
    integrationHooks: [
      { type: "dom-observer", target: '[data-testid="tweetText"]', description: "Reads tweet content from DOM" },
    ],
    permissions: ["dom-read"],
    tags: ["twitter", "threads", "summarizer", "nlp", "x"],
    forkCount: 67,
    deployCount: 2340,
    upvotes: 489,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-10-20T08:00:00Z",
    updatedAt: "2026-01-10T11:45:00Z",
  },
  {
    id: "feat_003",
    name: "YouTube Ad Skipper Workflow",
    description:
      "Automatically detects ad segments in YouTube videos and marks them on the progress bar. Provides one-click skip and tracks which segments are ads.",
    targetApp: "youtube.com",
    category: "workflow-automator",
    authorId: "user_003",
    authorName: "AdFreeYT",
    code: {
      html: `<div id="naya-ad-skipper" class="naya-overlay">\n  <div class="naya-ad-indicator hidden">\n    <span class="naya-ad-label">Ad Segment Detected</span>\n    <button class="naya-skip-btn">Skip</button>\n  </div>\n  <div class="naya-ad-markers"></div>\n</div>`,
      css: `.naya-ad-indicator { position: fixed; bottom: 80px; right: 20px; display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.85); color: white; padding: 10px 16px; border-radius: 10px; z-index: 10001; }\n.naya-ad-indicator.hidden { display: none; }\n.naya-ad-label { font-size: 13px; }\n.naya-skip-btn { background: #ff4444; color: white; border: none; padding: 6px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; }\n.naya-skip-btn:hover { background: #ff2222; }\n.naya-ad-markers { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; pointer-events: none; }`,
      js: `(function() {\n  const overlay = document.getElementById("naya-ad-skipper");\n  const indicator = overlay.querySelector(".naya-ad-indicator");\n  const skipBtn = overlay.querySelector(".naya-skip-btn");\n  let adSegments = [];\n\n  function detectAdSegments(video) {\n    const duration = video.duration;\n    adSegments = [\n      { start: 0, end: Math.min(15, duration) },\n      { start: duration * 0.4, end: duration * 0.4 + 30 },\n    ];\n  }\n\n  function checkCurrentTime(video) {\n    const t = video.currentTime;\n    const inAd = adSegments.find(s => t >= s.start && t <= s.end);\n    if (inAd) {\n      indicator.classList.remove("hidden");\n      skipBtn.onclick = () => { video.currentTime = inAd.end + 0.5; };\n    } else {\n      indicator.classList.add("hidden");\n    }\n  }\n\n  const waitForVideo = setInterval(() => {\n    const video = document.querySelector("video");\n    if (video && video.duration) {\n      clearInterval(waitForVideo);\n      detectAdSegments(video);\n      video.addEventListener("timeupdate", () => checkCurrentTime(video));\n    }\n  }, 1000);\n})();`,
    },
    triggerConditions: [
      { type: "url-match", value: "https://www.youtube.com/watch*", description: "Activates on YouTube watch pages" },
      { type: "element-present", value: "video", description: "Waits for the video player" },
    ],
    integrationHooks: [
      { type: "dom-observer", target: "video", description: "Monitors video element for ad detection" },
    ],
    permissions: ["dom-read", "dom-write"],
    tags: ["youtube", "ads", "skipper", "workflow", "video"],
    forkCount: 156,
    deployCount: 8920,
    upvotes: 1204,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-09-05T14:20:00Z",
    updatedAt: "2026-03-01T09:30:00Z",
  },
  {
    id: "feat_004",
    name: "LinkedIn Post Formatter",
    description:
      "Reformats LinkedIn posts for better readability. Removes excessive line breaks, highlights key metrics, and structures posts with proper headings.",
    targetApp: "linkedin.com",
    category: "content-enhancer",
    authorId: "user_004",
    authorName: "CleanFeed",
    code: {
      html: `<div id="naya-linkedin-formatter" class="naya-overlay">\n  <button class="naya-format-toggle">Format Posts</button>\n</div>`,
      css: `.naya-format-toggle { position: fixed; bottom: 20px; right: 20px; background: #0077b5; color: white; border: none; padding: 10px 20px; border-radius: 24px; font-size: 13px; font-weight: 600; cursor: pointer; z-index: 10000; box-shadow: 0 2px 12px rgba(0,119,181,0.3); }\n.naya-format-toggle:hover { background: #006097; }\n.naya-formatted { line-height: 1.6 !important; }\n.naya-formatted .naya-highlight { background: #fff3cd; padding: 2px 4px; border-radius: 3px; font-weight: 600; }`,
      js: `(function() {\n  let enabled = false;\n  const btn = document.querySelector(".naya-format-toggle");\n\n  function formatPosts() {\n    const posts = document.querySelectorAll(".feed-shared-update-v2__description");\n    posts.forEach(post => {\n      if (!post.dataset.nayaOriginal) post.dataset.nayaOriginal = post.innerHTML;\n      let text = post.innerHTML;\n      text = text.replace(/(\\n\\s*){3,}/g, "\\n\\n");\n      text = text.replace(/(\\d+[%+x])/g, '<span class="naya-highlight">$1</span>');\n      post.innerHTML = text;\n      post.classList.add("naya-formatted");\n    });\n  }\n\n  function restorePosts() {\n    const posts = document.querySelectorAll(".feed-shared-update-v2__description");\n    posts.forEach(post => {\n      if (post.dataset.nayaOriginal) post.innerHTML = post.dataset.nayaOriginal;\n      post.classList.remove("naya-formatted");\n    });\n  }\n\n  btn.addEventListener("click", () => {\n    enabled = !enabled;\n    btn.textContent = enabled ? "Restore Posts" : "Format Posts";\n    enabled ? formatPosts() : restorePosts();\n  });\n})();`,
    },
    triggerConditions: [
      { type: "url-match", value: "https://www.linkedin.com/feed*", description: "Activates on LinkedIn feed" },
      { type: "page-load", value: "complete", description: "Runs after page loads" },
    ],
    integrationHooks: [
      { type: "dom-observer", target: ".feed-shared-update-v2", description: "Watches for new posts in feed" },
    ],
    permissions: ["dom-read", "dom-write"],
    tags: ["linkedin", "formatter", "readability", "productivity"],
    forkCount: 23,
    deployCount: 890,
    upvotes: 145,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-12-01T16:00:00Z",
    updatedAt: "2026-02-15T08:20:00Z",
  },
  {
    id: "feat_005",
    name: "Reddit Comment Sentiment",
    description:
      "Color-codes Reddit comments by sentiment. Green for positive, red for negative, yellow for neutral. Adds a sentiment score badge next to each comment.",
    targetApp: "reddit.com",
    category: "data-extractor",
    authorId: "user_002",
    authorName: "ThreadWise",
    code: {
      html: `<div id="naya-sentiment" class="naya-overlay">\n  <div class="naya-sentiment-legend">\n    <span class="naya-legend-item positive">Positive</span>\n    <span class="naya-legend-item neutral">Neutral</span>\n    <span class="naya-legend-item negative">Negative</span>\n  </div>\n</div>`,
      css: `.naya-sentiment-legend { position: fixed; top: 70px; right: 20px; display: flex; gap: 8px; background: white; padding: 8px 14px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 10000; font-size: 11px; }\n.naya-legend-item { padding: 2px 8px; border-radius: 4px; }\n.naya-legend-item.positive { background: #d4edda; color: #155724; }\n.naya-legend-item.neutral { background: #fff3cd; color: #856404; }\n.naya-legend-item.negative { background: #f8d7da; color: #721c24; }\n.naya-sentiment-badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px; font-weight: 600; }`,
      js: `(function() {\n  const positiveWords = ["great","love","amazing","awesome","good","best","thank","helpful","excellent"];\n  const negativeWords = ["bad","hate","terrible","worst","awful","stupid","garbage","trash","annoying"];\n\n  function scoreSentiment(text) {\n    const words = text.toLowerCase().split(/\\s+/);\n    let score = 0;\n    words.forEach(w => {\n      if (positiveWords.includes(w)) score++;\n      if (negativeWords.includes(w)) score--;\n    });\n    return score;\n  }\n\n  function processComments() {\n    const comments = document.querySelectorAll('[data-testid="comment"]');\n    comments.forEach(comment => {\n      if (comment.dataset.nayaScored) return;\n      comment.dataset.nayaScored = "true";\n      const text = comment.textContent || "";\n      const score = scoreSentiment(text);\n      const badge = document.createElement("span");\n      badge.className = "naya-sentiment-badge";\n      if (score > 0) { badge.style.background = "#d4edda"; badge.textContent = "+" + score; }\n      else if (score < 0) { badge.style.background = "#f8d7da"; badge.textContent = String(score); }\n      else { badge.style.background = "#fff3cd"; badge.textContent = "0"; }\n      comment.prepend(badge);\n    });\n  }\n\n  processComments();\n  const observer = new MutationObserver(processComments);\n  observer.observe(document.body, { childList: true, subtree: true });\n})();`,
    },
    triggerConditions: [
      { type: "url-match", value: "https://www.reddit.com/r/*/comments/*", description: "Activates on Reddit comment pages" },
      { type: "element-present", value: '[data-testid="comment"]', description: "Waits for comments to load" },
    ],
    integrationHooks: [
      { type: "dom-observer", target: '[data-testid="comment"]', description: "Watches for new comments" },
    ],
    permissions: ["dom-read", "dom-write"],
    tags: ["reddit", "sentiment", "analysis", "comments", "nlp"],
    forkCount: 31,
    deployCount: 1120,
    upvotes: 267,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-11-28T12:00:00Z",
    updatedAt: "2026-01-22T15:30:00Z",
  },
  {
    id: "feat_006",
    name: "TikTok Reel-to-Blog",
    description:
      "Converts TikTok video content to written blog-style format. Extracts captions, transcribes narration, and generates a structured article.",
    targetApp: "tiktok.com",
    category: "content-enhancer",
    authorId: "user_005",
    authorName: "ContentMorph",
    code: {
      html: `<div id="naya-reel-to-blog" class="naya-overlay">\n  <button class="naya-convert-btn">Convert to Article</button>\n  <div class="naya-article-panel hidden">\n    <h2 class="naya-article-title"></h2>\n    <div class="naya-article-body"></div>\n    <div class="naya-article-actions">\n      <button class="naya-copy-btn">Copy</button>\n      <button class="naya-close-article">Close</button>\n    </div>\n  </div>\n</div>`,
      css: `.naya-convert-btn { position: fixed; bottom: 100px; right: 20px; background: #fe2c55; color: white; border: none; padding: 10px 20px; border-radius: 24px; font-size: 13px; font-weight: 600; cursor: pointer; z-index: 10000; }\n.naya-article-panel { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: white; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; padding: 24px; border-radius: 16px; box-shadow: 0 12px 48px rgba(0,0,0,0.2); z-index: 10001; }\n.naya-article-panel.hidden { display: none; }\n.naya-article-title { margin: 0 0 16px; font-size: 20px; }\n.naya-article-body { font-size: 15px; line-height: 1.7; color: #333; }\n.naya-article-actions { display: flex; gap: 8px; margin-top: 16px; }\n.naya-copy-btn, .naya-close-article { padding: 8px 16px; border-radius: 8px; border: 1px solid #ddd; background: white; cursor: pointer; font-size: 13px; }`,
      js: `(function() {\n  const el = document.getElementById("naya-reel-to-blog");\n  const convertBtn = el.querySelector(".naya-convert-btn");\n  const panel = el.querySelector(".naya-article-panel");\n  const title = el.querySelector(".naya-article-title");\n  const body = el.querySelector(".naya-article-body");\n\n  convertBtn.addEventListener("click", () => {\n    const caption = document.querySelector('[data-e2e="browse-video-desc"]')?.textContent || "Untitled Video";\n    const author = document.querySelector('[data-e2e="browse-username"]')?.textContent || "Unknown";\n    title.textContent = caption.substring(0, 80);\n    body.innerHTML = "<p><strong>By: " + author + "</strong></p>" +\n      "<p>" + caption + "</p>" +\n      "<p><em>Transcription would appear here with full AI processing enabled.</em></p>";\n    panel.classList.remove("hidden");\n  });\n\n  el.querySelector(".naya-copy-btn").addEventListener("click", () => {\n    navigator.clipboard.writeText(title.textContent + "\\n\\n" + body.textContent);\n  });\n  el.querySelector(".naya-close-article").addEventListener("click", () => panel.classList.add("hidden"));\n})();`,
    },
    triggerConditions: [
      { type: "url-match", value: "https://www.tiktok.com/*", description: "Activates on TikTok" },
      { type: "element-present", value: "video", description: "Waits for video content" },
    ],
    integrationHooks: [
      { type: "dom-observer", target: '[data-e2e="browse-video-desc"]', description: "Reads video captions" },
      { type: "api-call", target: "transcription-api", description: "Transcribes audio to text" },
    ],
    permissions: ["dom-read", "clipboard-write", "network-request"],
    tags: ["tiktok", "blog", "converter", "content", "transcription"],
    forkCount: 18,
    deployCount: 560,
    upvotes: 98,
    forkedFromId: null,
    status: "published",
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-03-05T13:45:00Z",
  },
  {
    id: "feat_007",
    name: "Gmail Smart Prioritizer",
    description:
      "Re-sorts your Gmail inbox by actual importance rather than arrival time. Analyzes sender history, email content, and your response patterns.",
    targetApp: "mail.google.com",
    category: "productivity",
    authorId: "user_006",
    authorName: "InboxZero",
    code: {
      html: `<div id="naya-gmail-prioritizer" class="naya-overlay">\n  <div class="naya-priority-bar">\n    <button class="naya-sort-btn active" data-sort="priority">Priority</button>\n    <button class="naya-sort-btn" data-sort="date">Date</button>\n    <button class="naya-sort-btn" data-sort="sender">Sender</button>\n  </div>\n</div>`,
      css: `.naya-priority-bar { position: fixed; top: 60px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; background: white; padding: 4px; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); z-index: 10000; }\n.naya-sort-btn { background: none; border: none; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; color: #666; }\n.naya-sort-btn.active { background: #1a73e8; color: white; }\n.naya-priority-high { border-left: 3px solid #ea4335 !important; }\n.naya-priority-medium { border-left: 3px solid #fbbc04 !important; }\n.naya-priority-low { border-left: 3px solid #34a853 !important; }`,
      js: `(function() {\n  const bar = document.querySelector(".naya-priority-bar");\n  const buttons = bar.querySelectorAll(".naya-sort-btn");\n\n  buttons.forEach(btn => {\n    btn.addEventListener("click", () => {\n      buttons.forEach(b => b.classList.remove("active"));\n      btn.classList.add("active");\n      sortInbox(btn.dataset.sort);\n    });\n  });\n\n  function sortInbox(mode) {\n    const rows = document.querySelectorAll("tr.zA");\n    rows.forEach((row, i) => {\n      const classes = ["naya-priority-high","naya-priority-medium","naya-priority-low"];\n      row.classList.remove(...classes);\n      if (mode === "priority") {\n        const priorityClass = classes[i % 3];\n        row.classList.add(priorityClass);\n      }\n    });\n  }\n\n  sortInbox("priority");\n})();`,
    },
    triggerConditions: [
      { type: "url-match", value: "https://mail.google.com/*", description: "Activates on Gmail" },
      { type: "element-present", value: "tr.zA", description: "Waits for inbox rows to load" },
    ],
    integrationHooks: [
      { type: "dom-observer", target: "tr.zA", description: "Watches inbox rows" },
      { type: "storage-access", target: "localStorage", description: "Stores sender priority scores locally" },
    ],
    permissions: ["dom-read", "dom-write", "storage-read", "storage-write"],
    tags: ["gmail", "email", "priority", "productivity", "inbox"],
    forkCount: 54,
    deployCount: 3200,
    upvotes: 678,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-10-01T07:30:00Z",
    updatedAt: "2026-03-10T16:00:00Z",
  },
  {
    id: "feat_008",
    name: "Spotify Mood Matcher",
    description:
      "Suggests playlist changes based on your current context: time of day, weather, recently browsed content. Adds a mood selector overlay to Spotify Web.",
    targetApp: "open.spotify.com",
    category: "entertainment",
    authorId: "user_007",
    authorName: "MoodTunes",
    code: {
      html: `<div id="naya-mood-matcher" class="naya-overlay">\n  <div class="naya-mood-selector">\n    <button class="naya-mood-btn" data-mood="energetic">Energetic</button>\n    <button class="naya-mood-btn" data-mood="chill">Chill</button>\n    <button class="naya-mood-btn" data-mood="focus">Focus</button>\n    <button class="naya-mood-btn" data-mood="happy">Happy</button>\n    <button class="naya-mood-btn" data-mood="melancholy">Melancholy</button>\n  </div>\n  <div class="naya-suggestions hidden">\n    <h4>Mood Suggestions</h4>\n    <ul class="naya-suggestion-list"></ul>\n  </div>\n</div>`,
      css: `.naya-mood-selector { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; background: #282828; padding: 8px; border-radius: 24px; z-index: 10000; }\n.naya-mood-btn { background: #404040; color: #b3b3b3; border: none; padding: 8px 16px; border-radius: 16px; font-size: 12px; cursor: pointer; transition: all 0.2s; }\n.naya-mood-btn:hover, .naya-mood-btn.active { background: #1db954; color: white; }\n.naya-suggestions { position: fixed; bottom: 160px; left: 50%; transform: translateX(-50%); background: #282828; padding: 16px; border-radius: 12px; min-width: 300px; z-index: 10000; }\n.naya-suggestions.hidden { display: none; }\n.naya-suggestions h4 { color: white; margin: 0 0 10px; font-size: 14px; }\n.naya-suggestion-list { list-style: none; padding: 0; margin: 0; }\n.naya-suggestion-list li { color: #b3b3b3; padding: 6px 0; font-size: 13px; cursor: pointer; }\n.naya-suggestion-list li:hover { color: #1db954; }`,
      js: `(function() {\n  const el = document.getElementById("naya-mood-matcher");\n  const buttons = el.querySelectorAll(".naya-mood-btn");\n  const suggestions = el.querySelector(".naya-suggestions");\n  const list = el.querySelector(".naya-suggestion-list");\n\n  const moodPlaylists = {\n    energetic: ["Workout Beats","Power Hour","Running Mix","High Energy EDM"],\n    chill: ["Lo-Fi Study","Evening Wind Down","Acoustic Calm","Jazz Vibes"],\n    focus: ["Deep Focus","Concentration","Instrumental Study","Brain Food"],\n    happy: ["Feel Good Friday","Sunny Day","Pop Hits","Good Vibes Only"],\n    melancholy: ["Sad Songs","Rainy Day","Emotional Acoustic","Reflective"],\n  };\n\n  buttons.forEach(btn => {\n    btn.addEventListener("click", () => {\n      buttons.forEach(b => b.classList.remove("active"));\n      btn.classList.add("active");\n      const mood = btn.dataset.mood;\n      const items = moodPlaylists[mood] || [];\n      list.innerHTML = items.map(p => "<li>" + p + "</li>").join("");\n      suggestions.classList.remove("hidden");\n    });\n  });\n})();`,
    },
    triggerConditions: [
      { type: "url-match", value: "https://open.spotify.com/*", description: "Activates on Spotify Web" },
      { type: "page-load", value: "complete", description: "Runs after page loads" },
    ],
    integrationHooks: [
      { type: "dom-observer", target: "[data-testid='now-playing-widget']", description: "Reads currently playing track" },
      { type: "api-call", target: "weather-api", description: "Fetches current weather for context" },
    ],
    permissions: ["dom-read", "network-request"],
    tags: ["spotify", "mood", "music", "playlist", "context"],
    forkCount: 29,
    deployCount: 1450,
    upvotes: 334,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-12-20T11:00:00Z",
    updatedAt: "2026-02-28T10:15:00Z",
  },
];

// Initialize seed data
for (const f of seedFeatures) {
  features.set(f.id, f);
}

// ---------------------------------------------------------------------------
// Public interface (mirrors a database service)
// ---------------------------------------------------------------------------

let featureCounter = seedFeatures.length;

function generateId(): string {
  featureCounter++;
  return `feat_${String(featureCounter).padStart(3, "0")}`;
}

export async function listFeatures(options?: {
  filter?: "trending" | "new" | "top";
  category?: FeatureCategory;
  targetApp?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Feature>> {
  let results = Array.from(features.values()).filter(
    (f) => f.status === "published"
  );

  if (options?.category) {
    results = results.filter((f) => f.category === options.category);
  }

  if (options?.targetApp) {
    results = results.filter((f) =>
      f.targetApp.toLowerCase().includes(options.targetApp!.toLowerCase())
    );
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    results = results.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.tags.some((t) => t.includes(q))
    );
  }

  // Sorting
  switch (options?.filter) {
    case "trending":
      results.sort(
        (a, b) =>
          b.deployCount + b.upvotes * 2 - (a.deployCount + a.upvotes * 2)
      );
      break;
    case "new":
      results.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "top":
      results.sort((a, b) => b.upvotes - a.upvotes);
      break;
    default:
      results.sort((a, b) => b.deployCount - a.deployCount);
  }

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const total = results.length;
  const start = (page - 1) * pageSize;
  const paged = results.slice(start, start + pageSize);

  return {
    success: true,
    data: paged,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getFeature(id: string): Promise<Feature | null> {
  return features.get(id) ?? null;
}

export async function createFeature(
  data: Omit<Feature, "id" | "forkCount" | "deployCount" | "upvotes" | "createdAt" | "updatedAt">
): Promise<Feature> {
  const now = new Date().toISOString();
  const feature: Feature = {
    ...data,
    id: generateId(),
    forkCount: 0,
    deployCount: 0,
    upvotes: 0,
    createdAt: now,
    updatedAt: now,
  };
  features.set(feature.id, feature);
  return feature;
}

export async function updateFeature(
  id: string,
  data: Partial<Pick<Feature, "name" | "description" | "code" | "triggerConditions" | "integrationHooks" | "permissions" | "tags" | "status" | "category">>
): Promise<Feature | null> {
  const existing = features.get(id);
  if (!existing) return null;
  const updated: Feature = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  features.set(id, updated);
  return updated;
}

export async function deleteFeature(id: string): Promise<boolean> {
  return features.delete(id);
}

export async function forkFeature(
  id: string,
  userId: string,
  userName: string
): Promise<Feature | null> {
  const original = features.get(id);
  if (!original) return null;

  original.forkCount++;
  features.set(id, original);

  const now = new Date().toISOString();
  const forked: Feature = {
    ...original,
    id: generateId(),
    name: `${original.name} (Fork)`,
    authorId: userId,
    authorName: userName,
    forkedFromId: id,
    forkCount: 0,
    deployCount: 0,
    upvotes: 0,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  features.set(forked.id, forked);
  return forked;
}

export async function incrementDeployCount(id: string): Promise<boolean> {
  const feature = features.get(id);
  if (!feature) return false;
  feature.deployCount++;
  features.set(id, feature);
  return true;
}

export async function getFeaturesByAuthor(authorId: string): Promise<Feature[]> {
  return Array.from(features.values()).filter((f) => f.authorId === authorId);
}
