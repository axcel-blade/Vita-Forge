import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const now = new Date().toISOString();

const sampleResumes = [
  {
    id: randomUUID(),
    title: 'Software Engineer Resume',
    data: {
      fullName: 'Jordan Avery',
      email: 'demo@vitaforge.dev',
      phone: '+1 (555) 010-2024',
      summary: 'Full-stack engineer with 6 years building resume and career tooling.',
      experience: [
        {
          company: 'Northwind Analytics',
          title: 'Senior Software Engineer',
          startDate: '2022-03',
          endDate: 'Present',
          bullets: [
            'Led migration of the resume rendering pipeline to a template-driven engine, cutting generation time by 40%.',
            'Mentored two junior engineers and ran the team\'s weekly design reviews.',
          ],
        },
        {
          company: 'Bluepoint Labs',
          title: 'Software Engineer',
          startDate: '2019-06',
          endDate: '2022-02',
          bullets: [
            'Built the initial version of the cover letter export service using PDF templating.',
            'Owned CI/CD pipeline for three internal services.',
          ],
        },
      ],
      education: [
        {
          school: 'State University',
          degree: 'B.S. Computer Science',
          graduationYear: '2019',
        },
      ],
      skills: ['TypeScript', 'React', 'NestJS', 'PostgreSQL', 'Docker'],
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Product Manager Resume',
    data: {
      fullName: 'Jordan Avery',
      email: 'demo@vitaforge.dev',
      phone: '+1 (555) 010-2024',
      summary: 'Product-minded engineer transitioning into PM roles, with a track record of shipping resume tooling used by thousands of job seekers.',
      experience: [
        {
          company: 'Northwind Analytics',
          title: 'Technical Product Lead',
          startDate: '2022-03',
          endDate: 'Present',
          bullets: [
            'Defined the roadmap for the resume builder product, prioritizing features based on user interviews.',
            'Partnered with design and engineering to launch the AI-assisted cover letter generator.',
          ],
        },
      ],
      education: [
        {
          school: 'State University',
          degree: 'B.S. Computer Science',
          graduationYear: '2019',
        },
      ],
      skills: ['Product Strategy', 'Roadmapping', 'User Research', 'SQL'],
    },
    createdAt: now,
    updatedAt: now,
  },
];

const sampleCoverLetters = [
  {
    id: randomUUID(),
    title: 'Northwind Analytics Cover Letter',
    data: {
      recipient: 'Hiring Manager',
      company: 'Northwind Analytics',
      role: 'Senior Software Engineer',
      body:
        'I am excited to apply for the Senior Software Engineer role at Northwind Analytics. ' +
        'In my current position I led the migration of our resume rendering pipeline to a ' +
        'template-driven engine, cutting generation time by 40% while mentoring two junior ' +
        'engineers. I would welcome the opportunity to bring that same focus on performance ' +
        'and mentorship to your team.',
      closing: 'Sincerely,\nJordan Avery',
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Bluepoint Labs Referral Cover Letter',
    data: {
      recipient: 'Talent Team',
      company: 'Bluepoint Labs',
      role: 'Software Engineer',
      body:
        'A former colleague referred me for the Software Engineer opening on your team. ' +
        'During my time at Bluepoint Labs I built the initial version of the cover letter ' +
        'export service and owned the CI/CD pipeline for three internal services, and I am ' +
        'eager to return in a role where I can keep improving developer tooling.',
      closing: 'Best regards,\nJordan Avery',
    },
    createdAt: now,
    updatedAt: now,
  },
];

const sampleProfile = {
  resumes: sampleResumes,
  coverLetters: sampleCoverLetters,
};

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@vitaforge.dev' },
    update: {},
    create: {
      email: 'demo@vitaforge.dev',
      name: 'Jordan Avery',
      passwordHash,
      role: 'user',
    },
  });

  await prisma.resumeProfile.upsert({
    where: { userId: user.id },
    update: { payload: sampleProfile },
    create: { userId: user.id, payload: sampleProfile },
  });

  await prisma.resumeVersion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { payload: sampleProfile, label: 'Initial draft' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      userId: user.id,
      payload: sampleProfile,
      label: 'Initial draft',
    },
  });

  console.log(
    `Seeded demo user: ${user.email} / Password123! with ${sampleResumes.length} resumes and ${sampleCoverLetters.length} cover letters`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
