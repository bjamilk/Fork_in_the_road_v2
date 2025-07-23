import React, { useState, useEffect } from 'react';
import { BikeScooterListing, BikeScooterListingType, BikeScooterType, BikeScooterCondition, MarketplaceRateType } from '../types';
import { XCircleIcon, ArrowPathIcon as BikeScooterIcon } from '@heroicons/react/24/outline'; // Using ArrowPathIcon for bike/scooter exchange
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

interface ListBikeScooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BikeScooterListing, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListBikeScooterModal: React.FC<ListBikeScooterModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [listingType, setListingType] = useState<BikeScooterListingType>(BikeScooterListingType.FOR_SALE);
  const [itemType, setItemType] = useState<BikeScooterType>(BikeScooterType.BICYCLE_HYBRID_COMMUTER);
  const [brandModel, setBrandModel] = useState('');
  const [condition, setCondition] = useState<BikeScooterCondition>(BikeScooterCondition.GOOD);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [rentalRate, setRentalRate] = useState<number | ''>('');
  const [rentalRateType, setRentalRateType] = useState<MarketplaceRateType>(MarketplaceRateType.PER_DAY);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const MAX_IMAGES = 3;

  useEffect(() => {
    if (!isOpen) {
      setListingType(BikeScooterListingType.FOR_SALE);
      setItemType(BikeScooterType.BICYCLE_HYBRID_COMMUTER);
      setBrandModel('');
      setCondition(BikeScooterCondition.GOOD);
      setDescription('');
      setPrice('');
      setRentalRate('');
      setRentalRateType(MarketplaceRateType.PER_DAY);
      images.forEach(img => URL.revokeObjectURL(img.url));
      setImages([]);
      setLocation('');
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
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
          alert(`Image "${file.name}" is too large (max 2MB).`);
          return;
        }
        newImages.push({ id: uuidv4(), file, url: URL.createObjectURL(file) });
      });

      if (newImages.length > 0) setImages(prev => [...prev, ...newImages]);
      event.target.value = "";
    }
  };

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove) URL.revokeObjectURL(imageToRemove.url);
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.trim() || !contactInfo.trim()) {
      alert('Please fill in Description, Location, and Contact Info.');
      return;
    }
    if ((listingType === BikeScooterListingType.FOR_SALE || listingType === BikeScooterListingType.WANTED_TO_BUY) && price === '') {
      alert('Please specify a price/budget for sale/wanted items.');
      return;
    }
    if ((listingType === BikeScooterListingType.FOR_RENT || listingType === BikeScooterListingType.WANTED_TO_RENT) && rentalRate === '') {
      alert('Please specify a rental rate/budget for rental items.');
      return;
    }

    const imagePromises = images.map(imgPreview => 
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imgPreview.file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      })
    );
    const base64Images = await Promise.all(imagePromises);

    onSubmit({
      listingType,
      itemType,
      brandModel: brandModel.trim() || undefined,
      condition,
      description: description.trim(),
      price: (listingType === BikeScooterListingType.FOR_SALE || listingType === BikeScooterListingType.WANTED_TO_BUY) && price !== '' ? Number(price) : undefined,
      rentalRate: (listingType === BikeScooterListingType.FOR_RENT || listingType === BikeScooterListingType.WANTED_TO_RENT) && rentalRate !== '' ? Number(rentalRate) : undefined,
      rentalRateType: (listingType === BikeScooterListingType.FOR_RENT || listingType === BikeScooterListingType.WANTED_TO_RENT) ? rentalRateType : undefined,
      images: base64Images.length > 0 ? base64Images : undefined,
      location: location.trim(),
      contactInfo: contactInfo.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;
  
  const isRental = listingType === BikeScooterListingType.FOR_RENT || listingType === BikeScooterListingType.WANTED_TO_RENT;
  const isSale = listingType === BikeScooterListingType.FOR_SALE || listingType === BikeScooterListingType.WANTED_TO_BUY;
  const applicableRateTypes = [MarketplaceRateType.PER_HOUR, MarketplaceRateType.PER_DAY, MarketplaceRateType.PER_WEEK, MarketplaceRateType.PER_ITEM, MarketplaceRateType.FIXED_PRICE, MarketplaceRateType.NEGOTIABLE, MarketplaceRateType.FREE];


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70] transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-bikescooter-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-bikescooter-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <BikeScooterIcon className="w-6 h-6 mr-2 text-green-500 dark:text-green-400" />
            List Bicycle / Scooter
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="bsListingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listing Type <span className="text-red-500">*</span></label>
                <select id="bsListingType" value={listingType} onChange={e => setListingType(e.target.value as BikeScooterListingType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500">
                {Object.values(BikeScooterListingType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="bsItemType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Type <span className="text-red-500">*</span></label>
                <select id="bsItemType" value={itemType} onChange={e => setItemType(e.target.value as BikeScooterType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500">
                {Object.values(BikeScooterType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bsBrandModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand & Model (Optional)</label>
              <input type="text" id="bsBrandModel" value={brandModel} onChange={e => setBrandModel(e.target.value)} placeholder="e.g., Trek FX2, Xiaomi M365 Pro" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="bsCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition <span className="text-red-500">*</span></label>
              <select id="bsCondition" value={condition} onChange={e => setCondition(e.target.value as BikeScooterCondition)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500">
                {Object.values(BikeScooterCondition).map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="bsDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="bsDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" placeholder="Include details like size, color, features, any issues. If wanted, specify requirements."></textarea>
          </div>

          {isSale && (
            <div>
              <label htmlFor="bsPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{listingType === BikeScooterListingType.WANTED_TO_BUY ? 'Budget' : 'Price'} (₦) <span className="text-red-500">*</span></label>
              <input type="number" id="bsPrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" step="100" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
            </div>
          )}

          {isRental && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bsRentalRateType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rental Rate Type <span className="text-red-500">*</span></label>
                <select id="bsRentalRateType" value={rentalRateType} onChange={e => setRentalRateType(e.target.value as MarketplaceRateType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500">
                   {applicableRateTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="bsRentalRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{listingType === BikeScooterListingType.WANTED_TO_RENT ? 'Budget' : 'Rental Rate'} (₦) <span className="text-red-500">*</span></label>
                <input type="number" id="bsRentalRate" value={rentalRate} onChange={e => setRentalRate(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" step="100" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
              </div>
            </div>
          )}

          {listingType !== BikeScooterListingType.WANTED_TO_BUY && listingType !== BikeScooterListingType.WANTED_TO_RENT && (
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Images (Optional, Max {MAX_IMAGES})</label>
                <input id="bsImages" type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-700/30 file:text-green-700 dark:file:text-green-300 hover:file:bg-green-100 dark:hover:file:bg-green-600/40 mb-2" disabled={images.length >= MAX_IMAGES} />
                {images.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                    {images.map((img, index) => (
                    <div key={img.id} className="relative group aspect-square">
                        <img src={img.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md border border-gray-300 dark:border-gray-600" />
                        <button type="button" onClick={() => removeImage(img.id)} className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove image ${index + 1}`}>
                        <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                    ))}
                </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 2MB per image.</p>
            </div>
          )}
          
          <div>
            <label htmlFor="bsLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location (for pickup/viewing) <span className="text-red-500">*</span></label>
            <input type="text" id="bsLocation" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g., Campus Main Gate, Hall 3 Common Room" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label htmlFor="bsContactInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Information <span className="text-red-500">*</span></label>
            <input type="text" id="bsContactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="e.g., your_email@example.com, Phone for text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-md shadow-sm">Submit Listing</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListBikeScooterModal;
