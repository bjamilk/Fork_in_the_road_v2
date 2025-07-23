
import React, { useState, useEffect } from 'react';
import { FoodListing, FoodCategory, DietaryInfo } from '../types';
import { XCircleIcon, CakeIcon, PhotoIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';


interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

interface ListFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FoodListing, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListFoodModal: React.FC<ListFoodModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>(FoodCategory.HOMEMADE_MEAL);
  const [price, setPrice] = useState<number | ''>('');
  const [swipeEquivalent, setSwipeEquivalent] = useState<number | ''>('');
  const [portionsAvailable, setPortionsAvailable] = useState<number | ''>(1);
  const [selectedDietaryInfo, setSelectedDietaryInfo] = useState<DietaryInfo[]>([]);
  const [pickupDetails, setPickupDetails] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);

  const MAX_IMAGES = 3;

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setCategory(FoodCategory.HOMEMADE_MEAL);
      setPrice('');
      setSwipeEquivalent('');
      setPortionsAvailable(1);
      setSelectedDietaryInfo([]);
      setPickupDetails('');
      images.forEach(img => URL.revokeObjectURL(img.url));
      setImages([]);
    }
  }, [isOpen]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: ImagePreview[] = [];
      const filesToProcess = Array.from(files).slice(0, MAX_IMAGES - images.length);
      filesToProcess.forEach(file => {
        if (file.size > 2 * 1024 * 1024) {
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
  
  const handleDietaryChange = (info: DietaryInfo) => {
    setSelectedDietaryInfo(prev =>
      prev.includes(info) ? prev.filter(i => i !== info) : [...prev, info]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || portionsAvailable === '' || !pickupDetails.trim()) {
      alert('Please fill in Title, Portions Available, and Pickup Details.');
      return;
    }
    if (price === '' && swipeEquivalent === '') {
      alert('Please specify either a price or a meal swipe equivalent.');
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
      title: title.trim(),
      description: description.trim(),
      category,
      price: price !== '' ? Number(price) : undefined,
      swipeEquivalent: swipeEquivalent !== '' ? Number(swipeEquivalent) : undefined,
      portionsAvailable: Number(portionsAvailable),
      dietaryInfo: selectedDietaryInfo.length > 0 ? selectedDietaryInfo : undefined,
      pickupDetails: pickupDetails.trim(),
      images: base64Images.length > 0 ? base64Images : undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70]" role="dialog" aria-modal="true" aria-labelledby="list-food-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl transform max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-food-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <CakeIcon className="w-6 h-6 mr-2 text-pink-500" />
            List a Food/Meal Item
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="foodTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" id="foodTitle" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Homemade Lasagna, 2 Meal Swipes for Trade" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-pink-500 focus:border-pink-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="foodCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select id="foodCategory" value={category} onChange={e => setCategory(e.target.value as FoodCategory)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                {Object.values(FoodCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="foodPortions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portions Available <span className="text-red-500">*</span></label>
              <input type="number" id="foodPortions" value={portionsAvailable} onChange={e => setPortionsAvailable(e.target.value === '' ? '' : parseInt(e.target.value))} required min="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="foodPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₦, if any)</label>
              <input type="number" id="foodPrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} min="0" step="100" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
            <div>
              <label htmlFor="foodSwipes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meal Swipes (if any)</label>
              <input type="number" id="foodSwipes" value={swipeEquivalent} onChange={e => setSwipeEquivalent(e.target.value === '' ? '' : parseInt(e.target.value))} min="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Please fill at least one: Price or Meal Swipes.</p>
          
          <div>
            <label htmlFor="foodDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
            <textarea id="foodDescription" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Ingredients, portion size, reason for selling, etc."></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dietary Information (Optional)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                {Object.values(DietaryInfo).map(info => (
                    <label key={info} className="flex items-center text-sm">
                        <input type="checkbox" checked={selectedDietaryInfo.includes(info)} onChange={() => handleDietaryChange(info)} className="h-4 w-4 text-pink-600 rounded focus:ring-pink-500" />
                        <span className="ml-2">{info}</span>
                    </label>
                ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images (Optional, Max {MAX_IMAGES})</label>
            <input id="foodImages" type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 mb-2" disabled={images.length >= MAX_IMAGES} />
            {images.length > 0 && <div className="mt-2 grid grid-cols-3 gap-2">{images.map((img, i) => <div key={img.id} className="relative group"><img src={img.url} alt={`Preview ${i+1}`} className="w-full h-20 object-cover rounded-md" /><button type="button" onClick={() => removeImage(img.id)} className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"><XCircleIcon className="w-5 h-5" /></button></div>)}</div>}
          </div>

          <div>
            <label htmlFor="foodPickup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Details <span className="text-red-500">*</span></label>
            <input type="text" id="foodPickup" value={pickupDetails} onChange={e => setPickupDetails(e.target.value)} required placeholder="e.g., Dorm Hall B Lobby, Tonight 6-8 PM" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-md shadow-sm">List Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListFoodModal;
