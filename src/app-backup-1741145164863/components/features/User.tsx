'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/Authentication';
import Navigation from '@/app/components/ui/Navigation';
import UpdatePassword from '@/app/components/auth/UpdatePassword';
import Button from '@/app/components/ui/Button';
import '@/app/styles/user.css';

interface UserPortalProps {
  title: string;
  errorMessage?: string;
  nav: {
    name: string;
    short: string;
    link: string;
    active?: boolean;
    class?: string;
  }[];
}

enum PortalSection {
  Overview = 'overview',
  Account = 'account',
  Subscription = 'subscription',
  ApiKeys = 'api-keys',
  Preferences = 'preferences',
  History = 'history'
}

const UserPortal: React.FC<UserPortalProps> = ({
  title,
  errorMessage = '',
  nav
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<PortalSection>(PortalSection.Overview);
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, activeSection]);
  
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for demonstration
      setAccountData({
        id: user?.id || '123456',
        email: user?.email || 'user@example.com',
        name: user?.name || 'Test User',
        createdAt: '2023-01-15T00:00:00Z',
        lastLogin: new Date().toISOString()
      });
      
      setSubscriptionData({
        tier: 'Basic',
        renewalDate: '2024-12-31T00:00:00Z',
        status: 'active',
        features: [
          { name: 'Buylist Access', enabled: true },
          { name: 'CSV Export', enabled: true },
          { name: 'Advanced Filtering', enabled: true },
          { name: 'API Access', enabled: true }
        ]
      });
      
      setApiKeys([
        { id: 'key1', name: 'Development Key', created: '2023-06-10T00:00:00Z', lastUsed: '2023-11-22T00:00:00Z', status: 'active' },
        { id: 'key2', name: 'Production Key', created: '2023-08-15T00:00:00Z', lastUsed: '2023-11-28T00:00:00Z', status: 'active' }
      ]);
      
      setPreferences({
        theme: 'system',
        defaultSearchMode: 'exact',
        defaultSort: 'chrono',
        hiddenSellers: ['seller1', 'seller2'],
        hiddenBuyers: ['buyer1'],
        emailNotifications: true
      });
      
      setSearchHistory([
        { id: 'search1', query: 'Black Lotus', date: '2023-11-28T14:35:00Z', results: 12 },
        { id: 'search2', query: 'Jace, the Mind Sculptor', date: '2023-11-27T09:12:00Z', results: 24 },
        { id: 'search3', query: 'Mox Emerald', date: '2023-11-25T17:43:00Z', results: 8 },
        { id: 'search4', query: 's:LEA r:m', date: '2023-11-23T11:22:00Z', results: 15 }
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to format dates
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  // Generate a new API key
  const handleGenerateKey = () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for your API key');
      return;
    }
    
    // Mock key generation - in a real app this would call your API
    const newKey = {
      id: `key${apiKeys.length + 1}`,
      name: newKeyName,
      created: new Date().toISOString(),
      lastUsed: null,
      status: 'active',
      key: `mtgban_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setIsNewKeyModalOpen(false);
    
    // Show key value to user (in a real app, you might want to display this in a modal)
    alert(`Your new API key is: ${newKey.key}\n\nStore this safely! You won't be able to see it again.`);
  };
  
  // Revoke an API key
  const handleRevokeKey = (keyId: string) => {
    if (confirm('Are you sure you want to revoke this key? This action cannot be undone.')) {
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, status: 'revoked' } : key
      ));
    }
  };
  
  // Save preferences
  const handleSavePreferences = () => {
    // In a real app, this would call your API
    alert('Preferences saved successfully!');
  };
  
  // Render different sections based on activeSection
  const renderSectionContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user data...</p>
        </div>
      );
    }
    
    switch (activeSection) {
      case PortalSection.Overview:
        return renderOverview();
      case PortalSection.Account:
        return renderAccount();
      case PortalSection.Subscription:
        return renderSubscription();
      case PortalSection.ApiKeys:
        return renderApiKeys();
      case PortalSection.Preferences:
        return renderPreferences();
      case PortalSection.History:
        return renderHistory();
      default:
        return renderOverview();
    }
  };
  
  // Render the overview section
  const renderOverview = () => {
    if (!accountData || !subscriptionData) {
      return <p>No account data available.</p>;
    }
    
    return (
      <div className="overview-section">
        <div className="account-summary">
          <h3>Account Summary</h3>
          <div className="summary-card">
            <div className="summary-item">
              <span className="summary-label">Email:</span>
              <span className="summary-value">{accountData.email}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Subscription:</span>
              <span className="summary-value">{subscriptionData.tier}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Status:</span>
              <span className="summary-value status-indicator active">{subscriptionData.status}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Renewal:</span>
              <span className="summary-value">{formatDate(subscriptionData.renewalDate)}</span>
            </div>
          </div>
        </div>
        
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button 
              className="action-button" 
              onClick={() => setActiveSection(PortalSection.Account)}
            >
              <span className="action-icon">👤</span>
              <span className="action-label">Account Settings</span>
            </button>
            <button 
              className="action-button" 
              onClick={() => setActiveSection(PortalSection.Subscription)}
            >
              <span className="action-icon">🔄</span>
              <span className="action-label">Manage Subscription</span>
            </button>
            <button 
              className="action-button" 
              onClick={() => setActiveSection(PortalSection.ApiKeys)}
            >
              <span className="action-icon">🔑</span>
              <span className="action-label">API Keys</span>
            </button>
            <button 
              className="action-button" 
              onClick={() => setActiveSection(PortalSection.Preferences)}
            >
              <span className="action-icon">⚙️</span>
              <span className="action-label">Preferences</span>
            </button>
          </div>
        </div>
        
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {searchHistory.slice(0, 3).map(item => (
              <div key={item.id} className="activity-item">
                <div className="activity-icon">🔍</div>
                <div className="activity-content">
                  <div className="activity-title">
                    Searched for <span className="activity-highlight">{item.query}</span>
                  </div>
                  <div className="activity-meta">
                    {formatDate(item.date)} • {item.results} results
                  </div>
                </div>
              </div>
            ))}
            <button 
              className="view-all-button" 
              onClick={() => setActiveSection(PortalSection.History)}
            >
              View All Activity
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the account section
  const renderAccount = () => {
    return (
      <div className="account-section">
        <h3>Account Information</h3>
        
        <div className="account-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={accountData?.email || ''} 
              disabled 
              className="form-input"
            />
            <small>To change your email, please contact support.</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Display Name</label>
            <input 
              type="text" 
              id="name" 
              defaultValue={accountData?.name || ''} 
              className="form-input" 
            />
          </div>
          
          <div className="form-group">
            <label>Account Creation Date</label>
            <div className="static-value">{formatDate(accountData?.createdAt || '')}</div>
          </div>
          
          <div className="form-group">
            <label>Last Login</label>
            <div className="static-value">{formatDate(accountData?.lastLogin || '')}</div>
          </div>
          
          <div className="form-actions">
            <Button variant="ghost">Save Changes</Button>
          </div>
        </div>
        
        <div className="account-section-divider"></div>
        
        <h3>Password Management</h3>
        <UpdatePassword redirectMethod="client" />
        
        <div className="account-section-divider"></div>
        
        <h3>Danger Zone</h3>
        <div className="danger-zone">
          <div className="danger-action">
            <div className="danger-info">
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <Button variant="ghost" className="danger-button">Delete Account</Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the subscription section
  const renderSubscription = () => {
    return (
      <div className="subscription-section">
        <div className="current-plan">
          <h3>Current Plan</h3>
          <div className="plan-card">
            <div className="plan-header">
              <h4>{subscriptionData?.tier || 'Basic'}</h4>
              <div className="plan-status">{subscriptionData?.status || 'active'}</div>
            </div>
            <div className="plan-details">
              <div className="plan-detail">
                <span className="detail-label">Renewal Date:</span>
                <span className="detail-value">{formatDate(subscriptionData?.renewalDate || '')}</span>
              </div>
              <div className="plan-detail">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">Credit Card ending in 1234</span>
              </div>
            </div>
            <div className="plan-features">
              <h5>Plan Features</h5>
              <ul className="features-list">
                {subscriptionData?.features.map((feature: any, index: number) => (
                  <li key={index} className={`feature-item ${feature.enabled ? 'enabled' : 'disabled'}`}>
                    {feature.enabled ? '✓' : '✕'} {feature.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="plan-actions">
              <Button variant="ghost">Change Plan</Button>
              <Button variant="ghost">Update Payment Method</Button>
            </div>
          </div>
        </div>
        
        <div className="billing-history">
          <h3>Billing History</h3>
          <table className="billing-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nov 01, 2023</td>
                <td>Monthly Subscription - {subscriptionData?.tier}</td>
                <td>$9.99</td>
                <td>Paid</td>
                <td><a href="#" className="receipt-link">View</a></td>
              </tr>
              <tr>
                <td>Oct 01, 2023</td>
                <td>Monthly Subscription - {subscriptionData?.tier}</td>
                <td>$9.99</td>
                <td>Paid</td>
                <td><a href="#" className="receipt-link">View</a></td>
              </tr>
              <tr>
                <td>Sep 01, 2023</td>
                <td>Monthly Subscription - {subscriptionData?.tier}</td>
                <td>$9.99</td>
                <td>Paid</td>
                <td><a href="#" className="receipt-link">View</a></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="cancel-subscription">
          <h3>Cancel Subscription</h3>
          <div className="cancel-info">
            <p>
              If you cancel your subscription, you will still have access to all features until the end of your current billing period.
              After that, your account will be downgraded to the Basic tier.
            </p>
            <Button variant="ghost" className="cancel-button">Cancel Subscription</Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the API keys section
  const renderApiKeys = () => {
    return (
      <div className="api-keys-section">
        <div className="section-header">
          <h3>API Keys</h3>
          <Button 
            variant="ghost" 
            onClick={() => setIsNewKeyModalOpen(true)}
          >
            Create New Key
          </Button>
        </div>
        
        <div className="api-keys-info">
          <p>
            API keys allow you to access MTGBAN data programmatically. 
            Each key should be used for a specific purpose and can be revoked individually if needed.
          </p>
          <p>
            <a href="/docs/api" target="_blank" className="docs-link">View API Documentation</a>
          </p>
        </div>
        
        {apiKeys.length > 0 ? (
          <table className="api-keys-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map(key => (
                <tr key={key.id}>
                  <td>{key.name}</td>
                  <td>{formatDate(key.created)}</td>
                  <td>{key.lastUsed ? formatDate(key.lastUsed) : 'Never'}</td>
                  <td>
                    <span className={`status-indicator ${key.status}`}>
                      {key.status}
                    </span>
                  </td>
                  <td>
                    {key.status === 'active' ? (
                      <button 
                        className="revoke-button"
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        Revoke
                      </button>
                    ) : (
                      <span className="revoked-text">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-keys-message">
            <p>You haven't created any API keys yet.</p>
          </div>
        )}
        
        {isNewKeyModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h4>Create New API Key</h4>
              <div className="modal-form">
                <div className="form-group">
                  <label htmlFor="keyName">Key Name</label>
                  <input 
                    type="text" 
                    id="keyName" 
                    value={newKeyName} 
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Development Key"
                    className="form-input"
                  />
                  <small>Give your key a descriptive name to remember what it's for.</small>
                </div>
              </div>
              <div className="modal-actions">
                <Button variant="ghost" onClick={() => setIsNewKeyModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="ghost" onClick={handleGenerateKey}>
                  Generate Key
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render the preferences section
  const renderPreferences = () => {
    return (
      <div className="preferences-section">
        <h3>Application Preferences</h3>
        
        <div className="preferences-form">
          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select 
              id="theme" 
              defaultValue={preferences.theme} 
              className="form-select"
            >
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="searchMode">Default Search Mode</label>
            <select 
              id="searchMode" 
              defaultValue={preferences.defaultSearchMode} 
              className="form-select"
            >
              <option value="exact">Exact Match</option>
              <option value="prefix">Prefix Match</option>
              <option value="any">Any Match</option>
              <option value="regexp">Regular Expression</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="defaultSort">Default Sort Order</label>
            <select 
              id="defaultSort" 
              defaultValue={preferences.defaultSort} 
              className="form-select"
            >
              <option value="chrono">Chronological</option>
              <option value="alpha">Alphabetical</option>
              <option value="retail">Best Retail Price</option>
              <option value="buylist">Best Buylist Price</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                defaultChecked={preferences.emailNotifications} 
                className="form-checkbox" 
              />
              <span>Email Notifications</span>
            </label>
            <small>Receive email updates about new features and price alerts.</small>
          </div>
        </div>
        
        <div className="section-divider"></div>
        
        <h3>Store Preferences</h3>
        <p>Select which stores you want to include in your searches:</p>
        
        <div className="store-preferences">
          <div className="store-section">
            <h4>Retail Stores</h4>
            <div className="stores-grid">
              <label className="store-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Card Kingdom</span>
              </label>
              <label className="store-checkbox">
                <input type="checkbox" defaultChecked />
                <span>TCGPlayer</span>
              </label>
              <label className="store-checkbox">
                <input type="checkbox" defaultChecked={false} />
                <span>Star City Games</span>
              </label>
              <label className="store-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Cool Stuff Inc</span>
              </label>
              <label className="store-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Channel Fireball</span>
              </label>
            </div>
          </div>
          
          <div className="store-section">
            <h4>Buylist Stores</h4>
            <div className="stores-grid">
              <label className="store-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Card Kingdom</span>
              </label>
              <label className="store-checkbox">
                <input type="checkbox" defaultChecked={false} />
                <span>Star City Games</span>
              </label>
              <label className="store-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Cool Stuff Inc</span>
              </label>
              <label className="store-checkbox">
                <input type="checkbox" defaultChecked />
                <span>ABU Games</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <Button variant="ghost" onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </div>
      </div>
    );
  };
  
  // Render the history section
  const renderHistory = () => {
    return (
      <div className="history-section">
        <h3>Search History</h3>
        
        <div className="history-filters">
          <div className="filter-group">
            <input 
              type="text" 
              placeholder="Filter by search term..." 
              className="filter-input" 
            />
            <select className="filter-select">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <Button variant="slim">Filter</Button>
          </div>
          <Button variant="ghost">Clear History</Button>
        </div>
        
        <table className="history-table">
          <thead>
            <tr>
              <th>Search Query</th>
              <th>Date & Time</th>
              <th>Results</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {searchHistory.map(item => (
              <tr key={item.id}>
                <td className="query-cell">{item.query}</td>
                <td>{formatDate(item.date)}</td>
                <td>{item.results}</td>
                <td>
                  <a href={`/search?q=${encodeURIComponent(item.query)}`} className="repeat-search-link">
                    Repeat Search
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="pagination">
          <button disabled className="pagination-button">Previous</button>
          <span className="pagination-info">Page 1 of 1</span>
          <button disabled className="pagination-button">Next</button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="user-portal">
      <Navigation navItems={nav} />
      
      <div className="portal-content">
        {errorMessage ? (
          <div className="error-banner">{errorMessage}</div>
        ) : (
          <>
            <div className="portal-header">
              <h1>{title}</h1>
              <Button variant="ghost" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
            
            <div className="portal-layout">
              <div className="sidebar">
                <div className="user-info">
                  <div className="avatar">
                    {accountData?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{accountData?.name || 'User'}</div>
                    <div className="user-tier">{subscriptionData?.tier || 'Basic'} Plan</div>
                  </div>
                </div>
                
                <nav className="sidebar-nav">
                  <button 
                    className={`nav-item ${activeSection === PortalSection.Overview ? 'active' : ''}`}
                    onClick={() => setActiveSection(PortalSection.Overview)}
                  >
                    Dashboard
                  </button>
                  <button 
                    className={`nav-item ${activeSection === PortalSection.Account ? 'active' : ''}`}
                    onClick={() => setActiveSection(PortalSection.Account)}
                  >
                    Account
                  </button>
                  <button 
                    className={`nav-item ${activeSection === PortalSection.Subscription ? 'active' : ''}`}
                    onClick={() => setActiveSection(PortalSection.Subscription)}
                  >
                    Subscription
                  </button>
                  <button 
                    className={`nav-item ${activeSection === PortalSection.ApiKeys ? 'active' : ''}`}
                    onClick={() => setActiveSection(PortalSection.ApiKeys)}
                  >
                    API Keys
                  </button>
                  <button 
                    className={`nav-item ${activeSection === PortalSection.Preferences ? 'active' : ''}`}
                    onClick={() => setActiveSection(PortalSection.Preferences)}
                  >
                    Preferences
                  </button>
                  <button 
                    className={`nav-item ${activeSection === PortalSection.History ? 'active' : ''}`}
                    onClick={() => setActiveSection(PortalSection.History)}
                  >
                    History
                  </button>
                </nav>
              </div>
              
              <div className="main-content">
                {renderSectionContent()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPortal;