
import React, { useState } from 'react';
import { StudyGroupListing, MeetingPreference } from '../types';
import { XCircleIcon, UsersIcon } from '@heroicons/react/24/outline';

interface ListStudyGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<StudyGroupListing, 'id' | 'listedBy' | 'listedById' | 'listedDate'>) => void;
}

const ListStudyGroupModal: React.FC<ListStudyGroupModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [groupName, setGroupName] = useState('');
  const [course, setCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [meetingPreference, setMeetingPreference] = useState<MeetingPreference>(MeetingPreference.ONLINE);
  const [contactInfo, setContactInfo] = useState('');
  const [maxSize, setMaxSize] = useState<number | ''>('');
  const [tags, setTags] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !course || !topic || !description) {
      alert('Please fill in Group Name, Course, Topic, and Description.');
      return;
    }
    onSubmit({
      groupName,
      course,
      topic,
      description,
      meetingPreference,
      contactInfo: contactInfo || undefined,
      maxSize: maxSize === '' ? undefined : Number(maxSize),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag) || undefined,
      meetingTime: meetingTime || undefined,
      location: location || undefined,
    });
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-study-group-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-study-group-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <UsersIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            List a New Study Group
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="sgName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name <span className="text-red-500">*</span></label>
            <input type="text" id="sgName" value={groupName} onChange={e => setGroupName(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sgCourse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code <span className="text-red-500">*</span></label>
              <input type="text" id="sgCourse" value={course} onChange={e => setCourse(e.target.value)} required placeholder="e.g., CS101" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="sgTopic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Main Topic <span className="text-red-500">*</span></label>
              <input type="text" id="sgTopic" value={topic} onChange={e => setTopic(e.target.value)} required placeholder="e.g., Midterm Prep, Chapter 5" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label htmlFor="sgDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="sgDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Briefly describe the group's goals, focus, and any prerequisites."></textarea>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="sgMeetingPref" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Preference</label>
                <select id="sgMeetingPref" value={meetingPreference} onChange={e => setMeetingPreference(e.target.value as MeetingPreference)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                    {Object.values(MeetingPreference).map(pref => <option key={pref} value={pref}>{pref}</option>)}
                </select>
            </div>
             <div>
              <label htmlFor="sgMaxSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Group Size (Optional)</label>
              <input type="number" id="sgMaxSize" value={maxSize} onChange={e => setMaxSize(e.target.value === '' ? '' : parseInt(e.target.value))} min="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
           <div>
            <label htmlFor="sgMeetingTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Meeting Time (Optional)</label>
            <input type="text" id="sgMeetingTime" value={meetingTime} onChange={e => setMeetingTime(e.target.value)} placeholder="e.g., Tuesdays 5-7 PM, Flexible" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          {(meetingPreference === MeetingPreference.OFFLINE || meetingPreference === MeetingPreference.HYBRID) && (
             <div>
                <label htmlFor="sgLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Location (for In-Person/Hybrid)</label>
                <input type="text" id="sgLocation" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Library Room 2A, Campus Cafe" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          )}
          <div>
            <label htmlFor="sgContactInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Info / Join Link (Optional)</label>
            <input type="text" id="sgContactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="e.g., your@email.com, Discord/GroupMe link" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="sgTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (Optional, comma-separated)</label>
            <input type="text" id="sgTags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., exam prep, homework, project" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-sm">List Study Group</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListStudyGroupModal;
