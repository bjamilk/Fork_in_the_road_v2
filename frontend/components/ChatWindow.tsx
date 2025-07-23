


import React, { useEffect, useRef, useState } from 'react';
import { Group, Message, User } from '../types';
import MessageItem from './MessageItem';
import MessageInputBar from './MessageInputBar';
import { EllipsisVerticalIcon, UserGroupIcon, PencilSquareIcon, QuestionMarkCircleIcon, AcademicCapIcon, PlusCircleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

interface ChatWindowProps {
  group: Group | null;
  messages: Message[];
  currentUser: User;
  userVotes: Record<string, 'up' | 'down' | undefined>; 
  onSendMessage: (text: string) => void;
  onOpenQuestionModal: () => void;
  onOpenGroupInfoModal: (group: Group) => void;
  onOpenTestConfigModal: () => void;
  onOpenStudyConfigModal: () => void;
  onVoteQuestion: (messageId: string, voteType: 'up' | 'down') => void;
  onFlagAsSimilar: (messageId: string) => void;
  onOpenCreateSubGroupModal: (parentId: string) => void; // Added prop
  groups: Group[]; // Added prop, potentially for context
  onToggleArchiveGroup: (groupId: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  group, messages, currentUser, userVotes,
  onSendMessage, onOpenQuestionModal, onOpenGroupInfoModal,
  onOpenTestConfigModal, onOpenStudyConfigModal, onVoteQuestion,
  onFlagAsSimilar,
  onOpenCreateSubGroupModal, groups, onToggleArchiveGroup
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!group) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-800 p-4 text-center">
        <AcademicCapIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">Welcome to Study Collab!</p>
        <p className="text-gray-400 dark:text-gray-500">Select a group to start collaborating, or create a new one.</p>
      </div>
    );
  }

  const handleDropdownAction = (action: () => void) => {
    action();
    setIsDropdownOpen(false);
  };
  
  const memberCountText = `${group.members.length} member${group.members.length === 1 ? '' : 's'}` + 
                          (group.memberEmails && group.memberEmails.length > group.members.length ? 
                           ` (+${group.memberEmails.length - group.members.length} invited)` : '');

  const isTopLevelGroup = !group.parentId;
  const isArchived = group.isArchived;
  const visibleMessages = messages.filter(msg => !msg.isArchived);

  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-900 max-h-screen">
      {/* Chat Header */}
      <div className="flex items-center justify-between h-16 p-4 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center min-w-0">
          <img 
            src={group.avatarUrl || `https://ui-avatars.com/api/?name=${group.name.replace(/\s/g, '+')}&background=random&color=fff&size=40`} 
            alt={group.name} 
            className="w-10 h-10 rounded-full mr-3 object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate text-gray-900 dark:text-gray-100" title={group.name}>{group.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={group.description || memberCountText}>
              {isArchived ? <span className="font-semibold text-yellow-600 dark:text-yellow-500">Archived</span> : (group.description || memberCountText)}
            </p>
          </div>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-label="Group options"
          >
            <EllipsisVerticalIcon className="w-6 h-6" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black dark:ring-gray-600 ring-opacity-5 z-20">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button
                  onClick={() => handleDropdownAction(() => onOpenGroupInfoModal(group))}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-50 flex items-center"
                  role="menuitem"
                >
                  <UserGroupIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400"/>
                  Group Info & Members
                </button>
                {isArchived ? (
                  <button
                    onClick={() => handleDropdownAction(() => onToggleArchiveGroup(group.id))}
                    className="w-full text-left px-4 py-2 text-sm text-yellow-700 dark:text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                    role="menuitem"
                  >
                    <ArchiveBoxIcon className="w-5 h-5 mr-3"/>
                    Unarchive Group
                  </button>
                ) : (
                  <>
                    {isTopLevelGroup && (
                        <button
                            onClick={() => handleDropdownAction(() => onOpenCreateSubGroupModal(group.id))}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-50 flex items-center"
                            role="menuitem"
                        >
                            <PlusCircleIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400"/>
                            Create Sub-group
                        </button>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    <button
                      onClick={() => handleDropdownAction(onOpenQuestionModal)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-50 flex items-center"
                      role="menuitem"
                    >
                      <PencilSquareIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400"/>
                      Submit New Question
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    <button
                      onClick={() => handleDropdownAction(onOpenTestConfigModal)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-50 flex items-center"
                      role="menuitem"
                    >
                      <QuestionMarkCircleIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400"/>
                      Take a Test
                    </button>
                    <button
                      onClick={() => handleDropdownAction(onOpenStudyConfigModal)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-50 flex items-center"
                      role="menuitem"
                    >
                      <AcademicCapIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400"/>
                      Study Mode
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-200 dark:bg-slate-900"> {/* Updated background for dark mode consistency */}
        {visibleMessages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isCurrentUserMessage={msg.sender.id === currentUser.id}
            currentUserVote={userVotes[msg.id]}
            onVoteQuestion={onVoteQuestion}
            onFlagAsSimilar={onFlagAsSimilar}
            currentUserFlagged={msg.flaggedAsSimilarUserIds?.includes(currentUser.id)}
          />
        ))}
        <div ref={messagesEndRef} />
         {visibleMessages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-3 rounded-md inline-block">
              {isArchived ? "This group is archived." : `No messages yet in ${group.name}. Start the conversation or add a question!`}
            </p>
          </div>
        )}
      </div>

      {/* Message Input */}
      {isArchived ? (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-t border-yellow-200 dark:border-yellow-800 text-center flex-shrink-0">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This group is archived. Unarchive it to send messages and use other features.
          </p>
        </div>
      ) : (
        <div className="flex-shrink-0">
          <MessageInputBar 
            onSendMessage={onSendMessage} 
            onOpenQuestionModal={onOpenQuestionModal} 
          />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;