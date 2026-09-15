/**
 * Account Panel — shown on the home page after login.
 * Lets the user edit their name/email and change their password.
 */

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/auth-context';
import { updateAccount, changePassword } from '../../services/auth';
import { formatErrorMessage } from '../../services/error-handling';
import './account-panel.css';

export function AccountPanel() {
  const { user, setUser, logout } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleProfileSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsSavingProfile(true);
    try {
      const updated = await updateAccount({ name, email });
      setUser(updated);
      setProfileSuccess('Account details updated.');
    } catch (err) {
      setProfileError(formatErrorMessage(err));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordSuccess('Password changed. Other devices have been signed out.');
    } catch (err) {
      setPasswordError(formatErrorMessage(err));
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <section className="account-panel">
      <header className="account-panel-header">
        <div>
          <h1>Welcome back, {user?.name?.trim() || 'there'}</h1>
          <p>Manage your account, or jump into your tools below.</p>
        </div>
        <button type="button" className="account-panel-logout" onClick={() => void logout()}>
          Log out
        </button>
      </header>

      <div className="account-panel-links">
        <Link to="/dashboard" className="account-panel-link">
          Go to dashboard
        </Link>
        <Link to="/apps/resume-builder" className="account-panel-link secondary">
          Resume builder
        </Link>
        <Link to="/apps/cover-letter" className="account-panel-link secondary">
          Cover letter writer
        </Link>
        <Link to="/account/sessions" className="account-panel-link secondary">
          Active sessions
        </Link>
      </div>

      <div className="account-panel-grid">
        <form className="account-panel-card" onSubmit={(e) => void handleProfileSubmit(e)}>
          <h2>Account details</h2>
          {profileError && (
            <p className="account-panel-error" role="alert">
              {profileError}
            </p>
          )}
          {profileSuccess && <p className="account-panel-success">{profileSuccess}</p>}
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" disabled={isSavingProfile}>
            {isSavingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <form className="account-panel-card" onSubmit={(e) => void handlePasswordSubmit(e)}>
          <h2>Change password</h2>
          {passwordError && (
            <p className="account-panel-error" role="alert">
              {passwordError}
            </p>
          )}
          {passwordSuccess && <p className="account-panel-success">{passwordSuccess}</p>}
          <label>
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
          <button type="submit" disabled={isSavingPassword}>
            {isSavingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </section>
  );
}
