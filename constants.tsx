
import { Asset, AssetStatus, Technician, SPK, SPKStatus } from './types';

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'AST-001',
    name: 'Server Rack HP ProLiant',
    category: 'IT Infrastructure',
    location: 'Data Center Room A',
    purchaseDate: '2023-01-15',
    arrivedDate: '2023-01-20',
    status: AssetStatus.OPERATIONAL,
    imageUrl: 'https://picsum.photos/seed/server/400/300',
    lastMaintenance: '2023-12-10'
  },
  {
    id: 'AST-002',
    name: 'Industrial HVAC Unit',
    category: 'Facilities',
    location: 'Rooftop Section 4',
    purchaseDate: '2022-05-20',
    arrivedDate: '2022-06-05',
    status: AssetStatus.MAINTENANCE,
    imageUrl: 'https://picsum.photos/seed/hvac/400/300',
    lastMaintenance: '2024-02-01'
  },
  {
    id: 'AST-003',
    name: 'Office Projector 4K',
    category: 'Office Equipment',
    location: 'Meeting Room 2',
    purchaseDate: '2023-08-11',
    arrivedDate: '2023-08-15',
    status: AssetStatus.REPAIR,
    imageUrl: 'https://picsum.photos/seed/projector/400/300',
    lastMaintenance: '2023-11-20'
  }
];

export const MOCK_TECHNICIANS: Technician[] = [
  { id: 'TECH-01', name: 'Budi Santoso', specialty: 'Electrical', activeTasks: 2, password: 'password123', rank: 'Senior Specialist' },
  { id: 'TECH-02', name: 'Siti Aminah', specialty: 'HVAC', activeTasks: 1, password: 'password123', rank: 'Expert Advisor' },
  { id: 'TECH-03', name: 'Andi Wijaya', specialty: 'IT Network', activeTasks: 0, password: 'password123', rank: 'Junior Associate' }
];

export const MOCK_SPKS: SPK[] = [
  {
    id: 'SPK-2024-001',
    assetId: 'AST-003',
    technicianId: 'TECH-03',
    title: 'Lamp Replacement',
    description: 'Projector lamp is flickering and dim.',
    priority: 'Medium',
    status: SPKStatus.IN_PROGRESS,
    createdAt: '2024-02-15',
    dueDate: '2024-02-28'
  }
];

export const DEFAULT_CATEGORIES = [
  'IT Infrastructure',
  'Facilities',
  'Vehicles',
  'Office Equipment',
  'Safety Gear',
  'Manufacturing'
];
