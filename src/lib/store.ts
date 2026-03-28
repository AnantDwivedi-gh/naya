import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Feature,
  FeatureStatus,
  FeatureFilters,
  User,
  Community,
  CommunityMember,
  Poll,
  PollVoteType,
  DeviceCapability,
  CapabilityTier,
  OverlayConfig,
} from './types';

// ============================================================================
// Slice Interfaces
// ============================================================================

interface FeatureSlice {
  features: Record<string, Feature>;
  featureIds: string[];
  activeFeatureId: string | null;
  filters: FeatureFilters;
  generatingFeatureId: string | null;

  // Actions
  setFeatures: (features: Feature[]) => void;
  addFeature: (feature: Feature) => void;
  updateFeature: (id: string, updates: Partial<Feature>) => void;
  removeFeature: (id: string) => void;
  setActiveFeature: (id: string | null) => void;
  setFilters: (filters: Partial<FeatureFilters>) => void;
  resetFilters: () => void;
  setGenerating: (id: string | null) => void;
  updateFeatureStatus: (id: string, status: FeatureStatus) => void;
  incrementVotes: (id: string) => void;
  incrementForks: (id: string) => void;
  incrementInstalls: (id: string) => void;
}

interface UserSlice {
  currentUser: User | null;
  users: Record<string, User>;
  isAuthenticated: boolean;

  // Actions
  setCurrentUser: (user: User | null) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  addUser: (user: User) => void;
  setUsers: (users: User[]) => void;
  addDeployedFeature: (featureId: string) => void;
  removeDeployedFeature: (featureId: string) => void;
  addCreatedFeature: (featureId: string) => void;
  addReputation: (points: number) => void;
  logout: () => void;
}

interface CommunitySlice {
  communities: Record<string, Community>;
  communityIds: string[];
  activeCommunityId: string | null;
  polls: Record<string, Poll>;

  // Actions
  setCommunities: (communities: Community[]) => void;
  addCommunity: (community: Community) => void;
  updateCommunity: (id: string, updates: Partial<Community>) => void;
  removeCommunity: (id: string) => void;
  setActiveCommunity: (id: string | null) => void;
  addMember: (communityId: string, member: CommunityMember) => void;
  removeMember: (communityId: string, userId: string) => void;

  // Poll actions
  setPolls: (polls: Poll[]) => void;
  addPoll: (poll: Poll) => void;
  updatePoll: (id: string, updates: Partial<Poll>) => void;
  castVote: (pollId: string, vote: PollVoteType) => void;
}

interface DeviceSlice {
  capabilities: DeviceCapability | null;
  tier: CapabilityTier;
  isDetecting: boolean;
  lastDetected: string | null;

  // Actions
  setCapabilities: (capabilities: DeviceCapability) => void;
  setDetecting: (detecting: boolean) => void;
  clearCapabilities: () => void;
}

interface OverlaySlice {
  deployedOverlays: Record<string, OverlayConfig>;
  activeOverlayIds: string[];
  overlayVisible: boolean;

  // Actions
  deployOverlay: (featureId: string, config: OverlayConfig) => void;
  removeOverlay: (featureId: string) => void;
  updateOverlayConfig: (featureId: string, config: Partial<OverlayConfig>) => void;
  toggleOverlayVisibility: () => void;
  setOverlayVisibility: (visible: boolean) => void;
  activateOverlay: (featureId: string) => void;
  deactivateOverlay: (featureId: string) => void;
}

interface UISlice {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface Toast {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
}

// ============================================================================
// Combined Store Type
// ============================================================================

export type NayaStore =
  & FeatureSlice
  & UserSlice
  & CommunitySlice
  & DeviceSlice
  & OverlaySlice
  & UISlice;

// ============================================================================
// Default Filter State
// ============================================================================

const defaultFilters: FeatureFilters = {
  sortBy: 'votes',
  sortOrder: 'desc',
  page: 1,
  pageSize: 20,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useNayaStore = create<NayaStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set) => ({
          // ================================================================
          // Feature Slice
          // ================================================================
          features: {},
          featureIds: [],
          activeFeatureId: null,
          filters: { ...defaultFilters },
          generatingFeatureId: null,

          setFeatures: (features) =>
            set((state) => {
              state.features = {};
              state.featureIds = [];
              for (const f of features) {
                state.features[f.id] = f;
                state.featureIds.push(f.id);
              }
            }),

          addFeature: (feature) =>
            set((state) => {
              state.features[feature.id] = feature;
              if (!state.featureIds.includes(feature.id)) {
                state.featureIds.unshift(feature.id);
              }
            }),

          updateFeature: (id, updates) =>
            set((state) => {
              if (state.features[id]) {
                Object.assign(state.features[id], updates);
              }
            }),

          removeFeature: (id) =>
            set((state) => {
              delete state.features[id];
              state.featureIds = state.featureIds.filter((fid) => fid !== id);
              if (state.activeFeatureId === id) {
                state.activeFeatureId = null;
              }
            }),

          setActiveFeature: (id) =>
            set((state) => {
              state.activeFeatureId = id;
            }),

          setFilters: (filters) =>
            set((state) => {
              Object.assign(state.filters, filters);
            }),

          resetFilters: () =>
            set((state) => {
              state.filters = { ...defaultFilters };
            }),

          setGenerating: (id) =>
            set((state) => {
              state.generatingFeatureId = id;
            }),

          updateFeatureStatus: (id, status) =>
            set((state) => {
              if (state.features[id]) {
                state.features[id].status = status;
              }
            }),

          incrementVotes: (id) =>
            set((state) => {
              if (state.features[id]) {
                state.features[id].votes += 1;
              }
            }),

          incrementForks: (id) =>
            set((state) => {
              if (state.features[id]) {
                state.features[id].forksCount += 1;
              }
            }),

          incrementInstalls: (id) =>
            set((state) => {
              if (state.features[id]) {
                state.features[id].installs += 1;
              }
            }),

          // ================================================================
          // User Slice
          // ================================================================
          currentUser: null,
          users: {},
          isAuthenticated: false,

          setCurrentUser: (user) =>
            set((state) => {
              state.currentUser = user;
              state.isAuthenticated = user !== null;
              if (user) {
                state.users[user.id] = user;
              }
            }),

          updateCurrentUser: (updates) =>
            set((state) => {
              if (state.currentUser) {
                Object.assign(state.currentUser, updates);
                state.users[state.currentUser.id] = state.currentUser;
              }
            }),

          addUser: (user) =>
            set((state) => {
              state.users[user.id] = user;
            }),

          setUsers: (users) =>
            set((state) => {
              for (const u of users) {
                state.users[u.id] = u;
              }
            }),

          addDeployedFeature: (featureId) =>
            set((state) => {
              if (state.currentUser && !state.currentUser.deployedFeatureIds.includes(featureId)) {
                state.currentUser.deployedFeatureIds.push(featureId);
              }
            }),

          removeDeployedFeature: (featureId) =>
            set((state) => {
              if (state.currentUser) {
                state.currentUser.deployedFeatureIds = state.currentUser.deployedFeatureIds.filter(
                  (id) => id !== featureId,
                );
              }
            }),

          addCreatedFeature: (featureId) =>
            set((state) => {
              if (state.currentUser && !state.currentUser.createdFeatureIds.includes(featureId)) {
                state.currentUser.createdFeatureIds.push(featureId);
              }
            }),

          addReputation: (points) =>
            set((state) => {
              if (state.currentUser) {
                state.currentUser.reputation += points;
              }
            }),

          logout: () =>
            set((state) => {
              state.currentUser = null;
              state.isAuthenticated = false;
            }),

          // ================================================================
          // Community Slice
          // ================================================================
          communities: {},
          communityIds: [],
          activeCommunityId: null,
          polls: {},

          setCommunities: (communities) =>
            set((state) => {
              state.communities = {};
              state.communityIds = [];
              for (const c of communities) {
                state.communities[c.id] = c;
                state.communityIds.push(c.id);
              }
            }),

          addCommunity: (community) =>
            set((state) => {
              state.communities[community.id] = community;
              if (!state.communityIds.includes(community.id)) {
                state.communityIds.push(community.id);
              }
            }),

          updateCommunity: (id, updates) =>
            set((state) => {
              if (state.communities[id]) {
                Object.assign(state.communities[id], updates);
              }
            }),

          removeCommunity: (id) =>
            set((state) => {
              delete state.communities[id];
              state.communityIds = state.communityIds.filter((cid) => cid !== id);
              if (state.activeCommunityId === id) {
                state.activeCommunityId = null;
              }
            }),

          setActiveCommunity: (id) =>
            set((state) => {
              state.activeCommunityId = id;
            }),

          addMember: (communityId, member) =>
            set((state) => {
              const community = state.communities[communityId];
              if (community) {
                if (!community.members) {
                  community.members = [];
                }
                const exists = community.members.some((m) => m.userId === member.userId);
                if (!exists) {
                  community.members.push(member);
                  community.memberCount += 1;
                }
              }
            }),

          removeMember: (communityId, userId) =>
            set((state) => {
              const community = state.communities[communityId];
              if (community && community.members) {
                community.members = community.members.filter((m) => m.userId !== userId);
                community.memberCount = Math.max(0, community.memberCount - 1);
              }
            }),

          setPolls: (polls) =>
            set((state) => {
              state.polls = {};
              for (const p of polls) {
                state.polls[p.id] = p;
              }
            }),

          addPoll: (poll) =>
            set((state) => {
              state.polls[poll.id] = poll;
            }),

          updatePoll: (id, updates) =>
            set((state) => {
              if (state.polls[id]) {
                Object.assign(state.polls[id], updates);
              }
            }),

          castVote: (pollId, vote) =>
            set((state) => {
              const poll = state.polls[pollId];
              if (poll) {
                if (vote === 'approve') {
                  poll.approveCount += 1;
                } else if (vote === 'reject') {
                  poll.rejectCount += 1;
                }
                const totalVotes = poll.approveCount + poll.rejectCount;
                if (totalVotes > 0) {
                  const approvalRate = (poll.approveCount / totalVotes) * 100;
                  if (approvalRate >= poll.thresholdPercent) {
                    poll.status = 'passed';
                  }
                }
              }
            }),

          // ================================================================
          // Device Slice
          // ================================================================
          capabilities: null,
          tier: 'minimal',
          isDetecting: false,
          lastDetected: null,

          setCapabilities: (capabilities) =>
            set((state) => {
              state.capabilities = capabilities;
              state.tier = capabilities.tier;
              state.lastDetected = new Date().toISOString();
              state.isDetecting = false;
            }),

          setDetecting: (detecting) =>
            set((state) => {
              state.isDetecting = detecting;
            }),

          clearCapabilities: () =>
            set((state) => {
              state.capabilities = null;
              state.tier = 'minimal';
              state.lastDetected = null;
            }),

          // ================================================================
          // Overlay Slice
          // ================================================================
          deployedOverlays: {},
          activeOverlayIds: [],
          overlayVisible: true,

          deployOverlay: (featureId, config) =>
            set((state) => {
              state.deployedOverlays[featureId] = config;
              if (!state.activeOverlayIds.includes(featureId)) {
                state.activeOverlayIds.push(featureId);
              }
            }),

          removeOverlay: (featureId) =>
            set((state) => {
              delete state.deployedOverlays[featureId];
              state.activeOverlayIds = state.activeOverlayIds.filter((id) => id !== featureId);
            }),

          updateOverlayConfig: (featureId, config) =>
            set((state) => {
              if (state.deployedOverlays[featureId]) {
                Object.assign(state.deployedOverlays[featureId], config);
              }
            }),

          toggleOverlayVisibility: () =>
            set((state) => {
              state.overlayVisible = !state.overlayVisible;
            }),

          setOverlayVisibility: (visible) =>
            set((state) => {
              state.overlayVisible = visible;
            }),

          activateOverlay: (featureId) =>
            set((state) => {
              if (state.deployedOverlays[featureId] && !state.activeOverlayIds.includes(featureId)) {
                state.activeOverlayIds.push(featureId);
              }
            }),

          deactivateOverlay: (featureId) =>
            set((state) => {
              state.activeOverlayIds = state.activeOverlayIds.filter((id) => id !== featureId);
            }),

          // ================================================================
          // UI Slice
          // ================================================================
          sidebarOpen: false,
          commandPaletteOpen: false,
          activeModal: null,
          toasts: [],

          toggleSidebar: () =>
            set((state) => {
              state.sidebarOpen = !state.sidebarOpen;
            }),

          setSidebarOpen: (open) =>
            set((state) => {
              state.sidebarOpen = open;
            }),

          toggleCommandPalette: () =>
            set((state) => {
              state.commandPaletteOpen = !state.commandPaletteOpen;
            }),

          setCommandPaletteOpen: (open) =>
            set((state) => {
              state.commandPaletteOpen = open;
            }),

          openModal: (modalId) =>
            set((state) => {
              state.activeModal = modalId;
            }),

          closeModal: () =>
            set((state) => {
              state.activeModal = null;
            }),

          addToast: (toast) =>
            set((state) => {
              const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
              state.toasts.push({ ...toast, id });
            }),

          removeToast: (id) =>
            set((state) => {
              state.toasts = state.toasts.filter((t) => t.id !== id);
            }),
        })),
        {
          name: 'naya-store',
          partialize: (state) => ({
            // Only persist these slices to localStorage
            currentUser: state.currentUser,
            isAuthenticated: state.isAuthenticated,
            deployedOverlays: state.deployedOverlays,
            activeOverlayIds: state.activeOverlayIds,
            overlayVisible: state.overlayVisible,
            capabilities: state.capabilities,
            tier: state.tier,
            lastDetected: state.lastDetected,
            filters: state.filters,
          }),
        },
      ),
    ),
    { name: 'NayaStore' },
  ),
);

// ============================================================================
// Selectors
// ============================================================================

/** Get all features as an array, sorted by current filters */
export const selectFeatureList = (state: NayaStore): Feature[] => {
  const { features, featureIds, filters } = state;
  let list = featureIds.map((id) => features[id]).filter(Boolean);

  if (filters.status) {
    list = list.filter((f) => f.status === filters.status);
  }
  if (filters.targetApp) {
    list = list.filter((f) => f.targetApp.includes(filters.targetApp!));
  }
  if (filters.creatorId) {
    list = list.filter((f) => f.creatorId === filters.creatorId);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.targetApp.toLowerCase().includes(q),
    );
  }

  const sortKey = filters.sortBy ?? 'votes';
  const order = filters.sortOrder === 'asc' ? 1 : -1;

  list.sort((a, b) => {
    switch (sortKey) {
      case 'votes':
        return (a.votes - b.votes) * order;
      case 'installs':
        return (a.installs - b.installs) * order;
      case 'forks':
        return (a.forksCount - b.forksCount) * order;
      case 'created':
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
      case 'updated':
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * order;
      default:
        return 0;
    }
  });

  return list;
};

/** Get the currently active feature */
export const selectActiveFeature = (state: NayaStore): Feature | null => {
  return state.activeFeatureId ? state.features[state.activeFeatureId] ?? null : null;
};

/** Get all communities as an array */
export const selectCommunityList = (state: NayaStore): Community[] => {
  return state.communityIds.map((id) => state.communities[id]).filter(Boolean);
};

/** Get polls for a specific community */
export const selectCommunityPolls = (communityId: string) => (state: NayaStore): Poll[] => {
  return Object.values(state.polls).filter((p) => p.communityId === communityId);
};

/** Get active polls only */
export const selectActivePolls = (state: NayaStore): Poll[] => {
  return Object.values(state.polls).filter((p) => p.status === 'active');
};

/** Check if a feature is compatible with the current device */
export const selectIsFeatureCompatible = (featureId: string) => (state: NayaStore): boolean => {
  const feature = state.features[featureId];
  if (!feature) return false;

  const tierRank: Record<CapabilityTier, number> = {
    minimal: 0,
    standard: 1,
    power: 2,
  };

  return tierRank[state.tier] >= tierRank[feature.minCapabilityTier];
};

/** Get all active overlay feature IDs */
export const selectActiveOverlays = (state: NayaStore): string[] => {
  return state.overlayVisible ? state.activeOverlayIds : [];
};
