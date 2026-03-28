import { DeviceCapabilities } from "./types";

const devices = new Map<string, DeviceCapabilities>();

export async function getByUserBrowserOs(
  userId: string,
  browser: string,
  os: string
): Promise<DeviceCapabilities | null> {
  for (const d of devices.values()) {
    if (d.userId === userId && d.browser === browser && d.os === os) {
      return d;
    }
  }
  return null;
}

export async function updateDevice(
  deviceId: string,
  data: {
    screenWidth?: number;
    screenHeight?: number;
    supportedApis?: string[];
    extensionsInstalled?: string[];
  }
): Promise<DeviceCapabilities | null> {
  const existing = devices.get(deviceId);
  if (!existing) return null;
  const updated: DeviceCapabilities = {
    ...existing,
    ...(data.screenWidth !== undefined && { screenWidth: data.screenWidth }),
    ...(data.screenHeight !== undefined && { screenHeight: data.screenHeight }),
    ...(data.supportedApis !== undefined && { supportedApis: data.supportedApis }),
    ...(data.extensionsInstalled !== undefined && { extensionsInstalled: data.extensionsInstalled }),
  };
  devices.set(deviceId, updated);
  return updated;
}

export async function registerDevice(data: {
  deviceId: string;
  userId: string;
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
  supportedApis: string[];
  extensionsInstalled: string[];
}): Promise<DeviceCapabilities> {
  const capabilities: DeviceCapabilities = {
    id: data.deviceId,
    userId: data.userId,
    browser: data.browser,
    os: data.os,
    screenWidth: data.screenWidth,
    screenHeight: data.screenHeight,
    supportedApis: data.supportedApis,
    extensionsInstalled: data.extensionsInstalled,
    registeredAt: new Date().toISOString(),
  };
  devices.set(data.deviceId, capabilities);
  return capabilities;
}
