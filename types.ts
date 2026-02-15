
export interface EventUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface ScheduledReminder {
  id: string;
  message: string;
  scheduledAt: string;
  isAdminReminder: boolean;
  status: 'PENDING' | 'SENT';
}

export interface Event {
  id: string;
  name: string;
  registrationDate: string;
  defaultMessage: string;
  participants: EventUser[];
  reminders: ScheduledReminder[];
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface MessageLog {
  id: string;
  eventId?: string;
  eventName?: string;
  recipientName?: string;
  studentId?: string;
  studentName?: string;
  reminderId?: string;
  phone: string;
  content: string;
  status: 'DELIVERED' | 'FAILED' | 'QUEUED';
  sentAt: string;
  templateParams?: string[];
}

export type View = 'events' | 'logs' | 'settings' | 'event-detail' | 'students';

export enum ReminderType {
  NEW_JOB = 'NEW_JOB',
  DEADLINE = 'DEADLINE',
  INTERVIEW = 'INTERVIEW'
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  email?: string;
  department?: string;
  batch?: string;
  isValidPhone: boolean;
  hasOptedIn: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  deadline: string;
  link: string;
  description: string;
}

export interface Reminder {
  id: string;
  jobId: string;
  type: ReminderType | string;
  templateId: string;
  scheduledAt: string;
  targetGroup: string[];
  status: 'SENT' | 'PENDING';
}

export interface ApiConfig {
  phoneId: string;
  accessToken: string;
  isProduction: boolean;
  useFallback: boolean;
}

export interface AdminCredentials {
  username: string;
  password: string;
}
