import { GenerateFeatureRequest, GeneratedFeature, FeatureCategory } from "../data/types";
import { SYSTEM_PROMPT, buildGenerationPrompt } from "./prompts";
import { selectTemplate } from "./templates";

// ---------------------------------------------------------------------------
// Core AI engine: natural language -> feature specification -> overlay code
// ---------------------------------------------------------------------------

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

interface OpenAIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIChatResponse {
  id: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

/**
 * Calls the OpenAI Chat Completions API.
 * Requires OPENAI_API_KEY environment variable.
 */
async function callOpenAI(messages: OpenAIChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. AI generation requires an OpenAI API key."
    );
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenAI API error (${response.status}): ${errorBody}`
    );
  }

  const data = (await response.json()) as OpenAIChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }
  return content;
}

/**
 * Parses the AI response into a GeneratedFeature, falling back to template
 * defaults for any missing fields.
 */
function parseGeneratedFeature(
  raw: string,
  request: GenerateFeatureRequest
): GeneratedFeature {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned invalid JSON. Raw output: " + raw.slice(0, 500));
  }

  const category = (parsed.category as FeatureCategory) || request.category || "content-enhancer";
  const template = selectTemplate(category);

  const code = parsed.code as Record<string, string> | undefined;

  return {
    name: (parsed.name as string) || `Feature for ${request.targetApp}`,
    description: (parsed.description as string) || request.description,
    targetApp: (parsed.targetApp as string) || request.targetApp,
    category,
    permissions: (parsed.permissions as string[]) || template.permissions,
    code: {
      html: code?.html || template.code.html,
      css: code?.css || template.code.css,
      js: code?.js || template.code.js,
    },
    triggerConditions:
      (parsed.triggerConditions as GeneratedFeature["triggerConditions"]) ||
      template.triggerConditions,
    integrationHooks:
      (parsed.integrationHooks as GeneratedFeature["integrationHooks"]) ||
      template.integrationHooks,
    tags: (parsed.tags as string[]) || [request.targetApp.replace(/\.com$/, "")],
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a complete overlay feature from a natural language description.
 * This is the core generation pipeline:
 *   1. Build a category-aware prompt from the user's description
 *   2. Call OpenAI with structured output expectations
 *   3. Parse and validate the result
 *   4. Fill in any gaps from templates
 */
export async function generateFeature(
  request: GenerateFeatureRequest
): Promise<GeneratedFeature> {
  const userPrompt = buildGenerationPrompt(
    request.description,
    request.targetApp,
    request.desiredBehavior,
    request.category
  );

  const messages: OpenAIChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  const raw = await callOpenAI(messages);
  return parseGeneratedFeature(raw, request);
}

/**
 * Generate a feature using only local templates (no API call).
 * Useful as a fallback when the AI API is unavailable, or for previews.
 */
export function generateFeatureFromTemplate(
  request: GenerateFeatureRequest
): GeneratedFeature {
  const category: FeatureCategory = request.category || "content-enhancer";
  const template = selectTemplate(category);
  const appName = request.targetApp.replace(/\.com$/, "").replace(/\./g, " ");

  // Customize the template with request-specific details
  const customizedHtml = template.code.html
    .replace(/Naya Feature/g, `${appName} Feature`)
    .replace(/Feature Details/g, request.description.slice(0, 40));

  const customizedJs = template.code.js;

  const triggerConditions = [
    {
      type: "url-match" as const,
      value: `https://*${request.targetApp}/*`,
      description: `Activates on ${request.targetApp}`,
    },
    ...template.triggerConditions.filter((t) => t.type !== "url-match"),
  ];

  return {
    name: generateFeatureName(request.description, appName),
    description: request.description,
    targetApp: request.targetApp,
    category,
    permissions: template.permissions,
    code: {
      html: customizedHtml,
      css: template.code.css,
      js: customizedJs,
    },
    triggerConditions,
    integrationHooks: template.integrationHooks,
    tags: [
      appName.toLowerCase().replace(/\s+/g, "-"),
      category,
      ...extractKeywords(request.description),
    ],
  };
}

/**
 * Derive a short feature name from the description and target app.
 */
function generateFeatureName(description: string, appName: string): string {
  // Take the first meaningful phrase (up to 5 words)
  const words = description.split(/\s+/).slice(0, 5);
  const phrase = words.join(" ");
  const capitalized = phrase.charAt(0).toUpperCase() + phrase.slice(1);
  if (capitalized.toLowerCase().includes(appName.toLowerCase())) {
    return capitalized;
  }
  return `${appName.charAt(0).toUpperCase() + appName.slice(1)} ${capitalized}`;
}

/**
 * Extract a few keywords from text for tagging.
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "shall", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "and", "but", "or",
    "not", "no", "so", "if", "then", "than", "that", "this", "it", "its",
    "i", "me", "my", "we", "our", "you", "your", "they", "their",
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, 5);
}
