/**
 * Utility functions for managing V1 to V2 migration localStorage data
 */

import MigrationConfig from './migrationConfig';

export const MigrationStorage = {
  // Keys for localStorage
  KEYS: {
    NFID_PRINCIPAL: 'nfidPrincipal',
    NEEDS_MIGRATION: 'needsMigration',
    MIGRATION_COMPLETED: 'migrationCompleted',
    UPGRADE_NOTICE_DISMISSED: 'upgradeNoticeDismissed',
    UPGRADE_NOTICE_DISMISSED_AT: 'upgradeNoticeDismissedAt',
  },

  // Store NFID principal for migration
  setNfidPrincipal(principal) {
    if (principal) {
      localStorage.setItem(this.KEYS.NFID_PRINCIPAL, principal);
      localStorage.setItem(this.KEYS.NEEDS_MIGRATION, 'true');
    }
  },

  // Get NFID principal
  getNfidPrincipal() {
    return localStorage.getItem(this.KEYS.NFID_PRINCIPAL);
  },

  // Check if user needs migration
  needsMigration() {
    return localStorage.getItem(this.KEYS.NEEDS_MIGRATION) === 'true';
  },

  // Mark migration as completed
  setMigrationCompleted() {
    localStorage.setItem(this.KEYS.MIGRATION_COMPLETED, 'true');
    // Clean up other migration flags
    localStorage.removeItem(this.KEYS.NEEDS_MIGRATION);
    localStorage.removeItem(this.KEYS.UPGRADE_NOTICE_DISMISSED);
    localStorage.removeItem(this.KEYS.UPGRADE_NOTICE_DISMISSED_AT);
  },

  // Check if migration is completed
  isMigrationCompleted() {
    return localStorage.getItem(this.KEYS.MIGRATION_COMPLETED) === 'true';
  },

  // Dismiss upgrade notice
  dismissUpgradeNotice() {
    localStorage.setItem(this.KEYS.UPGRADE_NOTICE_DISMISSED, 'true');
    localStorage.setItem(this.KEYS.UPGRADE_NOTICE_DISMISSED_AT, Date.now().toString());
  },

  // Check if upgrade notice was dismissed recently
  isUpgradeNoticeDismissed(hoursToWait = MigrationConfig.REMINDER_INTERVAL_HOURS) {
    const dismissed = localStorage.getItem(this.KEYS.UPGRADE_NOTICE_DISMISSED) === 'true';
    const dismissedAt = localStorage.getItem(this.KEYS.UPGRADE_NOTICE_DISMISSED_AT);
    
    if (!dismissed || !dismissedAt) {
      return false;
    }

    const dismissTime = parseInt(dismissedAt);
    const currentTime = Date.now();
    const waitTime = hoursToWait * 60 * 60 * 1000; // Convert hours to ms

    return (currentTime - dismissTime) < waitTime;
  },

  // Reset dismissal status (called when time has passed)
  resetDismissal() {
    localStorage.removeItem(this.KEYS.UPGRADE_NOTICE_DISMISSED);
    localStorage.removeItem(this.KEYS.UPGRADE_NOTICE_DISMISSED_AT);
  },

  // Check if upgrade notice should be shown
  shouldShowUpgradeNotice() {
    // Don't show if migration is completed
    if (this.isMigrationCompleted()) {
      return false;
    }

    // Don't show if user doesn't need migration
    if (!this.needsMigration()) {
      return false;
    }

    // Check if notice was dismissed recently
    if (this.isUpgradeNoticeDismissed()) {
      return false;
    } else {
      // Reset dismissal if time has passed
      this.resetDismissal();
    }

    return true;
  },

  // Clear all migration data (for testing or reset)
  clearAllMigrationData() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Get migration status summary (for debugging)
  getMigrationStatus() {
    return {
      nfidPrincipal: this.getNfidPrincipal(),
      needsMigration: this.needsMigration(),
      migrationCompleted: this.isMigrationCompleted(),
      upgradeNoticeDismissed: this.isUpgradeNoticeDismissed(),
      shouldShowNotice: this.shouldShowUpgradeNotice(),
    };
  }
};

export default MigrationStorage;