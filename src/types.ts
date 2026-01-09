export enum UserRole {
  STUDENT = 'STUDENT',
  WARDEN = 'WARDEN',
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Changed from room?: string to allow Firestore-compatible nulls
  room: string | null;
  idNumber: string;
  photoURL?: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  createdAt: number;
  aiAnalysis?: string;
  isAnonymous?: boolean;
  adminComments?: string;
}

export interface Suggestion {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  votes: number;
}

export interface GateEntry {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: number;
  otp: string;
  action: 'EXIT' | 'ENTRY';
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
  otp?: string;
  otpUsed?: boolean;
  otpUsedAt?: number;
  needsOtpReissue?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  role: UserRole;
  createdAt: number;
}

export interface MedicalRequest {
  id: string;
  studentId: string;
  studentName: string;
  symptoms: string;
  symptomChecklist: string[];
  aiAnalysis: string; // AI suggested condition/advice
  requestedMedicines: string[]; // Names of medicines
  status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'REJECTED';
  adminComments?: string;
  createdAt: number;
}

export interface Medicine {
  id: string;
  name: string;
  category: 'FIRST_AID' | 'OTC' | 'PRESCRIPTION';
  stock: number;
  minStock: number;
  description: string;
  lastRestocked: number;
}

export interface OtpLog {
  code: string;
  studentId: string;
  expiresAt: number;
  used: boolean;
  type: 'LEAVE' | 'ENTRY';
}

export interface MessVote {
  foodId: string;
  votes: number;
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}