export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  photo?: string;
  status: 'submitted' | 'verified' | 'acknowledged' | 'in-progress' | 'pending-confirmation' | 'resolved' | 'rejected';
  communityUpvotes: number;
  submittedBy: string;
  submittedAt: Date;
  assignedTo?: string;
  department?: string;
  resolutionRating?: number;
  isTrulyResolved: boolean;
  feedbackComment?: string;
  resolvedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

export const ISSUE_CATEGORIES = [
  'Pothole',
  'Garbage Overflow',
  'Broken Streetlight',
  'Water Leakage',
  'Drainage Problem',
  'Road Damage',
  'Public Toilet Issue',
  'Traffic Signal Problem',
  'Illegal Construction',
  'Other'
] as const;

export const DEPARTMENTS = {
  'Pothole': 'Public Works Department',
  'Garbage Overflow': 'Sanitation Department',
  'Broken Streetlight': 'Electrical Department',
  'Water Leakage': 'Water Department',
  'Drainage Problem': 'Public Works Department',
  'Road Damage': 'Public Works Department',
  'Public Toilet Issue': 'Sanitation Department',
  'Traffic Signal Problem': 'Traffic Department',
  'Illegal Construction': 'Urban Planning Department',
  'Other': 'General Administration'
} as const;