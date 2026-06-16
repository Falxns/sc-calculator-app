export interface Material {
  id: string;
  label: string;
  defaultPrice: number;
  /** Built-in asset filename without extension, e.g. "slastena" */
  imgSrc?: string;
  /** Base64 data URL for custom uploaded icons */
  imageData?: string;
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
  content: string;
}
