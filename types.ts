export enum UrgencyLevel {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MODERATE = 'Moderate',
  LOW = 'Low'
}

export interface FoodRequest {
  id: string;
  requesterName: string;
  location: string;
  contactNumber?: string;
  needs: string;
  peopleCount: number;
  urgency: UrgencyLevel;
  timestamp: string;
  originalText: string;
}

export interface ExtractionStats {
  totalProcessed: number;
  foodRequestsFound: number;
  criticalCount: number;
}
