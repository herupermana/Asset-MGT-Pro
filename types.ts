
export enum AssetStatus {
  OPERATIONAL = 'Operational',
  MAINTENANCE = 'Maintenance',
  REPAIR = 'Under Repair',
  BROKEN = 'Broken'
}

export enum SPKStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  location: string;
  purchaseDate: string;
  arrivedDate: string; // New field
  status: AssetStatus;
  imageUrl: string;
  lastMaintenance: string;
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  activeTasks: number;
  password?: string; // Added password field
}

export interface SPK {
  id: string;
  assetId: string;
  technicianId: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: SPKStatus;
  createdAt: string;
  dueDate: string;
  completedAt?: string;
  completionNote?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}
