import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const sampleProfile = {
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

  console.log(`Seeded demo user: ${user.email} / Password123!`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
