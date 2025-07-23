
import React, { useState } from 'react';
import { PaperAirplaneIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onOpenQuestionModal: () => void;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({ onSendMessage, onOpenQuestionModal }) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center p-3 bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700">
      <button 
        onClick={onOpenQuestionModal}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 mr-2"
        aria-label="Add question"
      >
        <PlusCircleIcon className="w-7 h-7" />
      </button>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message or add a question..."
        className="flex-1 p-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition duration-150"
      />
      <button
        onClick={handleSend}
        className="p-3 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none ml-2 disabled:opacity-50 disabled:cursor-not-allowed" // Added disabled styles
        aria-label="Send message"
        disabled={!inputText.trim()}
      >
        <PaperAirplaneIcon className="w-7 h-7" />
      </button>
    </div>
  );
};

export default MessageInputBar;
