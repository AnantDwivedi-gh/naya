import { User } from "./types";

const users = new Map<string, User>();

const seedUsers: User[] = [
  {
    id: "user_001",
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
    id: "user_002",
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
    id: "user_003",
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
    id: "user_004",
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
    id: "user_005",
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
    id: "user_006",
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
    id: "user_007",
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

for (const u of seedUsers) {
  users.set(u.id, u);
}

export async function getUser(id: string): Promise<User | null> {
  return users.get(id) ?? null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return (
    Array.from(users.values()).find((u) => u.username === username) ?? null
  );
}

export async function createUser(
  data: Omit<User, "id" | "featureIds" | "communityIds" | "deployedFeatureIds" | "reputation" | "createdAt">
): Promise<User> {
  const id = `user_${String(users.size + 1).padStart(3, "0")}`;
  const user: User = {
    ...data,
    id,
    featureIds: [],
    communityIds: [],
    deployedFeatureIds: [],
    reputation: 0,
    createdAt: new Date().toISOString(),
  };
  users.set(user.id, user);
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, "displayName" | "avatarUrl" | "bio">>
): Promise<User | null> {
  const existing = users.get(id);
  if (!existing) return null;
  const updated: User = { ...existing, ...data };
  users.set(id, updated);
  return updated;
}

export async function addFeatureToUser(
  userId: string,
  featureId: string
): Promise<boolean> {
  const user = users.get(userId);
  if (!user) return false;
  if (!user.featureIds.includes(featureId)) {
    user.featureIds.push(featureId);
    users.set(userId, user);
  }
  return true;
}

export async function addDeployedFeature(
  userId: string,
  featureId: string
): Promise<boolean> {
  const user = users.get(userId);
  if (!user) return false;
  if (!user.deployedFeatureIds.includes(featureId)) {
    user.deployedFeatureIds.push(featureId);
    users.set(userId, user);
  }
  return true;
}

export async function removeDeployedFeature(
  userId: string,
  featureId: string
): Promise<boolean> {
  const user = users.get(userId);
  if (!user) return false;
  user.deployedFeatureIds = user.deployedFeatureIds.filter(
    (id) => id !== featureId
  );
  users.set(userId, user);
  return true;
}
