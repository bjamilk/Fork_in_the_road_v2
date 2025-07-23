
import React, { useState, useEffect } from 'react';
import { LostAndFoundItem, LostAndFoundCategory, LostAndFoundStatus } from '../types';
import { XCircleIcon, DocumentMagnifyingGlassIcon, PhotoIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

interface ListLostAndFoundItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<LostAndFoundItem, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate' | 'isResolved'>) => void;
}

const ListLostAndFoundItemModal: React.FC<ListLostAndFoundItemModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LostAndFoundCategory>(LostAndFoundCategory.OTHER);
  const [status, setStatus] = useState<LostAndFoundStatus>(LostAndFoundStatus.LOST);
  const [dateLostOrFound, setDateLostOrFound] = useState('');
  const [locationLostOrFound, setLocationLostOrFound] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when modal opens or closes
    if (!isOpen) {
      setItemName('');
      setDescription('');
      setCategory(LostAndFoundCategory.OTHER);
      setStatus(LostAndFoundStatus.LOST);
      setDateLostOrFound('');
      setLocationLostOrFound('');
      setContactInfo('');
      setImageFile(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
    } else {
        // Prefill date with today's date when opening for convenience
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const dd = String(today.getDate()).padStart(2, '0');
        setDateLostOrFound(`${yyyy}-${mm}-${dd}`);
    }
  }, [isOpen]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Image is too large. Please select an image under 2MB.");
        event.target.value = ""; 
        return;
      }
      setImageFile(file);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };
  
  const removeImage = () => {
    setImageFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    const fileInput = document.getElementById('lfItemImage') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !description || !dateLostOrFound || !locationLostOrFound || !contactInfo) {
      alert('Please fill in all required fields.');
      return;
    }

    let base64ImageUrl: string | undefined = undefined;
    if (imageFile) {
      base64ImageUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    onSubmit({
      itemName,
      description,
      category,
      status,
      dateLostOrFound: new Date(dateLostOrFound + "T00:00:00"), // Ensure it's parsed as local date
      locationLostOrFound,
      contactInfo,
      imageUrl: base64ImageUrl,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[60] transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-lf-item-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-lf-item-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <DocumentMagnifyingGlassIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            Report Lost or Found Item
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="lfItemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name <span className="text-red-500">*</span></label>
            <input type="text" id="lfItemName" value={itemName} onChange={e => setItemName(e.target.value)} required placeholder="e.g., Black iPhone 12, Blue Jansport Backpack" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lfStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status <span className="text-red-500">*</span></label>
              <select id="lfStatus" value={status} onChange={e => setStatus(e.target.value as LostAndFoundStatus)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(LostAndFoundStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="lfCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category <span className="text-red-500">*</span></label>
              <select id="lfCategory" value={category} onChange={e => setCategory(e.target.value as LostAndFoundCategory)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(LostAndFoundCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="lfDateLostOrFound" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date {status === LostAndFoundStatus.LOST ? 'Lost' : 'Found'} <span className="text-red-500">*</span></label>
            <input type="date" id="lfDateLostOrFound" value={dateLostOrFound} onChange={e => setDateLostOrFound(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="lfLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location {status === LostAndFoundStatus.LOST ? 'Lost' : 'Found'} <span className="text-red-500">*</span></label>
            <input type="text" id="lfLocation" value={locationLostOrFound} onChange={e => setLocationLostOrFound(e.target.value)} required placeholder="e.g., Library Cafe, Main Auditorium Room 301" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          
          <div>
            <label htmlFor="lfDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="lfDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Provide details like color, brand, distinguishing features, etc."></textarea>
          </div>
          
          <div>
            <label htmlFor="lfItemImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Image (Optional)</label>
            <div className="mt-1 flex items-center space-x-3">
              <label className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                <PhotoIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span>Choose Image</span>
                <input id="lfItemImage" name="lfItemImage" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </label>
              {imagePreviewUrl && (
                <div className="relative group">
                  <img src={imagePreviewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-md border border-gray-300 dark:border-gray-600" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            {imageFile && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: {imageFile.name}</p>}
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max file size: 2MB.</p>
          </div>

          <div>
            <label htmlFor="lfContactInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Information (How can someone reach you?) <span className="text-red-500">*</span></label>
            <input type="text" id="lfContactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="e.g., Email student@example.com, Phone 080..., Ask for Jane at Admin Office" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-sm">Submit Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListLostAndFoundItemModal;
