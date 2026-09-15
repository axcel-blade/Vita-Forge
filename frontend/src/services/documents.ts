import { getProfile, uploadProfile } from './user';
import { defaultData, defaultCoverLetterData } from '../constants/defaultData';

export interface ProfileDocument {
  id: string;
  title: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resumeTitle(data: Record<string, unknown>): string {
  const profile = data?.profile as Record<string, unknown> | undefined;
  const fullName = typeof profile?.fullName === 'string' ? profile.fullName.trim() : '';
  return fullName || 'Untitled resume';
}

function coverLetterTitle(data: Record<string, unknown>): string {
  const jobTitle = typeof data?.jobTitle === 'string' ? (data.jobTitle as string).trim() : '';
  const companyName = typeof data?.companyName === 'string' ? (data.companyName as string).trim() : '';
  if (jobTitle && companyName) return `${jobTitle} at ${companyName}`;
  return jobTitle || companyName || 'Untitled cover letter';
}

function sortByUpdatedDesc(docs: ProfileDocument[]): ProfileDocument[] {
  return [...docs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function listResumes(): Promise<ProfileDocument[]> {
  const { profile } = await getProfile();
  return sortByUpdatedDesc((profile?.resumes as ProfileDocument[] | undefined) ?? []);
}

export async function listCoverLetters(): Promise<ProfileDocument[]> {
  const { profile } = await getProfile();
  return sortByUpdatedDesc((profile?.coverLetters as ProfileDocument[] | undefined) ?? []);
}

export async function getResume(id: string): Promise<ProfileDocument | null> {
  const { profile } = await getProfile();
  const resumes = (profile?.resumes as ProfileDocument[] | undefined) ?? [];
  return resumes.find((doc) => doc.id === id) ?? null;
}

export async function getCoverLetter(id: string): Promise<ProfileDocument | null> {
  const { profile } = await getProfile();
  const coverLetters = (profile?.coverLetters as ProfileDocument[] | undefined) ?? [];
  return coverLetters.find((doc) => doc.id === id) ?? null;
}

export async function createResume(): Promise<ProfileDocument> {
  const { profile } = await getProfile();
  const resumes = (profile?.resumes as ProfileDocument[] | undefined) ?? [];
  const now = new Date().toISOString();
  const doc: ProfileDocument = {
    id: makeId(),
    title: resumeTitle(defaultData),
    data: defaultData,
    createdAt: now,
    updatedAt: now,
  };
  await uploadProfile({ resumes: [...resumes, doc] });
  return doc;
}

export async function createCoverLetter(): Promise<ProfileDocument> {
  const { profile } = await getProfile();
  const coverLetters = (profile?.coverLetters as ProfileDocument[] | undefined) ?? [];
  const now = new Date().toISOString();
  const doc: ProfileDocument = {
    id: makeId(),
    title: coverLetterTitle(defaultCoverLetterData),
    data: defaultCoverLetterData,
    createdAt: now,
    updatedAt: now,
  };
  await uploadProfile({ coverLetters: [...coverLetters, doc] });
  return doc;
}

export async function saveResume(id: string, data: Record<string, unknown>): Promise<ProfileDocument> {
  const { profile } = await getProfile();
  const resumes = (profile?.resumes as ProfileDocument[] | undefined) ?? [];
  const index = resumes.findIndex((doc) => doc.id === id);
  const now = new Date().toISOString();
  const updated: ProfileDocument = {
    id,
    title: resumeTitle(data),
    data,
    createdAt: index >= 0 ? resumes[index].createdAt : now,
    updatedAt: now,
  };
  const next = index >= 0 ? resumes.map((doc, i) => (i === index ? updated : doc)) : [...resumes, updated];
  await uploadProfile({ resumes: next });
  return updated;
}

export async function saveCoverLetter(id: string, data: Record<string, unknown>): Promise<ProfileDocument> {
  const { profile } = await getProfile();
  const coverLetters = (profile?.coverLetters as ProfileDocument[] | undefined) ?? [];
  const index = coverLetters.findIndex((doc) => doc.id === id);
  const now = new Date().toISOString();
  const updated: ProfileDocument = {
    id,
    title: coverLetterTitle(data),
    data,
    createdAt: index >= 0 ? coverLetters[index].createdAt : now,
    updatedAt: now,
  };
  const next =
    index >= 0 ? coverLetters.map((doc, i) => (i === index ? updated : doc)) : [...coverLetters, updated];
  await uploadProfile({ coverLetters: next });
  return updated;
}
