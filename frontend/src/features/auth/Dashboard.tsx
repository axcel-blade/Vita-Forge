/**
 * Dashboard Page Component
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth-context';
import {
  listProfileVersions,
  listCoverLetterVersions,
  type ResumeVersion,
  type CoverLetterVersion,
} from '../../services/user';
import { formatErrorMessage } from '../../services/error-handling';
import './dashboard.css';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetterVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const greetingName = user?.name?.trim() || 'there';

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [resumeVersions, coverLetterVersions] = await Promise.all([
          listProfileVersions(),
          listCoverLetterVersions(),
        ]);
        if (!cancelled) {
          setResumes(resumeVersions);
          setCoverLetters(coverLetterVersions);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  return (
    <section className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {greetingName}</h1>
          <p>Here's everything you've created so far.</p>
        </div>
        <button type="button" className="dashboard-logout" onClick={() => void handleLogout()}>
          Log out
        </button>
      </header>

      <div className="dashboard-actions">
        <Link to="/apps/resume-builder" className="dashboard-action-link">
          + New resume
        </Link>
        <Link to="/apps/cover-letter" className="dashboard-action-link">
          + New cover letter
        </Link>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      )}

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h2>Your resumes</h2>
          {isLoading ? (
            <p className="dashboard-empty">Loading...</p>
          ) : resumes.length === 0 ? (
            <p className="dashboard-empty">
              No saved resumes yet. Open the{' '}
              <Link to="/apps/resume-builder">resume builder</Link> and use "Save restore point" to
              save one here.
            </p>
          ) : (
            <ul className="dashboard-list">
              {resumes.map((version) => (
                <li key={version.id} className="dashboard-list-item">
                  <div>
                    <p className="dashboard-item-title">{version.label || 'Untitled resume'}</p>
                    <p className="dashboard-item-meta">{formatDate(version.createdAt)}</p>
                  </div>
                  <Link to="/apps/resume-builder" className="dashboard-item-link">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Your cover letters</h2>
          {isLoading ? (
            <p className="dashboard-empty">Loading...</p>
          ) : coverLetters.length === 0 ? (
            <p className="dashboard-empty">
              No saved cover letters yet. Open the{' '}
              <Link to="/apps/cover-letter">cover letter writer</Link> and use "Save to dashboard"
              to save one here.
            </p>
          ) : (
            <ul className="dashboard-list">
              {coverLetters.map((version) => (
                <li key={version.id} className="dashboard-list-item">
                  <div>
                    <p className="dashboard-item-title">{version.label || 'Untitled cover letter'}</p>
                    <p className="dashboard-item-meta">{formatDate(version.createdAt)}</p>
                  </div>
                  <Link to="/apps/cover-letter" className="dashboard-item-link">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
