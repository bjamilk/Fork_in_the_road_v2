import React, { useState, useEffect } from 'react';
import { SubletListing, FurnishedStatus } from '../types';
import { XCircleIcon, HomeIcon, PhotoIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

interface ListSubletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SubletListing, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListSubletModal: React.FC<ListSubletModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [rent, setRent] = useState<number | ''>('');
  const [rentFrequency, setRentFrequency] = useState<'per month' | 'per week' | 'total for period'>('per month');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [bedrooms, setBedrooms] = useState<number | ''>(1);
  const [bathrooms, setBathrooms] = useState<number | ''>(1);
  const [furnishedStatus, setFurnishedStatus] = useState<FurnishedStatus>(FurnishedStatus.FURNISHED);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [currentAmenity, setCurrentAmenity] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const MAX_IMAGES = 5;

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setLocation('');
      setRent('');
      setRentFrequency('per month');
      setAvailableFrom('');
      setAvailableTo('');
      setBedrooms(1);
      setBathrooms(1);
      setFurnishedStatus(FurnishedStatus.FURNISHED);
      setDescription('');
      images.forEach(img => URL.revokeObjectURL(img.url));
      setImages([]);
      setAmenities([]);
      setCurrentAmenity('');
      setContactInfo('');
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

  const addAmenity = () => {
    if (currentAmenity.trim() && !amenities.includes(currentAmenity.trim())) {
      setAmenities(prev => [...prev, currentAmenity.trim()]);
      setCurrentAmenity('');
    }
  };

  const removeAmenity = (amenityToRemove: string) => {
    setAmenities(prev => prev.filter(a => a !== amenityToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || rent === '' || !availableFrom || !availableTo || !contactInfo.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    const imagePromises = images.map(img => 
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(img.file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      })
    );
    const base64Images = await Promise.all(imagePromises);

    onSubmit({
      title: title.trim(),
      location: location.trim(),
      rent: Number(rent),
      rentFrequency,
      availableFrom: new Date(availableFrom),
      availableTo: new Date(availableTo),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      furnishedStatus,
      description: description.trim(),
      images: base64Images,
      amenities,
      contactInfo: contactInfo.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70]" role="dialog" aria-modal="true" aria-labelledby="list-sublet-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl transform max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-sublet-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <HomeIcon className="w-6 h-6 mr-2 text-cyan-500" />
            List Your Sublet
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="subletTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" id="subletTitle" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Sunny Room in 2BR Apt near Campus" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label htmlFor="subletLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location / Address <span className="text-red-500">*</span></label>
                <input type="text" id="subletLocation" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g., 123 University Ave, Apt 4B" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="subletRent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rent (₦) <span className="text-red-500">*</span></label>
                    <input type="number" id="subletRent" value={rent} onChange={e => setRent(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div>
                    <label htmlFor="subletRentFreq" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rent Frequency</label>
                    <select id="subletRentFreq" value={rentFrequency} onChange={e => setRentFrequency(e.target.value as any)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                        <option value="per month">Per Month</option>
                        <option value="per week">Per Week</option>
                        <option value="total for period">Total for Period</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="subletAvailableFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available From <span className="text-red-500">*</span></label>
                    <input type="date" id="subletAvailableFrom" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div>
                    <label htmlFor="subletAvailableTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available To <span className="text-red-500">*</span></label>
                    <input type="date" id="subletAvailableTo" value={availableTo} onChange={e => setAvailableTo(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="subletBedrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bedrooms</label>
                    <input type="number" id="subletBedrooms" value={bedrooms} onChange={e => setBedrooms(e.target.value === '' ? '' : parseInt(e.target.value))} min="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div>
                    <label htmlFor="subletBathrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bathrooms</label>
                    <input type="number" id="subletBathrooms" value={bathrooms} onChange={e => setBathrooms(e.target.value === '' ? '' : parseInt(e.target.value))} min="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div>
                    <label htmlFor="subletFurnished" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Furnishing</label>
                    <select id="subletFurnished" value={furnishedStatus} onChange={e => setFurnishedStatus(e.target.value as FurnishedStatus)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                        {Object.values(FurnishedStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="subletDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea id="subletDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Describe the space, roommates, building, neighborhood, and any rules."></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amenities</label>
                <div className="flex items-center space-x-2 mb-2">
                    <input type="text" value={currentAmenity} onChange={e => setCurrentAmenity(e.target.value)} placeholder="e.g., In-unit laundry" className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
                    <button type="button" onClick={addAmenity} className="px-3 py-2 bg-cyan-100 text-cyan-700 rounded-md text-sm font-medium">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {amenities.map(a => <span key={a} className="flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-md text-xs">{a} <button type="button" onClick={() => removeAmenity(a)} className="ml-1.5 text-red-500"><TrashIcon className="w-3 h-3" /></button></span>)}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images (Max {MAX_IMAGES})</label>
                <input id="subletImages" type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" disabled={images.length >= MAX_IMAGES} />
                {images.length > 0 && <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-2">{images.map((img, i) => <div key={img.id} className="relative group"><img src={img.url} alt={`Preview ${i+1}`} className="w-full h-20 object-cover rounded-md" /><button type="button" onClick={() => removeImage(img.id)} className="absolute top-0 right-0 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"><XCircleIcon className="w-5 h-5" /></button></div>)}</div>}
            </div>
             <div>
                <label htmlFor="subletContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Info <span className="text-red-500">*</span></label>
                <input type="text" id="subletContact" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="e.g., your_email@example.com, Phone number" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-sm">List Sublet</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListSubletModal;