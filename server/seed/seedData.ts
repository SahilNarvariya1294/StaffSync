import bcrypt from 'bcryptjs';
import { dbStore } from '../services/dbStore.js';
import { dbManager } from '../config/db.js';

export async function initializeSeedData() {
  const existingUsers = await dbStore.getAllUsers();
  if (existingUsers.length > 0) {
    console.log(`Database already contains ${existingUsers.length} users. Skipping seed.`);
    return;
  }

  console.log('Seeding initial StaffSync database...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 1. Create Users
  const hrUser = await dbStore.createUser({
    name: 'Sarah Jenkins',
    email: 'hr@staffsync.com',
    password: hashedPassword,
    role: 'hr',
    department: 'Human Resources',
    position: 'Senior HR Operations Officer',
    status: 'active',
  });

  const managerUser = await dbStore.createUser({
    name: 'David Miller',
    email: 'manager@staffsync.com',
    password: hashedPassword,
    role: 'manager',
    department: 'Engineering',
    position: 'Engineering Lead & Tech Manager',
    status: 'active',
  });

  const emp1User = await dbStore.createUser({
    name: 'Alex Rivera',
    email: 'employee@staffsync.com',
    password: hashedPassword,
    role: 'employee',
    department: 'Engineering',
    position: 'Full Stack Software Engineer',
    status: 'active',
  });

  const emp2User = await dbStore.createUser({
    name: 'Emily Chen',
    email: 'emily@staffsync.com',
    password: hashedPassword,
    role: 'employee',
    department: 'Design & UX',
    position: 'Product Designer',
    status: 'active',
  });

  const emp3User = await dbStore.createUser({
    name: 'Marcus Vance',
    email: 'marcus@staffsync.com',
    password: hashedPassword,
    role: 'employee',
    department: 'Engineering',
    position: 'QA Automation Engineer',
    status: 'active',
  });

  // 2. Create Employee Profile Records
  await dbStore.createEmployee({
    userId: hrUser._id,
    employeeId: 'EMP-1001',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Springfield, IL',
    emergencyContact: {
      name: 'Tom Jenkins',
      phone: '+1 (555) 998-1122',
      relationship: 'Spouse',
    },
    dateOfJoining: '2021-03-15',
    managerId: null,
    skills: ['Talent Acquisition', 'Labor Compliance', 'People Operations', 'Conflict Resolution'],
    salary: 85000,
    workLocation: 'On-site',
  });

  await dbStore.createEmployee({
    userId: managerUser._id,
    employeeId: 'EMP-1002',
    phone: '+1 (555) 345-6789',
    address: '1200 Tech Boulevard, Austin, TX',
    emergencyContact: {
      name: 'Claire Miller',
      phone: '+1 (555) 887-3344',
      relationship: 'Spouse',
    },
    dateOfJoining: '2020-06-01',
    managerId: null,
    skills: ['Engineering Management', 'System Architecture', 'Agile/Scrum', 'Mentorship', 'Cloud Ops'],
    salary: 130000,
    workLocation: 'Hybrid',
  });

  await dbStore.createEmployee({
    userId: emp1User._id,
    employeeId: 'EMP-1003',
    phone: '+1 (555) 456-7890',
    address: '45 Silicon Way, Austin, TX',
    emergencyContact: {
      name: 'Elena Rivera',
      phone: '+1 (555) 776-5544',
      relationship: 'Sister',
    },
    dateOfJoining: '2023-01-10',
    managerId: managerUser._id,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'REST APIs', 'Docker'],
    salary: 95000,
    workLocation: 'Hybrid',
  });

  await dbStore.createEmployee({
    userId: emp2User._id,
    employeeId: 'EMP-1004',
    phone: '+1 (555) 567-8901',
    address: '88 Canvas Circle, Austin, TX',
    emergencyContact: {
      name: 'Howard Chen',
      phone: '+1 (555) 665-4433',
      relationship: 'Father',
    },
    dateOfJoining: '2023-05-15',
    managerId: managerUser._id,
    skills: ['Figma', 'UI Design Systems', 'User Research', 'Design Sprints', 'Accessibility'],
    salary: 88000,
    workLocation: 'Hybrid',
  });

  await dbStore.createEmployee({
    userId: emp3User._id,
    employeeId: 'EMP-1005',
    phone: '+1 (555) 678-9012',
    address: '302 Cypress Ave, Austin, TX',
    emergencyContact: {
      name: 'Patricia Vance',
      phone: '+1 (555) 554-3322',
      relationship: 'Mother',
    },
    dateOfJoining: '2023-08-20',
    managerId: managerUser._id,
    skills: ['Cypress', 'Playwright', 'Jest', 'CI/CD Pipelines', 'Regression Testing'],
    salary: 84000,
    workLocation: 'Remote',
  });

  // 3. Create Sample Leave Requests
  await dbStore.createLeaveRequest({
    employeeId: emp1User._id,
    managerId: managerUser._id,
    leaveType: 'Casual',
    startDate: '2026-11-05',
    endDate: '2026-11-07',
    totalDays: 3,
    reason: 'Family reunion and personal commitments out of state.',
    status: 'pending',
  });

  await dbStore.createLeaveRequest({
    employeeId: emp2User._id,
    managerId: managerUser._id,
    leaveType: 'Sick',
    startDate: '2026-10-20',
    endDate: '2026-10-21',
    totalDays: 2,
    reason: 'Severe seasonal flu and recovery prescription.',
    status: 'approved',
    reviewedBy: hrUser._id,
    reviewedAt: new Date(Date.now() - 7 * 86400000),
    reviewRemarks: 'Approved. Rest well and prioritize recovery.',
  });

  await dbStore.createLeaveRequest({
    employeeId: emp3User._id,
    managerId: managerUser._id,
    leaveType: 'Annual',
    startDate: '2026-12-15',
    endDate: '2026-12-22',
    totalDays: 6,
    reason: 'Annual planned holiday vacation with family.',
    status: 'approved',
    reviewedBy: hrUser._id,
    reviewedAt: new Date(Date.now() - 3 * 86400000),
    reviewRemarks: 'Approved. Handover plans noted with team lead.',
  });

  await dbStore.createLeaveRequest({
    employeeId: emp1User._id,
    managerId: managerUser._id,
    leaveType: 'Unpaid',
    startDate: '2026-10-10',
    endDate: '2026-10-10',
    totalDays: 1,
    reason: 'Personal errands.',
    status: 'rejected',
    reviewedBy: hrUser._id,
    reviewedAt: new Date(Date.now() - 15 * 86400000),
    reviewRemarks: 'Critical release deadline coincided on that day; please coordinate with manager first.',
  });

  // 4. Create Today and Past Attendance Logs
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

  // Today check-in for Alex Rivera (active work)
  const alexToday = await dbStore.markCheckIn(emp1User._id, todayStr, 'On-site', 'Morning sprint kickoff attended.');
  
  // Emily Chen checked in and out today
  await dbStore.markCheckIn(emp2User._id, todayStr, 'On-site', 'Design workshop at HQ.');
  await dbStore.markCheckOut(emp2User._id, todayStr);

  // Marcus Vance checked in today
  await dbStore.markCheckIn(emp3User._id, todayStr, 'Remote', 'Automation test suite run.');

  // Past logs for team
  const pastRecords: Array<{ emp: any; date: string; in: string; out: string; mode: 'On-site' | 'Remote' }> = [
    { emp: emp1User._id, date: yesterday, in: '09:02:00', out: '17:45:00', mode: 'On-site' },
    { emp: emp2User._id, date: yesterday, in: '08:50:00', out: '17:15:00', mode: 'On-site' },
    { emp: emp3User._id, date: yesterday, in: '09:15:00', out: '18:00:00', mode: 'Remote' },
    { emp: hrUser._id, date: yesterday, in: '08:45:00', out: '17:30:00', mode: 'On-site' },
    { emp: managerUser._id, date: yesterday, in: '09:00:00', out: '18:30:00', mode: 'On-site' },
    { emp: emp1User._id, date: dayBefore, in: '09:05:00', out: '17:30:00', mode: 'On-site' },
    { emp: emp2User._id, date: dayBefore, in: '09:00:00', out: '17:00:00', mode: 'On-site' },
    { emp: emp3User._id, date: dayBefore, in: '09:30:00', out: '18:15:00', mode: 'Remote' },
  ];

  for (const p of pastRecords) {
    const inTime = `${p.date}T${p.in}.000Z`;
    const outTime = `${p.date}T${p.out}.000Z`;
    const dur = Math.round((new Date(outTime).getTime() - new Date(inTime).getTime()) / 60000);
    const attData = {
      employeeId: p.emp,
      date: p.date,
      checkIn: inTime,
      checkOut: outTime,
      workDurationMinutes: dur,
      status: 'present',
      workMode: p.mode,
      notes: 'Standard daily business hours completed.',
      createdAt: inTime,
      updatedAt: outTime,
    };
    dbManager.getState().attendance.push({
      _id: Math.floor(Math.random() * 10000000).toString(16).padStart(24, '0'),
      ...attData,
    });
  }
  dbManager.saveState();

  // 5. Create Announcements
  await dbStore.createAnnouncement({
    title: 'Q4 Annual Company Summit & Strategic Roadmap Announcement',
    content: 'We are thrilled to announce our Q4 Company Summit scheduled for next month. All departments will gather to review key performance highlights, celebrate milestones, and unveil the company product roadmap for the upcoming year. Detailed schedule and agenda will follow shortly.',
    category: 'Event',
    priority: 'High',
    isPinned: true,
    publishedBy: hrUser._id,
  });

  await dbStore.createAnnouncement({
    title: 'Workplace Wellness and Flexible Hybrid Policy Guidelines',
    content: 'HR has published updated guidelines concerning flexible working arrangements and wellness days. Employees are reminded to coordinate with their respective managers regarding hybrid scheduling and submit leave requests at least 3 business days in advance.',
    category: 'Policy',
    priority: 'Medium',
    isPinned: false,
    publishedBy: hrUser._id,
  });

  await dbStore.createAnnouncement({
    title: 'Upcoming Public Holiday Observance: Office Closure Notice',
    content: 'Please be advised that all offices will be closed on the upcoming public holiday. Emergency contact numbers will remain active for critical operational queries. Enjoy the restful break with your families!',
    category: 'Holiday',
    priority: 'Low',
    isPinned: false,
    publishedBy: hrUser._id,
  });

  // 6. Create Training and Development Programs (Managed by David Miller)
  await dbStore.createTrainingProgram({
    title: 'Advanced Cloud Architecture & Microservices Certification',
    description: 'A comprehensive technical program designed to upskill engineering team members in distributed systems, event-driven microservices, container orchestration, and serverless best practices.',
    managerId: managerUser._id,
    category: 'Technical',
    startDate: '2026-10-01',
    endDate: '2026-12-15',
    status: 'Active',
    assignedEmployees: [
      {
        employeeId: emp1User._id,
        progress: 75,
        status: 'In Progress',
        notes: 'Passed Module 1 & 2 architecture quizzes with honors.',
      },
      {
        employeeId: emp3User._id,
        progress: 45,
        status: 'In Progress',
        notes: 'Currently working on containerized testing modules.',
      },
    ],
  });

  await dbStore.createTrainingProgram({
    title: 'Design Systems & WCAG 2.2 Accessibility Compliance',
    description: 'Hands-on practical workshop covering inclusive design principles, responsive tokens, color contrast compliance, and automated accessibility auditing.',
    managerId: managerUser._id,
    category: 'Technical',
    startDate: '2026-09-15',
    endDate: '2026-11-20',
    status: 'Active',
    assignedEmployees: [
      {
        employeeId: emp2User._id,
        progress: 90,
        status: 'In Progress',
        notes: 'Final capstone component library review pending.',
      },
    ],
  });

  await dbStore.createTrainingProgram({
    title: 'Cross-Functional Team Collaboration & Technical Leadership',
    description: 'Professional development curriculum on project estimation, peer mentoring, constructive code reviews, and stakeholder communication for senior individual contributors.',
    managerId: managerUser._id,
    category: 'Leadership',
    startDate: '2026-08-01',
    endDate: '2026-10-15',
    status: 'Completed',
    assignedEmployees: [
      {
        employeeId: emp1User._id,
        progress: 100,
        status: 'Completed',
        completionDate: '2026-10-12',
        notes: 'Successfully presented final team case study.',
      },
    ],
  });

  console.log('StaffSync initial seed data successfully loaded!');
}
