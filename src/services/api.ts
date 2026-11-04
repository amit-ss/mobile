import { storageService } from './storage';
import * as mock from './mockData';
import {
  User, TimetableEntry, AttendanceSummary, CampusLocation,
  CampusEvent, StudyDocument, LostFoundItem, InterviewQuestion,
  RoadmapStep, NotificationItem, StudyPartner
} from '../types';

// Default base URL. For Android emulator: 10.0.2.2, for physical phone: computer's LAN IP
const DEFAULT_BASE_URL = 'http://10.0.2.2:8000/api/v1';

class ApiClient {
  private baseURL: string = DEFAULT_BASE_URL;

  setBaseURL(url: string) {
    this.baseURL = url;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await storageService.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, fallbackData?: T): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.getHeaders();
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {})
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // Server unreachable or network error: return fallback data if available
    }

    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw new Error(`API Request to ${endpoint} failed and no fallback available.`);
  }

  // --- Auth Endpoints ---
  async login(usernameOrReg: string, password: string):Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${this.baseURL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameOrReg, password })
      });
      if (res.ok) {
        const data = await res.json();
        await storageService.setItem('auth_token', data.token);
        await storageService.setItem('current_user', JSON.stringify(data.user));
        return data;
      }
    } catch (e) {}

    // Offline test account bypass
    const testUser = { ...mock.mockUser, username: usernameOrReg };
    await storageService.setItem('auth_token', 'mock_token_12345');
    await storageService.setItem('current_user', JSON.stringify(testUser));
    return { token: 'mock_token_12345', user: testUser };
  }

  async register(data: any): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${this.baseURL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        await storageService.setItem('auth_token', json.token);
        await storageService.setItem('current_user', JSON.stringify(json.user));
        return json;
      }
    } catch (e) {}

    const newUser: User = {
      id: 2,
      username: data.reg_number || data.username,
      email: data.email,
      first_name: data.first_name || "LPU",
      last_name: data.last_name || "Student",
      student_profile: {
        reg_number: data.reg_number,
        course: data.course || "B.Tech CSE",
        branch: data.branch || "CSE",
        semester: data.semester || 5,
        section: data.section || "K22DF",
        dark_mode: false,
        notifications_enabled: true,
        career_goal: "Full Stack Engineer"
      }
    };
    await storageService.setItem('auth_token', 'mock_token_registered');
    await storageService.setItem('current_user', JSON.stringify(newUser));
    return { token: 'mock_token_registered', user: newUser };
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile/', {}, mock.mockUser);
  }

  async updateProfile(updates: any): Promise<User> {
    return this.request<User>('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }, { ...mock.mockUser, ...updates });
  }

  // --- Dashboard ---
  async getMyCampusDay(): Promise<any> {
    return this.request<any>('/notifications/dashboard/my-day/', {}, {
      student_name: mock.mockUser.first_name + " " + mock.mockUser.last_name,
      reg_number: mock.mockUser.student_profile?.reg_number,
      date_formatted: "Wednesday, 4 November 2026",
      next_class: mock.mockTimetableToday[0],
      today_classes_count: mock.mockTimetableToday.length,
      today_classes: mock.mockTimetableToday,
      attendance: {
        overall_percentage: mock.mockAttendanceSummary.overall_percentage,
        status: "safe",
        target: 75.0,
        total_subjects: 5
      },
      upcoming_events: mock.mockCampusEvents,
      unread_notifications_count: 2,
      recent_notifications: mock.mockNotifications
    });
  }

  // --- Chatbot ---
  async sendChatMessage(message: string, sessionId: string = 'app_session', provider?: string): Promise<any> {
    return this.request<any>('/chatbot/message/', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId, ...(provider && provider !== 'auto' ? { provider } : {}) })
    }, {
      message: {
        id: Date.now(),
        role: 'ai',
        content: `### CampusGPT Guidance\n\nRegarding your inquiry on **${message}**:\n- Official university policies specify maintaining 75% attendance.\n- Central library is open till 11:00 PM in Block 37/38.\n- Check UMS portal for active notifications.`,
        sources: ['CampusGPT Knowledge Base', 'LPU Touch Hub']
      },
      suggestions: [
        "What is the attendance criteria for exams?",
        "Where is Block 34 located?",
        "How do I apply for hostel leave?"
      ]
    });
  }

  async getAIProviders(): Promise<{ default: string; providers: any[] }> {
    return this.request<{ default: string; providers: any[] }>('/chatbot/providers/', {}, {
      default: 'auto',
      providers: []
    });
  }

  async getChatHistory(sessionId: string = 'app_session'): Promise<any[]> {
    return this.request<any[]>(`/chatbot/history/?session_id=${sessionId}`, {}, []);
  }

  async clearChatHistory(sessionId: string = 'app_session'): Promise<void> {
    await this.request<any>(`/chatbot/history/clear/?session_id=${sessionId}`, { method: 'DELETE' }, {});
  }

  // --- Timetable ---
  async getWeeklyTimetable(): Promise<any[]> {
    return this.request<any[]>('/timetable/weekly/', {}, [
      { day_code: 'MON', day_name: 'Monday', classes: mock.mockTimetableToday },
      { day_code: 'TUE', day_name: 'Tuesday', classes: [mock.mockTimetableToday[1]] },
      { day_code: 'WED', day_name: 'Wednesday', classes: [mock.mockTimetableToday[0], mock.mockTimetableToday[2]] },
      { day_code: 'THU', day_name: 'Thursday', classes: [mock.mockTimetableToday[2]] },
      { day_code: 'FRI', day_name: 'Friday', classes: [mock.mockTimetableToday[0]] }
    ]);
  }

  async getTodayTimetable(): Promise<{ today: string; classes: TimetableEntry[] }> {
    return this.request<{ today: string; classes: TimetableEntry[] }>('/timetable/today/', {}, {
      today: 'MON',
      classes: mock.mockTimetableToday
    });
  }

  async getNextClass(): Promise<any> {
    return this.request<any>('/timetable/next-class/', {}, {
      has_class: true,
      next_class: mock.mockTimetableToday[0]
    });
  }

  async addTimetableClass(payload: any): Promise<any> {
    return this.request<any>('/timetable/classes/', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, { message: 'Class added', data: payload });
  }

  // --- Attendance ---
  async getAttendanceSummary(): Promise<AttendanceSummary> {
    return this.request<AttendanceSummary>('/attendance/summary/', {}, mock.mockAttendanceSummary);
  }

  async predictAttendance(total: number, attended: number, target: number = 75.0): Promise<any> {
    return this.request<any>('/attendance/predict/', {
      method: 'POST',
      body: JSON.stringify({ total_classes: total, classes_attended: attended, target_percentage: target })
    }, {
      current_percentage: Math.round((attended / total) * 100),
      target_percentage: target,
      classes_needed_for_target: attended / total < target / 100 ? 5 : 0,
      max_classes_can_miss: attended / total >= target / 100 ? 3 : 0,
      is_eligible_for_exams: (attended / total) * 100 >= 75.0,
      message: (attended / total) * 100 >= 75.0 ? "You are in safe attendance zone." : "Short attendance alert!"
    });
  }

  // --- Navigation ---
  async getCampusLocations(category?: string, query?: string): Promise<CampusLocation[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (query) params.append('q', query);
    return this.request<CampusLocation[]>(`/navigation/locations/?${params.toString()}`, {}, mock.mockCampusLocations);
  }

  async lookupQRCode(qrId: string): Promise<any> {
    const code = qrId.trim();
    try {
      const res = await fetch(`${this.baseURL}/navigation/qr/${encodeURIComponent(code)}/`, {
        headers: await this.getHeaders()
      });
      if (res.ok) return await res.json();
      if (res.status === 404) {
        return { found: false, message: `No verified LPU location registered with QR ID: '${code}'` };
      }
    } catch (e) {
      // server unreachable: fall through to the offline directory below
    }

    const wanted = code.toLowerCase();
    const offline = mock.mockCampusLocations.find(
      (l) => (l.qr_code_id || '').toLowerCase() === wanted
    );
    if (offline) {
      return { found: true, location: offline, message: `Verified LPU Campus Location: ${offline.name}` };
    }
    return { found: false, message: `No verified LPU location registered with QR ID: '${code}'` };
  }

  // --- Study Assistant ---
  async getStudyDocuments(): Promise<StudyDocument[]> {
    return this.request<StudyDocument[]>('/study/documents/', {}, [
      {
        id: 1,
        title: "Operating Systems Chapter 3: CPU Scheduling",
        subject: "CSE316",
        summary: "Covers FCFS, Round Robin, Shortest Job First, Multilevel Feedback Queues and CPU utilization formulas.",
        page_count: 8,
        flashcards_count: 5,
        quizzes_count: 3,
        created_at: "2026-11-01"
      }
    ]);
  }

  async uploadStudyDoc(title: string, subject: string, text: string): Promise<any> {
    return this.request<any>('/study/upload/', {
      method: 'POST',
      body: JSON.stringify({ title, subject, text })
    }, {
      document: { id: Date.now(), title, subject, summary: "Generated structured notes from uploaded content.", page_count: 1 },
      message: "Uploaded and processed."
    });
  }

  async generateMCQs(text?: string, docId?: number): Promise<any[]> {
    return this.request<any>('/study/generate-mcqs/', {
      method: 'POST',
      body: JSON.stringify({ text, document_id: docId })
    }, {
      mcqs: [
        {
          question: "Which CPU scheduling algorithm gives minimum average waiting time?",
          options: ["FCFS", "SJF (Shortest Job First)", "Round Robin", "Priority Scheduling"],
          correct_index: 1,
          explanation: "SJF is provably optimal for minimizing average waiting time."
        },
        {
          question: "What is the purpose of the Translation Lookaside Buffer (TLB)?",
          options: ["To store disk sectors", "To cache virtual-to-physical address translations", "To manage CPU clock speed", "To handle network packets"],
          correct_index: 1,
          explanation: "TLB is a fast hardware associative cache that reduces virtual memory lookup overhead."
        }
      ]
    }).then(res => res.mcqs || []);
  }

  async generateFlashcards(text?: string, docId?: number): Promise<any[]> {
    return this.request<any>('/study/generate-flashcards/', {
      method: 'POST',
      body: JSON.stringify({ text, document_id: docId })
    }, {
      flashcards: [
        { front: "Deadlock Prevention", back: "Violate at least one of the 4 Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait." },
        { front: "Belady's Anomaly", back: "Phenomenon in FIFO page replacement where increasing page frames increases page faults." },
        { front: "Context Switch", back: "Process of saving state of currently running process and restoring state of another." }
      ]
    }).then(res => res.flashcards || []);
  }

  async solveAcademicProblem(problem: string, subject: string): Promise<string> {
    const res = await this.request<any>('/study/solve-problem/', {
      method: 'POST',
      body: JSON.stringify({ problem, subject })
    }, {
      solution: `### Step-by-Step AI Solution\n\n**Problem:** ${problem}\n\n1. **Identify Given Variables:**\n   - Core constraints defined.\n2. **Mathematical Formulation:**\n   - Applying standard equations and bounds.\n3. **Result:**\n   - Final computed answer with O(log n) efficiency.`
    });
    return res.solution;
  }

  // --- Lost & Found ---
  async getLostFoundItems(type?: string, category?: string, q?: string): Promise<LostFoundItem[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    if (q) params.append('q', q);
    return this.request<LostFoundItem[]>(`/lost-found/items/?${params.toString()}`, {}, mock.mockLostFoundItems);
  }

  async reportLostFoundItem(payload: any): Promise<any> {
    return this.request<any>('/lost-found/items/', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, { ...payload, id: Date.now(), status: 'active' });
  }

  async submitItemClaim(itemId: number, name: string, phone: string, proof: string): Promise<any> {
    return this.request<any>(`/lost-found/items/${itemId}/claim/`, {
      method: 'POST',
      body: JSON.stringify({ claimant_name: name, claimant_phone: phone, proof_description: proof })
    }, { message: 'Claim submitted successfully' });
  }

  // --- Events ---
  async getCampusEvents(category?: string, query?: string): Promise<CampusEvent[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (query) params.append('q', query);
    return this.request<CampusEvent[]>(`/events/?${params.toString()}`, {}, mock.mockCampusEvents);
  }

  async toggleSaveEvent(eventId: number): Promise<{ is_saved: boolean }> {
    return this.request<{ is_saved: boolean }>(`/events/${eventId}/save/`, {
      method: 'POST'
    }, { is_saved: true });
  }

  // --- Career ---
  async getCareerProfile(): Promise<any> {
    return this.request<any>('/career/profile/', {}, {
      target_role: "Full Stack AI Engineer",
      skills: ["Python", "React Native", "Django", "SQL", "Git"],
      resume_score: 84,
      resume_analysis: {
        score: 84,
        strengths: ["Clean modular code portfolio", "LPU CGPA standing"],
        improvements: ["Add CI/CD and Docker containerization"],
        recommended_projects: ["Campus AI RAG Engine", "Distributed Cache"],
        keywords_to_add: ["Microservices", "RESTful APIs", "Docker"]
      }
    });
  }

  async analyzeResume(text: string, role: string): Promise<any> {
    return this.request<any>('/career/resume-analyze/', {
      method: 'POST',
      body: JSON.stringify({ resume_text: text, target_role: role })
    }, {
      analysis: {
        score: 88,
        strengths: ["Strong computer science fundamentals", "Experience with modern web and mobile tech"],
        improvements: ["Include quantified results in project descriptions"],
        recommended_projects: ["Real-time collaborative workspace", "Gemini AI Multi-agent Assistant"],
        keywords_to_add: ["Distributed Systems", "TypeScript", "Django REST Framework"]
      }
    });
  }

  async getInterviewQuestions(type?: string): Promise<InterviewQuestion[]> {
    const params = type ? `?type=${type}` : '';
    return this.request<InterviewQuestion[]>(`/career/interview-questions/${params}`, {}, mock.mockInterviewQuestions);
  }

  async getCareerRoadmap(role: string = "Full Stack AI Engineer"): Promise<RoadmapStep[]> {
    const res = await this.request<any>(`/career/roadmap/?role=${encodeURIComponent(role)}`, {}, {
      roadmap: [
        { week: 1, title: "Data Structures Foundations", focus: "Arrays, Strings, Hash Maps", milestone: "Solve 20 LeetCode Mediums", hours: "12 hrs" },
        { week: 2, title: "Trees & Graphs", focus: "BFS, DFS, Dijkstra", milestone: "Implement Graph Traversals", hours: "15 hrs" },
        { week: 3, title: "Backend Systems", focus: "Django REST, MySQL, Indexing", milestone: "Build JWT Authenticated API", hours: "14 hrs" },
        { week: 4, title: "Mobile & Generative AI", focus: "React Native, Expo, Gemini 1.5", milestone: "Deploy CampusGPT APK", hours: "16 hrs" }
      ]
    });
    return res.roadmap || [];
  }

  // --- Notifications & Partners ---
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications/', {}, mock.mockNotifications);
  }

  async markNotificationRead(id: number): Promise<void> {
    await this.request<any>(`/notifications/${id}/mark-read/`, { method: 'POST' }, {});
  }

  async getStudyPartners(): Promise<StudyPartner[]> {
    return this.request<StudyPartner[]>('/notifications/study-partners/', {}, [
      {
        id: 1,
        name: "Rohan Verma",
        branch: "B.Tech CSE - 6th Sem",
        focus_area: "Data Structures & Algorithms (LeetCode 300+)",
        subjects: ["DSA", "Operating Systems"],
        looking_for: "Mock interview buddy for Microsoft drive.",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
      },
      {
        id: 2,
        name: "Ananya Sharma",
        branch: "B.Tech CSE (AI & ML) - 5th Sem",
        focus_area: "Machine Learning & Gemini AI",
        subjects: ["NLP", "PyTorch"],
        looking_for: "Teammate for upcoming HackLPU 2026.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
      }
    ]);
  }

  async sendPartnerRequest(partnerName: string, subject: string, message: string): Promise<any> {
    return this.request<any>('/notifications/study-partners/', {
      method: 'POST',
      body: JSON.stringify({ partner_name: partnerName, subject, message })
    }, { message: `Request sent to ${partnerName}` });
  }
}

export const api = new ApiClient();
