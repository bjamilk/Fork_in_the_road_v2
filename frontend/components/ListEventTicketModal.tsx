
import React, { useState, useEffect } from 'react';
import { EventTicketListing, CampusEventType } from '../types';
import { XCircleIcon, TicketIcon, PhotoIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

interface ListEventTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<EventTicketListing, 'id' | 'sellerName' | 'sellerId' | 'postedDate'>) => void;
}

const ListEventTicketModal: React.FC<ListEventTicketModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState<CampusEventType>(CampusEventType.SOCIAL_GATHERING_PARTY);
  const [eventDateTime, setEventDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [quantityAvailable, setQuantityAvailable] = useState<number | ''>(1);
  const [ticketType, setTicketType] = useState('');
  const [isResale, setIsResale] = useState(false);
  const [sellerContact, setSellerContact] = useState('');
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreviewUrl, setEventImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEventName('');
      setEventType(CampusEventType.SOCIAL_GATHERING_PARTY);
      setEventDateTime('');
      setLocation('');
      setDescription('');
      setOriginalPrice('');
      setSellingPrice('');
      setQuantityAvailable(1);
      setTicketType('');
      setIsResale(false);
      setSellerContact('');
      setEventImageFile(null);
      if (eventImagePreviewUrl) URL.revokeObjectURL(eventImagePreviewUrl);
      setEventImagePreviewUrl(null);
    } else {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone for datetime-local input
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        setEventDateTime(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    }
  }, [isOpen]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Image is too large. Please select an image under 2MB.");
        event.target.value = ""; 
        return;
      }
      setEventImageFile(file);
      if (eventImagePreviewUrl) URL.revokeObjectURL(eventImagePreviewUrl);
      setEventImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setEventImageFile(null);
    if (eventImagePreviewUrl) URL.revokeObjectURL(eventImagePreviewUrl);
    setEventImagePreviewUrl(null);
    const fileInput = document.getElementById('eventImage') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !eventDateTime || !location.trim() || sellingPrice === '' || quantityAvailable === '' || !sellerContact.trim()) {
      alert('Please fill in Event Name, Date/Time, Location, Selling Price, Quantity, and Seller Contact.');
      return;
    }
    if (Number(quantityAvailable) <= 0) {
        alert('Quantity must be greater than 0.');
        return;
    }

    let base64ImageUrl: string | undefined = undefined;
    if (eventImageFile) {
      base64ImageUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(eventImageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    onSubmit({
      eventName: eventName.trim(),
      eventType,
      eventDate: new Date(eventDateTime),
      location: location.trim(),
      description: description.trim(),
      originalPrice: originalPrice === '' ? undefined : Number(originalPrice),
      sellingPrice: Number(sellingPrice),
      quantityAvailable: Number(quantityAvailable),
      ticketType: ticketType.trim() || undefined,
      isResale,
      sellerContact: sellerContact.trim(),
      eventImageUrl: base64ImageUrl,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[70] transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="list-ticket-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="list-ticket-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <TicketIcon className="w-6 h-6 mr-2 text-green-500 dark:text-green-400" />
            List Event Ticket for Sale
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Name <span className="text-red-500">*</span></label>
            <input type="text" id="eventName" value={eventName} onChange={e => setEventName(e.target.value)} required placeholder="e.g., Spring Music Fest, Career Workshop" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type <span className="text-red-500">*</span></label>
              <select id="eventType" value={eventType} onChange={e => setEventType(e.target.value as CampusEventType)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500">
                {Object.values(CampusEventType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="eventDateTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time <span className="text-red-500">*</span></label>
              <input type="datetime-local" id="eventDateTime" value={eventDateTime} onChange={e => setEventDateTime(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
          
          <div>
            <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location <span className="text-red-500">*</span></label>
            <input type="text" id="eventLocation" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g., Main Auditorium, Campus Green" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
            <textarea id="eventDescription" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" placeholder="Brief details about the event, performers, or specific ticket conditions."></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ticketOriginalPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Price (₦, Optional)</label>
              <input type="number" id="ticketOriginalPrice" value={originalPrice} onChange={e => setOriginalPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} min="0" step="100" placeholder="If known" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="ticketSellingPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selling Price (₦) <span className="text-red-500">*</span></label>
              <input type="number" id="ticketSellingPrice" value={sellingPrice} onChange={e => setSellingPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} required min="0" step="100" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ticketQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity Available <span className="text-red-500">*</span></label>
              <input type="number" id="ticketQuantity" value={quantityAvailable} onChange={e => setQuantityAvailable(e.target.value === '' ? '' : parseInt(e.target.value))} required min="1" step="1" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="ticketType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ticket Type (Optional)</label>
              <input type="text" id="ticketType" value={ticketType} onChange={e => setTicketType(e.target.value)} placeholder="e.g., General Admission, VIP" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={isResale} onChange={(e) => setIsResale(e.target.checked)} className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-500 rounded focus:ring-green-500 dark:focus:ring-green-400 dark:bg-gray-700 dark:checked:bg-green-500" />
              <span className="ml-2">This is a resale ticket</span>
            </label>
          </div>

          <div>
            <label htmlFor="eventImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Image/Poster (Optional, max 2MB)</label>
            <div className="mt-1 flex items-center space-x-3">
              <label className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                <PhotoIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span>Choose Image</span>
                <input id="eventImage" name="eventImage" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </label>
              {eventImagePreviewUrl && (
                <div className="relative group">
                  <img src={eventImagePreviewUrl} alt="Event Preview" className="h-16 w-auto max-w-[100px] object-contain rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            {eventImageFile && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: {eventImageFile.name}</p>}
          </div>
          
          <div>
            <label htmlFor="sellerContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Contact Info (for buyers) <span className="text-red-500">*</span></label>
            <input type="text" id="sellerContact" value={sellerContact} onChange={e => setSellerContact(e.target.value)} required placeholder="e.g., your_email@example.com, Phone (for text/call)" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-md shadow-sm">List Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListEventTicketModal;
