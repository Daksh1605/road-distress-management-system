export type WorkOrderStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed';

export type WorkOrderPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TeamStatus = 'Available' | 'On Site' | 'En Route' | 'Off Duty';

export interface WorkOrder {
  orderId: string;
  roadId: string;
  location: string;
  distressType: string;
  priority: WorkOrderPriority;
  assignedTeam: string;
  status: WorkOrderStatus;
  dueDate: string;
  estimatedCost: number;
}

export interface MaintenanceTeam {
  id: string;
  name: string;
  leader: string;
  members: number;
  activeOrders: number;
  capacity: number;
  status: TeamStatus;
  specialization: string;
  currentAssignment?: string;
}

export interface UpcomingRepair {
  id: string;
  roadId: string;
  location: string;
  distressType: string;
  scheduledDate: string;
  scheduledTime: string;
  team: string;
  priority: WorkOrderPriority;
}

export interface RepairProgressItem {
  orderId: string;
  roadId: string;
  location: string;
  distressType: string;
  team: string;
  progress: number;
  status: WorkOrderStatus;
  startedAt: string;
  estimatedCompletion: string;
}

export interface MaintenanceKPIs {
  activeWorkOrders: number;
  repairsInProgress: number;
  completedRepairs: number;
  totalMaintenanceCost: number;
}
