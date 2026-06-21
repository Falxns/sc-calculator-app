export interface Material {
  id: string;
  label: string;
  defaultPrice: number;
  /** Built-in asset filename without extension, e.g. "slastena" */
  imgSrc?: string;
  /** Custom icon stored in IndexedDB (keyed by material id) */
  customIcon?: boolean;
}

export interface MaterialsState {
  materials: Material[];
}

export interface CalculatorState {
  calculators: Calculator[];
}

export interface CalculatorProfile {
  id: string;
  name: string;
  calculators: Calculator[];
}

export interface CalculatorProfilesState {
  activeProfileId: string;
  profiles: CalculatorProfile[];
}

export interface Calculator {
  id: string;
  materialId: string;
  price: number;
  quantity: number;
}

export interface MessageBuilderState {
  messages: Message[];
}

export interface Message {
  id: string;
  name: string;
  content: string;
}
