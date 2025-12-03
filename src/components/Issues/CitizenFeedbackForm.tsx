import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Issue } from '../../types';

interface CitizenFeedbackFormProps {
  issue: Issue;
  onFeedbackSubmitted: (updatedIssue: Issue) => void;
}

export const CitizenFeedbackForm: React.FC<CitizenFeedbackFormProps> = ({
  issue,
  onFeedbackSubmitted
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmResolution = async () => {
    if (rating === 0) {
      setError('Please provide a rating before confirming');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call to confirm resolution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedIssue: Issue = {
        ...issue,
        status: 'resolved',
        isTrulyResolved: true,
        resolutionRating: rating,
        feedbackComment: feedbackComment.trim() || undefined,
        resolvedAt: new Date()
      };

      onFeedbackSubmitted(updatedIssue);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopenIssue = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call to reopen issue
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedIssue: Issue = {
        ...issue,
        status: 'in-progress',
        isTrulyResolved: false,
        resolutionRating: undefined,
        feedbackComment: feedbackComment.trim() || undefined
      };

      onFeedbackSubmitted(updatedIssue);
    } catch (err) {
      setError('Failed to reopen issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-colors"
          >
            <Star
              size={24}
              className={`transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-slate-400 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-slate-300">
            {rating === 1 ? 'Poor' :
             rating === 2 ? 'Fair' :
             rating === 3 ? 'Good' :
             rating === 4 ? 'Very Good' :
             'Excellent'}
          </span>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Resolution Verification Required
            </h3>
            <p className="text-slate-300 text-sm">
              An official has marked this issue as resolved. Please verify the resolution 
              and share your feedback to help us improve our services.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-red-300">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Rate the Quality of Resolution *
          </label>
          {renderStars()}
          <p className="text-xs text-slate-400 mt-2">
            How satisfied are you with how this issue was resolved?
          </p>
        </div>

        {/* Feedback Comment */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Additional Feedback (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-slate-400" size={18} />
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              rows={3}
              className="w-full pl-10 pr-3 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              placeholder="Share any additional comments about the resolution..."
              maxLength={500}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-slate-400">
              Help us understand what worked well or what could be improved
            </p>
            <span className="text-xs text-slate-400">
              {feedbackComment.length}/500
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
          <Button
            onClick={handleConfirmResolution}
            loading={isSubmitting}
            disabled={rating === 0}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <CheckCircle size={18} className="mr-2" />
            Confirm & Close Issue
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleReopenIssue}
            loading={isSubmitting}
            className="flex-1"
          >
            <RotateCcw size={18} className="mr-2" />
            Re-open Issue
          </Button>
        </div>

        {/* Help Text */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">What happens next?</h4>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• <strong>Confirm & Close:</strong> Issue will be marked as fully resolved</li>
            <li>• <strong>Re-open:</strong> Issue will be sent back to authorities for further action</li>
            <li>• Your feedback helps improve municipal services for everyone</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};