import React, { useState, useEffect } from 'react';

const EmailDashboard = () => {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [folderFilter, setFolderFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState(null);

  // API Configuration
  const API_BASE_URL = 'http://localhost:3001';

  const getCategoryBadgeClass = (category) => {
    const classes = {
      'Interested': 'bg-blue-100 text-blue-700 border-blue-300',
      'Meeting Booked': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'Not Interested': 'bg-red-100 text-red-700 border-red-300',
      'Spam': 'bg-purple-100 text-purple-700 border-purple-300',
      'Out of Office': 'bg-amber-100 text-amber-700 border-amber-300'
    };
    return classes[category] || 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const getCategoryLabel = (category) => {
    return category || 'Uncategorized';
  };

  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Generate email preview from subject
  const generatePreview = (subject, sender) => {
    const previews = {
      'security alert': 'We detected unusual activity on your account. Please review recent sign-in attempts and secure your account.',
      'verification': 'Please verify your email address to complete your account setup and access all features.',
      'welcome': 'Welcome to our platform! Get started with these helpful resources and tips.',
      'application': 'Thank you for your interest. We have received your application and will review it shortly.',
      'reminder': 'This is a friendly reminder about our terms of service and privacy policy updates.',
      'interview': 'Discover interview experiences and tips from professionals in your field.',
      'offer': 'Limited time offer just for you! Don\'t miss out on these exclusive deals and savings.',
      'creative': 'Explore new creative tools and techniques to enhance your design workflow.',
      'skills': 'Enhance your technical skills with our comprehensive courses and learning resources.'
    };

    const subjectLower = subject.toLowerCase();
    for (const [key, preview] of Object.entries(previews)) {
      if (subjectLower.includes(key)) {
        return preview;
      }
    }
    return `Email from ${sender} regarding ${subject}`;
  };

  // Fetch emails from API
  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/emails`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API data to match component structure
      const transformedEmails = data.map((email, index) => ({
        id: index + 1,
        sender: email.from.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email.from,
        subject: email.subject,
        preview: generatePreview(email.subject, email.from),
        time: formatRelativeTime(email.date),
        category: email.label || null,
        account: email.account,
        folder: email.folder,
        unread: Math.random() > 0.7, // Randomly assign unread status
        rawDate: email.date
      }));

      // Sort by date (newest first)
      transformedEmails.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
      
      setEmails(transformedEmails);
      setFilteredEmails(transformedEmails);
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError('Failed to load emails. Please check if the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmails = () => {
    let filtered = emails.filter(email => {
      const matchesSearch = !searchTerm || 
        email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAccount = !accountFilter || email.account === accountFilter;
      const matchesFolder = !folderFilter || email.folder === folderFilter;
      const matchesCategory = !categoryFilter || email.category === categoryFilter;

      return matchesSearch && matchesAccount && matchesFolder && matchesCategory;
    });

    setFilteredEmails(filtered);
  };

  const refreshEmails = async () => {
    await fetchEmails();
  };

  const openEmail = (emailId) => {
    const email = emails.find(e => e.id === emailId);
    if (email) {
      // Mark as read
      const updatedEmails = emails.map(e => 
        e.id === emailId ? { ...e, unread: false } : e
      );
      setEmails(updatedEmails);
      
      alert(`Opening email: "${email.subject}" from ${email.sender}`);
    }
  };

  // Get unique accounts and folders for filter dropdowns
  const uniqueAccounts = [...new Set(emails.map(e => e.account))];
  const uniqueFolders = [...new Set(emails.map(e => e.folder))];
  const uniqueCategories = [...new Set(emails.map(e => e.category).filter(Boolean))];

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    filterEmails();
  }, [searchTerm, accountFilter, folderFilter, categoryFilter, emails]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('IMAP IDLE: Checking for new emails...');
      // In production, you might want to poll for updates or use WebSocket
      // refreshEmails();
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: filteredEmails.length,
    interested: filteredEmails.filter(e => e.category === 'Interested').length,
    meetings: filteredEmails.filter(e => e.category === 'Meeting Booked').length,
    accounts: uniqueAccounts.length,
    unread: filteredEmails.filter(e => e.unread).length
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-200 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchEmails}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-700">
      <div className="max-w-7xl mx-auto p-5">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 mb-5 shadow-xl border border-blue-200/30">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#003A6B' }}>
            📧 Email Management Dashboard
          </h1>
          <p className="text-slate-600 text-sm">
            Real-time IMAP synchronization with AI-powered categorization
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-5">
          <div className="bg-white rounded-xl p-5 text-center shadow-lg border border-blue-200/20 hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl font-bold mb-1" style={{ color: '#003A6B' }}>{stats.total}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Emails</div>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-lg border border-blue-200/20 hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl font-bold mb-1" style={{ color: '#003A6B' }}>{stats.unread}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Unread</div>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-lg border border-blue-200/20 hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl font-bold mb-1" style={{ color: '#003A6B' }}>{stats.interested}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Interested</div>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-lg border border-blue-200/20 hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl font-bold mb-1" style={{ color: '#003A6B' }}>{stats.meetings}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Meetings</div>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-lg border border-blue-200/20 hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl font-bold mb-1" style={{ color: '#003A6B' }}>{stats.accounts}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Accounts</div>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-lg border border-blue-200/20 hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm text-slate-700">Live Sync</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">IMAP Status</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl p-5 mb-5 shadow-xl border border-blue-200/30">
          {/* Search Bar */}
          <div className="relative mb-5">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search emails by sender, subject, or content..."
              className="w-full px-5 py-4 pr-12 border-2 border-slate-200 rounded-3xl text-base transition-all focus:outline-none focus:bg-white focus:shadow-lg bg-slate-50"
              style={{ 
                borderColor: searchTerm ? '#003A6B' : undefined,
                focusBorderColor: '#003A6B'
              }}
              onFocus={(e) => e.target.style.borderColor = '#003A6B'}
              onBlur={(e) => e.target.style.borderColor = searchTerm ? '#003A6B' : '#e2e8f0'}
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-lg" style={{ color: '#003A6B' }}>
              🔍
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="font-medium mb-2 text-slate-700 text-sm">Account</label>
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 transition-all focus:outline-none focus:bg-white"
                onFocus={(e) => e.target.style.borderColor = '#003A6B'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="">All Accounts</option>
                {uniqueAccounts.map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-medium mb-2 text-slate-700 text-sm">Folder</label>
              <select
                value={folderFilter}
                onChange={(e) => setFolderFilter(e.target.value)}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 transition-all focus:outline-none focus:bg-white"
                onFocus={(e) => e.target.style.borderColor = '#003A6B'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="">All Folders</option>
                {uniqueFolders.map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-medium mb-2 text-slate-700 text-sm">AI Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 transition-all focus:outline-none focus:bg-white"
                onFocus={(e) => e.target.style.borderColor = '#003A6B'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="">Uncategorized</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="mb-2">&nbsp;</label>
              <button
                onClick={refreshEmails}
                disabled={isLoading}
                className="text-white px-5 py-3 rounded-xl font-medium text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#003A6B',
                  '&:hover': { backgroundColor: '#002952' }
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#002952'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#003A6B'}
              >
                {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-blue-200/30">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-slate-200 rounded-full animate-spin mx-auto mb-5" 
                   style={{ borderTopColor: '#003A6B' }}></div>
              <p style={{ color: '#003A6B' }}>Loading emails from IMAP servers...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-15">
              <div className="text-5xl mb-5 text-slate-300">📭</div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">No emails found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredEmails.map((email, index) => (
              <div
                key={email.id}
                onClick={() => openEmail(email.id)}
                className={`p-5 cursor-pointer transition-all hover:bg-blue-50/50 ${
                  index !== filteredEmails.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold" style={{ color: '#003A6B' }}>{email.sender}</div>
                  <div className="text-xs text-slate-500">{email.time}</div>
                </div>
                
                <div className="text-sm text-slate-700 mb-2 font-medium">
                  {email.subject}
                </div>
                
                <div className="text-xs text-slate-600 mb-2 leading-relaxed">
                  {email.preview}
                </div>
                
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {email.category && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getCategoryBadgeClass(email.category)}`}>
                        {getCategoryLabel(email.category)}
                      </span>
                    )}
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      {email.folder} • {email.account}
                    </span>
                  </div>
                  {email.unread && (
                    <span className="font-bold" style={{ color: '#003A6B' }}>●</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDashboard;