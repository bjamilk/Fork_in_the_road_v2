
import React, { useState } from 'react';
import { MarketplaceReview, User } from '../types';
import { XCircleIcon, StarIcon as StarOutline, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import StarRating from './StarRating';

interface ListingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemData: { item: any; itemType: string } | null;
  onAddReview: (listingId: string, itemType: string, rating: number, comment: string) => void;
  currentUser: User;
}

const ListingPreviewModal: React.FC<ListingPreviewModalProps> = ({ isOpen, onClose, itemData, onAddReview, currentUser }) => {
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  if (!isOpen || !itemData) return null;

  const { item, itemType } = itemData;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0 || !newComment.trim()) {
      alert("Please provide a rating and a comment.");
      return;
    }
    onAddReview(item.id, itemType, newRating, newComment.trim());
    setNewRating(0);
    setNewComment('');
  };

  const hasUserReviewed = item.reviews?.some((r: MarketplaceReview) => r.reviewerId === currentUser.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[80] transition-opacity" role="dialog" aria-modal="true" aria-labelledby="preview-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 id="preview-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 truncate pr-4">{item.title || item.itemName || 'Listing Details'}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto space-y-4 pr-2 -mr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-auto max-h-64 object-contain rounded-md bg-gray-100 dark:bg-gray-700" />}
                 {item.images && item.images[0] && <img src={item.images[0]} alt={item.title} className="w-full h-auto max-h-64 object-contain rounded-md bg-gray-100 dark:bg-gray-700" />}
                
                <div className="space-y-2 text-sm">
                    <p><strong className="font-medium text-gray-600 dark:text-gray-400">Seller:</strong> {item.sellerName || item.tutorName || item.listedBy || item.listerName}</p>
                    <p><strong className="font-medium text-gray-600 dark:text-gray-400">Price:</strong> <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₦{item.price}</span></p>
                    {item.courseCode && <p><strong className="font-medium text-gray-600 dark:text-gray-400">Course:</strong> {item.courseCode}</p>}
                    {item.year && <p><strong className="font-medium text-gray-600 dark:text-gray-400">Year:</strong> {item.year}</p>}
                    {item.university && <p><strong className="font-medium text-gray-600 dark:text-gray-400">University:</strong> {item.university}</p>}
                    {item.condition && <p><strong className="font-medium text-gray-600 dark:text-gray-400">Condition:</strong> {item.condition}</p>}
                    {item.description && <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"><strong className="font-medium text-gray-600 dark:text-gray-400">Description:</strong> {item.description}</p>}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-2 text-gray-500" />
                    Reviews ({item.reviews?.length || 0})
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                    {item.reviews && item.reviews.length > 0 ? (
                        item.reviews.map((review: MarketplaceReview) => (
                            <div key={review.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img src={review.reviewerAvatar || `https://ui-avatars.com/api/?name=${review.reviewerName.replace(' ', '+')}`} alt={review.reviewerName} className="w-8 h-8 rounded-full mr-2" />
                                        <div>
                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{review.reviewerName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <StarRating rating={review.rating} readOnly />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 pl-10">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No reviews yet. Be the first!</p>
                    )}
                </div>
            </div>

            {/* Add Review Form */}
            {!hasUserReviewed && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Leave a Review</h3>
                 <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Rating</label>
                        <StarRating rating={newRating} onRatingChange={setNewRating} />
                    </div>
                     <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Comment</label>
                        <textarea id="comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} className="w-full p-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required></textarea>
                     </div>
                     <div className="text-right">
                         <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-50" disabled={newRating === 0 || !newComment.trim()}>Submit Review</button>
                     </div>
                 </form>
            </div>
            )}
             {hasUserReviewed && (
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md text-sm">
                    You've already reviewed this item.
                </div>
            )}
        </div>
        <div className="mt-6 flex justify-end flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingPreviewModal;
