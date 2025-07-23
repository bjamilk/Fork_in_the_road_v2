
import React, { useState, useEffect } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Group } from '../types'; // Import Group type

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, memberEmails: string, parentId?: string) => void;
  parentId?: string; // For creating sub-groups
  allGroups?: Group[]; // To get parent group name for title
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  parentId, 
  allGroups 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState('');
  const [modalTitle, setModalTitle] = useState('Create New Study Group');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setMemberEmails('');
      if (parentId && allGroups) {
        const parentGroup = allGroups.find(g => g.id === parentId);
        setModalTitle(parentGroup ? `Create Sub-group in "${parentGroup.name}"` : 'Create New Sub-group');
      } else {
        setModalTitle('Create New Study Group');
      }
    }
  }, [isOpen, parentId, allGroups]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim(), memberEmails.trim(), parentId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="create-group-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 id="create-group-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100">{modalTitle}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {parentId ? 'Sub-group Name' : 'Group Name'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="groupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder={parentId ? "e.g., Chapter 1 Discussions" : "e.g., Organic Chemistry Finals Prep"}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="groupDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="A brief description of the group's purpose"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="memberEmails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Invite Members by Email (Optional)
            </label>
            <input
              type="text"
              id="memberEmails"
              value={memberEmails}
              onChange={(e) => setMemberEmails(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="email1@example.com, email2@example.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated email addresses. Invited members can access this {parentId ? 'sub-group' : 'group'}.</p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50"
              disabled={!name.trim()}
            >
              {parentId ? 'Create Sub-group' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
