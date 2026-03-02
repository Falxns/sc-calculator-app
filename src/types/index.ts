export interface CalculatorState {
  calculators: Calculator[];
}

export interface Calculator {
  id: string;
  imgSrc: string;
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
