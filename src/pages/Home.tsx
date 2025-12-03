import React, { useState, useEffect } from 'react';
import { Plus, MapPin, TrendingUp } from 'lucide-react';
import { Navigation } from '../components/Layout/Navigation';
import { IssueCard } from '../components/Issues/IssueCard';
import { IssueMap } from '../components/Map/IssueMap';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Issue } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { mockApi } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([]);
  const [trendingIssues, setTrendingIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  
  const { location } = useGeolocation();
  const { user } = useAuth();

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const [allIssues] = await Promise.all([
          mockApi.getAllIssues()
        ]);

        // Get trending issues (most upvoted)
        const trending = [...allIssues]
          .sort((a, b) => b.communityUpvotes - a.communityUpvotes)
          .slice(0, 3);
        
        setTrendingIssues(trending);

        // Get nearby issues if location is available
        if (location) {
          const nearby = await mockApi.getNearbyIssues(location.lat, location.lng);
          setNearbyIssues(nearby);
        }
      } catch (error) {
        console.error('Failed to load issues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [location]);

  const handleIssueUpvote = (updatedIssue: Issue) => {
    setNearbyIssues(prev => 
      prev.map(issue => issue.id === updatedIssue.id ? updatedIssue : issue)
    );
    setTrendingIssues(prev => 
      prev.map(issue => issue.id === updatedIssue.id ? updatedIssue : issue)
    );
  };

  if (showReportForm) {
    const ReportIssueForm = React.lazy(() => 
      import('../components/Forms/ReportIssueForm').then(module => ({ 
        default: module.ReportIssueForm 
      }))
    );
    
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading form...</div>
          </div>
        }>
          <ReportIssueForm
            onSuccess={() => {
              setShowReportForm(false);
              // Refresh data
              window.location.reload();
            }}
            onCancel={() => setShowReportForm(false)}
          />
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-orange-400 via-white to-green-400 bg-clip-text text-transparent flex items-center justify-center">
                <span className="mr-4 text-6xl">🏛️</span>
                Jan Awaaz
                <span className="ml-4 text-4xl">🇮🇳</span>
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              <span className="text-orange-400 font-semibold">जन आवाज़</span> - Your voice matters. Report civic issues and help build a better community together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => setShowReportForm(true)}
                className="w-full sm:w-auto"
              >
                <Plus size={20} className="mr-2" />
                Report New Issue
              </Button>
              <div className="text-sm text-slate-400">
                Make your city better, one report at a time
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <MapPin className="mr-2 h-6 w-6" />
                  Issues Near You
                </h2>
                {location && (
                  <div className="text-sm text-slate-400">
                    📍 {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
                  </div>
                )}
              </div>
              
              <IssueMap
                userLocation={location || undefined}
                showNearbyIssues={true}
              />
              
              {location && nearbyIssues.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Recent Reports in Your Area
                  </h3>
                  <div className="space-y-4">
                    {nearbyIssues.slice(0, 2).map(issue => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onUpvote={handleIssueUpvote}
                        currentUserId={user?.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Issues */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Trending Issues
              </h3>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : trendingIssues.length > 0 ? (
                <div className="space-y-4">
                  {trendingIssues.map(issue => (
                    <div key={issue.id} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {issue.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {issue.category} • {issue.communityUpvotes} upvotes
                          </div>
                        </div>
                        <div className={`ml-2 w-2 h-2 rounded-full flex-shrink-0 ${
                          issue.status === 'resolved' ? 'bg-green-500' :
                          issue.status === 'in-progress' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-center py-8">
                  No issues reported yet
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Community Impact</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">
                    {nearbyIssues.length + trendingIssues.length}
                  </div>
                  <div className="text-sm text-slate-400">Total Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {trendingIssues.filter(i => i.status === 'resolved').length}
                  </div>
                  <div className="text-sm text-slate-400">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {trendingIssues.reduce((sum, issue) => sum + issue.communityUpvotes, 0)}
                  </div>
                  <div className="text-sm text-slate-400">Community Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {trendingIssues.filter(i => i.status === 'in-progress').length}
                  </div>
                  <div className="text-sm text-slate-400">In Progress</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowReportForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};