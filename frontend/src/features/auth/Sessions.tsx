/**
 * Sessions Page Component
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSessions, revokeSession, type Session } from '../../services/auth';
import { formatErrorMessage } from '../../services/error-handling';
import './sessions.css';

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function loadSessions() {
    setIsLoading(true);
    try {
      setSessions(await listSessions());
      setError(null);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId);
    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setRevokingId(null);
    }
  }

  function describeDevice(userAgent: string | null) {
    if (!userAgent) {
      return 'Unknown device';
    }
    if (/mobile/i.test(userAgent)) {
      return 'Mobile browser';
    }
    if (/chrome/i.test(userAgent)) {
      return 'Chrome';
    }
    if (/firefox/i.test(userAgent)) {
      return 'Firefox';
    }
    if (/safari/i.test(userAgent)) {
      return 'Safari';
    }
    if (/edg/i.test(userAgent)) {
      return 'Edge';
    }
    return 'Browser';
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  return (
    <section className="sessions-page">
      <header className="sessions-header">
        <div>
          <h1>Active sessions</h1>
          <p>Devices currently signed in to your account.</p>
        </div>
        <Link to="/" className="sessions-back-link">
          ← Back to home
        </Link>
      </header>

      {error && (
        <div className="sessions-error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="sessions-empty">Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="sessions-empty">No active sessions found.</p>
      ) : (
        <ul className="sessions-list">
          {sessions.map((session) => (
            <li key={session.id} className="sessions-list-item">
              <div>
                <p className="sessions-item-title">
                  {describeDevice(session.userAgent)}
                  {session.isCurrent && <span className="sessions-current-badge">This device</span>}
                </p>
                <p className="sessions-item-meta">
                  {session.ip ? `${session.ip} · ` : ''}Last active {formatDate(session.lastUsedAt)}
                </p>
              </div>
              {!session.isCurrent && (
                <button
                  type="button"
                  className="sessions-revoke-button"
                  onClick={() => void handleRevoke(session.id)}
                  disabled={revokingId === session.id}
                >
                  {revokingId === session.id ? 'Revoking...' : 'Revoke'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
