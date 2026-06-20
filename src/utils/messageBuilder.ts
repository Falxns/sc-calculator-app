import type { Message, MessageBuilderState } from '../types';

export const createUniqueMessageName = (base: string, existingNames: string[]): string => {
  const trimmed = base.trim() || 'Message';
  if (!existingNames.includes(trimmed)) return trimmed;

  let suffix = 2;
  while (existingNames.includes(`${trimmed} ${suffix}`)) {
    suffix += 1;
  }
  return `${trimmed} ${suffix}`;
};

const isRawMessage = (value: unknown): value is { id: string; content: string; name?: string } => {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return typeof m.id === 'string' && typeof m.content === 'string';
};

export const normalizeMessage = (raw: { id: string; content: string; name?: string }, index: number): Message => ({
  id: raw.id,
  content: raw.content,
  name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : `Message ${index + 1}`,
});

export const normalizeMessagesState = (raw: unknown): MessageBuilderState => {
  const data = raw as Partial<MessageBuilderState> | null;
  if (!Array.isArray(data?.messages)) return { messages: [] };

  return {
    messages: data.messages.filter(isRawMessage).map((message, index) => normalizeMessage(message, index)),
  };
};
