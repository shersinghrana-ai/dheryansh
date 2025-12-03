import React from 'react';
import { Star, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import { Card } from '../UI/Card';
import { Issue } from '../../types';

interface ResolutionSummaryProps {
  issue: Issue;
}

export const ResolutionSummary: React.FC<ResolutionSummaryProps> = ({ issue }) => {
  if (!issue.isTrulyResolved || !issue.resolutionRating) {
    return null;
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-400'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-slate-300">
          ({rating}/5)
        </span>
      </div>
    );
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Not Rated';
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">
            Issue Resolved & Verified
          </h3>
        </div>

        {/* Resolution Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Citizen Rating
            </label>
            <div className="flex items-center space-x-2">
              {renderStars(issue.resolutionRating)}
              <span className="text-sm text-green-400 font-medium">
                {getRatingText(issue.resolutionRating)}
              </span>
            </div>
          </div>

          {/* Resolution Date */}
          {issue.resolvedAt && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Resolved On
              </label>
              <div className="flex items-center space-x-2 text-slate-300">
                <Calendar size={16} />
                <span className="text-sm">
                  {new Date(issue.resolvedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Comment */}
        {issue.feedbackComment && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Citizen Feedback
            </label>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <MessageSquare size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  "{issue.feedbackComment}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <p className="text-sm text-green-300">
            ✅ Thank you for your feedback! This helps us improve our services and ensures 
            accountability in resolving civic issues.
          </p>
        </div>
      </div>
    </Card>
  );
};