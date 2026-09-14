/**
 * User-related types for frontend-backend integration
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string;
  skills?: string[];
  role?: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Resume profile data structure (matches backend prisma schema)
 */
export interface ResumeProfileData {
  /** Template type (e.g., "classic", "modern", "minimal") */
  templateType?: string;
  
  /** Personal Information */
  personalInfo: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    headline?: string;
    summary?: string;
  };

  /** Experience/Work History (reverse chronological order) */
  experience: Array<{
    id?: string;
    title: string;
    company: string;
    location?: string;
    startDate: string; // "Jun 2022" or "2022-06"
    endDate?: string; // "Jan 2024", "Present", or null
    currentJob: boolean;
    description: string; // Markdown format with bullets
    skills?: string[];
  }>;

  /** Education (reverse chronological order) */
  education: Array<{
    id?: string;
    degree?: string;
    school: string;
    areaOfStudy?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    currentJob: boolean;
    description: string; // Markdown format with bullets
    honors?: string[];
  }>;

  /** Projects */
  projects: Array<{
    id?: string;
    name: string;
    startDate?: string;
    endDate?: string;
    currentJob: boolean;
    description: string; // Markdown format with bullets
    skills?: string[];
  }>;

  /** Certifications */
  certifications: Array<{
    id?: string;
    name: string;
    issuer: string;
    dateObtained: string;
    credentialId?: string;
    description: string;
  }>;

  /** Skills (tags) */
  skills: string[];

  /** Languages */
  languages: Array<{
    language: string;
    proficiencyLevel: string; // e.g., "Native", "Fluent", "Conversational", "Basic"
  }>;

  /** Interests */
  interests: string[];

  /** Awards & Honors */
  awardsAndHonors: Array<{
    title: string;
    issuer?: string;
    date?: string;
    description: string;
  }>;

  /** Publications */
  publications: Array<{
    id?: string;
    name: string;
    publisher?: string;
    date: string;
    citation?: string;
    description: string;
  }>;

  /** Volunteer Experience */
  volunteerExperience: Array<{
    organization: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    currentJob: boolean;
    skills: string[];
    description: string;
  }>;

  /** Contact Information */
  contactInfo: {
    summary?: string;
    headline?: string;
  };

  /** Preferences */
  preferences: {
    displayName?: string; // For API display purposes
    themePreference?: 'light' | 'dark' | 'system';
    fontPreference?: 'sans' | 'serif' | 'mono';
  };
}

// Export base User type for use with fetch calls
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};