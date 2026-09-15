import { enableRemoteProfileMode } from '../features/shared/services/profileBundle';

/**
 * Signed-in users' resume/cover-letter documents live entirely on the server
 * (see services/documents.ts); this only switches the local editing-buffer
 * cache (features/shared/services/profileBundle) out of localStorage so a
 * shared machine doesn't leak one account's draft into another's session.
 */
export async function syncLocalBundleAfterAuth(): Promise<void> {
  enableRemoteProfileMode(true);
}
