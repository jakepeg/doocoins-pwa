/**
 * Debug utilities for V1 to V2 migration (Development only)
 * Use these functions in browser console for testing migration features
 */

import MigrationStorage from './migrationStorage';
import MigrationConfig from './migrationConfig';

export const MigrationDebug = {
  // Simulate user with NFID principal (for testing)
  simulateNfidUser(principal = "test-nfid-principal-123") {
    MigrationStorage.setNfidPrincipal(principal);
    console.log("✅ Simulated NFID user with principal:", principal);
    console.log("Migration status:", MigrationStorage.getMigrationStatus());
  },

  // Simulate user who has completed migration
  simulateCompletedMigration() {
    MigrationStorage.setMigrationCompleted();
    console.log("✅ Simulated completed migration");
    console.log("Migration status:", MigrationStorage.getMigrationStatus());
  },

  // Reset all migration data (start fresh)
  resetMigration() {
    MigrationStorage.clearAllMigrationData();
    console.log("🔄 Reset all migration data");
    console.log("Migration status:", MigrationStorage.getMigrationStatus());
  },

  // Force show upgrade notice
  forceShowNotice() {
    MigrationStorage.setNfidPrincipal("test-principal");
    MigrationStorage.resetDismissal();
    console.log("👁️ Forced upgrade notice to show");
    window.location.reload();
  },

  // Simulate dismissed notice
  simulateDismissedNotice() {
    MigrationStorage.dismissUpgradeNotice();
    console.log("❌ Simulated dismissed notice");
    console.log("Migration status:", MigrationStorage.getMigrationStatus());
  },

  // Get current migration status
  getStatus() {
    const status = MigrationStorage.getMigrationStatus();
    console.log("📊 Current Migration Status:", status);
    console.log("📋 Configuration:", {
      V2_URL: MigrationConfig.V2_FRONTEND_URL,
      REMINDER_HOURS: MigrationConfig.REMINDER_INTERVAL_HOURS,
      DEV_MODE: MigrationConfig.DEV_MODE,
    });
    return status;
  },

  // Test upgrade flow (without actual redirect)
  testUpgradeFlow() {
    const principal = MigrationStorage.getNfidPrincipal();
    if (principal) {
      console.log("🚀 Would redirect to V2 with principal:", principal);
      console.log("🔗 Target URL:", MigrationConfig.V2_FRONTEND_URL);
    } else {
      console.log("❌ No NFID principal found - would show error");
    }
  },

  // Show help
  help() {
    console.log(`
🛠️ Migration Debug Utilities:

MigrationDebug.simulateNfidUser()     - Simulate user with NFID account
MigrationDebug.simulateCompletedMigration() - Mark migration as completed
MigrationDebug.resetMigration()       - Clear all migration data
MigrationDebug.forceShowNotice()      - Force upgrade notice to appear
MigrationDebug.simulateDismissedNotice() - Simulate dismissed notice
MigrationDebug.getStatus()            - Show current migration status
MigrationDebug.testUpgradeFlow()      - Test upgrade without redirect
MigrationDebug.help()                 - Show this help

Examples:
- MigrationDebug.simulateNfidUser("rrkah-fqaaa-aaaah-qcwwa-cai")
- MigrationDebug.getStatus()
- MigrationDebug.resetMigration()
    `);
  }
};

// Make available globally in development
if (MigrationConfig.DEV_MODE && typeof window !== 'undefined') {
  window.MigrationDebug = MigrationDebug;
  console.log("🔧 MigrationDebug utilities available. Type MigrationDebug.help() for commands.");
}

export default MigrationDebug;