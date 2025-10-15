/**
 * Configuration for V1 to V2 migration
 */

export const MigrationConfig = {
  // V2 Frontend URL - Using IC canister URL
  V2_FRONTEND_URL: "https://zks5c-sqaaa-aaaah-qqf4a-cai.icp0.io",
  
  // Time to wait before showing upgrade notice again after dismissal (in hours)
  REMINDER_INTERVAL_HOURS: 24,
  
  // Banner display settings
  BANNER_SETTINGS: {
    // Auto-dismiss banner after this time (in milliseconds) - 0 to disable
    AUTO_DISMISS_TIMEOUT: 0, // 10 seconds
    
    // Show animation duration
    ANIMATION_DURATION: 300,
    
    // Position settings
    MOBILE_POSITION: "relative", // "relative" | "fixed"
    DESKTOP_POSITION: "fixed",   // "relative" | "fixed"
  },

  // Migration status messages
  MESSAGES: {
    UPGRADE_TITLE: "📱 This is an outdated version of DooCoins",
    UPGRADE_DESCRIPTION: "Click here to use the new updated version with better security and features.",
    ERROR_NO_PRINCIPAL: "Unable to find your NFID account. Please try logging out and logging back in.",
    REMINDER_SET: "We'll remind you about the upgrade in 24 hours.",
    UPGRADE_BUTTON: "Use New Version",
    REMIND_LATER_BUTTON: "Remind Me Later",
  },

  // Development/testing settings
  DEV_MODE: process.env.NODE_ENV === "development",
  
  // Enable console logging for migration events
  ENABLE_LOGGING: true,
};

export default MigrationConfig;