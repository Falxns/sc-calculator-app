import React from 'react';
import type { Message } from '../../types';
import CopyIcon from '../icons/CopyIcon';
import TrashIcon from '../icons/TrashIcon';

interface MessageComponentProps {
  message: Message;
  handleChangeMessage: (id: string, e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCopyMessage: (content: string) => void;
  handleDeleteMessage: (id: string) => void;
}

const MessageComponent = ({
  message,
  handleChangeMessage,
  handleCopyMessage,
  handleDeleteMessage,
}: MessageComponentProps) => {
  const { id, content } = message;

  return (
    <div className="flex items-stretch gap-3 w-full py-2.5 border-b border-white/10 last:border-b-0">
      <textarea
        className="input flex-1 min-w-0 min-h-28 py-2 px-3 text-base resize-y"
        value={content}
        onChange={(e) => handleChangeMessage(id, e)}
        placeholder="Enter your message here"
        aria-label={`Message ${id.slice(0, 8)}...`}
      />
      <div className="flex flex-col justify-center gap-1.5 shrink-0">
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
