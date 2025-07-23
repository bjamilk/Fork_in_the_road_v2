
import React, { useState, useEffect } from 'react';
import { ClubProfile, ClubType, MembershipTier } from '../types';
import { XCircleIcon, UsersIcon, PlusCircleIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

interface ListClubProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ClubProfile, 'id' | 'listedByUserId' | 'listedByUserName' | 'listedDate'>) => void;
}

const initialTier: Omit<MembershipTier, 'id'> = { name: '', price: 0, duration: 'Semester', benefits: [''] };

const ListClubProfileModal: React.FC<ListClubProfileModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [clubName, setClubName] = useState('');
  const [clubType, setClubType] = useState<ClubType>(ClubType.SOCIAL_INTEREST);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [meetingInfo, setMeetingInfo] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([{ ...initialTier, id: uuidv4() }]);

  useEffect(() => {
    if (!isOpen) {
      setClubName('');
      setClubType(ClubType.SOCIAL_INTEREST);
      setDescription('');
      setContactEmail('');
      setMeetingInfo('');
      setLogoFile(null);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
      setMembershipTiers([{ ...initialTier, id: uuidv4() }]);
    }
  }, [isOpen]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit for logo
        alert("Logo image is too large. Please select an image under 1MB.");
        event.target.value = "";
        return;
      }
      setLogoFile(file);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(URL.createObjectURL(file));
    } else {
      setLogoFile(null);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoPreviewUrl(null);
    const fileInput = document.getElementById('clubLogo') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleTierChange = (index: number, field: keyof MembershipTier, value: any) => {
    const newTiers = [...membershipTiers];
    if (field === 'benefits') {
        // This case is handled by handleBenefitChange
    } else if (field === 'price') {
        newTiers[index] = { ...newTiers[index], [field]: parseFloat(value) || 0 };
    }
     else {
        newTiers[index] = { ...newTiers[index], [field]: value };
    }
    setMembershipTiers(newTiers);
  };

  const addTier = () => {
    setMembershipTiers([...membershipTiers, { ...initialTier, id: uuidv4() }]);
  };

  const removeTier = (index: number) => {
    if (membershipTiers.length > 1) {
      const newTiers = membershipTiers.filter((_, i) => i !== index);
      setMembershipTiers(newTiers);
    } else {
      // If it's the last tier, just reset it
      setMembershipTiers([{ ...initialTier, id: uuidv4() }]);
    }
  };

  const handleBenefitChange = (tierIndex: number, benefitIndex: number, value: string) => {
    const newTiers = [...membershipTiers];
    newTiers[tierIndex].benefits[benefitIndex] = value;
    setMembershipTiers(newTiers);
  };

  const addBenefit = (tierIndex: number) => {
    const newTiers = [...membershipTiers];
    newTiers[tierIndex].benefits.push('');
    setMembershipTiers(newTiers);
  };

  const removeBenefit = (tierIndex: number, benefitIndex: number) => {
    const newTiers = [...membershipTiers];
    if (newTiers[tierIndex].benefits.length > 1) {
      newTiers[tierIndex].benefits.splice(benefitIndex, 1);
    } else {
      newTiers[tierIndex].benefits = ['']; // Keep at least one empty benefit input
    }
    setMembershipTiers(newTiers);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim() || !description.trim() || !contactEmail.trim()) {
      alert('Please fill in Club Name, Description, and Contact Email.');
      return;
    }

    let base64LogoUrl: string | undefined = undefined;
    if (logoFile) {
      base64LogoUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(logoFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    const finalTiers = membershipTiers.filter(tier => tier.name.trim() && tier.benefits.some(b => b.trim()));

    onSubmit({
      clubName: clubName.trim(),
      clubType,
      description: description.trim(),
      contactEmail: contactEmail.trim(),
      meetingInfo: meetingInfo.trim() || undefined,
      logoUrl: base64LogoUrl,
      membershipTiers: finalTiers.length > 0 ? finalTiers : undefined,
      // socialMediaLinks: can be added later
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70] transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-club-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-club-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <UsersIcon className="w-6 h-6 mr-2 text-purple-500 dark:text-purple-400" />
            List Your Club / Organization
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clubName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Name <span className="text-red-500">*</span></label>
            <input type="text" id="clubName" value={clubName} onChange={e => setClubName(e.target.value)} required placeholder="e.g., Debate Society, Tech Innovators Club" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-purple-500 focus:border-purple-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clubType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Type <span className="text-red-500">*</span></label>
              <select id="clubType" value={clubType} onChange={e => setClubType(e.target.value as ClubType)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-purple-500 focus:border-purple-500">
                {Object.values(ClubType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="clubContactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email <span className="text-red-500">*</span></label>
              <input type="email" id="clubContactEmail" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required placeholder="e.g., contact@clubname.com" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-purple-500 focus:border-purple-500" />
            </div>
          </div>
          
          <div>
            <label htmlFor="clubDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="clubDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-purple-500 focus:border-purple-500" placeholder="Describe your club's mission, activities, and what makes it unique."></textarea>
          </div>

          <div>
            <label htmlFor="clubMeetingInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Information (Optional)</label>
            <input type="text" id="clubMeetingInfo" value={meetingInfo} onChange={e => setMeetingInfo(e.target.value)} placeholder="e.g., Tuesdays 7 PM, Student Union Room 201" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-purple-500 focus:border-purple-500" />
          </div>

          <div>
            <label htmlFor="clubLogo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Logo (Optional, max 1MB)</label>
            <div className="mt-1 flex items-center space-x-3">
              <label className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                <PhotoIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span>Choose Logo</span>
                <input id="clubLogo" name="clubLogo" type="file" accept="image/*" onChange={handleLogoChange} className="sr-only" />
              </label>
              {logoPreviewUrl && (
                <div className="relative group">
                  <img src={logoPreviewUrl} alt="Logo Preview" className="h-16 w-16 object-contain rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900" />
                  <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove logo">
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            {logoFile && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: {logoFile.name}</p>}
          </div>

          <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Membership Tiers (Optional)</legend>
            {membershipTiers.map((tier, tierIndex) => (
              <div key={tier.id} className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                <div className="flex justify-between items-center">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Tier {tierIndex + 1}</h4>
                    {membershipTiers.length > 0 && (
                        <button type="button" onClick={() => removeTier(tierIndex)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" aria-label={`Remove Tier ${tierIndex + 1}`}>
                        <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor={`tierName-${tier.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input type="text" id={`tierName-${tier.id}`} value={tier.name} onChange={e => handleTierChange(tierIndex, 'name', e.target.value)} placeholder="e.g., Basic, Gold" className="w-full p-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label htmlFor={`tierPrice-${tier.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300">Price (₦)</label>
                    <input type="number" id={`tierPrice-${tier.id}`} value={tier.price} onChange={e => handleTierChange(tierIndex, 'price', e.target.value)} min="0" step="100" className="w-full p-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label htmlFor={`tierDuration-${tier.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300">Duration</label>
                    <select id={`tierDuration-${tier.id}`} value={tier.duration} onChange={e => handleTierChange(tierIndex, 'duration', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-purple-500 focus:border-purple-500">
                      <option value="Semester">Semester</option>
                      <option value="Annual">Annual</option>
                      <option value="Monthly">Monthly</option>
                      <option value="One-Time">One-Time</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Benefits (one per line):</label>
                  {tier.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center space-x-2 mb-1.5">
                      <input type="text" value={benefit} onChange={e => handleBenefitChange(tierIndex, benefitIndex, e.target.value)} placeholder="e.g., Free event entry" className="flex-grow p-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-purple-500 focus:border-purple-500" />
                      {tier.benefits.length > 1 && (
                        <button type="button" onClick={() => removeBenefit(tierIndex, benefitIndex)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" aria-label={`Remove benefit ${benefitIndex + 1}`}>
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addBenefit(tierIndex)} className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center">
                    <PlusCircleIcon className="w-4 h-4 mr-1" /> Add Benefit
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addTier} className="mt-2 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center">
              <PlusCircleIcon className="w-5 h-5 mr-1" /> Add Membership Tier
            </button>
          </fieldset>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-md shadow-sm">List Club</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListClubProfileModal;
