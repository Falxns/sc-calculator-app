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
    <div className="flex justify-center items-start gap-4 w-full">
      <textarea
        className="input w-96 h-32 resize-none"
        value={content}
        onChange={(e) => handleChangeMessage(id, e)}
        placeholder="Enter your message here"
        aria-label={`Message ${id.slice(0, 8)}...`}
      />
      <div className="flex flex-col justify-center items-center gap-2">
        <button
          type="button"
          className="btn w-auto p-2"
          aria-label="Copy"
          onClick={() => handleCopyMessage(content)}
        >
          <CopyIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="btn w-auto p-2"
          aria-label="Delete"
          onClick={() => handleDeleteMessage(id)}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageComponent;
