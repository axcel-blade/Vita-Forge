/**
 * Dashboard Page Component
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth-context';
import { getProfile, type SyncedProfile } from '../../services/user';
import './dashboard.css';

const tools = [
  {
    title: 'Resume Builder',
    description: 'Edit sections, preview A4 layout, and export your resume.',
    to: '/apps/resume-builder',
    action: 'Open builder',
  },
  {
    title: 'Cover Letter Writer',
    description: 'Draft a role-focused letter using your saved profile details.',
    to: '/apps/cover-letter',
    action: 'Open writer',
  },
];

function getResumeTitle(resume: Record<string, unknown> | undefined): string {
  const profile = resume?.profile as Record<string, unknown> | undefined;
  const fullName = typeof profile?.fullName === 'string' ? profile.fullName.trim() : '';
  return fullName || 'Untitled resume';
}

function getCoverLetterTitle(coverLetter: Record<string, unknown> | undefined): string {
  const jobTitle = typeof coverLetter?.jobTitle === 'string' ? coverLetter.jobTitle.trim() : '';
  const companyName = typeof coverLetter?.companyName === 'string' ? coverLetter.companyName.trim() : '';
  if (jobTitle && companyName) return `${jobTitle} at ${companyName}`;
  return jobTitle || companyName || 'Untitled cover letter';
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const greetingName = user?.name?.trim() || 'there';
  const [profile, setProfile] = useState<SyncedProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((response) => {
        if (!cancelled) setProfile(response.profile);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  const hasResume = Boolean(profile?.resume);
  const hasCoverLetter = Boolean(profile?.coverLetter);

  return (
    <section className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {greetingName}</h1>
          <p>Choose a tool to continue your application workflow.</p>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/account/settings" className="dashboard-account-link">
            Account settings
          </Link>
          <button type="button" className="dashboard-logout" onClick={() => void handleLogout()}>
            Log out
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        {tools.map((tool) => (
          <article key={tool.to} className="dashboard-card">
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <Link to={tool.to} className="dashboard-card-link">
              {tool.action}
            </Link>
          </article>
        ))}
      </div>

      <div className="dashboard-documents">
        <h2 className="dashboard-section-title">Your documents</h2>
        {loadingProfile ? (
          <p className="dashboard-documents-empty">Loading your documents…</p>
        ) : !hasResume && !hasCoverLetter ? (
          <p className="dashboard-documents-empty">
            You haven&apos;t created a resume or cover letter yet. Use the tools above to get started.
          </p>
        ) : (
          <div className="dashboard-grid">
            {hasResume && (
              <article className="dashboard-card">
                <h2>{getResumeTitle(profile?.resume)}</h2>
                <p>Resume</p>
                <Link to="/apps/resume-builder" className="dashboard-card-link">
                  Open resume
                </Link>
              </article>
            )}
            {hasCoverLetter && (
              <article className="dashboard-card">
                <h2>{getCoverLetterTitle(profile?.coverLetter)}</h2>
                <p>Cover letter</p>
                <Link to="/apps/cover-letter" className="dashboard-card-link">
                  Open cover letter
                </Link>
              </article>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
