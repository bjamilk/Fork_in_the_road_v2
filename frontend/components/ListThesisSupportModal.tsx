import React, { useState, useEffect } from 'react';
import { ThesisSupportListing, ThesisSupportType, MarketplaceRateType, MarketplaceListingType } from '../types';
import { XCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface ListThesisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ThesisSupportListing, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListThesisSupportModal: React.FC<ListThesisSupportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [listingType, setListingType] = useState<MarketplaceListingType>(MarketplaceListingType.OFFERING);
  const [supportType, setSupportType] = useState<ThesisSupportType>(ThesisSupportType.WRITING_COACHING_EDITING);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [specificSkills, setSpecificSkills] = useState('');
  const [rate, setRate] = useState<number | ''>('');
  const [rateType, setRateType] = useState<MarketplaceRateType>(MarketplaceRateType.PER_SESSION);
  const [availability, setAvailability] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setListingType(MarketplaceListingType.OFFERING);
      setSupportType(ThesisSupportType.WRITING_COACHING_EDITING);
      setTitle('');
      setDescription('');
      setFieldOfStudy('');
      setSpecificSkills('');
      setRate('');
      setRateType(MarketplaceRateType.PER_SESSION);
      setAvailability('');
      setContactInfo('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !contactInfo.trim() || !fieldOfStudy.trim()) {
      alert('Please fill in Title, Description, Field of Study, and Contact Information.');
      return;
    }
    if (rateType !== MarketplaceRateType.FREE && rateType !== MarketplaceRateType.NEGOTIABLE && rate === '') {
      alert('Please specify a rate or choose Free/Negotiable.');
      return;
    }

    onSubmit({
      listingType,
      supportType,
      title: title.trim(),
      description: description.trim(),
      fieldOfStudy: fieldOfStudy.split(',').map(s => s.trim()).filter(s => s.length > 0),
      specificSkills: specificSkills.split(',').map(s => s.trim()).filter(s => s.length > 0),
      rate: (rateType === MarketplaceRateType.FREE || rateType === MarketplaceRateType.NEGOTIABLE || rate === '') ? undefined : Number(rate),
      rateType: (rateType === MarketplaceRateType.FREE || rateType === MarketplaceRateType.NEGOTIABLE || rate === '') ? rateType : rateType,
      availability: availability.trim() || undefined,
      contactInfo: contactInfo.trim(),
    });
    onClose();
  };
  
  const isPaidRateType = rateType !== MarketplaceRateType.FREE && rateType !== MarketplaceRateType.NEGOTIABLE;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[60] transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-ts-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-ts-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-500 dark:text-yellow-400" />
            {listingType === MarketplaceListingType.OFFERING ? 'Offer Thesis/Dissertation Support' : 'Request Thesis/Dissertation Support'}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tsListingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I am...</label>
            <select id="tsListingType" value={listingType} onChange={e => setListingType(e.target.value as MarketplaceListingType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
              {Object.values(MarketplaceListingType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="tsSupportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type of Support <span className="text-red-500">*</span></label>
            <select id="tsSupportType" value={supportType} onChange={e => setSupportType(e.target.value as ThesisSupportType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
              {Object.values(ThesisSupportType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="tsTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title / Headline <span className="text-red-500">*</span></label>
            <input type="text" id="tsTitle" value={title} onChange={e => setTitle(e.target.value)} required placeholder={listingType === MarketplaceListingType.OFFERING ? "e.g., PhD Thesis Editing (Humanities)" : "e.g., Seeking SPSS Expert for Master's Thesis"} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          
          <div>
            <label htmlFor="tsDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="tsDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Describe the support you offer or need in detail. Include your experience, specific software expertise, or particular challenges."></textarea>
          </div>

          <div>
            <label htmlFor="tsFieldOfStudy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field(s) of Study (comma-separated) <span className="text-red-500">*</span></label>
            <input type="text" id="tsFieldOfStudy" value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} required placeholder="e.g., Computer Science, Sociology, Public Health" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="tsSpecificSkills" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specific Skills / Software (Optional, comma-separated)</label>
            <input type="text" id="tsSpecificSkills" value={specificSkills} onChange={e => setSpecificSkills(e.target.value)} placeholder="e.g., SPSS, R, NVivo, LaTeX, Qualitative Analysis" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tsRateType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate Type</label>
              <select id="tsRateType" value={rateType} onChange={e => setRateType(e.target.value as MarketplaceRateType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(MarketplaceRateType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
             {isPaidRateType && (
              <div>
                <label htmlFor="tsRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate (₦) {isPaidRateType ? <span className="text-red-500">*</span> : ''}</label>
                <input type="number" id="tsRate" value={rate} onChange={e => setRate(e.target.value === '' ? '' : parseFloat(e.target.value))} required={isPaidRateType} min="0" step="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            )}
            {!isPaidRateType && <div/>}
          </div>

          <div>
            <label htmlFor="tsAvailability" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability (Optional)</label>
            <input type="text" id="tsAvailability" value={availability} onChange={e => setAvailability(e.target.value)} placeholder="e.g., Evenings & Weekends, Project-based, Next 2 months" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="tsContactInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Information <span className="text-red-500">*</span></label>
            <input type="text" id="tsContactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="e.g., your_email@example.com, LinkedIn Profile URL" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
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

export default ListThesisSupportModal;
