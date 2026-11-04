import {
  User, TimetableEntry, AttendanceRecord, AttendanceSummary,
  CampusLocation, CampusEvent, StudyDocument, LostFoundItem,
  InterviewQuestion, RoadmapStep, NotificationItem, StudyPartner
} from '../types';

export const mockUser: User = {
  id: 1,
  username: "12204567",
  email: "student@lpu.in",
  first_name: "Amit",
  last_name: "Singh",
  student_profile: {
    reg_number: "12204567",
    course: "B.Tech Computer Science & Engineering",
    branch: "CSE",
    semester: 5,
    section: "K22DF",
    phone: "+91 9598993555",
    dark_mode: false,
    notifications_enabled: true,
    career_goal: "Full Stack AI Engineer"
  }
};

export const mockTimetableToday: TimetableEntry[] = [
  {
    id: 1,
    course: { id: 1, name: "Operating Systems & Shell Scripting", code: "CSE316", credits: 4, assigned_faculty: { id: 1, name: "Dr. Amar Kumar", department: "CSE", email: "amar.cse@lpu.co.in", office_room: "Block 34-402" } },
    day_of_week: "MON",
    day_display: "Monday",
    start_time: "09:00:00",
    end_time: "10:00:00",
    room_number: "34-402",
    section: "K22DF"
  },
  {
    id: 2,
    course: { id: 2, name: "Data Structures and Algorithms", code: "CSE205", credits: 4, assigned_faculty: { id: 2, name: "Prof. Javed Sheikh", department: "CSE", email: "javed.cse@lpu.co.in", office_room: "Block 34-508" } },
    day_of_week: "MON",
    day_display: "Monday",
    start_time: "10:15:00",
    end_time: "11:15:00",
    room_number: "34-508",
    section: "K22DF"
  },
  {
    id: 3,
    course: { id: 3, name: "Artificial Intelligence & Expert Systems", code: "INT404", credits: 4, assigned_faculty: { id: 4, name: "Dr. Priya Sharma", department: "AI & Data Science", email: "priya.ai@lpu.co.in", office_room: "Block 35-304" } },
    day_of_week: "MON",
    day_display: "Monday",
    start_time: "12:00:00",
    end_time: "13:00:00",
    room_number: "35-304",
    section: "K22DF"
  }
];

export const mockAttendanceSummary: AttendanceSummary = {
  overall_percentage: 82.4,
  total_subjects: 5,
  total_classes_held: 138,
  total_classes_attended: 114,
  critical_subjects_count: 1,
  warning_subjects_count: 1,
  records: [
    {
      id: 1,
      subject_name: "Data Structures and Algorithms",
      subject_code: "CSE205",
      total_classes: 32,
      classes_attended: 28,
      target_percentage: 75.0,
      faculty_name: "Prof. Javed Sheikh",
      current_percentage: 87.5,
      classes_needed: 0,
      max_missable_classes: 5,
      status_level: "safe"
    },
    {
      id: 2,
      subject_name: "Operating Systems",
      subject_code: "CSE316",
      total_classes: 30,
      classes_attended: 24,
      target_percentage: 75.0,
      faculty_name: "Dr. Amar Kumar",
      current_percentage: 80.0,
      classes_needed: 0,
      max_missable_classes: 2,
      status_level: "safe"
    },
    {
      id: 3,
      subject_name: "Artificial Intelligence",
      subject_code: "INT404",
      total_classes: 28,
      classes_attended: 25,
      target_percentage: 75.0,
      faculty_name: "Dr. Priya Sharma",
      current_percentage: 89.3,
      classes_needed: 0,
      max_missable_classes: 5,
      status_level: "safe"
    },
    {
      id: 4,
      subject_name: "Discrete Mathematics",
      subject_code: "MTH401",
      total_classes: 26,
      classes_attended: 18,
      target_percentage: 75.0,
      faculty_name: "Dr. Jasmeet Singh",
      current_percentage: 69.2,
      classes_needed: 6,
      max_missable_classes: 0,
      status_level: "critical"
    },
    {
      id: 5,
      subject_name: "Mobile & Cloud Applications",
      subject_code: "CSE326",
      total_classes: 22,
      classes_attended: 19,
      target_percentage: 75.0,
      faculty_name: "Dr. Amar Kumar",
      current_percentage: 86.4,
      classes_needed: 0,
      max_missable_classes: 3,
      status_level: "safe"
    }
  ]
};

export const mockCampusLocations: CampusLocation[] = [
  {
    id: 1,
    name: "Block 34 – Computer Science & IT Hub",
    category: "academic",
    category_display: "Academic Block",
    block_number: "Block 34",
    floor_or_room: "Floors 1-6, Labs 1-8",
    latitude: 31.2555,
    longitude: 75.7042,
    description: "Primary home of School of Computer Science & Engineering. Advanced computing labs, high-speed workstations, faculty chambers.",
    qr_code_id: "LPU-BLK34-CSE",
    is_popular: true
  },
  {
    id: 2,
    name: "Block 37 & 38 – Central Library",
    category: "library",
    category_display: "Central Library",
    block_number: "Block 38",
    floor_or_room: "Central 4-Floor Atrium",
    latitude: 31.2562,
    longitude: 75.7050,
    description: "Over 1.5 million print volumes, 30,000+ IEEE journals, reading halls open 24/7 during examinations.",
    qr_code_id: "LPU-LIB-MAIN",
    is_popular: true
  },
  {
    id: 3,
    name: "Baldev Raj Mittal Unipolis",
    category: "sports",
    category_display: "Amphitheater & Stage",
    block_number: "Unipolis",
    floor_or_room: "Open Air Stage",
    latitude: 31.2549,
    longitude: 75.7065,
    description: "Iconic open amphitheater for national hackathons, cultural festivals, Youth Vibe, and grand guest performances.",
    qr_code_id: "LPU-UNIPOLIS-MAIN",
    is_popular: true
  },
  {
    id: 4,
    name: "UniMall Commercial Complex & Food Court",
    category: "cafeteria",
    category_display: "Food & Shopping",
    block_number: "UniMall",
    floor_or_room: "Multi-Storey Complex",
    latitude: 31.2522,
    longitude: 75.7048,
    description: "Food court with Dominos, Subway, Cafe Coffee Day, stationery shops, electronics repair, and department store.",
    qr_code_id: "LPU-UNIMALL",
    is_popular: true
  },
  {
    id: 5,
    name: "Block 32 – Career Services & Admissions",
    category: "office",
    category_display: "Administrative Office",
    block_number: "Block 32",
    floor_or_room: "Ground & First Floor",
    latitude: 31.2538,
    longitude: 75.7031,
    description: "Central Placement Cell coordination, interview rooms, international affairs, and student counseling.",
    qr_code_id: "LPU-BLK32-CAREER",
    is_popular: true
  },
  {
    id: 6,
    name: "UniHospital 24/7 Healthcare Center",
    category: "office",
    category_display: "Healthcare",
    block_number: "Main Gate Health Center",
    floor_or_room: "Complete Center",
    latitude: 31.2518,
    longitude: 75.7055,
    description: "Free medical checkups for students, 24/7 trauma emergency, pharmacy, ambulance, and dental clinic.",
    qr_code_id: "LPU-HOSPITAL",
    is_popular: true
  }
];

export const mockCampusEvents: CampusEvent[] = [
  {
    id: 1,
    title: "HackLPU 2026 – 36hr National Hackathon",
    category: "hackathon",
    category_display: "Hackathon & Coding",
    description: "Flagship 36-hour hackathon bringing together 2000+ top student developers across India. Generative AI, Web3, Smart Mobility tracks with Rs 5,00,000 in cash awards.",
    venue: "Baldev Raj Mittal Unipolis",
    organizer: "Google Developer Student Club & Coding Oasis",
    start_date: "2026-11-14T09:00:00Z",
    end_date: "2026-11-15T21:00:00Z",
    registration_url: "https://hacklpu2026.devpost.com",
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600"
  },
  {
    id: 2,
    title: "Generative AI & Agentic Systems Workshop",
    category: "workshop",
    category_display: "Technical Workshop",
    description: "Practical masterclass on Google Gemini 1.5/2.0 APIs, RAG architecture, PyMuPDF pipelines, and building autonomous multi-agent systems.",
    venue: "Block 34, 4th Floor Audi",
    organizer: "Division of Student Affairs & CSE Dept",
    start_date: "2026-11-18T14:00:00Z",
    end_date: "2026-11-18T18:00:00Z",
    registration_url: "https://ums.lpu.in/workshops",
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
  },
  {
    id: 3,
    title: "Microsoft & Tier-1 Placement Drive Briefing",
    category: "placement",
    category_display: "Placement Drive",
    description: "Official orientation session on online assessment rounds, core DSA topics, system design requirements, and behavioral interview expectations.",
    venue: "Shanti Devi Mittal Auditorium",
    organizer: "Division of Career Services (Block 32)",
    start_date: "2026-11-20T10:00:00Z",
    end_date: "2026-11-20T13:00:00Z",
    registration_url: "https://ums.lpu.in/placement",
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600"
  }
];

export const mockLostFoundItems: LostFoundItem[] = [
  {
    id: 1,
    item_type: "lost",
    item_type_display: "Lost Item",
    title: "HP Pavilion 65W Laptop Charger",
    category: "electronics",
    category_display: "Electronics",
    description: "Left in Block 34 Lab 402 around 11:30 AM. Has an identifiable orange tape on the cable head.",
    location_name: "Block 34, Lab 402",
    date_time: "2026-11-03T11:30:00Z",
    contact_phone: "+91 9598993555",
    status: "active"
  },
  {
    id: 2,
    item_type: "found",
    item_type_display: "Found Item",
    title: "Black Noise ColorFit Smartwatch",
    category: "accessories",
    category_display: "Accessories",
    description: "Found on second floor reading hall desk in Central Library. Submitted to library helpdesk.",
    location_name: "Central Library Block 38",
    date_time: "2026-11-03T16:00:00Z",
    contact_phone: "+91 9876543210",
    status: "active"
  },
  {
    id: 3,
    item_type: "found",
    item_type_display: "Found Item",
    title: "LPU Student ID Card (Vikram Patel)",
    category: "id_cards",
    category_display: "ID Cards & Wallets",
    description: "Found near Domino's billing counter at UniMall. Kept safely with UniMall security.",
    location_name: "UniMall Ground Floor",
    date_time: "2026-11-02T19:15:00Z",
    contact_phone: "+91 9876543211",
    status: "active"
  }
];

export const mockInterviewQuestions: InterviewQuestion[] = [
  {
    id: 1,
    question_type: "technical",
    role_category: "Operating Systems",
    question: "Explain the difference between Processes and Threads, and what happens during a context switch.",
    sample_answer: "A process has its own address space, memory pages, and system handles. Threads within the same process share heap, code, and static memory, only maintaining private stacks and registers. Context switching between threads is much cheaper than processes because the page table and TLB cache don't need invalidation.",
    tips: "Highlight memory overhead, IPC vs shared memory, and TLB invalidation cost.",
    difficulty: "Medium"
  },
  {
    id: 2,
    question_type: "dsa",
    role_category: "Graphs",
    question: "How do you detect cycles in directed versus undirected graphs?",
    sample_answer: "Undirected graphs can use DFS with a parent pointer or Disjoint Set Union (Union-Find). Directed graphs require tracking vertices in the current recursive call stack (3-color DFS) or using Kahn's topological sort algorithm with in-degrees.",
    tips: "Explain why simple visited set works for undirected but causes false cycles in DAGs.",
    difficulty: "Hard"
  },
  {
    id: 3,
    question_type: "hr",
    role_category: "Behavioral",
    question: "Describe a project deadline at LPU where requirements shifted unexpectedly. How did you handle it?",
    sample_answer: "Use the STAR method: Situation (hackathon or course capstone deadline), Task (deliverable scope), Action (reprioritized MVP features, divided tasks transparently, communicated with mentor), Result (completed working product on time).",
    tips: "Focus on composure, teamwork, and proactive communication.",
    difficulty: "Easy"
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Upcoming Class: Operating Systems",
    message: "CSE316 starts at 09:00 AM in Room 34-402 with Dr. Amar Kumar.",
    notification_type: "class",
    is_read: false,
    created_at: "10 mins ago"
  },
  {
    id: 2,
    title: "Attendance Warning: Discrete Mathematics",
    message: "Your attendance in MTH401 is 69.2% (below 75%). Attend next 6 classes to become eligible for exams.",
    notification_type: "attendance",
    is_read: false,
    created_at: "1 hour ago"
  },
  {
    id: 3,
    title: "HackLPU 2026 Registration Open",
    message: "Rs 5,00,000 prize pool. Team registration closes in 4 days. Register on Devpost.",
    notification_type: "event",
    is_read: true,
    created_at: "Yesterday"
  }
];
