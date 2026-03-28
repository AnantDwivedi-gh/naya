import { OverlayCode, TriggerCondition, IntegrationHook } from "../data/types";

// ---------------------------------------------------------------------------
// Base overlay templates that the AI generation engine uses as starting points
// ---------------------------------------------------------------------------

export interface FeatureTemplate {
  name: string;
  description: string;
  code: OverlayCode;
  triggerConditions: TriggerCondition[];
  integrationHooks: IntegrationHook[];
  permissions: string[];
}

/**
 * Base overlay widget — minimal floating panel with open/close toggle.
 */
export const BASE_OVERLAY: FeatureTemplate = {
  name: "Base Overlay Widget",
  description: "A minimal floating overlay panel with toggle functionality.",
  code: {
    html: `<div id="naya-widget" class="naya-overlay">
  <button class="naya-toggle-btn" aria-label="Toggle Naya Widget">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
      <path d="M10 6v8M6 10h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </button>
  <div class="naya-panel hidden">
    <div class="naya-panel-header">
      <h3 class="naya-panel-title">Naya Feature</h3>
      <button class="naya-close-btn" aria-label="Close">&times;</button>
    </div>
    <div class="naya-panel-body">
      <!-- Feature content goes here -->
    </div>
    <div class="naya-panel-footer">
      <span class="naya-powered-by">Powered by Naya</span>
    </div>
  </div>
</div>`,
    css: `.naya-overlay {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.naya-toggle-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #6366f1;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.naya-toggle-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}
.naya-panel {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 360px;
  max-height: 480px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.naya-panel.hidden { display: none; }
.naya-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.naya-panel-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111;
}
.naya-close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.naya-close-btn:hover { color: #333; }
.naya-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.naya-panel-footer {
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}
.naya-powered-by {
  font-size: 11px;
  color: #aaa;
}`,
    js: `(function() {
  const widget = document.getElementById("naya-widget");
  const toggleBtn = widget.querySelector(".naya-toggle-btn");
  const panel = widget.querySelector(".naya-panel");
  const closeBtn = widget.querySelector(".naya-close-btn");

  toggleBtn.addEventListener("click", function() {
    panel.classList.toggle("hidden");
  });

  closeBtn.addEventListener("click", function() {
    panel.classList.add("hidden");
  });

  // Close when clicking outside
  document.addEventListener("click", function(e) {
    if (!widget.contains(e.target)) {
      panel.classList.add("hidden");
    }
  });
})();`,
  },
  triggerConditions: [
    {
      type: "page-load",
      value: "complete",
      description: "Loads after page is ready",
    },
  ],
  integrationHooks: [
    {
      type: "dom-observer",
      target: "body",
      description: "Observes DOM changes",
    },
  ],
  permissions: ["dom-read"],
};

/**
 * Badge / indicator overlay — attaches badges near specific elements.
 */
export const BADGE_OVERLAY: FeatureTemplate = {
  name: "Badge Overlay",
  description:
    "Attaches informational badges next to target elements on the page.",
  code: {
    html: `<div id="naya-badge-container" class="naya-overlay">
  <!-- Badges are dynamically injected next to target elements -->
</div>
<template id="naya-badge-template">
  <span class="naya-badge" data-naya-badge>
    <span class="naya-badge-dot"></span>
    <span class="naya-badge-text"></span>
  </span>
</template>`,
    css: `.naya-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: opacity 0.2s;
  vertical-align: middle;
  margin-left: 6px;
}
.naya-badge:hover { opacity: 0.8; }
.naya-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.naya-badge.naya-badge-success { background: #d4edda; color: #155724; }
.naya-badge.naya-badge-success .naya-badge-dot { background: #28a745; }
.naya-badge.naya-badge-warning { background: #fff3cd; color: #856404; }
.naya-badge.naya-badge-warning .naya-badge-dot { background: #ffc107; }
.naya-badge.naya-badge-danger { background: #f8d7da; color: #721c24; }
.naya-badge.naya-badge-danger .naya-badge-dot { background: #dc3545; }
.naya-badge.naya-badge-info { background: #d1ecf1; color: #0c5460; }
.naya-badge.naya-badge-info .naya-badge-dot { background: #17a2b8; }`,
    js: `(function() {
  const template = document.getElementById("naya-badge-template");

  function createBadge(text, variant) {
    const clone = template.content.cloneNode(true);
    const badge = clone.querySelector(".naya-badge");
    badge.classList.add("naya-badge-" + (variant || "info"));
    badge.querySelector(".naya-badge-text").textContent = text;
    return badge;
  }

  function attachBadges(selector, evaluator) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(function(el) {
      if (el.querySelector("[data-naya-badge]")) return;
      var result = evaluator(el);
      if (result) {
        el.appendChild(createBadge(result.text, result.variant));
      }
    });
  }

  // Expose for feature-specific logic
  window.__nayaBadge = { createBadge: createBadge, attachBadges: attachBadges };
})();`,
  },
  triggerConditions: [
    {
      type: "element-present",
      value: "[data-target-selector]",
      description: "Waits for target elements",
    },
  ],
  integrationHooks: [
    {
      type: "dom-observer",
      target: "[data-target-selector]",
      description: "Watches for new elements to badge",
    },
  ],
  permissions: ["dom-read", "dom-write"],
};

/**
 * Sidebar panel — slides in from the right with detailed content.
 */
export const SIDEBAR_OVERLAY: FeatureTemplate = {
  name: "Sidebar Overlay",
  description: "A slide-in sidebar panel for displaying detailed information.",
  code: {
    html: `<div id="naya-sidebar" class="naya-overlay">
  <button class="naya-sidebar-trigger" aria-label="Open Naya Sidebar">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="2" width="14" height="2" rx="1"/>
      <rect x="1" y="7" width="14" height="2" rx="1"/>
      <rect x="1" y="12" width="14" height="2" rx="1"/>
    </svg>
  </button>
  <div class="naya-sidebar-panel closed">
    <div class="naya-sidebar-header">
      <h3 class="naya-sidebar-title">Feature Details</h3>
      <button class="naya-sidebar-close" aria-label="Close">&times;</button>
    </div>
    <div class="naya-sidebar-content">
      <!-- Sidebar content goes here -->
    </div>
  </div>
  <div class="naya-sidebar-backdrop closed"></div>
</div>`,
    css: `.naya-sidebar-trigger {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 32px;
  height: 48px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  transition: width 0.2s;
}
.naya-sidebar-trigger:hover { width: 36px; }
.naya-sidebar-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 24px rgba(0,0,0,0.1);
  z-index: 10001;
  transform: translateX(0);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}
.naya-sidebar-panel.closed { transform: translateX(100%); }
.naya-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.naya-sidebar-title { margin: 0; font-size: 16px; font-weight: 600; }
.naya-sidebar-close { background: none; border: none; font-size: 24px; color: #999; cursor: pointer; }
.naya-sidebar-content { flex: 1; overflow-y: auto; padding: 20px; }
.naya-sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 10000;
  transition: opacity 0.3s;
}
.naya-sidebar-backdrop.closed { display: none; }`,
    js: `(function() {
  var sidebar = document.getElementById("naya-sidebar");
  var trigger = sidebar.querySelector(".naya-sidebar-trigger");
  var panel = sidebar.querySelector(".naya-sidebar-panel");
  var closeBtn = sidebar.querySelector(".naya-sidebar-close");
  var backdrop = sidebar.querySelector(".naya-sidebar-backdrop");

  function open() {
    panel.classList.remove("closed");
    backdrop.classList.remove("closed");
    trigger.style.display = "none";
  }
  function close() {
    panel.classList.add("closed");
    backdrop.classList.add("closed");
    trigger.style.display = "";
  }

  trigger.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", function(e) { if (e.key === "Escape") close(); });
})();`,
  },
  triggerConditions: [
    {
      type: "page-load",
      value: "complete",
      description: "Loads after page is ready",
    },
  ],
  integrationHooks: [
    {
      type: "dom-observer",
      target: "body",
      description: "Observes page content",
    },
  ],
  permissions: ["dom-read"],
};

/**
 * Inline annotation overlay — adds annotations near specific text or elements.
 */
export const INLINE_ANNOTATION: FeatureTemplate = {
  name: "Inline Annotation",
  description: "Adds contextual annotations near specific content elements.",
  code: {
    html: `<div id="naya-annotations" class="naya-overlay">
  <div class="naya-annotation-tooltip hidden">
    <div class="naya-tooltip-content"></div>
    <div class="naya-tooltip-arrow"></div>
  </div>
</div>`,
    css: `.naya-annotated {
  background: rgba(99, 102, 241, 0.1);
  border-bottom: 2px dashed #6366f1;
  cursor: help;
  transition: background 0.2s;
}
.naya-annotated:hover { background: rgba(99, 102, 241, 0.2); }
.naya-annotation-tooltip {
  position: fixed;
  max-width: 300px;
  background: #1a1a2e;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  z-index: 10001;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  pointer-events: none;
}
.naya-annotation-tooltip.hidden { display: none; }
.naya-tooltip-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #1a1a2e;
}`,
    js: `(function() {
  var tooltip = document.querySelector(".naya-annotation-tooltip");
  var tooltipContent = tooltip.querySelector(".naya-tooltip-content");

  function annotate(element, text) {
    element.classList.add("naya-annotated");
    element.dataset.nayaAnnotation = text;
  }

  document.addEventListener("mouseover", function(e) {
    var target = e.target.closest(".naya-annotated");
    if (!target) return;
    tooltipContent.textContent = target.dataset.nayaAnnotation;
    var rect = target.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px";
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + "px";
    tooltip.classList.remove("hidden");
  });

  document.addEventListener("mouseout", function(e) {
    if (!e.target.closest(".naya-annotated")) {
      tooltip.classList.add("hidden");
    }
  });

  window.__nayaAnnotate = annotate;
})();`,
  },
  triggerConditions: [
    {
      type: "element-present",
      value: "[data-annotate-target]",
      description: "Waits for annotatable elements",
    },
  ],
  integrationHooks: [
    {
      type: "dom-observer",
      target: "[data-annotate-target]",
      description: "Watches for new content to annotate",
    },
  ],
  permissions: ["dom-read", "dom-write"],
};

// Map template names for lookup
export const TEMPLATES: Record<string, FeatureTemplate> = {
  base: BASE_OVERLAY,
  badge: BADGE_OVERLAY,
  sidebar: SIDEBAR_OVERLAY,
  annotation: INLINE_ANNOTATION,
};

/**
 * Select the most appropriate template based on the feature category.
 */
export function selectTemplate(category: string): FeatureTemplate {
  switch (category) {
    case "fact-checker":
    case "data-extractor":
      return BADGE_OVERLAY;
    case "content-enhancer":
    case "accessibility":
      return INLINE_ANNOTATION;
    case "workflow-automator":
    case "productivity":
      return SIDEBAR_OVERLAY;
    default:
      return BASE_OVERLAY;
  }
}
