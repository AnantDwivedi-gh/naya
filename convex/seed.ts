import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingFeature = await ctx.db
      .query("features")
      .withIndex("by_featureId", (q) => q.eq("featureId", "feat_001"))
      .unique();
    if (existingFeature) {
      return { success: false, message: "Database already seeded" };
    }

    // -----------------------------------------------------------------------
    // Seed Users
    // -----------------------------------------------------------------------
    const seedUsers = [
      {
        userId: "user_001",
        username: "verifybot",
        displayName: "VerifyBot",
        avatarUrl: "/avatars/verifybot.png",
        bio: "Building trust in social media, one fact-check at a time.",
        featureIds: ["feat_001"],
        communityIds: ["comm_001"],
        deployedFeatureIds: ["feat_002", "feat_007"],
        reputation: 1540,
        createdAt: "2025-08-15T00:00:00Z",
      },
      {
        userId: "user_002",
        username: "threadwise",
        displayName: "ThreadWise",
        avatarUrl: "/avatars/threadwise.png",
        bio: "NLP enthusiast. Making long-form content accessible.",
        featureIds: ["feat_002", "feat_005"],
        communityIds: ["comm_001"],
        deployedFeatureIds: ["feat_001", "feat_003"],
        reputation: 2340,
        createdAt: "2025-08-20T00:00:00Z",
      },
      {
        userId: "user_003",
        username: "adfreey",
        displayName: "AdFreeYT",
        avatarUrl: "/avatars/adfreey.png",
        bio: "Your time is valuable. Let me help you reclaim it.",
        featureIds: ["feat_003"],
        communityIds: ["comm_002"],
        deployedFeatureIds: ["feat_007", "feat_008"],
        reputation: 4120,
        createdAt: "2025-07-01T00:00:00Z",
      },
      {
        userId: "user_004",
        username: "cleanfeed",
        displayName: "CleanFeed",
        avatarUrl: "/avatars/cleanfeed.png",
        bio: "Better formatting, better reading. LinkedIn deserves better.",
        featureIds: ["feat_004"],
        communityIds: ["comm_001"],
        deployedFeatureIds: ["feat_002"],
        reputation: 670,
        createdAt: "2025-11-01T00:00:00Z",
      },
      {
        userId: "user_005",
        username: "contentmorph",
        displayName: "ContentMorph",
        avatarUrl: "/avatars/contentmorph.png",
        bio: "Transforming content across formats. Video to text and beyond.",
        featureIds: ["feat_006"],
        communityIds: ["comm_003"],
        deployedFeatureIds: ["feat_001", "feat_008"],
        reputation: 450,
        createdAt: "2025-12-10T00:00:00Z",
      },
      {
        userId: "user_006",
        username: "inboxzero",
        displayName: "InboxZero",
        avatarUrl: "/avatars/inboxzero.png",
        bio: "Email productivity evangelist. Zero inbox, zero stress.",
        featureIds: ["feat_007"],
        communityIds: ["comm_002"],
        deployedFeatureIds: ["feat_003"],
        reputation: 3100,
        createdAt: "2025-09-20T00:00:00Z",
      },
      {
        userId: "user_007",
        username: "moodtunes",
        displayName: "MoodTunes",
        avatarUrl: "/avatars/moodtunes.png",
        bio: "Music should match your moment. Context-aware playlists.",
        featureIds: ["feat_008"],
        communityIds: ["comm_003"],
        deployedFeatureIds: ["feat_006"],
        reputation: 1890,
        createdAt: "2025-11-15T00:00:00Z",
      },
    ];

    for (const user of seedUsers) {
      await ctx.db.insert("users", user);
    }

    // -----------------------------------------------------------------------
    // Seed Features
    // -----------------------------------------------------------------------
    const seedFeatures = [
      {
        featureId: "feat_001",
        name: "Instagram Fact Checker",
        description:
          "Overlays fact-check badges on Instagram posts by cross-referencing claims with trusted databases. Highlights misleading captions and provides verified context.",
        targetApp: "instagram.com",
        category: "fact-checker" as const,
        authorId: "user_001",
        authorName: "VerifyBot",
        code: {
          html: '<div id="naya-fact-checker" class="naya-overlay"><div class="naya-badge" data-status="unknown"><span class="naya-badge-icon"></span><span class="naya-badge-label">Checking...</span></div></div>',
          css: ".naya-overlay { position: fixed; z-index: 10000; }",
          js: '(function() { console.log("Fact checker loaded"); })();',
        },
        triggerConditions: [
          { type: "url-match" as const, value: "https://www.instagram.com/*", description: "Activates on Instagram pages" },
          { type: "element-present" as const, value: "article", description: "Waits for post articles to load" },
        ],
        integrationHooks: [
          { type: "dom-observer" as const, target: "article", description: "Monitors new posts appearing in feed" },
          { type: "api-call" as const, target: "fact-check-api", description: "Queries fact-check database" },
        ],
        permissions: ["dom-read", "network-request"],
        tags: ["fact-check", "misinformation", "social-media", "instagram"],
        forkCount: 42,
        deployCount: 1580,
        upvotes: 312,
        forkedFromId: null,
        status: "published" as const,
        createdAt: "2025-11-15T10:30:00Z",
        updatedAt: "2026-02-20T14:15:00Z",
      },
      {
        featureId: "feat_002",
        name: "Twitter Thread Summarizer",
        description:
          "Collapses long Twitter/X threads into concise key-point summaries. Uses NLP to extract the main arguments and presents them in a clean overlay card.",
        targetApp: "x.com",
        category: "content-enhancer" as const,
        authorId: "user_002",
        authorName: "ThreadWise",
        code: {
          html: '<div id="naya-thread-summary" class="naya-overlay"><button class="naya-summarize-btn">Summarize Thread</button></div>',
          css: ".naya-summarize-btn { background: #1d9bf0; color: white; border: none; padding: 8px 16px; border-radius: 20px; }",
          js: '(function() { console.log("Thread summarizer loaded"); })();',
        },
        triggerConditions: [
          { type: "url-match" as const, value: "https://x.com/*/status/*", description: "Activates on tweet detail pages" },
          { type: "element-present" as const, value: '[data-testid="tweetText"]', description: "Waits for tweet content" },
        ],
        integrationHooks: [
          { type: "dom-observer" as const, target: '[data-testid="tweetText"]', description: "Reads tweet content from DOM" },
        ],
        permissions: ["dom-read"],
        tags: ["twitter", "threads", "summarizer", "nlp", "x"],
        forkCount: 67,
        deployCount: 2340,
        upvotes: 489,
        forkedFromId: null,
        status: "published" as const,
        createdAt: "2025-10-20T08:00:00Z",
        updatedAt: "2026-01-10T11:45:00Z",
      },
      {
        featureId: "feat_003",
        name: "YouTube Ad Skipper Workflow",
        description:
          "Automatically detects ad segments in YouTube videos and marks them on the progress bar. Provides one-click skip.",
        targetApp: "youtube.com",
        category: "workflow-automator" as const,
        authorId: "user_003",
        authorName: "AdFreeYT",
        code: {
          html: '<div id="naya-ad-skipper" class="naya-overlay"><div class="naya-ad-indicator hidden"><span class="naya-ad-label">Ad Segment Detected</span><button class="naya-skip-btn">Skip</button></div></div>',
          css: ".naya-ad-indicator { position: fixed; bottom: 80px; right: 20px; }",
          js: '(function() { console.log("Ad skipper loaded"); })();',
        },
        triggerConditions: [
          { type: "url-match" as const, value: "https://www.youtube.com/watch*", description: "Activates on YouTube watch pages" },
          { type: "element-present" as const, value: "video", description: "Waits for the video player" },
        ],
        integrationHooks: [
          { type: "dom-observer" as const, target: "video", description: "Monitors video element for ad detection" },
        ],
        permissions: ["dom-read", "dom-write"],
        tags: ["youtube", "ads", "skipper", "workflow", "video"],
        forkCount: 156,
        deployCount: 8920,
        upvotes: 1204,
        forkedFromId: null,
        status: "published" as const,
        createdAt: "2025-09-05T14:20:00Z",
        updatedAt: "2026-03-01T09:30:00Z",
      },
      {
        featureId: "feat_004",
        name: "LinkedIn Post Formatter",
        description:
          "Reformats LinkedIn posts for better readability. Removes excessive line breaks, highlights key metrics, and structures posts with proper headings.",
        targetApp: "linkedin.com",
        category: "content-enhancer" as const,
        authorId: "user_004",
        authorName: "CleanFeed",
        code: {
          html: '<div id="naya-linkedin-formatter" class="naya-overlay"><button class="naya-format-toggle">Format Posts</button></div>',
          css: ".naya-format-toggle { position: fixed; bottom: 20px; right: 20px; background: #0077b5; color: white; }",
          js: '(function() { console.log("LinkedIn formatter loaded"); })();',
        },
        triggerConditions: [
          { type: "url-match" as const, value: "https://www.linkedin.com/feed*", description: "Activates on LinkedIn feed" },
          { type: "page-load" as const, value: "complete", description: "Runs after page loads" },
        ],
        integrationHooks: [
          { type: "dom-observer" as const, target: ".feed-shared-update-v2", description: "Watches for new posts in feed" },
        ],
        permissions: ["dom-read", "dom-write"],
        tags: ["linkedin", "formatter", "readability", "productivity"],
        forkCount: 23,
        deployCount: 890,
        upvotes: 145,
        forkedFromId: null,
        status: "published" as const,
        createdAt: "2025-12-01T16:00:00Z",
        updatedAt: "2026-02-15T08:20:00Z",
      },
      {
        featureId: "feat_005",
        name: "Reddit Comment Sentiment",
        description:
          "Color-codes Reddit comments by sentiment. Green for positive, red for negative, yellow for neutral.",
        targetApp: "reddit.com",
        category: "data-extractor" as const,
        authorId: "user_002",
        authorName: "ThreadWise",
        code: {
          html: '<div id="naya-sentiment" class="naya-overlay"><div class="naya-sentiment-legend"></div></div>',
          css: ".naya-sentiment-legend { position: fixed; top: 70px; right: 20px; }",
          js: '(function() { console.log("Sentiment analyzer loaded"); })();',
        },
        triggerConditions: [
          { type: "url-match" as const, value: "https://www.reddit.com/r/*/comments/*", description: "Activates on Reddit comment pages" },
          { type: "element-present" as const, value: '[data-testid="comment"]', description: "Waits for comments to load" },
        ],
        integrationHooks: [
          { type: "dom-observer" as const, target: '[data-testid="comment"]', description: "Watches for new comments" },
        ],
        permissions: ["dom-read", "dom-write"],
        tags: ["reddit", "sentiment", "analysis", "comments", "nlp"],
        forkCount: 31,
        deployCount: 1120,
        upvotes: 267,
        forkedFromId: null,
        status: "published" as const,
        createdAt: "2025-11-28T12:00:00Z",
        updatedAt: "2026-01-22T15:30:00Z",
      },
      {
        featureId: "feat_006",
        name: "TikTok Reel-to-Blog",
        description:
          "Converts TikTok video content to written blog-style format. Extracts captions, transcribes narration, and generates a structured article.",
        targetApp: "tiktok.com",
        category: "content-enhancer" as const,
        authorId: "user_005",
        authorName: "ContentMorph",
        code: {
          html: '<div id="naya-reel-to-blog" class="naya-overlay"><button class="naya-convert-btn">Convert to Article</button></div>',
          css: ".naya-convert-btn { position: fixed; bottom: 100px; right: 20px; background: #fe2c55; color: white; }",
          js: '(function() { console.log("Reel to blog loaded"); })();',
        },
        triggerConditions: [
          { type: "url-match" as const, value: "https://www.tiktok.com/*", description: "Activates on TikTok" },
          { type: "element-present" as const, value: "video", description: "Waits for video content" },
        ],
        integrationHooks: [
          { type: "dom-observer" as const, target: '[data-e2e="browse-video-desc"]', description: "Reads video captions" },
          { type: "api-call" as const, target: "transcription-api", description: "Transcribes audio to text" },
        ],
        permissions: ["dom-read", "clipboard-write", "network-request"],
        tags: ["tiktok", "blog", "converter", "content", "transcription"],
        forkCount: 18,
        deployCount: 560,
        upvotes: 98,
        forkedFromId: null,
        status: "published" as const,
        createdAt: "2026-01-10T09:00:00Z",
        updatedAt: "2026-03-05T13:45:00Z",
      },
      {
        featureId: "feat_007",
        name: "Gmail Smart Prioritizer",
        description:
          "Re-sorts your Gmail inbox by actual importance rather than arrival time. Analyzes sender history, email content, and your response patterns.",
        targetApp: "mail.google.com",
        category: "productivity" as const,
        authorId: "user_006",
        authorName: "InboxZero",
        code: {
          html: '<div id="naya-gmail-prioritizer" class="naya-overlay"><div class="naya-priority-bar"></div></div>',
          css: ".naya-priority-bar { position: fixed; top: 60px; left: 50%; }",
          js: '(function() { console.log("Gmail prioritizer loaded"); })();',
        },
        triggerConditions: [
          { type: "url-match" as const, value: "https://mail.google.com/*", description: "Activates on Gmail" },
          { type: "element-present" as const, value: "tr.zA", description: "Waits for inbox rows to load" },
        ],
        integrationHooks: [
          { type: "dom-observer" as const, target: "tr.zA", description: "Watches inbox rows" },
          { type: "storage-access" as const, target: "localStorage", description: "Stores sender priority scores locally" },
        ],
        permissions: ["dom-read", "dom-write", "storage-read", "storage-write"],
        tags: ["gmail", "email", "priority", "productivity", "inbox"],
        forkCount: 54,
        deployCount: 3200,
        upvotes: 678,
        forkedFromId: null,
        status: "published" as const,
        createdAt: "2025-10-01T07:30:00Z",
        updatedAt: "2026-03-10T16:00:00Z",
      },
      {
        featureId: "feat_008",
        name: "Spotify Mood Matcher",
        description:
          "Suggests playlist changes based on your current context: time of day, weather, recently browsed content.",
        targetApp: "open.spotify.com",
        category: "entertainment" as const,
        authorId: "user_007",
        authorName: "MoodTunes",
        code: {
          html: '<div id="naya-mood-matcher" class="naya-overlay"><div class="naya-mood-selector"></div></div>',
          css: ".naya-mood-selector { position: fixed; bottom: 100px; left: 50%; }",
          js: '(function() { console.log("Mood matcher loaded"); })();',
        },
        triggerConditions: [
          { type: "url-match" as const, value: "https://open.spotify.com/*", description: "Activates on Spotify Web" },
          { type: "page-load" as const, value: "complete", description: "Runs after page loads" },
        ],
        integrationHooks: [
          { type: "dom-observer" as const, target: "[data-testid='now-playing-widget']", description: "Reads currently playing track" },
          { type: "api-call" as const, target: "weather-api", description: "Fetches current weather for context" },
        ],
        permissions: ["dom-read", "network-request"],
        tags: ["spotify", "mood", "music", "playlist", "context"],
        forkCount: 29,
        deployCount: 1450,
        upvotes: 334,
        forkedFromId: null,
        status: "published" as const,
        createdAt: "2025-12-20T11:00:00Z",
        updatedAt: "2026-02-28T10:15:00Z",
      },
    ];

    for (const feature of seedFeatures) {
      await ctx.db.insert("features", feature);
    }

    // -----------------------------------------------------------------------
    // Seed Communities
    // -----------------------------------------------------------------------
    const seedCommunities = [
      {
        communityId: "comm_001",
        name: "Social Media Enhancers",
        description:
          "Features that improve social media platforms — fact-checkers, formatters, summarizers, and more.",
        iconUrl: "/icons/social.svg",
        ownerId: "user_001",
        memberCount: 4520,
        featureIds: ["feat_001", "feat_002", "feat_004", "feat_005"],
        pollIds: ["poll_001", "poll_002"],
        tags: ["social-media", "instagram", "twitter", "linkedin", "reddit"],
        createdAt: "2025-09-01T00:00:00Z",
        updatedAt: "2026-03-15T12:00:00Z",
      },
      {
        communityId: "comm_002",
        name: "Productivity Boosters",
        description:
          "Features focused on getting more done: email prioritizers, workflow automators, and smart tools.",
        iconUrl: "/icons/productivity.svg",
        ownerId: "user_006",
        memberCount: 3180,
        featureIds: ["feat_003", "feat_007"],
        pollIds: ["poll_003"],
        tags: ["productivity", "email", "workflow", "automation"],
        createdAt: "2025-09-15T00:00:00Z",
        updatedAt: "2026-03-10T08:00:00Z",
      },
      {
        communityId: "comm_003",
        name: "Entertainment Mods",
        description:
          "Make your entertainment apps better — mood matchers, content converters, and discovery tools.",
        iconUrl: "/icons/entertainment.svg",
        ownerId: "user_007",
        memberCount: 2740,
        featureIds: ["feat_006", "feat_008"],
        pollIds: [],
        tags: ["entertainment", "spotify", "tiktok", "youtube", "music"],
        createdAt: "2025-10-10T00:00:00Z",
        updatedAt: "2026-02-20T14:00:00Z",
      },
    ];

    for (const community of seedCommunities) {
      await ctx.db.insert("communities", community);
    }

    // -----------------------------------------------------------------------
    // Seed Polls
    // -----------------------------------------------------------------------
    const seedPolls = [
      {
        pollId: "poll_001",
        communityId: "comm_001",
        authorId: "user_001",
        title: "Which social platform should we build features for next?",
        description:
          "We have strong coverage on Instagram and Twitter. Help us decide where to focus next.",
        options: [
          { id: "opt_001a", label: "Threads (Meta)", votes: 234, voterIds: [] as string[] },
          { id: "opt_001b", label: "Mastodon", votes: 89, voterIds: [] as string[] },
          { id: "opt_001c", label: "Bluesky", votes: 312, voterIds: [] as string[] },
          { id: "opt_001d", label: "Pinterest", votes: 67, voterIds: [] as string[] },
        ],
        status: "active" as const,
        endsAt: "2026-04-15T00:00:00Z",
        createdAt: "2026-03-01T10:00:00Z",
      },
      {
        pollId: "poll_002",
        communityId: "comm_001",
        authorId: "user_002",
        title: "Most wanted feature type for Reddit?",
        description: "What kind of overlay feature would you most want on Reddit?",
        options: [
          { id: "opt_002a", label: "Auto-TLDR for long posts", votes: 445, voterIds: [] as string[] },
          { id: "opt_002b", label: "User reputation scores", votes: 312, voterIds: [] as string[] },
          { id: "opt_002c", label: "Thread visualizer", votes: 198, voterIds: [] as string[] },
          { id: "opt_002d", label: "Duplicate post detector", votes: 156, voterIds: [] as string[] },
        ],
        status: "active" as const,
        endsAt: "2026-04-10T00:00:00Z",
        createdAt: "2026-02-20T14:00:00Z",
      },
      {
        pollId: "poll_003",
        communityId: "comm_002",
        authorId: "user_006",
        title: "Next productivity integration?",
        description:
          "Which productivity tool should we target with our next overlay feature?",
        options: [
          { id: "opt_003a", label: "Notion", votes: 567, voterIds: [] as string[] },
          { id: "opt_003b", label: "Slack", votes: 423, voterIds: [] as string[] },
          { id: "opt_003c", label: "Google Calendar", votes: 389, voterIds: [] as string[] },
          { id: "opt_003d", label: "Trello / Jira", votes: 234, voterIds: [] as string[] },
        ],
        status: "active" as const,
        endsAt: "2026-04-20T00:00:00Z",
        createdAt: "2026-03-05T09:00:00Z",
      },
    ];

    for (const poll of seedPolls) {
      await ctx.db.insert("polls", poll);
    }

    return {
      success: true,
      message: "Database seeded with 8 features, 3 communities, 7 users, and 3 polls",
    };
  },
});
