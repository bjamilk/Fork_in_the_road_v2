
import React, { useState } from 'react';
import { ReportReason } from '../types';
import { XCircleIcon, FlagIcon } from '@heroicons/react/24/outline';

interface ReportListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemData: { item: any; itemType: string } | null;
  onSubmit: (listingId: string, itemType: string, reason: ReportReason, comment: string) => void;
}

const ReportListingModal: React.FC<ReportListingModalProps> = ({ isOpen, onClose, itemData, onSubmit }) => {
  const [reason, setReason] = useState<ReportReason>(ReportReason.INACCURATE);
  const [comment, setComment] = useState('');

  if (!isOpen || !itemData) return null;

  const { item, itemType } = itemData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason === ReportReason.OTHER && !comment.trim()) {
      alert("Please provide details for your 'Other' report reason.");
      return;
    }
    onSubmit(item.id, itemType, reason, comment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[90] transition-opacity" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 id="report-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <FlagIcon className="w-6 h-6 mr-2 text-red-500" />
            Report Listing
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">You are reporting: <strong className="text-gray-700 dark:text-gray-300">{item.title || item.itemName}</strong></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for reporting:</label>
            <div className="space-y-2">
              {Object.values(ReportReason).map(r => (
                <label key={r} className="flex items-center text-sm">
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="reportComment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Additional Comments (optional, required for 'Other')</label>
            <textarea
              id="reportComment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              placeholder="Provide any extra details here..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportListingModal;
