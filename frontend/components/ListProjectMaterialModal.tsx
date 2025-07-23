import React, { useState } from 'react';
import { ProjectMaterialListing } from '../types';
import { XCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface ListProjectMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ProjectMaterialListing, 'id' | 'sellerName' | 'sellerId' | 'listedDate'>) => void;
}

const ListProjectMaterialModal: React.FC<ListProjectMaterialModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [projectTitle, setProjectTitle] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [abstract, setAbstract] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [tags, setTags] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !fieldOfStudy || !abstract || price === '') {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmit({
      projectTitle,
      fieldOfStudy,
      abstract,
      price: Number(price),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70]" role="dialog" aria-modal="true" aria-labelledby="list-pm-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-pm-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <LightBulbIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            List Project Material for Reference
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-md mb-4">Note: This is for selling reference materials (e.g., Chapter 1-5 PDFs) to help other students. Plagiarism is strictly prohibited.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pmProjectTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Title <span className="text-red-500">*</span></label>
            <input type="text" id="pmProjectTitle" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} required placeholder="e.g., Design and Implementation of..." className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="pmFieldOfStudy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field of Study <span className="text-red-500">*</span></label>
            <input type="text" id="pmFieldOfStudy" value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} required placeholder="e.g., Computer Engineering" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="pmAbstract" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Abstract <span className="text-red-500">*</span></label>
            <textarea id="pmAbstract" value={abstract} onChange={e => setAbstract(e.target.value)} required rows={5} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Paste the project abstract here."></textarea>
          </div>
           <div>
            <label htmlFor="pmTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords/Tags (Optional, comma-separated)</label>
            <input type="text" id="pmTags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., React, Machine Learning, Arduino" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="pmPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₦) <span className="text-red-500">*</span></label>
            <input type="number" id="pmPrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" step="100" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md" />
          </div>
           <p className="text-xs text-gray-500 dark:text-gray-400">File upload functionality will be added here. For now, listings are for demonstration.</p>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">List Project Material</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ListProjectMaterialModal;
