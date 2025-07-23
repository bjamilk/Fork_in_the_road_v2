
import React from 'react';
import { Group } from '../types';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';

interface GroupListItemProps {
  group: Group;
  isSelected: boolean;
  onClick: () => void;
  isDisabled?: boolean;
  isSubGroup?: boolean;
  hasSubGroups?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const GroupListItem: React.FC<GroupListItemProps> = ({ 
  group, 
  isSelected, 
  onClick, 
  isDisabled,
  isSubGroup = false,
  hasSubGroups = false,
  isExpanded = false,
  onToggleExpand 
}) => {
  const isArchived = group.isArchived;
  const baseClasses = `flex items-center p-3 border-l-4 transition-colors duration-150`;
  const selectedClasses = isSelected ? 'bg-gray-700 dark:bg-slate-700 border-blue-500 dark:border-blue-400' : 'border-transparent hover:bg-gray-700 dark:hover:bg-slate-700';
  const disabledClasses = isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer';
  const subGroupIndentClass = isSubGroup ? 'pl-7' : 'pl-3';
  const archivedClasses = isArchived ? 'opacity-60' : '';

  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent click on item itself if the click was on the expand toggle
    if (onToggleExpand && (e.target as HTMLElement).closest('.expand-toggle-button')) {
      return;
    }
    if (!isDisabled) {
      onClick();
    }
  };
  
  const handleToggleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onToggleExpand) {
      e.preventDefault();
      onToggleExpand();
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled && !onToggleExpand) { // Only if not a toggleable item itself
        onClick();
    }
  };


  return (
    <div
      className={`${baseClasses} ${selectedClasses} ${disabledClasses} ${subGroupIndentClass} ${archivedClasses}`}
      onClick={handleItemClick}
      aria-disabled={isDisabled}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={handleItemKeyDown}
    >
      {hasSubGroups && onToggleExpand && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent item click
            onToggleExpand();
          }}
          onKeyDown={handleToggleKeyDown}
          className="expand-toggle-button p-0.5 mr-1.5 rounded-sm text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Collapse ${group.name}` : `Expand ${group.name}`}
        >
          {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
        </button>
      )}
      {!hasSubGroups && !isSubGroup && <div className="w-[1.375rem] mr-1.5 flex-shrink-0"></div> /* Placeholder for alignment */}
      
      <img
        src={group.avatarUrl || `https://ui-avatars.com/api/?name=${group.name.replace(/\s/g, '+')}&background=random&color=fff&size=50`}
        alt={group.name}
        className="w-8 h-8 rounded-full mr-2.5 object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate text-gray-100 dark:text-gray-50">{group.name}</p>
        {group.lastMessage && !isSubGroup && ( // Optionally hide last message for sub-groups for cleaner UI
          <p className="text-xs text-gray-400 dark:text-gray-400 truncate">{group.lastMessage}</p>
        )}
      </div>
      {isArchived && <ArchiveBoxIcon className="w-4 h-4 text-gray-500 ml-2 flex-shrink-0" title="Archived"/>}
      {group.lastMessageTime && !isSubGroup && !isArchived && ( // Optionally hide last message time for sub-groups
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{group.lastMessageTime}</span>
      )}
    </div>
  );
};

export default GroupListItem;
