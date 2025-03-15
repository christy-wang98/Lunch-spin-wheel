export interface WheelOption {
  id: string;
  label: string;
  color: string;
  weight?: number;
}

export interface SpinWheelProps {
  options: WheelOption[];
  onSpinEnd?: (option: WheelOption) => void;
}

export interface SpinButtonProps {
  onSpin: () => void;
  disabled?: boolean;
}

export interface ResultDisplayProps {
  selectedOption: WheelOption | null;
} 