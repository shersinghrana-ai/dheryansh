import { Issue, User, DEPARTMENTS } from '../types';

// Mock data storage
let mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Large pothole on Main Street',
    description: 'Deep pothole causing damage to vehicles near the bus stop',
    category: 'Pothole',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'Main Street, Connaught Place, New Delhi'
    },
    status: 'in-progress',
    communityUpvotes: 15,
    submittedBy: 'citizen1',
    submittedAt: new Date('2024-01-15'),
    assignedTo: 'admin1',
    department: 'Public Works Department'
  },
  {
    id: '2',
    title: 'Garbage overflow near market',
    description: 'Garbage bins are overflowing for past 3 days, creating unhygienic conditions',
    category: 'Garbage Overflow',
    location: {
      lat: 28.6280,
      lng: 77.2107,
      address: 'Khan Market, New Delhi'
    },
    status: 'acknowledged',
    communityUpvotes: 8,
    submittedBy: 'citizen2',
    submittedAt: new Date('2024-01-16'),
    assignedTo: 'admin2',
    department: 'Sanitation Department'
  }
];

let mockUsers: User[] = [
  {
    id: 'citizen1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91-9876543210',
    isAdmin: false
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@municipal.gov.in',
    phone: '+91-9876543211',
    isAdmin: true
  }
];

// Load data from localStorage
const loadFromStorage = () => {
  const savedIssues = localStorage.getItem('jan-awaaz-issues');
  const savedUsers = localStorage.getItem('jan-awaaz-users');
  
  if (savedIssues) {
    mockIssues = JSON.parse(savedIssues);
  }
  if (savedUsers) {
    mockUsers = JSON.parse(savedUsers);
  }
};

// Save data to localStorage
const saveToStorage = () => {
  localStorage.setItem('jan-awaaz-issues', JSON.stringify(mockIssues));
  localStorage.setItem('jan-awaaz-users', JSON.stringify(mockUsers));
};

// Initialize data
loadFromStorage();

export const mockApi = {
  // Issues
  getAllIssues: async (): Promise<Issue[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockIssues;
  },

  getIssueById: async (id: string): Promise<Issue | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockIssues.find(issue => issue.id === id) || null;
  },

  getIssuesByUser: async (userId: string): Promise<Issue[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockIssues.filter(issue => issue.submittedBy === userId);
  },

  getNearbyIssues: async (lat: number, lng: number, radiusKm: number = 5): Promise<Issue[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Simple distance calculation (approximate)
    const isNearby = (issueLat: number, issueLng: number) => {
      const latDiff = Math.abs(lat - issueLat);
      const lngDiff = Math.abs(lng - issueLng);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      return distance <= radiusKm * 0.01; // Rough conversion
    };

    return mockIssues.filter(issue => 
      isNearby(issue.location.lat, issue.location.lng)
    );
  },

  createIssue: async (issueData: Omit<Issue, 'id' | 'submittedAt' | 'communityUpvotes' | 'status'>): Promise<Issue> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check for duplicates within 50m radius
    const duplicates = mockIssues.filter(issue => {
      const latDiff = Math.abs(issueData.location.lat - issue.location.lat);
      const lngDiff = Math.abs(issueData.location.lng - issue.location.lng);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      const withinRadius = distance <= 0.0005; // ~50 meters
      const sameCategory = issue.category === issueData.category;
      const recent = new Date().getTime() - new Date(issue.submittedAt).getTime() < 48 * 60 * 60 * 1000;
      
      return withinRadius && sameCategory && recent;
    });

    if (duplicates.length > 0) {
      throw new Error('DUPLICATE_FOUND');
    }

    const newIssue: Issue = {
      ...issueData,
      id: Date.now().toString(),
      submittedAt: new Date(),
      communityUpvotes: 0,
      status: 'submitted',
      department: DEPARTMENTS[issueData.category as keyof typeof DEPARTMENTS]
    };

    mockIssues.push(newIssue);
    saveToStorage();
    return newIssue;
  },

  upvoteIssue: async (issueId: string): Promise<Issue> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const issue = mockIssues.find(i => i.id === issueId);
    if (!issue) throw new Error('Issue not found');
    
    issue.communityUpvotes += 1;
    if (issue.communityUpvotes >= 5 && issue.status === 'submitted') {
      issue.status = 'verified';
    }
    
    saveToStorage();
    return issue;
  },

  updateIssueStatus: async (issueId: string, status: Issue['status'], assignedTo?: string): Promise<Issue> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const issue = mockIssues.find(i => i.id === issueId);
    if (!issue) throw new Error('Issue not found');
    
    issue.status = status;
    if (assignedTo) {
      issue.assignedTo = assignedTo;
    }
    
    saveToStorage();
    return issue;
  },

  // Users
  getCurrentUser: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUsers[0]; // Return first citizen user
  },

  loginAsAdmin: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.find(u => u.isAdmin) || mockUsers[0];
  }
};