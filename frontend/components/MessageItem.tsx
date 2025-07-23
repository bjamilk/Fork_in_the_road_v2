


import React from 'react';
import { Message, MessageType, QuestionType, MatchingItem } from '../types';
import { HandThumbUpIcon, HandThumbDownIcon, TagIcon, CheckCircleIcon as CheckOutline, FlagIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid';

interface MessageItemProps {
  message: Message;
  isCurrentUserMessage: boolean;
  currentUserVote?: 'up' | 'down' | undefined;
  onVoteQuestion: (messageId: string, voteType: 'up' | 'down') => void;
  onFlagAsSimilar: (messageId: string) => void;
  currentUserFlagged?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isCurrentUserMessage, currentUserVote, onVoteQuestion, onFlagAsSimilar, currentUserFlagged }) => {
  const commonBubbleClasses = "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow";
  const userBubbleClasses = `bg-blue-600 text-white ${commonBubbleClasses} ml-auto`; 
  const otherBubbleClasses = `bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 ${commonBubbleClasses} mr-auto`;

  const bubbleClasses = isCurrentUserMessage ? userBubbleClasses : otherBubbleClasses;
  const alignmentClass = isCurrentUserMessage ? 'justify-end' : 'justify-start';

  const getQuestionTypeLabel = (type?: QuestionType): string => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE:
        return "Multiple Choice (Single Answer)";
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
        return "Multiple Choice (Multiple Answers)";
      case QuestionType.TRUE_FALSE:
        return "True/False Question";
      case QuestionType.FILL_IN_THE_BLANK:
        return "Fill-in-the-Blank Question";
      case QuestionType.MATCHING:
        return "Matching Question";
      case QuestionType.OPEN_ENDED:
      default:
        return "Question";
    }
  };

  const UpvoteIcon = currentUserVote === 'up' ? HandThumbUpSolidIcon : HandThumbUpIcon;
  const DownvoteIcon = currentUserVote === 'down' ? HandThumbDownSolidIcon : HandThumbDownIcon;

  const renderMatchingItemsList = (items: MatchingItem[] | undefined, listTitle: string) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="mt-2">
            <p className={`text-xs font-medium ${isCurrentUserMessage ? 'text-blue-200' : 'text-gray-600 dark:text-gray-300'}`}>{listTitle}:</p>
            <ul className="list-disc list-inside pl-1 space-y-0.5">
                {items.map(item => <li key={item.id} className={`text-sm ${isCurrentUserMessage ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{item.text}</li>)}
            </ul>
        </div>
    );
  };

  return (
    <div className={`flex ${alignmentClass} mb-2 items-end`}>
      {!isCurrentUserMessage && (
        <img 
          src={message.sender.avatarUrl || `https://ui-avatars.com/api/?name=${message.sender.name.replace(/\s/g, '+')}&background=random&color=fff&size=30`} 
          alt={message.sender.name} 
          className="w-8 h-8 rounded-full mr-2 self-start object-cover flex-shrink-0"
        />
      )}
      <div className={bubbleClasses}>
        {!isCurrentUserMessage && (
          <p className="text-xs font-semibold mb-1 text-purple-600 dark:text-purple-400">{message.sender.name}</p>
        )}
        {message.type === MessageType.TEXT && message.text && (
          <p className="text-sm break-words">{message.text}</p>
        )}
        {message.type === MessageType.QUESTION && (
          <div className="space-y-1">
            <p className={`font-semibold text-sm ${isCurrentUserMessage ? 'text-blue-100' : 'text-blue-700 dark:text-blue-300'}`}>
              {getQuestionTypeLabel(message.questionType)}:
            </p>
            <p className="text-sm break-words whitespace-pre-wrap">{message.questionStem}</p>

            {message.imageUrl && (
              <div className="my-2">
                <img 
                  src={message.imageUrl} 
                  alt="Question visual" 
                  className="max-w-full h-auto rounded-md border border-gray-300 dark:border-gray-600" 
                  style={{ maxHeight: '200px' }} 
                />
              </div>
            )}

            {(message.questionType === QuestionType.MULTIPLE_CHOICE_SINGLE || message.questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE) && message.options && (
              <div className="mt-2 space-y-1">
                <p className={`text-xs font-medium ${isCurrentUserMessage ? 'text-blue-200' : 'text-gray-600 dark:text-gray-300'}`}>Options:</p>
                <ul className="list-disc list-inside pl-1 space-y-0.5">
                  {message.options.map(opt => (
                    <li key={opt.id} className={`text-sm flex items-center ${isCurrentUserMessage ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                       {message.correctAnswerIds?.includes(opt.id) ? 
                         <CheckOutline className={`w-3.5 h-3.5 mr-1.5 flex-shrink-0 ${isCurrentUserMessage ? 'text-green-300' : 'text-green-500 dark:text-green-400'}`} /> :
                         <span className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 inline-block"></span>
                       }
                      {opt.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {message.questionType === QuestionType.TRUE_FALSE && message.options && (
               <div className="mt-2 space-y-1">
                <p className={`text-xs font-medium ${isCurrentUserMessage ? 'text-blue-200' : 'text-gray-600 dark:text-gray-300'}`}>Options:</p>
                 <ul className="list-none pl-1 space-y-0.5">
                    <li className={`text-sm ${isCurrentUserMessage ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>True</li>
                    <li className={`text-sm ${isCurrentUserMessage ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>False</li>
                 </ul>
              </div>
            )}
            
            {message.questionType === QuestionType.FILL_IN_THE_BLANK && message.acceptableAnswers && (
                <div className="mt-2">
                    {/* Acceptable answers are usually not shown in chat, only stem. Stem already rendered. */}
                </div>
            )}

            {message.questionType === QuestionType.MATCHING && (
                <>
                    {renderMatchingItemsList(message.matchingPromptItems, "Prompt Items")}
                    {renderMatchingItemsList(message.matchingAnswerItems, "Answer Items")}
                </>
            )}


            {message.explanation && (
              <>
                <p className={`font-semibold text-sm pt-2 ${isCurrentUserMessage ? 'text-blue-100' : 'text-blue-700 dark:text-blue-300'}`}>Explanation:</p>
                <p className="text-sm break-words whitespace-pre-wrap">{message.explanation}</p>
              </>
            )}

            {message.tags && message.tags.length > 0 && (
              <div className={`mt-2 pt-2 border-t ${isCurrentUserMessage ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'} border-opacity-30 dark:border-opacity-20`}>
                <div className="flex items-center text-xs mb-1">
                   <TagIcon className={`w-3.5 h-3.5 mr-1 ${isCurrentUserMessage ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`} />
                   <span className={`font-medium ${isCurrentUserMessage ? 'text-blue-200' : 'text-gray-600 dark:text-gray-300'}`}>Tags:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {message.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className={`text-xs px-2 py-0.5 rounded-full ${isCurrentUserMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className={`flex items-center space-x-3 mt-3 pt-2 ${message.tags && message.tags.length > 0 ? '' : (isCurrentUserMessage ? 'border-t border-blue-500 border-opacity-30' : 'border-t border-gray-300 dark:border-gray-600 border-opacity-30 dark:border-opacity-20')}`}>
              <button 
                onClick={() => onVoteQuestion(message.id, 'up')}
                className={`flex items-center text-xs p-1 rounded hover:bg-opacity-20 ${isCurrentUserMessage ? 'text-blue-200 hover:bg-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'} ${currentUserVote === 'up' ? (isCurrentUserMessage ? 'text-green-300' : 'text-green-500 dark:text-green-400') : ''}`}
                aria-pressed={currentUserVote === 'up'}
                aria-label={`Upvote question, current upvotes: ${message.upvotes}`}
              >
                <UpvoteIcon className="w-4 h-4 mr-1" /> 
                {message.upvotes}
              </button>
              <button 
                onClick={() => onVoteQuestion(message.id, 'down')}
                className={`flex items-center text-xs p-1 rounded hover:bg-opacity-20 ${isCurrentUserMessage ? 'text-blue-200 hover:bg-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'} ${currentUserVote === 'down' ? (isCurrentUserMessage ? 'text-red-300' : 'text-red-500 dark:text-red-400') : ''}`}
                aria-pressed={currentUserVote === 'down'}
                aria-label={`Downvote question, current downvotes: ${message.downvotes}`}
              >
                <DownvoteIcon className="w-4 h-4 mr-1" />
                {message.downvotes}
              </button>
              <button 
                onClick={() => onFlagAsSimilar(message.id)}
                disabled={isCurrentUserMessage}
                className={`flex items-center text-xs p-1 rounded hover:bg-opacity-20 ${isCurrentUserMessage ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'} ${currentUserFlagged ? (isCurrentUserMessage ? 'text-orange-300' : 'text-orange-500 dark:text-orange-400') : ''} disabled:opacity-50`}
                aria-pressed={currentUserFlagged}
                aria-label={`Flag as similar, current flags: ${message.flaggedAsSimilarUserIds?.length || 0}`}
                title={isCurrentUserMessage ? "Cannot flag your own question" : "Flag as similar/duplicate"}
              >
                <FlagIcon className="w-4 h-4 mr-1" />
                {message.flaggedAsSimilarUserIds?.length || 0}
              </button>
            </div>

          </div>
        )}
        <p className={`text-xs mt-1.5 ${isCurrentUserMessage ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isCurrentUserMessage && (
         <img 
          src={message.sender.avatarUrl || `https://ui-avatars.com/api/?name=${message.sender.name.replace(/\s/g, '+')}&background=random&color=fff&size=30`} 
          alt={message.sender.name} 
          className="w-8 h-8 rounded-full ml-2 self-start object-cover flex-shrink-0" 
        />
      )}
    </div>
  );
};

export default MessageItem;