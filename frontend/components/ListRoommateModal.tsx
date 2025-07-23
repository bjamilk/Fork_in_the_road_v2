import React, { useState, useEffect } from 'react';
import { RoommateListing, RoommateListingType } from '../types';
import { XCircleIcon, UserPlusIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ListRoommateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<RoommateListing, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListRoommateModal: React.FC<ListRoommateModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [listingType, setListingType] = useState<RoommateListingType>(RoommateListingType.SEEKING_PLACE);
    const [title, setTitle] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'>('Prefer not to say');
    const [schoolProgram, setSchoolProgram] = useState('');
    const [bio, setBio] = useState('');
    const [habits, setHabits] = useState('');
    const [location, setLocation] = useState('');
    const [rent, setRent] = useState<number | ''>('');
    const [moveInDate, setMoveInDate] = useState('');
    const [leaseLength, setLeaseLength] = useState('');
    const [lookingFor, setLookingFor] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setListingType(RoommateListingType.SEEKING_PLACE);
      setTitle('');
      setAge('');
      setGender('Prefer not to say');
      setSchoolProgram('');
      setBio('');
      setHabits('');
      setLocation('');
      setRent('');
      setMoveInDate('');
      setLeaseLength('');
      setLookingFor('');
      setContactInfo('');
      setProfileImageFile(null);
      if (profileImagePreviewUrl) URL.revokeObjectURL(profileImagePreviewUrl);
      setProfileImagePreviewUrl(null);
    }
  }, [isOpen]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large (max 2MB).");
        return;
      }
      setProfileImageFile(file);
      if (profileImagePreviewUrl) URL.revokeObjectURL(profileImagePreviewUrl);
      setProfileImagePreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const removeImage = () => {
    setProfileImageFile(null);
    if(profileImagePreviewUrl) URL.revokeObjectURL(profileImagePreviewUrl);
    setProfileImagePreviewUrl(null);
    const fileInput = document.getElementById('roommateImage') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || age === '' || !schoolProgram.trim() || !bio.trim() || !location.trim() || rent === '' || !moveInDate || !leaseLength.trim() || !contactInfo.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    
    let base64ImageUrl: string | undefined = undefined;
    if (profileImageFile) {
        base64ImageUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(profileImageFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    onSubmit({
      listingType,
      title: title.trim(),
      age: Number(age),
      gender,
      schoolProgram: schoolProgram.trim(),
      bio: bio.trim(),
      habits: habits.split(',').map(h => h.trim()).filter(h => h),
      location: location.trim(),
      rent: Number(rent),
      moveInDate: new Date(moveInDate),
      leaseLength: leaseLength.trim(),
      lookingFor: lookingFor.trim(),
      contactInfo: contactInfo.trim(),
      profileImageUrl: base64ImageUrl,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70]" role="dialog" aria-modal="true" aria-labelledby="list-roommate-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl transform max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-roommate-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <UserPlusIcon className="w-6 h-6 mr-2 text-cyan-500" />
            Create Roommate Profile
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="rmListingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I am...</label>
                <select id="rmListingType" value={listingType} onChange={e => setListingType(e.target.value as RoommateListingType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                    {Object.values(RoommateListingType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="rmTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Title <span className="text-red-500">*</span></label>
                <input type="text" id="rmTitle" value={title} onChange={e => setTitle(e.target.value)} required placeholder={listingType === RoommateListingType.SEEKING_PLACE ? "e.g., Quiet CS student looking for a room" : "e.g., Room available in 3BR house near Law Faculty"} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>

            <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">About You</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="rmAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age <span className="text-red-500">*</span></label>
                        <input type="number" id="rmAge" value={age} onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value))} required min="16" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="rmGender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                        <select id="rmGender" value={gender} onChange={e => setGender(e.target.value as any)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                            <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="rmProgram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School/Program <span className="text-red-500">*</span></label>
                        <input type="text" id="rmProgram" value={schoolProgram} onChange={e => setSchoolProgram(e.target.value)} required placeholder="e.g., Engineering, 2nd Year" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                </div>
                 <div className="mt-4">
                    <label htmlFor="rmBio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Bio <span className="text-red-500">*</span></label>
                    <textarea id="rmBio" value={bio} onChange={e => setBio(e.target.value)} required rows={2} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Tell us a bit about yourself, your hobbies, etc."></textarea>
                </div>
                <div className="mt-4">
                    <label htmlFor="rmHabits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Living Habits (comma-separated)</label>
                    <input type="text" id="rmHabits" value={habits} onChange={e => setHabits(e.target.value)} placeholder="e.g., Clean, Quiet, Non-smoker, Pet-friendly" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture (Optional)</label>
                    <div className="flex items-center space-x-3">
                        <input id="roommateImage" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        <img src={profileImagePreviewUrl || 'https://ui-avatars.com/api/?name=?&background=random&color=fff&size=64'} alt="Profile Preview" className="h-16 w-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-500" />
                        <button type="button" onClick={() => document.getElementById('roommateImage')?.click()} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">Choose Image</button>
                        {profileImagePreviewUrl && <button type="button" onClick={removeImage} className="text-red-500"><TrashIcon className="w-5 h-5"/></button>}
                    </div>
                </div>
            </fieldset>

             <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Housing Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="rmLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{listingType === RoommateListingType.SEEKING_PLACE ? 'Desired Location' : 'Property Location'} <span className="text-red-500">*</span></label>
                        <input type="text" id="rmLocation" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g., North Campus, Yaba area" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                     <div>
                        <label htmlFor="rmRent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{listingType === RoommateListingType.SEEKING_PLACE ? 'Max Rent Budget' : 'Rent per Room'} (₦/month) <span className="text-red-500">*</span></label>
                        <input type="number" id="rmRent" value={rent} onChange={e => setRent(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="rmMoveIn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Move-in Date <span className="text-red-500">*</span></label>
                        <input type="date" id="rmMoveIn" value={moveInDate} onChange={e => setMoveInDate(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="rmLease" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lease Length <span className="text-red-500">*</span></label>
                        <input type="text" id="rmLease" value={leaseLength} onChange={e => setLeaseLength(e.target.value)} required placeholder="e.g., 1 Year, 6 Months, Flexible" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                </div>
                 <div className="mt-4">
                    <label htmlFor="rmLookingFor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Looking for in a Roommate (Optional)</label>
                    <textarea id="rmLookingFor" value={lookingFor} onChange={e => setLookingFor(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Describe your ideal roommate(s). e.g., 'Looking for tidy and respectful students'"></textarea>
                </div>
            </fieldset>

             <div>
                <label htmlFor="rmContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Info <span className="text-red-500">*</span></label>
                <input type="text" id="rmContact" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="e.g., your_email@example.com, Platform DM @username" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-sm">Post Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListRoommateModal;