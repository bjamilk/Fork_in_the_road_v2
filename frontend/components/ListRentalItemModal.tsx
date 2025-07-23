
import React, { useState, useEffect } from 'react';
import { RentalListing, EquipmentCategory, MarketplaceRateType } from '../types';
import { XCircleIcon, ShareIcon, PhotoIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

interface ListRentalItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<RentalListing, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListRentalItemModal: React.FC<ListRentalItemModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>(EquipmentCategory.OTHER_RENTALS);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [rentalRate, setRentalRate] = useState<number | ''>('');
  const [rentalRateType, setRentalRateType] = useState<MarketplaceRateType>(MarketplaceRateType.PER_DAY);
  const [depositRequired, setDepositRequired] = useState<number | ''>('');
  const [availabilityInfo, setAvailabilityInfo] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  
  const MAX_IMAGES = 4;

  useEffect(() => {
    if (!isOpen) {
      setItemName('');
      setCategory(EquipmentCategory.OTHER_RENTALS);
      setDescription('');
      images.forEach(img => URL.revokeObjectURL(img.url));
      setImages([]);
      setRentalRate('');
      setRentalRateType(MarketplaceRateType.PER_DAY);
      setDepositRequired('');
      setAvailabilityInfo('');
      setPickupLocation('');
      setContactInfo('');
    }
  }, [isOpen]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: ImagePreview[] = [];
      const currentImageCount = images.length;
      const filesToProcess = Array.from(files).slice(0, MAX_IMAGES - currentImageCount);

      filesToProcess.forEach(file => {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit per image
          alert(`Image "${file.name}" is too large (max 2MB). It will not be added.`);
          return;
        }
        newImages.push({ id: uuidv4(), file, url: URL.createObjectURL(file) });
      });

      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
      }
      event.target.value = ""; // Clear file input
    }
  };

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove) URL.revokeObjectURL(imageToRemove.url);
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !description.trim() || rentalRate === '' || !pickupLocation.trim() || !contactInfo.trim()) {
      alert('Please fill in Item Name, Description, Rental Rate, Pickup Location, and Contact Info.');
      return;
    }

    const imagePromises = images.map(imgPreview => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imgPreview.file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    });
    const base64Images = await Promise.all(imagePromises);

    onSubmit({
      itemName: itemName.trim(),
      category,
      description: description.trim(),
      images: base64Images,
      rentalRate: Number(rentalRate),
      rentalRateType,
      depositRequired: depositRequired === '' ? undefined : Number(depositRequired),
      availabilityInfo: availabilityInfo.trim() || undefined,
      pickupLocation: pickupLocation.trim(),
      contactInfo: contactInfo.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;
  
  const applicableRateTypes = [MarketplaceRateType.PER_HOUR, MarketplaceRateType.PER_DAY, MarketplaceRateType.PER_WEEK, MarketplaceRateType.PER_ITEM, MarketplaceRateType.PER_PROJECT, MarketplaceRateType.FIXED_PRICE, MarketplaceRateType.NEGOTIABLE, MarketplaceRateType.FREE];


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70] transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-rental-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-rental-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <ShareIcon className="w-6 h-6 mr-2 text-teal-500 dark:text-teal-400" />
            List Item for Rent / Share
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rentalItemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name <span className="text-red-500">*</span></label>
            <input type="text" id="rentalItemName" value={itemName} onChange={e => setItemName(e.target.value)} required placeholder="e.g., Canon EOS R5 Camera, Acoustic Guitar" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500" />
          </div>

          <div>
            <label htmlFor="rentalCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category <span className="text-red-500">*</span></label>
            <select id="rentalCategory" value={category} onChange={e => setCategory(e.target.value as EquipmentCategory)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500">
              {Object.values(EquipmentCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="rentalDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Description <span className="text-red-500">*</span></label>
            <textarea id="rentalDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500" placeholder="Include details like condition, model, included accessories, etc."></textarea>
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Images (Max {MAX_IMAGES}, First is primary)</label>
            <input id="rentalImages" type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 dark:file:bg-teal-700/30 file:text-teal-700 dark:file:text-teal-300 hover:file:bg-teal-100 dark:hover:file:bg-teal-600/40 mb-2" disabled={images.length >= MAX_IMAGES} />
            {images.length > 0 && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img src={img.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md border border-gray-300 dark:border-gray-600" />
                    <button type="button" onClick={() => removeImage(img.id)} className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-400" aria-label={`Remove image ${index + 1}`}>
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                    {index === 0 && <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-2xs bg-black/60 text-white rounded">Primary</span>}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 2MB per image.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rentalRateType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rental Rate Type <span className="text-red-500">*</span></label>
              <select id="rentalRateType" value={rentalRateType} onChange={e => setRentalRateType(e.target.value as MarketplaceRateType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500">
                {applicableRateTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="rentalRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rental Rate (₦) <span className="text-red-500">*</span></label>
              <input type="number" id="rentalRate" value={rentalRate} onChange={e => setRentalRate(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" step="100" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rentalDeposit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Deposit (₦, Optional)</label>
              <input type="number" id="rentalDeposit" value={depositRequired} onChange={e => setDepositRequired(e.target.value === '' ? '' : parseFloat(e.target.value))} min="0" step="100" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label htmlFor="rentalAvailability" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability Info (Optional)</label>
              <input type="text" id="rentalAvailability" value={availabilityInfo} onChange={e => setAvailabilityInfo(e.target.value)} placeholder="e.g., Weekends only, Available from [Date]" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500" />
            </div>
          </div>
          
          <div>
            <label htmlFor="rentalPickupLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Location <span className="text-red-500">*</span></label>
            <input type="text" id="rentalPickupLocation" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} required placeholder="e.g., My Dorm Room B101, Campus Library Front Desk" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500" />
          </div>

          <div>
            <label htmlFor="rentalContactInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Information <span className="text-red-500">*</span></label>
            <input type="text" id="rentalContactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="e.g., your_email@example.com, Phone for text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-md shadow-sm">List Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListRentalItemModal;
