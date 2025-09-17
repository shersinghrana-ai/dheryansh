import React, { useState, useEffect } from 'react';
import { FileText, Filter, Search } from 'lucide-react';
import { Navigation } from '../components/Layout/Navigation';
import { IssueCard } from '../components/Issues/IssueCard';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Issue } from '../types';
import { mockApi } from '../services/mockApi';

export const MyReports: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadUserIssues = async () => {
      try {
        const userIssues = await mockApi.getIssuesByUser('citizen1');
        setIssues(userIssues);
        setFilteredIssues(userIssues);
      } catch (error) {
        console.error('Failed to load user issues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserIssues();
  }, []);

  useEffect(() => {
    let filtered = issues;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredIssues(filtered);
  }, [issues, statusFilter, searchQuery]);

  const handleIssueUpvote = (updatedIssue: Issue) => {
    setIssues(prev =>
      prev.map(issue => issue.id === updatedIssue.id ? updatedIssue : issue)
    );
  };

  const getStatusCounts = () => {
    return {
      all: issues.length,
      submitted: issues.filter(i => i.status === 'submitted').length,
      verified: issues.filter(i => i.status === 'verified').length,
      acknowledged: issues.filter(i => i.status === 'acknowledged').length,
      'in-progress': issues.filter(i => i.status === 'in-progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FileText className="mr-3 h-8 w-8" />
              My Reports
            </h1>
            <p className="text-slate-400 mt-2">
              Track the status of all your submitted issues
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Search Issues
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Search..."
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Status
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'all', label: 'All Issues', count: statusCounts.all },
                    { key: 'submitted', label: 'Submitted', count: statusCounts.submitted },
                    { key: 'verified', label: 'Verified', count: statusCounts.verified },
                    { key: 'acknowledged', label: 'Acknowledged', count: statusCounts.acknowledged },
                    { key: 'in-progress', label: 'In Progress', count: statusCounts['in-progress'] },
                    { key: 'resolved', label: 'Resolved', count: statusCounts.resolved },
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        statusFilter === key
                          ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        statusFilter === key
                          ? 'bg-white/20'
                          : 'bg-slate-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredIssues.length > 0 ? (
              <div className="space-y-6">
                {filteredIssues.map(issue => (
                  <div key={issue.id} className="relative">
                    <IssueCard
                      issue={issue}
                      onUpvote={handleIssueUpvote}
                      showDetails={true}
                      currentUserId="citizen1"
                    />
                    
                    {/* Progress Timeline */}
                    <div className="mt-4 ml-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 relative overflow-hidden">
                          <div 
                            className={`absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-pink-600 rounded-full transition-all duration-500 ${
                              issue.status === 'submitted' ? 'w-1/5' :
                              issue.status === 'verified' ? 'w-2/5' :
                              issue.status === 'acknowledged' ? 'w-3/5' :
                              issue.status === 'in-progress' ? 'w-4/5' :
                              issue.status === 'resolved' ? 'w-full' : 'w-0'
                            }`} 
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {issue.status === 'submitted' ? '20%' :
                           issue.status === 'verified' ? '40%' :
                           issue.status === 'acknowledged' ? '60%' :
                           issue.status === 'in-progress' ? '80%' :
                           issue.status === 'resolved' ? '100%' : '0%'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Submitted</span>
                        <span>Verified</span>
                        <span>Acknowledged</span>
                        <span>In Progress</span>
                        <span>Resolved</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center">
                  <FileText className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchQuery || statusFilter !== 'all' ? 'No matching issues found' : 'No issues reported yet'}
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your filters or search query'
                      : 'Start by reporting your first civic issue to help improve your community'
                    }
                  </p>
                  {!searchQuery && statusFilter === 'all' && (
                    <Button onClick={() => window.location.href = '/'}>
                      Report New Issue
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};