import { getRedis } from "./redis";

const MAINTENANCE_KEY = "maintenance:login";

export type MaintenanceState = {
  enabled: boolean;
  message?: string | null;
  scheduledEnd?: string | null;
};

const defaultState: MaintenanceState = { enabled: false };

export async function getMaintenanceState(): Promise<MaintenanceState> {
  const redis = getRedis();

  if (!redis) {
    return {
      enabled: process.env.FEATURE_LOGIN_MAINTENANCE === "true",
      message: process.env.FEATURE_LOGIN_MAINTENANCE_MESSAGE ?? null,
      scheduledEnd: null,
    };
  }

  try {
    const cached = await redis.get(MAINTENANCE_KEY);
    if (!cached) {
      return defaultState;
    }

    const parsed = JSON.parse(cached) as MaintenanceState;

    if (parsed.scheduledEnd && new Date(parsed.scheduledEnd).getTime() <= Date.now()) {
      await redis.del(MAINTENANCE_KEY);
      return defaultState;
    }

    return {
      enabled: Boolean(parsed.enabled),
      message: parsed.message ?? null,
      scheduledEnd: parsed.scheduledEnd ?? null,
    };
  } catch (error) {
    console.error("Failed to read maintenance state:", error);
    return defaultState;
  }
}

type SetMaintenanceInput = {
  enabled: boolean;
  message?: string | null;
  durationMinutes?: number | null;
  scheduledEnd?: string | null;
};

export async function setMaintenanceState(input: SetMaintenanceInput): Promise<MaintenanceState> {
  const redis = getRedis();
  if (!redis) {
    throw new Error("Redis not available");
  }

  if (!input.enabled) {
    await redis.del(MAINTENANCE_KEY);
    return defaultState;
  }

  const scheduledEnd =
    input.scheduledEnd ??
    (input.durationMinutes ? new Date(Date.now() + input.durationMinutes * 60 * 1000).toISOString() : null);

  const payload: MaintenanceState = {
    enabled: true,
    message: input.message ?? null,
    scheduledEnd,
  };

  const ttlMs = scheduledEnd ? new Date(scheduledEnd).getTime() - Date.now() : undefined;

  if (ttlMs && ttlMs > 0) {
    await redis.set(MAINTENANCE_KEY, JSON.stringify(payload), "PX", ttlMs);
  } else {
    await redis.set(MAINTENANCE_KEY, JSON.stringify(payload));
  }

  return payload;
}

export async function disableMaintenance(): Promise<MaintenanceState> {
  const redis = getRedis();
  if (!redis) {
    throw new Error("Redis not available");
  }
  await redis.del(MAINTENANCE_KEY);
  return defaultState;
}


