import React, { useState, useEffect } from 'react';
import { AsoEbiListing } from '../types';
import { XCircleIcon, SwatchIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

interface ListAsoEbiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AsoEbiListing, 'id' | 'sellerId' | 'sellerName' | 'postedDate'>) => void;
}

const ListAsoEbiModal: React.FC<ListAsoEbiModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<'Fabric' | 'Outfit'>('Fabric');
  const [price, setPrice] = useState<number | ''>('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [size, setSize] = useState('');
  const [yards, setYards] = useState<number | ''>('');

  const MAX_IMAGES = 3;

  useEffect(() => {
    if (!isOpen) {
      setEventName('');
      setDescription('');
      setListingType('Fabric');
      setPrice('');
      images.forEach(img => URL.revokeObjectURL(img.url));
      setImages([]);
      setSize('');
      setYards('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !description.trim() || price === '') {
      alert('Please fill in Event Name, Description, and Price.');
      return;
    }
    if (listingType === 'Fabric' && yards === '') {
        alert('Please specify the number of yards for the fabric.');
        return;
    }
     if (listingType === 'Outfit' && !size.trim()) {
        alert('Please specify the size of the outfit.');
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
      eventName: eventName.trim(),
      description: description.trim(),
      listingType,
      price: Number(price),
      images: base64Images,
      size: listingType === 'Outfit' ? size.trim() : undefined,
      yards: listingType === 'Fabric' && yards !== '' ? Number(yards) : undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70]" role="dialog" aria-modal="true" aria-labelledby="list-asoebi-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-asoebi-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <SwatchIcon className="w-6 h-6 mr-2 text-purple-500" />
            List Aso-Ebi / Event Wear
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="aeEventName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Name <span className="text-red-500">*</span></label>
            <input type="text" id="aeEventName" value={eventName} onChange={e => setEventName(e.target.value)} required placeholder="e.g., Engineering Dinner, Law Society Ball" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-purple-500 focus:border-purple-500" />
          </div>

           <div>
            <label htmlFor="aeListingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listing Type</label>
            <select id="aeListingType" value={listingType} onChange={e => setListingType(e.target.value as any)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                <option value="Fabric">Fabric</option>
                <option value="Outfit">Outfit</option>
            </select>
          </div>

          <div>
            <label htmlFor="aeDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="aeDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={2} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Describe the fabric (e.g., color, type) or the outfit style."></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="aePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₦) <span className="text-red-500">*</span></label>
              <input type="number" id="aePrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
            {listingType === 'Fabric' ? (
                <div>
                    <label htmlFor="aeYards" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yards Available <span className="text-red-500">*</span></label>
                    <input type="number" id="aeYards" value={yards} onChange={e => setYards(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0.5" step="0.5" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
            ) : (
                 <div>
                    <label htmlFor="aeSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outfit Size <span className="text-red-500">*</span></label>
                    <input type="text" id="aeSize" value={size} onChange={e => setSize(e.target.value)} required placeholder="e.g., 10, Medium" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images (Max {MAX_IMAGES})</label>
            <input id="aeImages" type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-2" disabled={images.length >= MAX_IMAGES} />
            {images.length > 0 && <div className="mt-2 grid grid-cols-3 gap-2">{images.map((img, i) => <div key={img.id} className="relative group"><img src={img.url} alt={`Preview ${i+1}`} className="w-full h-24 object-cover rounded-md" /><button type="button" onClick={() => removeImage(img.id)} className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"><XCircleIcon className="w-5 h-5" /></button></div>)}</div>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm">List Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListAsoEbiModal;
