import React, { useState, useEffect } from 'react';
import { PeerReviewServiceListing, PeerReviewServiceType, MarketplaceRateType, MarketplaceListingType } from '../types';
import { XCircleIcon, ClipboardDocumentListIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface ListPeerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PeerReviewServiceListing, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListPeerReviewModal: React.FC<ListPeerReviewModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [listingType, setListingType] = useState<MarketplaceListingType>(MarketplaceListingType.OFFERING);
  const [serviceType, setServiceType] = useState<PeerReviewServiceType>(PeerReviewServiceType.GENERAL_FEEDBACK);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectsOrSkills, setSubjectsOrSkills] = useState('');
  const [rate, setRate] = useState<number | ''>('');
  const [rateType, setRateType] = useState<MarketplaceRateType>(MarketplaceRateType.PER_ITEM);
  const [turnaroundTime, setTurnaroundTime] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setListingType(MarketplaceListingType.OFFERING);
      setServiceType(PeerReviewServiceType.GENERAL_FEEDBACK);
      setTitle('');
      setDescription('');
      setSubjectsOrSkills('');
      setRate('');
      setRateType(MarketplaceRateType.PER_ITEM);
      setTurnaroundTime('');
      setContactInfo('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !contactInfo.trim()) {
      alert('Please fill in Title, Description, and Contact Information.');
      return;
    }
    if (rateType !== MarketplaceRateType.FREE && rateType !== MarketplaceRateType.NEGOTIABLE && rate === '') {
      alert('Please specify a rate or choose Free/Negotiable.');
      return;
    }

    onSubmit({
      listingType,
      serviceType,
      title: title.trim(),
      description: description.trim(),
      subjectsOrSkills: subjectsOrSkills.split(',').map(s => s.trim()).filter(s => s.length > 0),
      rate: (rateType === MarketplaceRateType.FREE || rateType === MarketplaceRateType.NEGOTIABLE || rate === '') ? undefined : Number(rate),
      rateType: (rateType === MarketplaceRateType.FREE || rateType === MarketplaceRateType.NEGOTIABLE || rate === '') ? rateType : rateType,
      turnaroundTime: turnaroundTime.trim() || undefined,
      contactInfo: contactInfo.trim(),
    });
    onClose();
  };

  const isPaidRateType = rateType !== MarketplaceRateType.FREE && rateType !== MarketplaceRateType.NEGOTIABLE;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[60] transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-pr-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-pr-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <ClipboardDocumentListIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            {listingType === MarketplaceListingType.OFFERING ? 'Offer Peer Review/Editing Service' : 'Request Peer Review/Editing Help'}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prListingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I am...</label>
            <select id="prListingType" value={listingType} onChange={e => setListingType(e.target.value as MarketplaceListingType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
              {Object.values(MarketplaceListingType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="prServiceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type <span className="text-red-500">*</span></label>
            <select id="prServiceType" value={serviceType} onChange={e => setServiceType(e.target.value as PeerReviewServiceType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
              {Object.values(PeerReviewServiceType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="prTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title / Headline <span className="text-red-500">*</span></label>
            <input type="text" id="prTitle" value={title} onChange={e => setTitle(e.target.value)} required placeholder={listingType === MarketplaceListingType.OFFERING ? "e.g., Expert APA Formatting & Proofreading" : "e.g., Need Help Reviewing History Paper"} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="prDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="prDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Provide details about the service you're offering or the help you need. Specify document type, length, specific requirements, etc."></textarea>
          </div>

          <div>
            <label htmlFor="prSubjectsOrSkills" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relevant Subjects / Skills (comma-separated)</label>
            <input type="text" id="prSubjectsOrSkills" value={subjectsOrSkills} onChange={e => setSubjectsOrSkills(e.target.value)} placeholder="e.g., English Literature, Scientific Writing, APA 7th Ed." className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prRateType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate Type</label>
              <select id="prRateType" value={rateType} onChange={e => setRateType(e.target.value as MarketplaceRateType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(MarketplaceRateType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            {isPaidRateType && (
              <div>
                <label htmlFor="prRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate (₦) {isPaidRateType ? <span className="text-red-500">*</span> : ''}</label>
                <input type="number" id="prRate" value={rate} onChange={e => setRate(e.target.value === '' ? '' : parseFloat(e.target.value))} required={isPaidRateType} min="0" step="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            )}
            {!isPaidRateType && <div />}
          </div>
          
          <div>
            <label htmlFor="prTurnaroundTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Turnaround Time (Optional)</label>
            <input type="text" id="prTurnaroundTime" value={turnaroundTime} onChange={e => setTurnaroundTime(e.target.value)} placeholder="e.g., 24 hours, 2-3 business days, By [Date]" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="prContactInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Information <span className="text-red-500">*</span></label>
            <input type="text" id="prContactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="e.g., your@email.com, Platform DM @username" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-sm">Submit Listing</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListPeerReviewModal;
