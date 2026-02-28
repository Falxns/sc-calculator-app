export interface CalculatorState {
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
