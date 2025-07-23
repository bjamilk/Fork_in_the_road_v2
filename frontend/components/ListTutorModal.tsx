
import React, { useState } from 'react';
import { TutorListing, TutoringSubjectProficiency, MarketplaceRateType, TutoringDeliveryMethod } from '../types';
import { XCircleIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface ListTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TutorListing, 'id' | 'tutorName' | 'tutorId' | 'listedDate' | 'avatarUrl'>) => void;
}

const ListTutorModal: React.FC<ListTutorModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [subjectsInput, setSubjectsInput] = useState('');
  const [coursesInput, setCoursesInput] = useState('');
  const [overallProficiency, setOverallProficiency] = useState<TutoringSubjectProficiency>(TutoringSubjectProficiency.INTERMEDIATE);
  const [rate, setRate] = useState<number | ''>('');
  const [rateType, setRateType] = useState<MarketplaceRateType>(MarketplaceRateType.PER_HOUR);
  const [deliveryMethod, setDeliveryMethod] = useState<TutoringDeliveryMethod>(TutoringDeliveryMethod.ONLINE);
  const [availability, setAvailability] = useState('');
  const [bio, setBio] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState('');
  const [schoolOfStudy, setSchoolOfStudy] = useState('');


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectsInput.trim() || (rateType !== MarketplaceRateType.FREE && rate === '')) {
      alert('Please fill in Subjects and Rate (unless offering for free).');
      return;
    }
    onSubmit({
      subjects: subjectsInput.split(',').map(s => s.trim()).filter(s => s),
      courses: coursesInput.split(',').map(c => c.trim()).filter(c => c) || undefined,
      overallProficiency,
      rate: rateType === MarketplaceRateType.FREE ? 0 : Number(rate),
      rateType,
      deliveryMethod,
      availability: availability || undefined,
      bio: bio || undefined,
      contactInfo: contactInfo || undefined,
      location: (deliveryMethod === TutoringDeliveryMethod.IN_PERSON || deliveryMethod === TutoringDeliveryMethod.HYBRID) && location ? location : undefined,
      schoolOfStudy: schoolOfStudy.trim() || undefined,
    });
    onClose(); 
  };

  const isPaidRateType = rateType !== MarketplaceRateType.FREE;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-tutor-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-tutor-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <BriefcaseIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            Offer Your Tutoring Services
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tutorSubjects" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subjects You Teach (comma-separated) <span className="text-red-500">*</span></label>
            <input type="text" id="tutorSubjects" value={subjectsInput} onChange={e => setSubjectsInput(e.target.value)} required placeholder="e.g., Calculus I, Organic Chemistry, Python Basics" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="tutorCourses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specific Course Codes (Optional, comma-separated)</label>
            <input type="text" id="tutorCourses" value={coursesInput} onChange={e => setCoursesInput(e.target.value)} placeholder="e.g., MATH101, CHEM202, CS110" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="tutorSchool" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School/University (Optional)</label>
            <input type="text" id="tutorSchool" value={schoolOfStudy} onChange={e => setSchoolOfStudy(e.target.value)} placeholder="e.g., University of Lagos, MIT" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
           <div>
            <label htmlFor="tutorProficiency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Overall Proficiency</label>
            <select id="tutorProficiency" value={overallProficiency} onChange={e => setOverallProficiency(e.target.value as TutoringSubjectProficiency)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(TutoringSubjectProficiency).map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tutorRateType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate Type</label>
              <select id="tutorRateType" value={rateType} onChange={e => setRateType(e.target.value as MarketplaceRateType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                  {Object.values(MarketplaceRateType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            {isPaidRateType && (
                <div>
                    <label htmlFor="tutorRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate (₦) <span className="text-red-500">*</span></label>
                    <input type="number" id="tutorRate" value={rate} onChange={e => setRate(e.target.value === '' ? '' : parseFloat(e.target.value))} required={isPaidRateType} min="0" step="0.01" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
                </div>
            )}
            {!isPaidRateType && <div />} 
          </div>
           <div>
            <label htmlFor="tutorDeliveryMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Method</label>
            <select id="tutorDeliveryMethod" value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value as TutoringDeliveryMethod)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(TutoringDeliveryMethod).map(method => <option key={method} value={method}>{method}</option>)}
            </select>
          </div>
          {(deliveryMethod === TutoringDeliveryMethod.IN_PERSON || deliveryMethod === TutoringDeliveryMethod.HYBRID) && (
             <div>
                <label htmlFor="tutorLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred In-Person Location (Optional)</label>
                <input type="text" id="tutorLocation" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Campus Library, Specific Dept Building, Yaba" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          )}
           <div>
            <label htmlFor="tutorAvailability" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability (Optional)</label>
            <input type="text" id="tutorAvailability" value={availability} onChange={e => setAvailability(e.target.value)} placeholder="e.g., Weekdays 6-9 PM, Flexible on Weekends" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="tutorBio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Bio / Qualifications (Optional)</label>
            <textarea id="tutorBio" value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Briefly describe your experience, teaching style, or relevant achievements."></textarea>
          </div>
          <div>
            <label htmlFor="tutorContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Contact Method (Optional)</label>
            <input type="text" id="tutorContact" value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="e.g., your@email.com, Platform DMs" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-sm">List Tutoring Service</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListTutorModal;
