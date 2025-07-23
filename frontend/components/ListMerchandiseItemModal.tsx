
import React, { useState, useEffect } from 'react';
import { MerchandiseItem, MerchandiseCategory } from '../types';
import { XCircleIcon, ShoppingBagIcon, PhotoIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';


interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

interface ListMerchandiseItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<MerchandiseItem, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListMerchandiseItemModal: React.FC<ListMerchandiseItemModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<MerchandiseCategory>(MerchandiseCategory.APPAREL);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [sellerInfo, setSellerInfo] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [currentSizeInput, setCurrentSizeInput] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [contactForPurchase, setContactForPurchase] = useState('');

  const MAX_IMAGES = 4; // Primary + 3 additional

  useEffect(() => {
    if (!isOpen) {
      setItemName('');
      setCategory(MerchandiseCategory.APPAREL);
      setDescription('');
      setPrice('');
      setSellerInfo('');
      images.forEach(img => URL.revokeObjectURL(img.url));
      setImages([]);
      setAvailableSizes([]);
      setCurrentSizeInput('');
      setStockQuantity('');
      setContactForPurchase('');
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
  
  const addSize = () => {
    if (currentSizeInput.trim() && !availableSizes.includes(currentSizeInput.trim())) {
      setAvailableSizes(prev => [...prev, currentSizeInput.trim()]);
      setCurrentSizeInput('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setAvailableSizes(prev => prev.filter(size => size !== sizeToRemove));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || price === '' || !sellerInfo.trim() || !contactForPurchase.trim()) {
      alert('Please fill in Item Name, Price, Seller Info, and Contact for Purchase.');
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
      price: Number(price),
      sellerInfo: sellerInfo.trim(),
      images: base64Images,
      availableSizes: availableSizes.length > 0 ? availableSizes : undefined,
      stockQuantity: stockQuantity === '' ? undefined : Number(stockQuantity),
      contactForPurchase: contactForPurchase.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70] transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-merch-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-merch-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <ShoppingBagIcon className="w-6 h-6 mr-2 text-red-500 dark:text-red-400" />
            List Merchandise for Sale
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name <span className="text-red-500">*</span></label>
            <input type="text" id="itemName" value={itemName} onChange={e => setItemName(e.target.value)} required placeholder="e.g., Campus Hoodie, Department Mug" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-red-500 focus:border-red-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="merchCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category <span className="text-red-500">*</span></label>
              <select id="merchCategory" value={category} onChange={e => setCategory(e.target.value as MerchandiseCategory)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-red-500 focus:border-red-500">
                {Object.values(MerchandiseCategory).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="merchPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₦) <span className="text-red-500">*</span></label>
              <input type="number" id="merchPrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" step="100" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-red-500 focus:border-red-500" />
            </div>
          </div>
          
          <div>
            <label htmlFor="merchDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
            <textarea id="merchDescription" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-red-500 focus:border-red-500" placeholder="Details about the item, material, design, etc."></textarea>
          </div>
          
          <div>
            <label htmlFor="merchSellerInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seller Information <span className="text-red-500">*</span></label>
            <input type="text" id="merchSellerInfo" value={sellerInfo} onChange={e => setSellerInfo(e.target.value)} required placeholder="e.g., Chess Club, Art Department, Your Name" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-red-500 focus:border-red-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Images (Max {MAX_IMAGES}, First is primary)</label>
            <input id="merchImages" type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 dark:file:bg-red-700/30 file:text-red-700 dark:file:text-red-300 hover:file:bg-red-100 dark:hover:file:bg-red-600/40 mb-2" disabled={images.length >= MAX_IMAGES} />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Sizes (Optional)</label>
            <div className="flex items-center space-x-2 mb-2">
              <input type="text" value={currentSizeInput} onChange={e => setCurrentSizeInput(e.target.value)} placeholder="e.g., S, M, XL, One Size" className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-red-500 focus:border-red-500" />
              <button type="button" onClick={addSize} className="px-3 py-2 bg-red-100 dark:bg-red-700/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-600/60 rounded-md text-sm font-medium flex items-center">
                <PlusCircleIcon className="w-5 h-5 mr-1" /> Add Size
              </button>
            </div>
            {availableSizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <span key={size} className="flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-xs">
                    {size}
                    <button type="button" onClick={() => removeSize(size)} className="ml-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="merchStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity (Optional)</label>
            <input type="number" id="merchStock" value={stockQuantity} onChange={e => setStockQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} min="0" step="1" placeholder="Leave blank if not tracking" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-red-500 focus:border-red-500" />
          </div>
          
          <div>
            <label htmlFor="merchContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact for Purchase <span className="text-red-500">*</span></label>
            <input type="text" id="merchContact" value={contactForPurchase} onChange={e => setContactForPurchase(e.target.value)} required placeholder="e.g., DM @ClubHandle, Email to order" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-red-500 focus:border-red-500" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-md shadow-sm">List Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListMerchandiseItemModal;
