import React, { useState } from 'react';
import { PastQuestionListing } from '../types';
import { XCircleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

interface ListPastQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PastQuestionListing, 'id' | 'sellerName' | 'sellerId' | 'listedDate' | 'rating' | 'reviewCount'>) => void;
}

const ListPastQuestionModal: React.FC<ListPastQuestionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [university, setUniversity] = useState('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear() - 1);
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseCode || year === '' || price === '') {
      alert('Please fill in Title, Course Code, Year, and Price.');
      return;
    }
    onSubmit({
      title,
      courseCode: courseCode.toUpperCase(),
      university: university || undefined,
      year: Number(year),
      price: Number(price),
      description: description || undefined,
    });
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70]" role="dialog" aria-modal="true" aria-labelledby="list-pq-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-pq-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <ArchiveBoxIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            List Past Questions
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pqTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" id="pqTitle" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., MTH101 Final Exam Paper" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
           <div>
            <label htmlFor="pqCourseCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code <span className="text-red-500">*</span></label>
            <input type="text" id="pqCourseCode" value={courseCode} onChange={e => setCourseCode(e.target.value)} required placeholder="e.g., MTH101" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pqUniversity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">University (Optional)</label>
              <input type="text" id="pqUniversity" value={university} onChange={e => setUniversity(e.target.value)} placeholder="e.g., University of Lagos" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="pqYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year of Exam <span className="text-red-500">*</span></label>
              <input type="number" id="pqYear" value={year} onChange={e => setYear(e.target.value === '' ? '' : parseInt(e.target.value))} required placeholder="e.g., 2022" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
          </div>
           <div>
            <label htmlFor="pqPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₦) <span className="text-red-500">*</span></label>
            <input type="number" id="pqPrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" step="50" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
          </div>
          <div>
            <label htmlFor="pqDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
            <textarea id="pqDescription" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="e.g., Includes marking scheme, Complete questions."></textarea>
          </div>
          {/* File input can be added here */}
          <p className="text-xs text-gray-500 dark:text-gray-400">File upload functionality will be added here. For now, listings are for demonstration.</p>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">List Past Question</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ListPastQuestionModal;
