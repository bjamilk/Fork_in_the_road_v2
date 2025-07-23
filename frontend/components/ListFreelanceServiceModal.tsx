import React, { useState, useEffect } from 'react';
import { CampusHustleListing, CampusHustleCategory, MarketplaceRateType, MarketplaceListingType } from '../types';
import { XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface ListCampusHustleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CampusHustleListing, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListCampusHustleModal: React.FC<ListCampusHustleModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [listingType, setListingType] = useState<MarketplaceListingType>(MarketplaceListingType.OFFERING);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CampusHustleCategory>(CampusHustleCategory.OTHER);
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [rate, setRate] = useState<number | ''>('');
  const [rateType, setRateType] = useState<MarketplaceRateType>(MarketplaceRateType.PER_HOUR);
  const [availability, setAvailability] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setListingType(MarketplaceListingType.OFFERING);
      setTitle('');
      setCategory(CampusHustleCategory.OTHER);
      setDescription('');
      setSkills('');
      setPortfolioLink('');
      setRate('');
      setRateType(MarketplaceRateType.PER_HOUR);
      setAvailability('');
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
      title: title.trim(),
      category,
      description: description.trim(),
      skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
      portfolioLink: portfolioLink.trim() || undefined,
      rate: (rateType === MarketplaceRateType.FREE || rateType === MarketplaceRateType.NEGOTIABLE || rate === '') ? undefined : Number(rate),
      rateType: (rateType === MarketplaceRateType.FREE || rateType === MarketplaceRateType.NEGOTIABLE || rate === '') ? rateType : rateType,
      availability: availability.trim() || undefined,
      contactInfo: contactInfo.trim(),
    });
    onClose();
  };
  
  const isPaidRateType = rateType !== MarketplaceRateType.FREE && rateType !== MarketplaceRateType.NEGOTIABLE;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70] transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-ch-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-ch-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-yellow-500 dark:text-yellow-400" />
            {listingType === MarketplaceListingType.OFFERING ? 'Offer a Campus Hustle / Service' : 'Request a Service'}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="chListingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I am...</label>
            <select id="chListingType" value={listingType} onChange={e => setListingType(e.target.value as MarketplaceListingType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500">
              {Object.values(MarketplaceListingType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="chTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Title <span className="text-red-500">*</span></label>
            <input type="text" id="chTitle" value={title} onChange={e => setTitle(e.target.value)} required placeholder={listingType === MarketplaceListingType.OFFERING ? "e.g., Expert Hair Braiding" : "e.g., Need a DJ for Birthday Party"} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500" />
          </div>

          <div>
            <label htmlFor="chCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category <span className="text-red-500">*</span></label>
            <select id="chCategory" value={category} onChange={e => setCategory(e.target.value as CampusHustleCategory)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500">
              {Object.values(CampusHustleCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="chDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detailed Description <span className="text-red-500">*</span></label>
            <textarea id="chDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500" placeholder="Describe your service, experience, what's included, or the specific help you need."></textarea>
          </div>

          <div>
            <label htmlFor="chSkills" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relevant Skills (comma-separated)</label>
            <input type="text" id="chSkills" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g., Knotless Braids, Phone Screen Repair" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500" />
          </div>

          <div>
            <label htmlFor="chPortfolioLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio/Instagram Link (Optional)</label>
            <input type="url" id="chPortfolioLink" value={portfolioLink} onChange={e => setPortfolioLink(e.target.value)} placeholder="e.g., https://instagram.com/your_hustle" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="chRateType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate Type</label>
              <select id="chRateType" value={rateType} onChange={e => setRateType(e.target.value as MarketplaceRateType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500">
                {Object.values(MarketplaceRateType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            {isPaidRateType && (
              <div>
                <label htmlFor="chRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate (₦) {isPaidRateType ? <span className="text-red-500">*</span> : ''}</label>
                <input type="number" id="chRate" value={rate} onChange={e => setRate(e.target.value === '' ? '' : parseFloat(e.target.value))} required={isPaidRateType} min="0" step="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500" />
              </div>
            )}
             {!isPaidRateType && <div />}
          </div>
          
          <div>
            <label htmlFor="chAvailability" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability (Optional)</label>
            <input type="text" id="chAvailability" value={availability} onChange={e => setAvailability(e.target.value)} placeholder="e.g., Weekends, Evenings, 10 hrs/week" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500" />
          </div>

          <div>
            <label htmlFor="chContactInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Information <span className="text-red-500">*</span></label>
            <input type="text" id="chContactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="e.g., WhatsApp number, Instagram handle" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-yellow-500 focus:border-yellow-500" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 rounded-md shadow-sm">Submit Listing</button>
          </div>
        </form>
      </div>
    </div>
  );
};
