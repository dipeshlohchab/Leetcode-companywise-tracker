export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Unknown';
export type ProgressStatus = 'solved' | 'attempted' | 'not_attempted';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  streak: {
    current: number;
    longest: number;
    lastActivity: string | null;
  };
  totalSolved: number;
  bookmarks: string[];
  createdAt: string;
}

export interface Question {
  _id: string;
  title: string;
  titleSlug: string;
  link: string;
  difficulty: Difficulty;
  companies: string[];
  tags: string[];
  frequency: number;
  userStatus?: ProgressStatus;
  userNotes?: string;
}

export interface Progress {
  _id: string;
  userId: string;
  questionId: string | Question;
  status: ProgressStatus;
  notes: string;
  solvedAt: string | null;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProgress {
  company: string;
  total: number;
  solved: number;
  attempted: number;
  percentage: number;
}

export interface Company {
  name: string;
  count: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DailyStat {
  _id: string;
  count: number;
}

export interface ActivityItem {
  _id: string;
  questionId: Question;
  status: ProgressStatus;
  updatedAt: string;
}
