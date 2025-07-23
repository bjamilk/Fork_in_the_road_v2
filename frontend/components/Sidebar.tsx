
import React, { useRef, useState, useMemo } from 'react';
import { Group, AppMode, User, Badge } from '../types';
import GroupListItem from './GroupListItem';
import { PlusIcon, ChartBarIcon, UsersIcon, CameraIcon, SunIcon, MoonIcon, CloudArrowDownIcon, ArrowPathIcon, BellIcon, BuildingStorefrontIcon, ArrowLeftOnRectangleIcon, ArchiveBoxIcon, ChevronDownIcon, ChevronRightIcon, SparklesIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  currentUser: User;
  groups: Group[];
  selectedGroup: Group | null;
  onSelectGroup: (group: Group) => void;
  onOpenCreateGroupModal: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToOfflineMode: () => void;
  onNavigateToMarketplace: () => void;
  onNavigateToAiCompanion: () => void;
  pendingSyncCount: number;
  isOnline: boolean;
  onSyncPendingResults: () => void;
  onUpdateCurrentUserAvatar: (avatarUrl: string) => void;
  onOpenSettingsModal: () => void;
  currentAppMode: AppMode;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  hasNewQuestionNotification: boolean;
  onClearNewQuestionNotification: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser,
  groups, 
  selectedGroup, 
  onSelectGroup, 
  onOpenCreateGroupModal, 
  onNavigateToDashboard,
  onNavigateToOfflineMode,
  onNavigateToMarketplace,
  onNavigateToAiCompanion,
  pendingSyncCount,
  isOnline,
  onSyncPendingResults,
  onUpdateCurrentUserAvatar,
  onOpenSettingsModal,
  currentAppMode,
  theme,
  toggleTheme,
  hasNewQuestionNotification,
  onClearNewQuestionNotification,
  onLogout
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedParentGroups, setExpandedParentGroups] = useState<Record<string, boolean>>({});
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);

  const canNavigateToDashboard = currentAppMode !== AppMode.TEST_ACTIVE && currentAppMode !== AppMode.STUDY_ACTIVE;
  const canInteractWithGroups = ![AppMode.TEST_ACTIVE, AppMode.STUDY_ACTIVE].includes(currentAppMode);

  const { topLevelGroups, subGroupsMap, archivedGroups } = useMemo(() => {
    const topLevel: Group[] = [];
    const subMap: Record<string, Group[]> = {};
    const archived: Group[] = [];
    
    groups.forEach(group => {
      if (group.isArchived) {
        archived.push(group);
      } else if (group.parentId) {
        if (!subMap[group.parentId]) {
          subMap[group.parentId] = [];
        }
        subMap[group.parentId].push(group);
      } else {
        topLevel.push(group);
      }
    });

    for (const parentId in subMap) {
        subMap[parentId].sort((a, b) => a.name.localeCompare(b.name));
    }
    topLevel.sort((a, b) => a.name.localeCompare(b.name));
    archived.sort((a, b) => a.name.localeCompare(b.name));

    return { topLevelGroups: topLevel, subGroupsMap: subMap, archivedGroups: archived };
  }, [groups]);

  const toggleParentGroupExpansion = (groupId: string) => {
    setExpandedParentGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        if (file.size > 2 * 1024 * 1024) { 
          alert("Image is too large. Please select an image under 2MB.");
          return;
        }
        const base64 = await convertFileToBase64(file);
        onUpdateCurrentUserAvatar(base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        alert("Error processing image. Please try another one.");
      } finally {
        if (event.target) {
            event.target.value = "";
        }
      }
    }
  };

  const highestLevelBadges = useMemo(() => {
    const badgeMap = new Map<string, Badge>();
    (currentUser.badges || []).forEach(badge => {
        const existing = badgeMap.get(badge.id);
        if (!existing || badge.level > existing.level) {
            badgeMap.set(badge.id, badge);
        }
    });
    return Array.from(badgeMap.values()).sort((a, b) => new Date(b.dateAwarded).getTime() - new Date(a.dateAwarded).getTime());
  }, [currentUser.badges]);

  const romanNumerals: { [key: number]: string } = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };

  return (
    <div className={`flex flex-col w-64 md:w-80 bg-gray-900 text-gray-100 dark:bg-slate-800 transition-all duration-300 ${
      (currentAppMode === AppMode.TEST_ACTIVE || currentAppMode === AppMode.STUDY_ACTIVE) && 
      (selectedGroup !== null) 
      ? 'opacity-50 pointer-events-none' 
      : ''
    }`}>
      <div className="flex items-center justify-between h-16 p-4 border-b border-gray-700 dark:border-slate-700">
        <div className="flex items-center">
            <UsersIcon className="w-7 h-7 mr-2 text-blue-400"/>
            <h1 className="text-xl font-semibold text-gray-100 dark:text-gray-50">Study Groups</h1>
        </div>
        <div className="flex items-center space-x-1">
            <button
              onClick={onClearNewQuestionNotification}
              className="relative p-2 text-gray-400 hover:text-white dark:hover:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="New question notifications"
              disabled={!canInteractWithGroups}
              title={hasNewQuestionNotification ? "Clear new question alert" : "No new questions"}
            >
              <BellIcon className="w-6 h-6" />
              {hasNewQuestionNotification && (
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-gray-900 dark:ring-slate-800" />
              )}
            </button>
            <button
              onClick={onOpenCreateGroupModal} 
              className="p-2 text-gray-400 hover:text-white dark:hover:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Create new group"
              disabled={!canInteractWithGroups}
            >
              <PlusIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
      
      <div className="p-2 border-b border-gray-700 dark:border-slate-700 space-y-1">
        <button
          onClick={onNavigateToDashboard}
          className={`w-full flex items-center p-3 rounded-md text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-slate-700 hover:text-white dark:hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-colors duration-150 ${
            currentAppMode === AppMode.DASHBOARD ? 'bg-gray-700 dark:bg-slate-700 text-teal-300 dark:text-teal-300 font-semibold' : ''
          } ${!canNavigateToDashboard ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canNavigateToDashboard}
          aria-label="View Dashboard"
        >
          <ChartBarIcon className="w-6 h-6 mr-3" />
          Dashboard
        </button>
        <button
          onClick={onNavigateToAiCompanion}
          className={`w-full flex items-center p-3 rounded-md text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-slate-700 hover:text-white dark:hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-150 ${
            currentAppMode === AppMode.AI_COMPANION ? 'bg-gray-700 dark:bg-slate-700 text-indigo-300 dark:text-indigo-300 font-semibold' : ''
          } ${!canNavigateToDashboard ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canNavigateToDashboard}
          aria-label="AI Companion"
        >
          <SparklesIcon className="w-6 h-6 mr-3" />
          AI Companion
        </button>
        <button
          onClick={onNavigateToMarketplace}
          className={`w-full flex items-center p-3 rounded-md text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-slate-700 hover:text-white dark:hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-colors duration-150 ${
            currentAppMode === AppMode.MARKETPLACE ? 'bg-gray-700 dark:bg-slate-700 text-orange-300 dark:text-orange-300 font-semibold' : ''
          } ${!canNavigateToDashboard ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canNavigateToDashboard}
          aria-label="Marketplace"
        >
          <BuildingStorefrontIcon className="w-6 h-6 mr-3" />
          Marketplace
        </button>
        <button
          onClick={onNavigateToOfflineMode}
          className={`w-full flex items-center justify-between p-3 rounded-md text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-slate-700 hover:text-white dark:hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors duration-150 ${
            currentAppMode === AppMode.OFFLINE_MODE ? 'bg-gray-700 dark:bg-slate-700 text-purple-300 dark:text-purple-300 font-semibold' : ''
          } ${!canNavigateToDashboard ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canNavigateToDashboard}
          aria-label="Offline Activity"
        >
          <div className="flex items-center">
            <CloudArrowDownIcon className="w-6 h-6 mr-3" />
            Offline Activity
          </div>
          {pendingSyncCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {pendingSyncCount}
            </span>
          )}
        </button>
        {isOnline && pendingSyncCount > 0 && (
            <button
                onClick={onSyncPendingResults}
                className="w-full flex items-center justify-center p-2 text-sm bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-300 transition-colors duration-150"
                aria-label="Sync pending offline results"
            >
                <ArrowPathIcon className="w-5 h-5 mr-2"/> Sync Results
            </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto">
        <h3 className="px-3 pt-3 text-xs font-semibold text-gray-400 uppercase">Active Groups</h3>
        {topLevelGroups.map((group) => {
          const subGroups = subGroupsMap[group.id] || [];
          const isExpanded = !!expandedParentGroups[group.id];
          return (
            <React.Fragment key={group.id}>
              <GroupListItem
                group={group}
                isSelected={selectedGroup?.id === group.id && currentAppMode === AppMode.CHAT}
                onClick={canInteractWithGroups ? () => onSelectGroup(group) : () => {}}
                isDisabled={!canInteractWithGroups}
                hasSubGroups={subGroups.length > 0}
                isExpanded={isExpanded}
                onToggleExpand={subGroups.length > 0 ? () => toggleParentGroupExpansion(group.id) : undefined}
                isSubGroup={false}
              />
              {isExpanded && subGroups.map(subGroup => (
                <GroupListItem
                  key={subGroup.id}
                  group={subGroup}
                  isSelected={selectedGroup?.id === subGroup.id && currentAppMode === AppMode.CHAT}
                  onClick={canInteractWithGroups ? () => onSelectGroup(subGroup) : () => {}}
                  isDisabled={!canInteractWithGroups}
                  isSubGroup={true}
                />
              ))}
            </React.Fragment>
          );
        })}
        {topLevelGroups.length === 0 && <p className="px-3 py-2 text-sm text-gray-500">No active groups.</p>}

        {archivedGroups.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700 dark:border-slate-700">
            <button
              onClick={() => setIsArchivedExpanded(!isArchivedExpanded)}
              className="w-full flex items-center justify-between p-3 text-xs font-semibold text-gray-400 uppercase hover:text-white focus:outline-none"
              aria-expanded={isArchivedExpanded}
            >
              <span className="flex items-center"><ArchiveBoxIcon className="w-4 h-4 mr-2"/> Archived Groups</span>
              {isArchivedExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
            </button>
            {isArchivedExpanded && (
              <div className="mt-1">
                {archivedGroups.map(group => (
                  <GroupListItem
                    key={group.id}
                    group={group}
                    isSelected={selectedGroup?.id === group.id}
                    onClick={canInteractWithGroups ? () => onSelectGroup(group) : () => {}}
                    isDisabled={!canInteractWithGroups}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-gray-700 dark:border-slate-700">
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-start min-w-0">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick} aria-label="Change profile picture">
                    <img 
                    src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name.replace(/\s/g, '+')}&background=random&color=fff&size=40`}
                    alt={currentUser.name} 
                    className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-transparent group-hover:border-blue-400 transition-colors"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-full">
                    <CameraIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/gif, image/webp" 
                    onChange={handleFileChange} 
                    />
                </div>
                <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-200 dark:text-gray-100 truncate block">{currentUser.name}</span>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center text-xs text-yellow-400 dark:text-yellow-300" title={`${currentUser.points} Points`}>
                            <SparklesIcon className="w-4 h-4 mr-1 text-yellow-500 dark:text-yellow-400"/>
                            {currentUser.points}
                        </div>
                    </div>
                    {highestLevelBadges.length > 0 && (
                        <div className="mt-1.5 flex items-center space-x-1.5" title={highestLevelBadges.map(b => b.name).join(', ')}>
                            {highestLevelBadges.slice(0, 4).map(badge => (
                                <div key={badge.id} className="relative" title={`${badge.name}: ${badge.description}`}>
                                    <span className="text-lg">{badge.icon}</span>
                                    {badge.level > 1 && (
                                        <span className="absolute -top-1 -right-2 text-2xs font-bold text-yellow-300 bg-gray-700 px-1 rounded-full">{romanNumerals[badge.level] || badge.level}</span>
                                    )}
                                </div>
                            ))}
                            {highestLevelBadges.length > 4 && <span className="text-xs text-gray-400">+{highestLevelBadges.length - 4}</span>}
                        </div>
                    )}
                </div>
            </div>
             <div className="flex flex-col space-y-1">
                <button
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-red-400 dark:hover:text-red-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    aria-label="Logout"
                    title="Logout"
                >
                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={onOpenSettingsModal}
                    className="p-2 text-gray-400 hover:text-white dark:hover:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Settings"
                    title="Settings"
                >
                    <Cog6ToothIcon className="w-6 h-6" />
                </button>
            </div>
        </div>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center p-2 rounded-md text-sm font-medium text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-slate-700 hover:text-white dark:hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 transition-colors"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <MoonIcon className="w-5 h-5 mr-2" />
          ) : (
            <SunIcon className="w-5 h-5 mr-2" />
          )}
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
