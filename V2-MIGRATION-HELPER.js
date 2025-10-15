/**
 * V2 Migration Helper - Use this in your V2 frontend to handle migration
 */

export const V2MigrationHelper = {
  // Extract migration data from URL parameters (sent from V1)
  extractMigrationDataFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const migrate = urlParams.get('migrate') === 'true';
    const nfidPrincipal = urlParams.get('nfid');
    
    return {
      shouldMigrate: migrate && nfidPrincipal,
      nfidPrincipal: nfidPrincipal ? decodeURIComponent(nfidPrincipal) : null,
      rawParams: Object.fromEntries(urlParams)
    };
  },

  // Process migration in V2 frontend
  async processMigration() {
    const { shouldMigrate, nfidPrincipal } = this.extractMigrationDataFromUrl();
    
    if (!shouldMigrate) {
      console.log('No migration required');
      return { success: false, reason: 'No migration data found' };
    }

    console.log('Processing migration for NFID principal:', nfidPrincipal);

    try {
      // TODO: Implement your V2 backend migration logic here
      // Example: await migrateUserData(nfidPrincipal, newIIPrincipal);
      
      // Mark migration as completed
      localStorage.setItem('migrationCompleted', 'true');
      localStorage.setItem('migratedFromNfid', nfidPrincipal);
      localStorage.setItem('migrationDate', new Date().toISOString());
      
      // Clean URL parameters
      this.cleanUrlParameters();
      
      console.log('Migration completed successfully');
      return { success: true, nfidPrincipal };
      
    } catch (error) {
      console.error('Migration failed:', error);
      return { success: false, reason: error.message, nfidPrincipal };
    }
  },

  // Clean migration parameters from URL
  cleanUrlParameters() {
    const url = new URL(window.location);
    url.searchParams.delete('migrate');
    url.searchParams.delete('nfid');
    
    // Update URL without page reload
    window.history.replaceState({}, '', url.toString());
  },

  // Check if user has already migrated
  isMigrationCompleted() {
    return localStorage.getItem('migrationCompleted') === 'true';
  },

  // Get migration info for debugging
  getMigrationInfo() {
    return {
      migrationCompleted: this.isMigrationCompleted(),
      migratedFromNfid: localStorage.getItem('migratedFromNfid'),
      migrationDate: localStorage.getItem('migrationDate'),
      currentUrlParams: this.extractMigrationDataFromUrl()
    };
  }
};

// Make available globally in V2 for easy access
if (typeof window !== 'undefined') {
  window.V2MigrationHelper = V2MigrationHelper;
}

export default V2MigrationHelper;