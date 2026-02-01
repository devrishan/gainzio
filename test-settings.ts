import { settingsService } from "@/services/settings-service";
import { prisma } from "@/lib/prisma";

async function testSettings() {
    console.log("Starting Settings Logic Test...");

    // 1. Fetch a user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found!");
        return;
    }
    console.log(`Using user: ${user.username} (${user.id})`);

    // 2. Default State Check
    console.log("\n--- Default State ---");
    let effective = await settingsService.getEffectiveSettings(user.id);
    console.log("Effective AI Enabled:", effective.ai.enabled);
    console.log("Effective Chat:", effective.ai.chat);

    // 3. Admin Disable AI Global
    console.log("\n--- Admin Disables Global AI ---");
    await settingsService.updateSystemSettings({
        ai: {
            enabled: false,
            features: { chat: true, autoSuggestions: true, helpTips: true }
        }
    });

    effective = await settingsService.getEffectiveSettings(user.id);
    console.log("Effective AI Enabled:", effective.ai.enabled);
    console.log("Effective Chat (Should be FALSE):", effective.ai.chat);

    // 4. Admin Enable AI, User Disable Chat
    console.log("\n--- Admin Enables AI, User Disables Chat ---");
    // Reset admin
    await settingsService.updateSystemSettings({
        ai: {
            enabled: true,
            features: { chat: true, autoSuggestions: true, helpTips: true }
        }
    });

    // Update user pref
    await settingsService.updateUserPreferences(user.id, {
        chat: false,
        autoSuggestions: true,
        helpTips: true
    });

    effective = await settingsService.getEffectiveSettings(user.id);
    console.log("Effective AI Enabled:", effective.ai.enabled);
    console.log("Effective Chat (Should be FALSE due to user pref):", effective.ai.chat);

    // 5. Cleanup
    await settingsService.updateUserPreferences(user.id, { chat: true, autoSuggestions: true, helpTips: true });
    console.log("\nTest Completed.");
}

testSettings()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
