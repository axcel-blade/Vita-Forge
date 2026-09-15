/**
 * Dashboard Page Component
 */

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth-context';
import { useToast } from '../../components/Toast';
import { formatErrorMessage } from '../../services/error-handling';
import {
  createCoverLetter,
  createResume,
  listCoverLetters,
  listResumes,
  type ProfileDocument,
} from '../../services/documents';
import './dashboard.css';

const tools = [
  {
    title: 'Resume Builder',
    description: 'Edit sections, preview A4 layout, and export your resume.',
    action: 'Create resume',
  },
  {
    title: 'Cover Letter Writer',
    description: 'Draft a role-focused letter using your saved profile details.',
    action: 'Create cover letter',
  },
];

function formatUpdatedAt(isoDate: string): string {
  try {
    return `Updated ${new Date(isoDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}`;
  } catch {
    return 'Updated recently';
  }
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const greetingName = user?.name?.trim() || 'there';
  const [resumes, setResumes] = useState<ProfileDocument[]>([]);
  const [coverLetters, setCoverLetters] = useState<ProfileDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [creating, setCreating] = useState<'resume' | 'coverLetter' | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoadingDocuments(true);
    try {
      const [resumeDocs, coverLetterDocs] = await Promise.all([listResumes(), listCoverLetters()]);
      setResumes(resumeDocs);
      setCoverLetters(coverLetterDocs);
    } catch (error) {
      toast.error(formatErrorMessage(error));
    } finally {
      setLoadingDocuments(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleCreateResume = async () => {
    setCreating('resume');
    try {
      const doc = await createResume();
      navigate(`/apps/resume-builder/${doc.id}`);
    } catch (error) {
      toast.error(formatErrorMessage(error));
      setCreating(null);
    }
  };

  const handleCreateCoverLetter = async () => {
    setCreating('coverLetter');
    try {
      const doc = await createCoverLetter();
      navigate(`/apps/cover-letter/${doc.id}`);
    } catch (error) {
      toast.error(formatErrorMessage(error));
      setCreating(null);
    }
  };

  const hasDocuments = resumes.length > 0 || coverLetters.length > 0;

  return (
    <section className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {greetingName}</h1>
          <p>Choose a tool to continue your application workflow.</p>
        </div>
      </header>

      <div className="dashboard-grid">
        {tools.map((tool) => (
          <article key={tool.title} className="dashboard-card">
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <button
              type="button"
              className="dashboard-card-link"
              onClick={tool.title === 'Resume Builder' ? handleCreateResume : handleCreateCoverLetter}
              disabled={creating !== null}
            >
              {creating === (tool.title === 'Resume Builder' ? 'resume' : 'coverLetter')
                ? 'Creating…'
                : tool.action}
            </button>
          </article>
        ))}
      </div>

      <div className="dashboard-documents">
        <h2 className="dashboard-section-title">Your documents</h2>
        {loadingDocuments ? (
          <p className="dashboard-documents-empty">Loading your documents…</p>
        ) : !hasDocuments ? (
          <p className="dashboard-documents-empty">
            You haven&apos;t created a resume or cover letter yet. Use the tools above to get started.
          </p>
        ) : (
          <div className="dashboard-grid">
            {resumes.map((doc) => (
              <article key={doc.id} className="dashboard-card">
                <h2>{doc.title}</h2>
                <p>
                  Resume · {formatUpdatedAt(doc.updatedAt)}
                </p>
                <Link to={`/apps/resume-builder/${doc.id}`} className="dashboard-card-link">
                  Open resume
                </Link>
              </article>
            ))}
            {coverLetters.map((doc) => (
              <article key={doc.id} className="dashboard-card">
                <h2>{doc.title}</h2>
                <p>
                  Cover letter · {formatUpdatedAt(doc.updatedAt)}
                </p>
                <Link to={`/apps/cover-letter/${doc.id}`} className="dashboard-card-link">
                  Open cover letter
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
