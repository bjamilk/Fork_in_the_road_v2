import React, { useState } from 'react';
import { LectureNoteListing } from '../types';
import { XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ListLectureNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<LectureNoteListing, 'id' | 'sellerName' | 'sellerId' | 'listedDate' | 'rating' | 'reviewCount'>) => void;
}

const ListLectureNoteModal: React.FC<ListLectureNoteModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseCode || !description || price === '') {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmit({
      title,
      courseCode: courseCode.toUpperCase(),
      lecturerName: lecturerName || undefined,
      description,
      price: Number(price),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70]" role="dialog" aria-modal="true" aria-labelledby="list-ln-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-ln-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <DocumentTextIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            List Lecture Notes
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="lnTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" id="lnTitle" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., EEC421 - Complete Lecture Notes" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lnCourseCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code <span className="text-red-500">*</span></label>
              <input type="text" id="lnCourseCode" value={courseCode} onChange={e => setCourseCode(e.target.value)} required placeholder="e.g., EEC421" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="lnLecturer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lecturer's Name (Optional)</label>
              <input type="text" id="lnLecturer" value={lecturerName} onChange={e => setLecturerName(e.target.value)} placeholder="e.g., Prof. Adebayo" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label htmlFor="lnDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="lnDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="e.g., Comprehensive notes covering all topics for the semester. Includes diagrams and examples."></textarea>
          </div>
          <div>
            <label htmlFor="lnPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₦) <span className="text-red-500">*</span></label>
            <input type="number" id="lnPrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" step="50" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">File upload functionality will be added here. For now, listings are for demonstration.</p>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">List Lecture Notes</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ListLectureNoteModal;
