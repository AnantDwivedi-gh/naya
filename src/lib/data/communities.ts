import { Community, PaginatedResponse } from "./types";

const communities = new Map<string, Community>();

const seedCommunities: Community[] = [
  {
    id: "comm_001",
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
    id: "comm_002",
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
    id: "comm_003",
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

for (const c of seedCommunities) {
  communities.set(c.id, c);
}

let communityCounter = seedCommunities.length;

function generateId(): string {
  communityCounter++;
  return `comm_${String(communityCounter).padStart(3, "0")}`;
}

export async function listCommunities(options?: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Community>> {
  let results = Array.from(communities.values());

  if (options?.search) {
    const q = options.search.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q))
    );
  }

  results.sort((a, b) => b.memberCount - a.memberCount);

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const total = results.length;
  const start = (page - 1) * pageSize;
  const paged = results.slice(start, start + pageSize);

  return {
    success: true,
    data: paged,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getCommunity(id: string): Promise<Community | null> {
  return communities.get(id) ?? null;
}

export async function createCommunity(
  data: Omit<Community, "id" | "memberCount" | "featureIds" | "pollIds" | "createdAt" | "updatedAt">
): Promise<Community> {
  const now = new Date().toISOString();
  const community: Community = {
    ...data,
    id: generateId(),
    memberCount: 1,
    featureIds: [],
    pollIds: [],
    createdAt: now,
    updatedAt: now,
  };
  communities.set(community.id, community);
  return community;
}

export async function updateCommunity(
  id: string,
  data: Partial<Pick<Community, "name" | "description" | "iconUrl" | "tags">>
): Promise<Community | null> {
  const existing = communities.get(id);
  if (!existing) return null;
  const updated: Community = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  communities.set(id, updated);
  return updated;
}

export async function addFeatureToCommunity(
  communityId: string,
  featureId: string
): Promise<boolean> {
  const community = communities.get(communityId);
  if (!community) return false;
  if (!community.featureIds.includes(featureId)) {
    community.featureIds.push(featureId);
    community.updatedAt = new Date().toISOString();
    communities.set(communityId, community);
  }
  return true;
}

export async function addPollToCommunity(
  communityId: string,
  pollId: string
): Promise<boolean> {
  const community = communities.get(communityId);
  if (!community) return false;
  if (!community.pollIds.includes(pollId)) {
    community.pollIds.push(pollId);
    community.updatedAt = new Date().toISOString();
    communities.set(communityId, community);
  }
  return true;
}
