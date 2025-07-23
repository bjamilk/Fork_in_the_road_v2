import React, { useState } from 'react';
import { DataCollectionGig } from '../types';
import { XCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';

interface ListDataCollectionGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<DataCollectionGig, 'id' | 'listerName' | 'listerId' | 'listedDate'>) => void;
}

const ListDataCollectionGigModal: React.FC<ListDataCollectionGigModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [compensation, setCompensation] = useState('');
  const [requiredParticipants, setRequiredParticipants] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !compensation) {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmit({
      title,
      description,
      location,
      compensation,
      requiredParticipants: requiredParticipants === '' ? undefined : Number(requiredParticipants),
      deadline: deadline ? new Date(deadline) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70]" role="dialog" aria-modal="true" aria-labelledby="list-gig-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-gig-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <BanknotesIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            Post Data Collection Gig
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="gigTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gig Title <span className="text-red-500">*</span></label>
            <input type="text" id="gigTitle" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Survey Participants for FYP" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="gigDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="gigDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Describe the task, requirements for participants, duration, and purpose of the data collection."></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="gigLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location <span className="text-red-500">*</span></label>
                <input type="text" id="gigLocation" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g., Online, Unilag Campus" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
            <div>
              <label htmlFor="gigCompensation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compensation <span className="text-red-500">*</span></label>
              <input type="text" id="gigCompensation" value={compensation} onChange={e => setCompensation(e.target.value)} required placeholder="e.g., ₦500 Voucher, ₦100 per entry, Volunteer" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gigParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"># of Participants Needed (Optional)</label>
              <input type="number" id="gigParticipants" value={requiredParticipants} onChange={e => setRequiredParticipants(e.target.value === '' ? '' : parseInt(e.target.value))} min="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
             <div>
                <label htmlFor="gigDeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Deadline (Optional)</label>
                <input type="date" id="gigDeadline" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Post Gig</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ListDataCollectionGigModal;
