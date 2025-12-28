
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
  room?: string;
  idNumber: string;
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
  medicineName: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface MessVote {
  foodId: string;
  votes: number;
  name: string;
}
