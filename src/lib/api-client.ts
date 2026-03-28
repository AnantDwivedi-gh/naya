// ---------------------------------------------------------------------------
// Typed API client for all Naya endpoints
// ---------------------------------------------------------------------------

import type {
  Feature,
  FeatureCategory,
  Community,
  Poll,
  User,
  GeneratedFeature,
  PaginatedResponse,
} from "./data/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

type ApiResult<T> = ApiSuccess<T> | ApiError;

class ApiClientError extends Error {
  code: string;
  details?: unknown;
  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
  }
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options?.headers as Record<string, string>) },
    ...options,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const err = json as ApiError | null;
    throw new ApiClientError(
      err?.error?.code ?? "HTTP_ERROR",
      err?.error?.message ?? `HTTP ${res.status}`,
      err?.error?.details
    );
  }

  return json as T;
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

export interface ListFeaturesParams {
  filter?: "trending" | "new" | "top";
  category?: FeatureCategory;
  targetApp?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

const features = {
  async list(params?: ListFeaturesParams): Promise<PaginatedResponse<Feature>> {
    const qs = buildQuery({
      filter: params?.filter,
      category: params?.category,
      targetApp: params?.targetApp,
      search: params?.search,
      page: params?.page,
      pageSize: params?.pageSize,
    });
    return request<PaginatedResponse<Feature>>(`/api/features${qs}`);
  },

  async get(id: string): Promise<Feature> {
    const res = await request<ApiSuccess<Feature>>(`/api/features/${id}`);
    return res.data;
  },

  async create(data: {
    name: string;
    description: string;
    targetApp: string;
    category?: string;
    code?: { html: string; css: string; js: string };
    permissions?: string[];
    tags?: string[];
    triggerConditions?: Array<{ type: string; value: string; description: string }>;
    integrationHooks?: Array<{ type: string; target: string; description: string }>;
    authorId?: string;
    authorName?: string;
    status?: string;
  }): Promise<Feature> {
    const res = await request<ApiSuccess<Feature>>("/api/features", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async fork(
    id: string,
    userId: string = "user_anonymous",
    userName: string = "Anonymous"
  ): Promise<Feature> {
    const res = await request<ApiSuccess<Feature>>(`/api/features/${id}/fork`, {
      method: "POST",
      body: JSON.stringify({ userId, userName }),
    });
    return res.data;
  },

  async deploy(
    id: string,
    userId: string = "user_anonymous"
  ): Promise<{
    deploymentId: string;
    featureId: string;
    userId: string;
    deviceId: string | null;
    status: string;
    deployedAt: string;
  }> {
    const res = await request<ApiSuccess<{
      deploymentId: string;
      featureId: string;
      userId: string;
      deviceId: string | null;
      status: string;
      deployedAt: string;
    }>>(`/api/features/${id}/deploy`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    return res.data;
  },

  async generate(
    description: string,
    targetApp: string,
    desiredBehavior?: string,
    category?: FeatureCategory
  ): Promise<{ data: GeneratedFeature; meta: Record<string, unknown> }> {
    const res = await request<{
      success: true;
      data: GeneratedFeature;
      meta: Record<string, unknown>;
    }>("/api/features/generate", {
      method: "POST",
      body: JSON.stringify({
        description,
        targetApp,
        desiredBehavior: desiredBehavior || description,
        category,
      }),
    });
    return { data: res.data, meta: res.meta };
  },
};

// ---------------------------------------------------------------------------
// Communities
// ---------------------------------------------------------------------------

const communities = {
  async list(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Community>> {
    const qs = buildQuery({
      search: params?.search,
      page: params?.page,
      pageSize: params?.pageSize,
    });
    return request<PaginatedResponse<Community>>(`/api/community${qs}`);
  },

  async get(id: string): Promise<Community> {
    const res = await request<ApiSuccess<Community>>(`/api/community/${id}`);
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Polls
// ---------------------------------------------------------------------------

const polls = {
  async listByCommunity(communityId: string): Promise<Poll[]> {
    const res = await request<ApiSuccess<Poll[]>>(
      `/api/community/${communityId}/polls`
    );
    return res.data;
  },

  async vote(
    communityId: string,
    pollId: string,
    optionId: string,
    userId: string = "user_anonymous"
  ): Promise<{ poll: Poll; results: unknown }> {
    const res = await request<ApiSuccess<{ poll: Poll; results: unknown }>>(
      `/api/community/${communityId}/polls/${pollId}/vote`,
      {
        method: "POST",
        body: JSON.stringify({ optionId, userId }),
      }
    );
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const users = {
  async get(id: string): Promise<User> {
    const res = await request<ApiSuccess<User>>(`/api/users/${id}`);
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const api = {
  features,
  communities,
  polls,
  users,
};

export { ApiClientError };
