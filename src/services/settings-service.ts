import { prisma } from "@/lib/prisma";

export interface SystemSettings {
    ai: {
        enabled: boolean;
        features: {
            chat: boolean;
            autoSuggestions: boolean;
            helpTips: boolean;
        };
    };
    limits: {
        maxTasksPerDay: number;
        maxWithdrawalsPerWeek: number;
        maxAiRequestsPerDay: number;
        cooldownDays: number;
        minPayoutAmount: number;
    };
}

export interface UserAiPreferences {
    chat: boolean;
    autoSuggestions: boolean;
    helpTips: boolean;
}

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
    ai: {
        enabled: true,
        features: {
            chat: true,
            autoSuggestions: true,
            helpTips: true,
        },
    },
    limits: {
        maxTasksPerDay: 7, // The "Seven" problem solves here
        maxWithdrawalsPerWeek: 7,
        maxAiRequestsPerDay: 50,
        cooldownDays: 7,
        minPayoutAmount: 50,
    },
};

export class SettingsService {
    /**
     * Gets the global system settings.
     * Uses caching strategy ideally, but direct DB for now.
     */
    async getSystemSettings(): Promise<SystemSettings> {
        const config = await prisma.systemConfig.findUnique({
            where: { key: "global_settings" },
        });

        if (!config || !config.value) {
            // Seed if not exists
            await prisma.systemConfig.create({
                data: {
                    key: "global_settings",
                    value: DEFAULT_SYSTEM_SETTINGS as any,
                    description: "Global system settings and limits",
                },
            });
            return DEFAULT_SYSTEM_SETTINGS;
        }

        return config.value as unknown as SystemSettings;
    }

    /**
     * Updates global system settings.
     */
    async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
        const current = await this.getSystemSettings();
        const updated = { ...current, ...settings };

        // Deep merge/update logic if needed for nested objects, simplified here
        if (settings.ai) {
            updated.ai = { ...current.ai, ...settings.ai };
            if (settings.ai.features) {
                updated.ai.features = { ...current.ai.features, ...settings.ai.features };
            }
        }
        if (settings.limits) {
            updated.limits = { ...current.limits, ...settings.limits };
        }

        await prisma.systemConfig.update({
            where: { key: "global_settings" },
            data: { value: updated as any, updatedBy: "admin" }, // TODO: Pass admin ID if available
        });

        return updated;
    }

    /**
     * Gets the effective settings for a user, applying the Priority Rule.
     * Admin > Member
     */
    async getEffectiveSettings(userId: string) {
        const systemSettings = await this.getSystemSettings();

        const userPrefs = await prisma.userPreference.findUnique({
            where: { userId },
        });

        // Default user prefs if not set
        const userAiPrefs: UserAiPreferences = (userPrefs?.aiPreferences as any) || {
            chat: true,
            autoSuggestions: true,
            helpTips: true,
        };

        // Apply Priority Rule: IF system disabled, FORCE disabled.
        const effectiveAi = {
            enabled: systemSettings.ai.enabled, // If global OFF, this is false
            chat: systemSettings.ai.enabled && systemSettings.ai.features.chat && userAiPrefs.chat,
            autoSuggestions: systemSettings.ai.enabled && systemSettings.ai.features.autoSuggestions && userAiPrefs.autoSuggestions,
            helpTips: systemSettings.ai.enabled && systemSettings.ai.features.helpTips && userAiPrefs.helpTips,
        };

        return {
            ai: effectiveAi,
            limits: systemSettings.limits, // Limits are strictly global for now
        };
    }

    /**
     * Updates user specific preferences.
     */
    async updateUserPreferences(userId: string, prefs: Partial<UserAiPreferences>) {
        const userPreference = await prisma.userPreference.findUnique({
            where: { userId },
        });

        const currentAiPrefs = (userPreference?.aiPreferences as any) || {
            chat: true,
            autoSuggestions: true,
            helpTips: true,
        };

        const updatedAiPrefs = { ...currentAiPrefs, ...prefs };

        await prisma.userPreference.upsert({
            where: { userId },
            create: {
                userId,
                aiPreferences: updatedAiPrefs,
            },
            update: {
                aiPreferences: updatedAiPrefs,
            },
        });

        return updatedAiPrefs;
    }
}

export const settingsService = new SettingsService();
