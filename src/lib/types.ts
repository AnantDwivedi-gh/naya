// ============================================================================
// NAYA — Core Type Definitions
// ============================================================================

// --- Feature System ---

export type FeatureStatus =
  | 'draft'
  | 'generating'
  | 'validating'
  | 'ready'
  | 'deployed'
  | 'archived';

export type FeaturePermission =
  | 'dom:read'
  | 'dom:write'
  | 'network:fetch'
  | 'storage:local'
  | 'clipboard:read'
  | 'clipboard:write'
  | 'notification';

export type CapabilityTier = 'minimal' | 'standard' | 'power';

export type OverlayPositionType = 'fixed' | 'relative' | 'floating' | 'sidebar' | 'fullscreen';

export type OverlayAnchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type OverlayPlacement = 'above' | 'below' | 'left' | 'right';

export type TriggerType =
  | 'page-load'
  | 'element-presence'
  | 'keyboard-shortcut'
  | 'context-menu'
  | 'selection'
  | 'scheduled';

export interface OverlayPosition {
  type: OverlayPositionType;
  anchor?: OverlayAnchor;
  offset?: { x: number; y: number };
  selector?: string;
  placement?: OverlayPlacement;
  defaultPosition?: { x: number; y: number };
  draggable?: boolean;
  side?: 'left' | 'right';
  width?: number;
}

export interface OverlayTrigger {
  type: TriggerType;
  /** CSS selector for element-presence trigger */
  selector?: string;
  /** Keyboard shortcut string, e.g. "Ctrl+Shift+N" */
  shortcut?: string;
  /** Interval in ms for scheduled trigger */
  interval?: number;
}

export interface OverlayConfig {
  position: OverlayPosition;
  size: { width: number; height: number };
  trigger: OverlayTrigger;
  permissions: FeaturePermission[];
  /** Z-index priority (higher = on top) */
  zIndex?: number;
  /** Whether the overlay can be resized by the user */
  resizable?: boolean;
  /** Whether the overlay can be minimized */
  minimizable?: boolean;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  /** The generated TSX code for this feature */
  code: string;
  /** ID of the user who created this feature */
  creatorId: string;
  /** Resolved creator profile (optional, joined) */
  creator?: User;
  status: FeatureStatus;
  /** Target app domain pattern, e.g. "*.instagram.com" */
  targetApp: string;
  overlayConfig: OverlayConfig;
  permissions: FeaturePermission[];
  version: number;
  /** ID of the feature this was forked from, if any */
  forkedFrom?: string;
  votes: number;
  forksCount: number;
  installs: number;
  minCapabilityTier: CapabilityTier;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureCreateInput {
  name: string;
  description: string;
  targetApp: string;
  prompt: string;
}

export interface FeatureGenerateRequest {
  prompt: string;
  targetApp: string;
  deviceCapabilities?: DeviceCapability;
  /** Existing code to refine (for iterative generation) */
  existingCode?: string;
  /** Refinement instruction (for iterative generation) */
  refinement?: string;
}

export interface FeatureGenerateResponse {
  code: string;
  overlayConfig: OverlayConfig;
  permissions: FeaturePermission[];
  minCapabilityTier: CapabilityTier;
  /** Warnings from validation */
  warnings: string[];
}

// --- User System ---

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  reputation: number;
  createdFeatureIds: string[];
  deployedFeatureIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  createdFeatures: Feature[];
  deployedFeatures: Feature[];
  communities: Community[];
}

// --- Community System ---

export type CommunityRole = 'member' | 'moderator' | 'admin';

export interface CommunityMember {
  userId: string;
  user?: User;
  role: CommunityRole;
  joinedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  creator?: User;
  memberCount: number;
  members?: CommunityMember[];
  polls?: Poll[];
  deployedFeatureIds: string[];
  deployedFeatures?: Feature[];
  createdAt: string;
}

export interface CommunityCreateInput {
  name: string;
  description?: string;
}

// --- Poll System ---

export type PollStatus = 'active' | 'passed' | 'rejected' | 'expired';

export type PollVoteType = 'approve' | 'reject' | 'suggest_changes';

export interface PollVote {
  pollId: string;
  userId: string;
  user?: User;
  vote: PollVoteType;
  comment?: string;
  createdAt: string;
}

export interface Poll {
  id: string;
  featureId: string;
  feature?: Feature;
  communityId: string;
  community?: Community;
  proposerId: string;
  proposer?: User;
  status: PollStatus;
  approveCount: number;
  rejectCount: number;
  thresholdPercent: number;
  deadline: string;
  votes?: PollVote[];
  createdAt: string;
}

export interface PollCreateInput {
  featureId: string;
  communityId: string;
  /** Deadline as ISO string */
  deadline: string;
  thresholdPercent?: number;
}

// --- Device Capability ---

export interface GPUInfo {
  renderer: string;
  vendor: string;
  tier: 'low' | 'mid' | 'high';
}

export interface ScreenSize {
  width: number;
  height: number;
  dpr: number;
}

export interface DeviceCapability {
  gpu: GPUInfo;
  /** RAM in GB (from navigator.deviceMemory) */
  ram: number;
  /** Whether WebNN / NPU is available */
  npu: boolean;
  browser: {
    name: string;
    version: string;
    engine: string;
  };
  screenSize: ScreenSize;
  /** Computed overall tier */
  tier: CapabilityTier;
}

// --- Runtime API Types ---

export interface SerializedElement {
  tagName: string;
  textContent: string;
  attributes: Record<string, string>;
  children: SerializedElement[];
  rect: { x: number; y: number; width: number; height: number };
}

export interface RuntimeMessage {
  type:
    | 'query-page'
    | 'get-page-text'
    | 'get-page-metadata'
    | 'get-state'
    | 'set-state'
    | 'fetch'
    | 'resize'
    | 'close'
    | 'minimize'
    | 'broadcast'
    | 'on-broadcast';
  id: string;
  payload: unknown;
}

export interface RuntimeResponse {
  id: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

// --- API Response Types ---

export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: {
    message: string;
    code: string;
    status: number;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// --- Filter & Sort ---

export interface FeatureFilters {
  status?: FeatureStatus;
  targetApp?: string;
  creatorId?: string;
  minCapabilityTier?: CapabilityTier;
  search?: string;
  sortBy?: 'votes' | 'installs' | 'forks' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
