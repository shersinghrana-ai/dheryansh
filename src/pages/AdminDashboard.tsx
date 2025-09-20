import React, { useState, useEffect } from 'react';
import { BarChart3, MapPin, Filter, Search, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { Navigation } from '../components/Layout/Navigation';
import { IssueMap } from '../components/Map/IssueMap';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { StatusBadge } from '../components/UI/StatusBadge';
import { Issue } from '../types';
import { mockApi } from '../services/mockApi';

export const AdminDashboard: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const allIssues = await mockApi.getAllIssues();
        setIssues(allIssues);
        setFilteredIssues(allIssues);
      } catch (error) {
        console.error('Failed to load issues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  useEffect(() => {
    let filtered = issues;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredIssues(filtered);
  }, [issues, statusFilter, categoryFilter, searchQuery]);

  const updateIssueStatus = async (issueId: string, status: Issue['status']) => {
    try {
      const updatedIssue = await mockApi.updateIssueStatus(issueId, status, 'admin1');
      setIssues(prev =>
        prev.map(issue => issue.id === issueId ? updatedIssue : issue)
      );
      
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(updatedIssue);
      }
    } catch (error) {
      console.error('Failed to update issue status:', error);
    }
  };

  const getStats = () => {
    return {
      total: issues.length,
      pending: issues.filter(i => i.status === 'submitted' || i.status === 'verified').length,
      inProgress: issues.filter(i => i.status === 'in-progress').length,
      pendingConfirmation: issues.filter(i => i.status === 'pending-confirmation').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      highPriority: issues.filter(i => i.communityUpvotes >= 10).length
    };
  };

  const stats = getStats();
  const categories = Array.from(new Set(issues.map(i => i.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation isAdmin={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <BarChart3 className="mr-3 h-8 w-8" />
              Municipal Dashboard
            </h1>
            <p className="text-slate-400 mt-2">
              Manage and resolve civic issues reported by citizens
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Total Issues</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">In Progress</p>
                <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Pending Confirmation</p>
                <p className="text-2xl font-bold text-white">{stats.pendingConfirmation}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Resolved</p>
                <p className="text-2xl font-bold text-white">{stats.resolved}</p>
              </div>
            </div>
          </Card>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <MapPin className="mr-2 h-6 w-6" />
                Live Issues Map
              </h2>
              
              <IssueMap
                onIssueSelect={setSelectedIssue}
                selectedIssue={selectedIssue || undefined}
                showNearbyIssues={false}
              />
            </Card>

            {/* Filters */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filters & Search
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Search issues..."
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="verified">Verified</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in-progress">In Progress</option>
                    <option value="pending-confirmation">Pending Confirmation</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
               </div>
                </div>
              </div>
            </Card>

            {/* Issues Table */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Issue Management ({filteredIssues.length} issues)
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredIssues.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedIssue?.id === issue.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-white truncate">
                              {issue.title}
                            </span>
                            <StatusBadge status={issue.status} />
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {issue.category} • {issue.location.address} • {issue.communityUpvotes} upvotes
                          </div>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <span className="text-xs text-slate-500">
                            {issue.department}
                          </span>
                          <div className="text-xs text-slate-400">
                            {new Date(issue.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No issues found matching your criteria
                </div>
              )}
            </Card>
          </div>

          {/* Issue Details Sidebar */}
          <div className="space-y-6">
            {selectedIssue ? (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Issue Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium">{selectedIssue.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-orange-400">{selectedIssue.category}</span>
                      <StatusBadge status={selectedIssue.status} />
                    </div>
                  </div>

                  {selectedIssue.photo && (
                    <div>
                      <img
                        src={selectedIssue.photo}
                        alt="Issue photo"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <p className="text-slate-400 mt-1">{selectedIssue.description}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">Location</label>
                    <p className="text-slate-400 mt-1">{selectedIssue.location.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-slate-300">Community Votes</label>
                      <p className="text-white">{selectedIssue.communityUpvotes}</p>
                    </div>
                    <div>
                      <label className="text-slate-300">Department</label>
                      <p className="text-white">{selectedIssue.department}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">Submitted</label>
                    <p className="text-slate-400 mt-1">
                      {new Date(selectedIssue.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Status Update Actions */}
                  <div className="pt-4 border-t border-slate-700">
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Update Status
                    </label>
                    <div className="space-y-2">
                      {[
                        { status: 'acknowledged' as const, label: 'Acknowledge', variant: 'secondary' as const },
                        { status: 'in-progress' as const, label: 'Mark In Progress', variant: 'primary' as const },
                        { status: 'resolved' as const, label: 'Mark Resolved', variant: 'primary' as const }
                      ].map(({ status, label, variant }) => (
                        <Button
                          key={status}
                          variant={variant}
                          size="sm"
                          onClick={() => updateIssueStatus(selectedIssue.id, status)}
                          disabled={selectedIssue.status === status}
                          className="w-full"
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Select an Issue</h3>
                  <p className="text-slate-400">
                    Click on an issue from the map or list to view details and manage its status.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};