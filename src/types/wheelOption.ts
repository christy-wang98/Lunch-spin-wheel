export interface WheelOption {
  id: string;
  label: string;
  weight: number;
  color?: string;
  metadata?: {
    address?: string;
    distance?: number;
  };
} 