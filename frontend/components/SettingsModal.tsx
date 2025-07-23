import React from 'react';
import { User } from '../types';
import { XCircleIcon, BellAlertIcon } from '@heroicons/react/24/outline';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: User['settings'];
  onUpdateSettings: (newSettings: User['settings']) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  const handleReminderToggle = (enabled: boolean) => {
    onUpdateSettings({
      ...settings,
      reminders: {
        ...settings?.reminders,
        enabled,
      },
    });
  };
  
  const isRemindersEnabled = settings?.reminders?.enabled ?? true;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[80]" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="settings-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Settings
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-start">
                    <BellAlertIcon className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Daily Test Reminders</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Get a notification to take a test if you haven't been active.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => handleReminderToggle(!isRemindersEnabled)}
                    className={`${
                        isRemindersEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                    role="switch"
                    aria-checked={isRemindersEnabled}
                    >
                    <span className="sr-only">Use setting</span>
                    <span
                        aria-hidden="true"
                        className={`${
                        isRemindersEnabled ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </button>
            </div>
            
            {/* Future settings can be added here */}
            {/* <div className="border-t border-gray-200 dark:border-gray-700 pt-4">...</div> */}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
