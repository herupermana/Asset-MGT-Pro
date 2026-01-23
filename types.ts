
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
  arrivedDate: string;
  status: AssetStatus;
  imageUrl: string;
  lastMaintenance: string;
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  activeTasks: number;
  password?: string;
  rank?: string;
  averageRating?: number;
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
  evidence?: string[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  tls: boolean;
  enabled: boolean;
}

export interface MySQLConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  ssl: boolean;
}
