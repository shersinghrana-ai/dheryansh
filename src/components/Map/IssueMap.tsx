import React, { useEffect, useState } from 'react';
import { MapPin, Users, Calendar } from 'lucide-react';
import { Issue } from '../../types';
import { mockApi } from '../../services/mockApi';

interface IssueMapProps {
  userLocation?: { lat: number; lng: number };
  selectedIssue?: Issue;
  onIssueSelect?: (issue: Issue) => void;
  showNearbyIssues?: boolean;
}

export const IssueMap: React.FC<IssueMapProps> = ({ 
  userLocation, 
  selectedIssue, 
  onIssueSelect, 
  showNearbyIssues = true 
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        if (showNearbyIssues && userLocation) {
          const nearbyIssues = await mockApi.getNearbyIssues(userLocation.lat, userLocation.lng);
          setIssues(nearbyIssues);
        } else {
          const allIssues = await mockApi.getAllIssues();
          setIssues(allIssues);
        }
      } catch (error) {
        console.error('Failed to load issues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [userLocation, showNearbyIssues]);

  if (loading) {
    return (
      <div className="w-full h-64 bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-slate-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      {/* Mock map interface */}
      <div className="relative h-full p-4">
        <div className="absolute top-4 left-4 bg-slate-900/90 rounded-lg p-2 backdrop-blur-sm">
          <div className="flex items-center space-x-2 text-sm text-slate-300">
            <MapPin size={16} />
            <span>Interactive Map View</span>
          </div>
        </div>

        {/* Issues grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-12 max-h-48 overflow-y-auto">
          {issues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onIssueSelect?.(issue)}
              className={`
                bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border cursor-pointer transition-all
                ${selectedIssue?.id === issue.id 
                  ? 'border-orange-500 bg-orange-500/10' 
                  : 'border-slate-600 hover:border-slate-500'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {issue.category}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {issue.description}
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    issue.status === 'resolved' ? 'bg-green-500' :
                    issue.status === 'in-progress' ? 'bg-orange-500' :
                    issue.status === 'acknowledged' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <Users size={12} />
                  <span>{issue.communityUpvotes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{new Date(issue.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {issues.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <MapPin className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No issues found in this area</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};