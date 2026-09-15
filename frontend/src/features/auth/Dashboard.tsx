/**
 * Dashboard Page Component
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth-context';
import './dashboard.css';

const tools = [
  {
    title: 'Resume Builder',
    description: 'Edit sections, preview A4 layout, and export your resume.',
    to: '/apps/resume-builder',
    action: 'Open builder',
  },
  {
    title: 'Template marketplace',
    description: 'Pick a professional layout and apply it to your resume.',
    to: '/apps/resume-builder/templates',
    action: 'Browse templates',
  },
  {
    title: 'Cover Letter Writer',
    description: 'Draft a role-focused letter using your saved profile details.',
    to: '/apps/cover-letter',
    action: 'Open writer',
  },
  {
    title: 'Active sessions',
    description: 'See which devices are signed in and revoke access.',
    to: '/account/sessions',
    action: 'Manage sessions',
  },
];

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const greetingName = user?.name?.trim() || 'there';

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

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
    </section>
  );
}
