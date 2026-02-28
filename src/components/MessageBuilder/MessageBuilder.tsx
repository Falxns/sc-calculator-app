import useLocalStorage from '../../hooks/useLocalStorage';
import type { MessageBuilderState } from '../../types';

const MessageBuilder = () => {
  const [state, setState] = useLocalStorage<MessageBuilderState>('messageBuilderState', {
    messages: [],
  });

  return (
    <div className="flex flex-col items-center justify-center gap-2 bg-gray-700 p-2 rounded-2xl">
      <button
        className="text-base text-black text-center p-2 rounded-md w-32 border-2 border-gray-500 bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => {
          setState({
            ...state,
            messages: [...state.messages, ''],
          });
        }}
      >
        Add Message
      </button>
      {state.messages.map((message, index) => (
        <div key={index} className="flex items-center justify-center gap-2 w-full">
          <textarea
            className="text-base text-black p-2 rounded-md w-1/2 h-32 border-2 border-gray-500 bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={message}
            onChange={(e) => {
              setState({
                ...state,
                messages: state.messages.map((m, ind) => (ind === index ? e.target.value : m)),
              });
            }}
          />
          <button
            className="text-base text-black text-center p-2 rounded-md w-20 border-2 border-gray-500 bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => {
              navigator.clipboard
                .writeText(message)
                .then(() => {
                  alert('Copied!');
                })
                .catch(() => {
                  alert('Failed to copy!');
                });
            }}
          >
            Copy
          </button>
          <button
            className="text-base text-black text-center p-2 rounded-md w-20 border-2 border-gray-500 bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => {
              if (confirm('Are you sure you want to delete this message?')) {
                setState({
                  ...state,
                  messages: state.messages.filter((_, ind) => ind !== index),
                });
              }
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default MessageBuilder;
