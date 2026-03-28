// Shared types for the Naya platform

export interface Feature {
  id: string;
  name: string;
  description: string;
  targetApp: string;
  category: FeatureCategory;
  authorId: string;
  authorName: string;
  code: OverlayCode;
  triggerConditions: TriggerCondition[];
  integrationHooks: IntegrationHook[];
  permissions: string[];
  tags: string[];
  forkCount: number;
  deployCount: number;
  upvotes: number;
  forkedFromId: string | null;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

export type FeatureCategory =
  | "fact-checker"
  | "workflow-automator"
  | "content-enhancer"
  | "data-extractor"
  | "ui-modifier"
  | "accessibility"
  | "productivity"
  | "entertainment";

export interface OverlayCode {
  html: string;
  css: string;
  js: string;
}

export interface TriggerCondition {
  type: "url-match" | "element-present" | "page-load" | "user-action" | "schedule";
  value: string;
  description: string;
}

export interface IntegrationHook {
  type: "dom-observer" | "network-intercept" | "storage-access" | "api-call";
  target: string;
  description: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  ownerId: string;
  memberCount: number;
  featureIds: string[];
  pollIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Poll {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  description: string;
  options: PollOption[];
  status: "active" | "closed";
  endsAt: string;
  createdAt: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  voterIds: string[];
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  featureIds: string[];
  communityIds: string[];
  deployedFeatureIds: string[];
  reputation: number;
  createdAt: string;
}

export interface DeviceCapabilities {
  id: string;
  userId: string;
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
  supportedApis: string[];
  extensionsInstalled: string[];
  registeredAt: string;
}

export interface OverlayConfig {
  featureId: string;
  featureName: string;
  targetApp: string;
  enabled: boolean;
  code: OverlayCode;
  triggerConditions: TriggerCondition[];
  integrationHooks: IntegrationHook[];
  permissions: string[];
  userSettings: Record<string, unknown>;
}

export interface DeploymentRecord {
  id: string;
  featureId: string;
  userId: string;
  deviceId: string | null;
  status: "active" | "paused" | "removed";
  deployedAt: string;
}

// API response wrappers

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Generation types

export interface GenerateFeatureRequest {
  description: string;
  targetApp: string;
  desiredBehavior: string;
  category?: FeatureCategory;
}

export interface GeneratedFeature {
  name: string;
  description: string;
  targetApp: string;
  category: FeatureCategory;
  permissions: string[];
  code: OverlayCode;
  triggerConditions: TriggerCondition[];
  integrationHooks: IntegrationHook[];
  tags: string[];
}
