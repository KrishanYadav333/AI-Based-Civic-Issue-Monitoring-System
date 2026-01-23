import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues, setSelectedIssue, setFilters, setSearchQuery } from '../../store/issueSlice';
import { Card, Button, Input } from '../common/FormElements';
import { LoadingSpinner, CardSkeleton } from '../common/Loaders';
import { PriorityBadge, StatusBadge } from '../common/Badges';
import { Search, Eye, MapPin, Calendar } from 'lucide-react';
import { filterIssues, sortIssues, formatDate } from '../../utils/helpers';
import { motion } from 'framer-motion';
import IssueDetailPanel from './IssueDetailPanel';

const IssueList = () => {
  const dispatch = useDispatch();
  const { issues, loading, filters, searchQuery, selectedIssue } = useSelector(state => state.issues);
  const user = useSelector(state => state.auth.user);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  // Filter issues assigned to the engineer
  const engineerIssues = useMemo(() => {
    return issues.filter(issue => 
      issue.assignedTo === user?.id || issue.assignedTo === 'Engineer001' || issue.assignedTo === 'Engineer002' || issue.assignedTo === 'Engineer003'
    );
  }, [issues, user]);

  // Apply filters and search
  const filteredIssues = useMemo(() => {
    let filtered = filterIssues(engineerIssues, {
      ...filters,
      searchQuery: localSearch || searchQuery,
    });
    return sortIssues(filtered, sortBy);
  }, [engineerIssues, filters, searchQuery, localSearch, sortBy]);

  const handleSelectIssue = (issue) => {
    dispatch(setSelectedIssue(issue));
    setDetailPanelOpen(true);
  };

  const handleSearch = (value) => {
    setLocalSearch(value);
    dispatch(setSearchQuery(value));
  };

  if (loading) {
    return <CardSkeleton count={5} />;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Search issues..."
              icon={<Search className="w-4 h-4" />}
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="date">Latest</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </Card>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="cursor-pointer" onClick={() => handleSelectIssue(issue)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 hover:text-primary-600">
                          {issue.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {issue.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {issue.ward}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(issue.createdDate)}
                          </span>
                          <span className="font-medium">{issue.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end flex-shrink-0">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                    <Button size="sm" variant="outline" onClick={(e) => {
                      e.stopPropagation();
                      handleSelectIssue(issue);
                    }}>
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">No issues found</p>
            </div>
          </Card>
        )}
      </div>

      {/* Detail Panel */}
      {selectedIssue && (
        <IssueDetailPanel
          isOpen={detailPanelOpen}
          onClose={() => setDetailPanelOpen(false)}
          issue={selectedIssue}
        />
      )}
    </div>
  );
};

export default IssueList;
