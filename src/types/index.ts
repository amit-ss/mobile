export interface StudentProfile {
  reg_number: string;
  course: string;
  branch: string;
  semester: number;
  section: string;
  phone?: string;
  profile_photo?: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
  career_goal: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  student_profile?: StudentProfile;
}

export interface ChatMessage {
  id: string | number;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  sources?: string[];
  session_id?: string;
}

export interface Faculty {
  id: number;
  name: string;
  department: string;
  email: string;
  phone?: string;
  office_room: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  assigned_faculty?: Faculty;
}

export interface TimetableEntry {
  id: number;
  course: Course;
  day_of_week: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
  day_display?: string;
  start_time: string;
  end_time: string;
  room_number: string;
  section: string;
}

export interface AttendanceRecord {
  id: number;
  subject_name: string;
  subject_code: string;
  total_classes: number;
  classes_attended: number;
  target_percentage: number;
  faculty_name: string;
  current_percentage: number;
  classes_needed: number;
  max_missable_classes: number;
  status_level: 'safe' | 'warning' | 'critical';
}

export interface AttendanceSummary {
  overall_percentage: number;
  total_subjects: number;
  total_classes_held: number;
  total_classes_attended: number;
  critical_subjects_count: number;
  warning_subjects_count: number;
  records: AttendanceRecord[];
}

export interface CampusLocation {
  id: number;
  name: string;
  category: 'academic' | 'lab' | 'hostel' | 'cafeteria' | 'library' | 'sports' | 'office';
  category_display?: string;
  block_number: string;
  floor_or_room: string;
  latitude: number;
  longitude: number;
  description: string;
  qr_code_id?: string;
  image_url?: string;
  is_popular?: boolean;
}

export interface CampusEvent {
  id: number;
  title: string;
  category: 'hackathon' | 'workshop' | 'cultural' | 'sports' | 'seminar' | 'placement';
  category_display?: string;
  description: string;
  image_url?: string;
  venue: string;
  organizer: string;
  start_date: string;
  end_date: string;
  registration_url: string;
  is_featured: boolean;
  is_saved?: boolean;
}

export interface StudyDocument {
  id: number;
  title: string;
  subject: string;
  file?: string;
  extracted_text?: string;
  summary: string;
  page_count: number;
  flashcards_count?: number;
  quizzes_count?: number;
  created_at: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  is_mastered: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface LostFoundItem {
  id: number;
  item_type: 'lost' | 'found';
  item_type_display?: string;
  title: string;
  category: 'electronics' | 'id_cards' | 'books' | 'accessories' | 'keys' | 'other';
  category_display?: string;
  description: string;
  location_name: string;
  date_time: string;
  photo?: string;
  contact_phone: string;
  status: 'active' | 'claimed' | 'returned';
}

export interface CareerAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  recommended_projects: string[];
  keywords_to_add: string[];
}

export interface InterviewQuestion {
  id: number;
  question_type: 'hr' | 'technical' | 'dsa';
  role_category: string;
  question: string;
  sample_answer: string;
  tips?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface RoadmapStep {
  week: number;
  title: string;
  focus: string;
  milestone: string;
  hours: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: 'class' | 'attendance' | 'event' | 'exam' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface StudyPartner {
  id: number;
  name: string;
  branch: string;
  focus_area: string;
  subjects: string[];
  looking_for: string;
  avatar: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  Timetable: undefined;
  Attendance: undefined;
  StudyAssistant: undefined;
  Flashcards: { docId?: number };
  LostFound: undefined;
  ReportItem: undefined;
  Career: undefined;
  StudyPartner: undefined;
  CampusMap: undefined;
  QRScanner: undefined;
  EventDetail: { event: CampusEvent };
  Notifications: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  AIChat: undefined;
  Campus: undefined;
  Events: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
