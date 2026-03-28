const ONBOARDING_KEY = "naya:onboarding";
const ONBOARDING_COMPLETE_KEY = "naya:onboarding:complete";

export interface OnboardingData {
  username: string;
  interests: string[];
  apps: string[];
  featureIdea: string;
  completedAt: string | null;
}

const defaultData: OnboardingData = {
  username: "",
  interests: [],
  apps: [],
  featureIdea: "",
  completedAt: null,
};

export function getOnboardingData(): OnboardingData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveOnboardingData(data: Partial<OnboardingData>): void {
  if (typeof window === "undefined") return;
  const existing = getOnboardingData();
  const merged = { ...existing, ...data };
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(merged));
}

export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
}

export function completeOnboarding(): void {
  if (typeof window === "undefined") return;
  saveOnboardingData({ completedAt: new Date().toISOString() });
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_KEY);
  localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
}
