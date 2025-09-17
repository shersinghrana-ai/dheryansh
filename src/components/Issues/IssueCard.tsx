import React, { useState } from 'react';
import { Calendar, MapPin, Users, ThumbsUp, Eye } from 'lucide-react';
import { Issue } from '../../types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { StatusBadge } from '../UI/StatusBadge';
import { mockApi } from '../../services/mockApi';

interface IssueCardProps {
  issue: Issue;
  onUpvote?: (issue: Issue) => void;
  showDetails?: boolean;
  currentUserId?: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({ 
  issue, 
  onUpvote, 
  showDetails = false,
  currentUserId
}) => {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(issue.communityUpvotes);

  const handleUpvote = async () => {
    if (isUpvoting) return;

    setIsUpvoting(true);
    try {
      const updatedIssue = await mockApi.upvoteIssue(issue.id);
      setLocalUpvotes(updatedIssue.communityUpvotes);
      onUpvote?.(updatedIssue);
    } catch (error) {
      console.error('Failed to upvote issue:', error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const canUpvote = currentUserId && currentUserId !== issue.submittedBy;

  return (
    <Card hover className="p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {issue.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm font-medium text-orange-400">
                {issue.category}
              </span>
              <StatusBadge status={issue.status} />
            </div>
          </div>
          
          {canUpvote && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleUpvote}
              loading={isUpvoting}
              className="ml-2 flex-shrink-0"
            >
              <ThumbsUp size={16} className="mr-1" />
              {localUpvotes}
            </Button>
          )}
        </div>

        {/* Photo */}
        {issue.photo && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={issue.photo}
              alt="Issue photo"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Description */}
        <p className={`text-slate-300 ${showDetails ? '' : 'line-clamp-2'}`}>
          {issue.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{new Date(issue.submittedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin size={14} />
              <span className="truncate max-w-24">{issue.location.address}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{localUpvotes}</span>
            </div>
            {issue.department && (
              <div className="text-xs text-slate-500">
                {issue.department}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};