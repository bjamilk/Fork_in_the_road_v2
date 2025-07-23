import React, { useState, useEffect } from 'react';
import { RideShareListing, RideShareType, RideRecurrence } from '../types';
import { XCircleIcon, TruckIcon } from '@heroicons/react/24/outline';

interface ListRideShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<RideShareListing, 'id' | 'postedByUserId' | 'postedByUserName' | 'postedDate'>) => void;
}

const ListRideShareModal: React.FC<ListRideShareModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [listingType, setListingType] = useState<RideShareType>(RideShareType.OFFERING_RIDE);
  const [departureLocation, setDepartureLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [departureDateTime, setDepartureDateTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState<number | ''>('');
  const [passengersNeeded, setPassengersNeeded] = useState<number | ''>('');
  const [recurrence, setRecurrence] = useState<RideRecurrence>(RideRecurrence.ONE_TIME);
  const [customRecurrenceDetails, setCustomRecurrenceDetails] = useState('');
  const [costContribution, setCostContribution] = useState<number | ''>('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [luggageSpace, setLuggageSpace] = useState<'None' | 'Small' | 'Medium' | 'Large' | ''>('');
  const [notes, setNotes] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form
      setListingType(RideShareType.OFFERING_RIDE);
      setDepartureLocation('');
      setDestinationLocation('');
      setDepartureDateTime('');
      setAvailableSeats('');
      setPassengersNeeded('');
      setRecurrence(RideRecurrence.ONE_TIME);
      setCustomRecurrenceDetails('');
      setCostContribution('');
      setVehicleInfo('');
      setLuggageSpace('');
      setNotes('');
      setContactInfo('');
    } else {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        setDepartureDateTime(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureLocation.trim() || !destinationLocation.trim() || !departureDateTime || !contactInfo.trim()) {
      alert('Please fill in Departure, Destination, Date/Time, and Contact Info.');
      return;
    }
    if (listingType === RideShareType.OFFERING_RIDE && (availableSeats === '' || Number(availableSeats) <= 0)) {
      alert('Please specify available seats for ride offers.');
      return;
    }
    if (listingType === RideShareType.REQUESTING_RIDE && (passengersNeeded === '' || Number(passengersNeeded) <= 0)) {
      alert('Please specify passengers needed for ride requests.');
      return;
    }

    onSubmit({
      listingType,
      departureLocation: departureLocation.trim(),
      destinationLocation: destinationLocation.trim(),
      departureDateTime: new Date(departureDateTime),
      availableSeats: listingType === RideShareType.OFFERING_RIDE && availableSeats !== '' ? Number(availableSeats) : undefined,
      passengersNeeded: listingType === RideShareType.REQUESTING_RIDE && passengersNeeded !== '' ? Number(passengersNeeded) : undefined,
      recurrence,
      customRecurrenceDetails: recurrence === RideRecurrence.CUSTOM ? customRecurrenceDetails.trim() : undefined,
      costContribution: costContribution === '' ? undefined : Number(costContribution),
      vehicleInfo: vehicleInfo.trim() || undefined,
      luggageSpace: luggageSpace === '' ? undefined : luggageSpace,
      notes: notes.trim() || undefined,
      contactInfo: contactInfo.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70] transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-rideshare-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-rideshare-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <TruckIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            {listingType === RideShareType.OFFERING_RIDE ? 'Offer a Ride' : 'Request a Ride'}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rsListingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I am...</label>
            <select id="rsListingType" value={listingType} onChange={e => setListingType(e.target.value as RideShareType)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
              {Object.values(RideShareType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rsDepartureLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departure Location <span className="text-red-500">*</span></label>
              <input type="text" id="rsDepartureLocation" value={departureLocation} onChange={e => setDepartureLocation(e.target.value)} required placeholder="e.g., Main Campus Gate" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="rsDestinationLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination Location <span className="text-red-500">*</span></label>
              <input type="text" id="rsDestinationLocation" value={destinationLocation} onChange={e => setDestinationLocation(e.target.value)} required placeholder="e.g., Downtown City Center, Airport" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rsDepartureDateTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departure Date & Time <span className="text-red-500">*</span></label>
              <input type="datetime-local" id="rsDepartureDateTime" value={departureDateTime} onChange={e => setDepartureDateTime(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="rsRecurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recurrence</label>
              <select id="rsRecurrence" value={recurrence} onChange={e => setRecurrence(e.target.value as RideRecurrence)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(RideRecurrence).map(rec => <option key={rec} value={rec}>{rec}</option>)}
              </select>
            </div>
          </div>
          {recurrence === RideRecurrence.CUSTOM && (
            <div>
                <label htmlFor="rsCustomRecurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Recurrence Details</label>
                <input type="text" id="rsCustomRecurrence" value={customRecurrenceDetails} onChange={e => setCustomRecurrenceDetails(e.target.value)} placeholder="e.g., Every Mon & Wed for 3 weeks" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listingType === RideShareType.OFFERING_RIDE ? (
              <div>
                <label htmlFor="rsAvailableSeats" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Seats <span className="text-red-500">*</span></label>
                <input type="number" id="rsAvailableSeats" value={availableSeats} onChange={e => setAvailableSeats(e.target.value === '' ? '' : parseInt(e.target.value))} required min="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            ) : (
              <div>
                <label htmlFor="rsPassengersNeeded" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passengers Needed <span className="text-red-500">*</span></label>
                <input type="number" id="rsPassengersNeeded" value={passengersNeeded} onChange={e => setPassengersNeeded(e.target.value === '' ? '' : parseInt(e.target.value))} required min="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            )}
            <div>
              <label htmlFor="rsCostContribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Contribution (₦, Optional)</label>
              <input type="number" id="rsCostContribution" value={costContribution} onChange={e => setCostContribution(e.target.value === '' ? '' : parseFloat(e.target.value))} min="0" placeholder="e.g., 5000 for fuel" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          
          {listingType === RideShareType.OFFERING_RIDE && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rsVehicleInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Info (Optional)</label>
                <input type="text" id="rsVehicleInfo" value={vehicleInfo} onChange={e => setVehicleInfo(e.target.value)} placeholder="e.g., Toyota Camry, Blue SUV" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="rsLuggageSpace" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Luggage Space (Optional)</label>
                <select id="rsLuggageSpace" value={luggageSpace} onChange={e => setLuggageSpace(e.target.value as any)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select space...</option>
                  <option value="None">None</option>
                  <option value="Small">Small (Backpack)</option>
                  <option value="Medium">Medium (Suitcase)</option>
                  <option value="Large">Large (Multiple bags)</option>
                </select>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="rsNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Notes (Optional)</label>
            <textarea id="rsNotes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Prefer non-smokers, music preferences, specific pickup points."></textarea>
          </div>
          
          <div>
            <label htmlFor="rsContactInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Information <span className="text-red-500">*</span></label>
            <input type="text" id="rsContactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="e.g., your_email@example.com, Phone for text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-sm">Submit Listing</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListRideShareModal;
