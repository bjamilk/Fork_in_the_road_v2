
import React, { useState, useEffect } from 'react';
import { SecondHandGood, SecondHandCategory, TextbookCondition } from '../types';
import { XCircleIcon, ArchiveBoxIcon, PhotoIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

interface ListSecondHandGoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SecondHandGood, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListSecondHandGoodModal: React.FC<ListSecondHandGoodModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SecondHandCategory>(SecondHandCategory.OTHER);
  const [condition, setCondition] = useState<TextbookCondition>(TextbookCondition.GOOD);
  const [price, setPrice] = useState<number | ''>('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [location, setLocation] = useState('');

  const MAX_IMAGES = 4;

  useEffect(() => {
    if (!isOpen) {
      setItemName('');
      setDescription('');
      setCategory(SecondHandCategory.OTHER);
      setCondition(TextbookCondition.GOOD);
      setPrice('');
      images.forEach(img => URL.revokeObjectURL(img.url));
      setImages([]);
      setLocation('');
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
    if (!itemName.trim() || price === '' || !location.trim()) {
      alert('Please fill in Item Name, Price, and Pickup Location.');
      return;
    }
    if (images.length === 0) {
      if (!window.confirm("You haven't uploaded any images. Are you sure you want to post without photos?")) {
        return;
      }
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
      itemName: itemName.trim(),
      description: description.trim(),
      category,
      condition,
      price: Number(price),
      images: base64Images,
      location: location.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70]" role="dialog" aria-modal="true" aria-labelledby="list-shg-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl transform max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-shg-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <ArchiveBoxIcon className="w-6 h-6 mr-2 text-indigo-500" />
            List a Second-Hand Good
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="shgItemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name <span className="text-red-500">*</span></label>
            <input type="text" id="shgItemName" value={itemName} onChange={e => setItemName(e.target.value)} required placeholder="e.g., Mini Fridge, IKEA Desk Lamp" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shgCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select id="shgCategory" value={category} onChange={e => setCategory(e.target.value as SecondHandCategory)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                {Object.values(SecondHandCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="shgCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
              <select id="shgCondition" value={condition} onChange={e => setCondition(e.target.value as TextbookCondition)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                {Object.values(TextbookCondition).map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="shgDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
            <textarea id="shgDescription" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Provide details about the item, its condition, dimensions, age, any flaws, etc."></textarea>
          </div>

          <div>
            <label htmlFor="shgPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₦) <span className="text-red-500">*</span></label>
            <input type="number" id="shgPrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images (Max {MAX_IMAGES})</label>
            <input id="shgImages" type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-2" disabled={images.length >= MAX_IMAGES} />
            {images.length > 0 && <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">{images.map((img, i) => <div key={img.id} className="relative group"><img src={img.url} alt={`Preview ${i+1}`} className="w-full h-24 object-cover rounded-md" /><button type="button" onClick={() => removeImage(img.id)} className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"><XCircleIcon className="w-5 h-5" /></button></div>)}</div>}
          </div>

          <div>
            <label htmlFor="shgLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Location <span className="text-red-500">*</span></label>
            <input type="text" id="shgLocation" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g., Hall C Common Room" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm">List Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListSecondHandGoodModal;
