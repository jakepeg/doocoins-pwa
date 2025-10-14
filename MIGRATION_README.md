# V1 to V2 Migration Implementation

This document describes the implementation of the V1 (NFID) to V2 (Internet Identity) migration system for DooCoins.

## Overview

The migration system helps V1 users transition to V2 by:

1. Automatically storing their NFID principal for data migration
2. Showing an upgrade notice banner with migration options
3. Redirecting users to the V2 frontend with their stored principal

## Components Added

### 1. UpgradeNotice Component (`src/frontend/components/UpgradeNotice/`)

- Displays a dismissible banner encouraging users to upgrade
- Shows "Upgrade Now" and "Remind Me Later" buttons
- Respects dismissal preferences and timing
- Mobile-responsive design using Chakra UI

### 2. Migration Storage Utility (`src/frontend/utils/migrationStorage.js`)

- Manages localStorage for migration-related data
- Handles principal storage, dismissal states, and migration completion
- Provides clean API for migration state management

### 3. Migration Configuration (`src/frontend/utils/migrationConfig.js`)

- Centralizes configuration for V2 URL, messages, and timing
- Easy to update for production deployment
- Configurable banner behavior and styling

### 4. Debug Utilities (`src/frontend/utils/migrationDebug.js`)

- Development-only utilities for testing migration flows
- Available in browser console as `MigrationDebug`
- Simulate different migration states for testing

## How It Works

### 1. Principal Storage

When a user logs in with NFID:

- `onConnectSuccess` callback in `IdentityKitProvider` stores the principal
- `useAuthClient` hook also stores principal during agent initialization
- Principal is stored as: `localStorage.setItem('nfidPrincipal', principal)`
- Migration flag is set: `localStorage.setItem('needsMigration', 'true')`

### 2. Upgrade Notice Display

The `UpgradeNotice` component is shown when:

- User has `needsMigration === 'true'`
- Migration is not completed (`migrationCompleted !== 'true'`)
- Notice hasn't been dismissed recently (within 24 hours)

### 3. User Actions

- **Upgrade Now**: Redirects to V2 frontend with stored NFID principal
- **Remind Me Later**: Dismisses banner for 24 hours
- **Close (X)**: Temporarily hides banner (shows again on refresh)

### 4. Migration States

```javascript
localStorage: {
  'nfidPrincipal': 'user-principal-string',
  'needsMigration': 'true',
  'migrationCompleted': 'true', // Set by V2 after successful migration
  'upgradeNoticeDismissed': 'true',
  'upgradeNoticeDismissedAt': '1634567890123'
}
```

## Configuration

Update `src/frontend/utils/migrationConfig.js`:

```javascript
export const MigrationConfig = {
  // IMPORTANT: Update this with actual V2 frontend URL
  V2_FRONTEND_URL: "https://your-v2-frontend.com",

  // Reminder interval (hours)
  REMINDER_INTERVAL_HOURS: 24,

  // Customize messages
  MESSAGES: {
    UPGRADE_TITLE: "🎉 We've upgraded to Internet Identity!",
    // ... other messages
  },
};
```

## Integration Points

### 1. App.jsx Changes

- Added NFID principal storage in `onConnectSuccess`
- Import migration utilities

### 2. use-auth-client.jsx Changes

- Added principal storage during agent initialization
- Import and use MigrationStorage utility

### 3. ProtectedRoute.jsx Changes

- Added UpgradeNotice component to layout
- Shows on all authenticated pages

## Testing

### Development Console Commands

```javascript
// Available in development mode
MigrationDebug.help(); // Show all commands
MigrationDebug.simulateNfidUser(); // Simulate NFID user
MigrationDebug.forceShowNotice(); // Force show banner
MigrationDebug.resetMigration(); // Clear all data
MigrationDebug.getStatus(); // Check current state
```

### Manual Testing Scenarios

1. **New V1 User**: Login → Notice appears → Test both buttons
2. **Returning User**: Login → Dismiss → Wait/simulate 24h → Notice reappears
3. **Migrated User**: Simulate completed migration → Notice shouldn't show
4. **Mobile/Desktop**: Test responsive behavior on different screen sizes

## V2 Integration Requirements

The V2 frontend should:

1. Check for `localStorage.getItem('nfidPrincipal')` on load
2. If found, initiate backend migration process linking NFID → II principals
3. After successful migration, call: `localStorage.setItem('migrationCompleted', 'true')`
4. Clear temporary migration flags: `localStorage.removeItem('needsMigration')`

## Production Deployment

Before deploying:

1. **Update V2_FRONTEND_URL** in `migrationConfig.js`
2. **Test migration flow** end-to-end
3. **Verify mobile responsiveness**
4. **Test dismissal and reminder timing**
5. **Ensure V2 frontend handles NFID principal correctly**

## UI/UX Features

- **Chakra UI Components**: Consistent with existing design system
- **Mobile-Responsive**: Adapts layout for mobile/desktop
- **Dismissible**: Users can control when they see the notice
- **Non-Blocking**: Doesn't prevent normal app usage
- **Friendly Messaging**: Encouraging rather than alarming
- **Progress Indication**: Clear next steps for users

## Files Modified

### New Files

- `src/frontend/components/UpgradeNotice/UpgradeNotice.jsx`
- `src/frontend/components/UpgradeNotice/index.js`
- `src/frontend/utils/migrationStorage.js`
- `src/frontend/utils/migrationConfig.js`
- `src/frontend/utils/migrationDebug.js`

### Modified Files

- `src/frontend/App.jsx` - Added principal storage on login success
- `src/frontend/use-auth-client.jsx` - Added principal storage and utility import
- `src/frontend/ProtectedRoute.jsx` - Added UpgradeNotice component

## Security Considerations

- NFID principal is stored in localStorage (client-side only)
- No sensitive data beyond public principal identifiers
- Migration flags are user-preference only
- V2 backend should validate principal ownership before migration

## Future Enhancements

Possible improvements:

- Progress tracking for multi-step migration
- Migration analytics/metrics
- A/B testing for different messaging
- Batch migration for multiple children
- Migration rollback support
