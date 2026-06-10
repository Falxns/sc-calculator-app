import { useState } from 'react';
import type { Message } from '../../types';
import CopyIcon from '../icons/CopyIcon';
import TrashIcon from '../icons/TrashIcon';

interface MessageComponentProps {
  message: Message;
  handleChangeMessage: (id: string, e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCopyMessage: (content: string) => void;
  handleDeleteMessage: (id: string) => void;
}

const COLLAPSE_CHAR_LIMIT = 60;

const MessageComponent = ({
  message,
  handleChangeMessage,
  handleCopyMessage,
  handleDeleteMessage,
}: MessageComponentProps) => {
  const { id, content } = message;
  const [isFocused, setIsFocused] = useState(false);

  const isMultiline = content.includes('\n') || content.length > COLLAPSE_CHAR_LIMIT;
  const isExpanded = isFocused || isMultiline;

  return (
    <div
      className={`flex gap-3 w-full py-2.5 border-b border-white/10 last:border-b-0 ${isExpanded ? 'items-start' : 'items-center'}`}
    >
      <textarea
        className={`input flex-1 min-w-0 py-2 px-3 text-base transition-[min-height] duration-200 ${
          isExpanded
            ? 'min-h-[5.5rem] resize-y'
            : 'min-h-[2.75rem] max-h-[2.75rem] overflow-hidden resize-none'
        }`}
        rows={isExpanded ? 3 : 1}
        value={content}
        onChange={(e) => handleChangeMessage(id, e)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Enter your message here"
        aria-label={`Message ${id.slice(0, 8)}...`}
      />
      <div
        className={`flex flex-col gap-1.5 shrink-0 ${isExpanded ? 'pt-1' : ''}`}
      >
        <button
          type="button"
          className="btn w-auto p-2"
          aria-label="Copy"
          onClick={() => handleCopyMessage(content)}
        >
          <CopyIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="btn w-auto p-2"
          aria-label="Delete"
          onClick={() => handleDeleteMessage(id)}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageComponent;
