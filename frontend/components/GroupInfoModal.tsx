
import React, { useState, useEffect, useRef } from 'react';
import { Group, User } from '../types';
import { CameraIcon, PhotoIcon, XCircleIcon, CheckCircleIcon, ArrowUpOnSquareIcon, ShieldCheckIcon, UserPlusIcon, UserMinusIcon, ArchiveBoxIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';


interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  currentUser: User; 
  onUpdateDetails: (groupId: string, name: string, description: string) => void;
  onAddMembers: (groupId: string, memberEmails: string) => void;
  onUpdateGroupAvatar: (groupId: string, avatarUrl: string) => void;
  onPromoteToAdmin: (groupId: string, userId: string) => void;
  onDemoteAdmin: (groupId: string, userId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onToggleArchiveGroup: (groupId: string) => void;
  onChallengeUser: (user: User) => void;
  onApproveMember: (groupId: string, userId: string) => void;
  onRejectMember: (groupId: string, userId: string) => void;
}

const MAX_GROUP_MEMBERS = 200;

const GroupInfoModal: React.FC<GroupInfoModalProps> = ({ 
    isOpen, 
    onClose, 
    group, 
    currentUser, 
    onUpdateDetails, 
    onAddMembers, 
    onUpdateGroupAvatar,
    onPromoteToAdmin,
    onDemoteAdmin,
    onDeleteGroup,
    onToggleArchiveGroup,
    onChallengeUser,
    onApproveMember,
    onRejectMember,
}) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [newMemberEmails, setNewMemberEmails] = useState('');
  const [detailsChanged, setDetailsChanged] = useState(false);

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (isOpen) {
      setName(group.name);
      setDescription(group.description || '');
      setNewMemberEmails('');
      setDetailsChanged(false);
      setSelectedAvatarFile(null);
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
      if (avatarFileRef.current) {
        avatarFileRef.current.value = ""; 
      }
    }
  }, [isOpen, group]); 

  // Clean up preview URL on component unmount or when previewUrl changes
  useEffect(() => {
    const currentPreviewUrl = avatarPreviewUrl;
    return () => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);


  if (!isOpen) return null;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && (name.trim() !== group.name || description.trim() !== (group.description || ''))) {
      onUpdateDetails(group.id, name.trim(), description.trim());
      setDetailsChanged(false); 
    }
  };
  
  const handleAddMembersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberEmails.trim()) {
      onAddMembers(group.id, newMemberEmails.trim());
      setNewMemberEmails(''); 
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setDetailsChanged(e.target.value.trim() !== group.name || description !== (group.description || ''));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setDetailsChanged(name.trim() !== group.name || e.target.value.trim() !== (group.description || ''));
  };
  
  const memberMap = new Map<string, User>();
  group.members.forEach(member => {
    memberMap.set(member.id, { ...member }); 
  });
  if (group.memberEmails) {
    group.memberEmails.forEach(email => {
      const existingRegisteredMember = group.members.find(m => m.email === email);
      if (!existingRegisteredMember) {
        const invitedUserId = `invited-${email}`; 
        if (!memberMap.has(invitedUserId)) {
          memberMap.set(invitedUserId, { 
            id: invitedUserId, 
            name: email, 
            email: email, 
            avatarUrl: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random&color=fff&size=30`,
            points: 0,
            badges: [],
            stats: {
              testsCompleted: 0,
              questionsCreated: 0,
              groupsCreated: 0,
              highScoreTests: 0,
              perfectScoreTests: 0,
              gamesWon: 0,
            },
            settings: { reminders: { enabled: false } },
            testPresets: []
          });
        }
      }
    });
  }
  const sortedMembers = Array.from(memberMap.values());
  const currentUserInList = sortedMembers.find(m => m.id === currentUser.id);
  const otherMembersInList = sortedMembers.filter(m => m.id !== currentUser.id);
  const finalMemberList = currentUserInList ? [currentUserInList, ...otherMembersInList] : otherMembersInList;


  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert("Image is too large. Please select an image under 2MB.");
        event.target.value = ""; 
        return;
      }
      setSelectedAvatarFile(file);
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl); 
      setAvatarPreviewUrl(URL.createObjectURL(file));
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

  const handleSaveAvatar = async () => {
    if (selectedAvatarFile) {
      try {
        const base64Avatar = await convertFileToBase64(selectedAvatarFile);
        onUpdateGroupAvatar(group.id, base64Avatar);
        setSelectedAvatarFile(null); 
        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
        if (avatarFileRef.current) avatarFileRef.current.value = "";
      } catch (error) {
        console.error("Error saving group avatar:", error);
        alert("Error saving avatar. Please try again.");
      }
    }
  };
  
  const handleRemoveAvatarPreview = () => {
    setSelectedAvatarFile(null);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(null);
    if (avatarFileRef.current) avatarFileRef.current.value = "";
  };

  const isCurrentUserAdmin = group.adminIds.includes(currentUser.id);
  const inviteLink = `${window.location.origin}${window.location.pathname}?inviteId=${group.inviteId}`;

  const handleCopyLink = () => {
      navigator.clipboard.writeText(inviteLink).then(() => {
          alert('Invite link copied to clipboard!');
      }).catch(err => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy link.');
      });
  };

  const isGroupFull = group.members.length >= MAX_GROUP_MEMBERS;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="group-info-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="group-info-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100">Group Information</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Group Avatar</h3>
            <div className="flex items-start space-x-4">
                <img 
                    src={avatarPreviewUrl || group.avatarUrl || `https://ui-avatars.com/api/?name=${group.name.replace(/\s/g, '+')}&background=random&color=fff&size=100`} 
                    alt={`${group.name} avatar`}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                />
                <div className="flex-grow">
                    <button 
                        type="button"
                        onClick={() => avatarFileRef.current?.click()}
                        className="w-full sm:w-auto mb-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900/50 dark:hover:bg-blue-800/60 border border-blue-300 dark:border-blue-700 rounded-md shadow-sm flex items-center justify-center"
                        aria-label={selectedAvatarFile ? "Change group avatar image" : "Upload group avatar image"}
                    >
                        <ArrowUpOnSquareIcon className="w-4 h-4 mr-1.5" />
                        {selectedAvatarFile ? 'Change Image' : 'Upload Image'}
                    </button>
                    <input type="file" ref={avatarFileRef} onChange={handleAvatarFileChange} accept="image/png, image/jpeg, image/gif, image/webp" className="hidden" />
                    
                    {selectedAvatarFile && (
                        <div className="mt-2 space-y-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={selectedAvatarFile.name}>
                                Preview: <span className="font-medium">{selectedAvatarFile.name}</span>
                            </p>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={handleSaveAvatar}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 border border-transparent rounded-md shadow-sm flex items-center"
                                    aria-label="Save new group avatar"
                                >
                                    <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                    Save Avatar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatarPreview}
                                    className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50"
                                    title="Cancel image change"
                                    aria-label="Cancel image change"
                                >
                                    <XCircleIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    )}
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Max file size: 2MB. PNG, JPG, GIF, WebP accepted.</p>
                </div>
            </div>
        </div>

        <form onSubmit={handleDetailsSubmit} className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Edit Group Details</h3>
          <div className="mb-4">
            <label htmlFor="groupInfoName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
            <input
              type="text"
              id="groupInfoName"
              value={name}
              onChange={handleNameChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="groupInfoDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              id="groupInfoDescription"
              value={description}
              onChange={handleDescriptionChange}
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="A brief description for the group (optional)"
            />
          </div>
          {detailsChanged && (
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 disabled:opacity-50"
              disabled={!name.trim()}
            >
              Save Details Changes
            </button>
          )}
        </form>

        <form onSubmit={handleAddMembersSubmit} className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Add New Members</h3>
          <div className="mb-4">
            <label htmlFor="newMemberEmails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invite by Email</label>
            <input
              type="text"
              id="newMemberEmails"
              value={newMemberEmails}
              onChange={(e) => setNewMemberEmails(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
              placeholder="email1@example.com, email2@example.com"
              disabled={isGroupFull}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated email addresses.</p>
            {isGroupFull && <p className="text-xs text-red-500 dark:text-red-400 mt-1">This group is full ({MAX_GROUP_MEMBERS} members) and cannot accept new members.</p>}
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50"
            disabled={!newMemberEmails.trim() || isGroupFull}
          >
            Add Members
          </button>
        </form>
        
        {isCurrentUserAdmin && group.inviteId && (
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Group Invite Link</h3>
                <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <input type="text" readOnly value={inviteLink} className="flex-grow p-1 bg-transparent text-sm text-gray-600 dark:text-gray-400 focus:outline-none" />
                    <button onClick={handleCopyLink} className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Copy</button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Anyone with this link can request to join. Admins must approve requests.</p>
            </div>
        )}

        {isCurrentUserAdmin && group.pendingMembers && group.pendingMembers.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Pending Join Requests ({group.pendingMembers.length})</h3>
                <ul className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                    {group.pendingMembers.map(member => (
                        <li key={member.id} className="flex items-center text-sm text-gray-700 dark:text-gray-300 py-1.5">
                            <img 
                                src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name.replace(/\s/g, '+')}&background=random&color=fff&size=30`} 
                                alt={member.name} 
                                className="w-7 h-7 rounded-full mr-2.5 object-cover flex-shrink-0"
                            />
                            <span className="truncate flex-grow" title={member.name}>{member.name}</span>
                            <div className="ml-auto flex items-center space-x-2">
                                <button 
                                  onClick={() => onApproveMember(group.id, member.id)} 
                                  className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-700/50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" 
                                  title={isGroupFull ? "Cannot approve, group is full" : "Approve"}
                                  disabled={isGroupFull}
                                >
                                    <CheckCircleIcon className="w-6 h-6" />
                                </button>
                                <button onClick={() => onRejectMember(group.id, member.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-700/50 rounded-full" title="Reject">
                                    <XCircleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                 {isGroupFull && <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">Cannot approve new members because the group is full.</p>}
            </div>
        )}
        
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Current Members & Invitations ({finalMemberList.length} / {MAX_GROUP_MEMBERS})</h3>
             {finalMemberList.length > 0 ? (
                <ul className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                {finalMemberList.map((member, index) => {
                    const isMemberAdmin = group.adminIds.includes(member.id);
                    const isInvitedGuest = member.id.startsWith('invited-');
                    return (
                        <li key={member.id || `member-${index}`} className="flex items-center text-sm text-gray-700 dark:text-gray-300 py-1.5">
                            <img 
                                src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name.replace(/\s/g, '+')}&background=random&color=fff&size=30`} 
                                alt={member.name} 
                                className="w-7 h-7 rounded-full mr-2.5 object-cover flex-shrink-0"
                            />
                            <span className="truncate flex-grow" title={member.name}>{member.name}</span>
                            
                            {isMemberAdmin && !isInvitedGuest && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 rounded-full flex items-center">
                                    <ShieldCheckIcon className="w-3.5 h-3.5 mr-1" /> Admin
                                </span>
                            )}
                            {isInvitedGuest && (
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-sm">(Invited)</span>
                            )}
                            {member.id === currentUser.id && !isInvitedGuest && (
                                <span className="ml-2 text-xs text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-700/30 px-1.5 py-0.5 rounded-sm">(You)</span>
                            )}

                            {/* Action buttons */}
                            {!isInvitedGuest && member.id !== currentUser.id && (
                                <div className="ml-auto flex items-center space-x-1.5">
                                    <button
                                        onClick={() => onChallengeUser(member)}
                                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-700/50 rounded-md"
                                        title={`Challenge ${member.name}`}
                                        aria-label={`Challenge ${member.name} to a game`}
                                    >
                                        <span role="img" aria-label="crossed swords" className="text-base leading-none">⚔️</span>
                                    </button>
                                    {isCurrentUserAdmin && (
                                        <>
                                            {!isMemberAdmin ? (
                                                <button 
                                                    onClick={() => onPromoteToAdmin(group.id, member.id)}
                                                    className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-700/50 rounded-md"
                                                    title="Promote to Admin"
                                                    aria-label={`Promote ${member.name} to admin`}
                                                >
                                                    <UserPlusIcon className="w-5 h-5"/>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => onDemoteAdmin(group.id, member.id)}
                                                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-700/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Demote Admin"
                                                    aria-label={`Demote ${member.name} from admin`}
                                                    disabled={group.adminIds.length <= 1} 
                                                >
                                                    <UserMinusIcon className="w-5 h-5"/>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No members yet.</p>
            )}
        </div>

        {isCurrentUserAdmin && (
          <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <legend className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Actions</legend>
            <div className="space-y-3">
              <button
                onClick={() => {
                  onToggleArchiveGroup(group.id);
                  onClose();
                }}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:text-yellow-200 dark:bg-yellow-600/30 dark:hover:bg-yellow-600/50 rounded-md shadow-sm transition-colors"
              >
                <ArchiveBoxIcon className="w-5 h-5 mr-2" />
                {group.isArchived ? 'Unarchive Group' : 'Archive Group'}
              </button>
            </div>
            <div className="mt-6 border-t border-red-500/30 pt-4">
                 <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h4>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to permanently delete the group "${group.name}"? This action cannot be undone.`)) {
                        onDeleteGroup(group.id);
                        onClose();
                      }
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-800 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-600/30 dark:hover:bg-red-600/50 rounded-md shadow-sm transition-colors"
                  >
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Delete Group Permanently
                  </button>
            </div>
          </fieldset>
        )}

        <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
