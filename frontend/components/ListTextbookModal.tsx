
import React, { useState } from 'react';
import { TextbookCondition, TextbookListing } from '../types';
import { XCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface ListTextbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TextbookListing, 'id' | 'sellerName' | 'sellerId' | 'listedDate'>) => void;
}

const ListTextbookModal: React.FC<ListTextbookModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [condition, setCondition] = useState<TextbookCondition>(TextbookCondition.GOOD);
  const [description, setDescription] = useState('');
  // Image file handling would be more complex, placeholder for now
  // const [imageFile, setImageFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || price === '') {
      alert('Please fill in Title, Author, and Price.');
      return;
    }
    onSubmit({
      title,
      author,
      isbn: isbn || undefined,
      course: course || undefined,
      price: Number(price),
      condition,
      description: description || undefined,
      // imageUrl: if imageFile is handled, convert to base64 or URL
    });
    // Reset form can be done here or handled by parent re-rendering
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-textbook-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-textbook-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <BookOpenIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            List Your Textbook for Sale
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="textbookTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" id="textbookTitle" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="textbookAuthor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author <span className="text-red-500">*</span></label>
            <input type="text" id="textbookAuthor" value={author} onChange={e => setAuthor(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="textbookIsbn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISBN (Optional)</label>
              <input type="text" id="textbookIsbn" value={isbn} onChange={e => setIsbn(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="textbookCourse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code (Optional)</label>
              <input type="text" id="textbookCourse" value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g., BIO101" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="textbookPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($) <span className="text-red-500">*</span></label>
              <input type="number" id="textbookPrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" step="0.01" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="textbookCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition <span className="text-red-500">*</span></label>
              <select id="textbookCondition" value={condition} onChange={e => setCondition(e.target.value as TextbookCondition)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(TextbookCondition).map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="textbookDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
            <textarea id="textbookDescription" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Any additional details, e.g., highlighting, edition notes."></textarea>
          </div>
          {/* Placeholder for image upload
          <div>
            <label htmlFor="textbookImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image (Optional)</label>
            <input type="file" id="textbookImage" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-800/60"/>
          </div>
          */}
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-sm">List Textbook</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListTextbookModal;
