import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Search, Filter, AlertTriangle, CheckCircle, Clock, Users, Shield, FileText } from 'lucide-react';

interface User {
  username: string;
  role: string;
  permissions: string[];
}

interface PolicyManagementProps {
  user: User | null;
}

interface Policy {
  policy_id: string;
  policy_name: string;
  policy_type: string;
  status: 'active' | 'inactive' | 'draft';
  applicable_roles: string[];
  applicable_activities: string[];
  rules: PolicyRule[];
  created_at: string;
  updated_at: string;
  created_by: string;
  description?: string;
}

interface PolicyRule {
  type: string;
  name: string;
  description?: string;
  blocked_terms?: string[];
  required_terms?: string[];
  allowed_roles?: string[];
  restricted_activities?: string[];
  enforcement_actions: string[];
  max_length?: number;
  min_length?: number;
  threshold?: number;
  analysis_type?: string;
}

const PolicyManagement: React.FC<PolicyManagementProps> = ({ user }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize with sample policies
  useEffect(() => {
    const samplePolicies: Policy[] = [
      {
        policy_id: 'policy_001',
        policy_name: 'Content Safety Policy',
        policy_type: 'content_filter',
        status: 'active',
        applicable_roles: ['admin', 'analyst', 'user'],
        applicable_activities: ['prompt_submission', 'output_generation'],
        description: 'Filters harmful and inappropriate content from AI interactions',
        rules: [
          {
            type: 'content_filter',
            name: 'Harmful Content Filter',
            description: 'Blocks content containing violence, hate speech, or discrimination',
            blocked_terms: ['violence', 'hate', 'discrimination', 'harmful'],
            enforcement_actions: ['warn', 'block']
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-07T00:00:00Z',
        created_by: 'admin'
      },
      {
        policy_id: 'policy_002',
        policy_name: 'Privacy Protection Policy',
        policy_type: 'privacy',
        status: 'active',
        applicable_roles: ['admin', 'analyst', 'user'],
        applicable_activities: ['all'],
        description: 'Protects personal and sensitive information from exposure',
        rules: [
          {
            type: 'content_filter',
            name: 'PII Detection',
            description: 'Detects and blocks personally identifiable information',
            blocked_terms: ['ssn', 'social security', 'credit card', 'passport'],
            enforcement_actions: ['block', 'escalate']
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-05T00:00:00Z',
        created_by: 'admin'
      },
      {
        policy_id: 'policy_003',
        policy_name: 'Role-Based Access Control',
        policy_type: 'access_control',
        status: 'active',
        applicable_roles: ['user'],
        applicable_activities: ['admin_functions'],
        description: 'Controls access to administrative functions based on user roles',
        rules: [
          {
            type: 'role_restriction',
            name: 'Admin Function Restriction',
            description: 'Restricts access to admin functions for non-admin users',
            allowed_roles: ['admin'],
            restricted_activities: ['policy_management', 'user_management'],
            enforcement_actions: ['block']
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
        created_by: 'admin'
      },
      {
        policy_id: 'policy_004',
        policy_name: 'Content Length Policy',
        policy_type: 'content_validation',
        status: 'draft',
        applicable_roles: ['admin', 'analyst', 'user'],
        applicable_activities: ['prompt_submission'],
        description: 'Enforces content length limits for prompts',
        rules: [
          {
            type: 'content_length',
            name: 'Prompt Length Limit',
            description: 'Limits prompt length to prevent abuse',
            max_length: 5000,
            min_length: 10,
            enforcement_actions: ['warn']
          }
        ],
        created_at: '2024-01-06T00:00:00Z',
        updated_at: '2024-01-06T00:00:00Z',
        created_by: 'analyst'
      }
    ];
    
    setPolicies(samplePolicies);
    setFilteredPolicies(samplePolicies);
  }, []);

  // Filter policies based on search and filters
  useEffect(() => {
    let filtered = policies;

    if (searchTerm) {
      filtered = filtered.filter(policy =>
        policy.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.policy_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(policy => policy.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(policy => policy.policy_type === typeFilter);
    }

    setFilteredPolicies(filtered);
  }, [policies, searchTerm, statusFilter, typeFilter]);

  const handleCreatePolicy = () => {
    setSelectedPolicy(null);
    setShowCreateModal(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowEditModal(true);
  };

  const handleDeletePolicy = (policyId: string) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter(p => p.policy_id !== policyId));
    }
  };

  const handleToggleStatus = (policyId: string) => {
    setPolicies(policies.map(p => 
      p.policy_id === policyId 
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
        : p
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <X className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content_filter':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'privacy':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'access_control':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const PolicyForm = ({ policy, onSave, onCancel }: { 
    policy?: Policy | null; 
    onSave: (policy: Policy) => void; 
    onCancel: () => void; 
  }) => {
    const [formData, setFormData] = useState<Partial<Policy>>(
      policy || {
        policy_name: '',
        policy_type: 'content_filter',
        status: 'draft',
        applicable_roles: ['user'],
        applicable_activities: ['all'],
        description: '',
        rules: []
      }
    );

    const [newRule, setNewRule] = useState<Partial<PolicyRule>>({
      type: 'content_filter',
      name: '',
      description: '',
      enforcement_actions: ['warn']
    });

    const handleSave = () => {
      const policyToSave: Policy = {
        policy_id: policy?.policy_id || `policy_${Date.now()}`,
        policy_name: formData.policy_name || '',
        policy_type: formData.policy_type || 'content_filter',
        status: formData.status || 'draft',
        applicable_roles: formData.applicable_roles || ['user'],
        applicable_activities: formData.applicable_activities || ['all'],
        description: formData.description || '',
        rules: formData.rules || [],
        created_at: policy?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: policy?.created_by || user?.username || 'unknown'
      };

      onSave(policyToSave);
    };

    const addRule = () => {
      if (newRule.name) {
        const rule: PolicyRule = {
          type: newRule.type || 'content_filter',
          name: newRule.name,
          description: newRule.description,
          enforcement_actions: newRule.enforcement_actions || ['warn'],
          ...(newRule.blocked_terms && { blocked_terms: newRule.blocked_terms }),
          ...(newRule.required_terms && { required_terms: newRule.required_terms }),
          ...(newRule.allowed_roles && { allowed_roles: newRule.allowed_roles }),
          ...(newRule.restricted_activities && { restricted_activities: newRule.restricted_activities }),
          ...(newRule.max_length && { max_length: newRule.max_length }),
          ...(newRule.min_length && { min_length: newRule.min_length }),
          ...(newRule.threshold && { threshold: newRule.threshold })
        };

        setFormData({
          ...formData,
          rules: [...(formData.rules || []), rule]
        });

        setNewRule({
          type: 'content_filter',
          name: '',
          description: '',
          enforcement_actions: ['warn']
        });
      }
    };

    const removeRule = (index: number) => {
      setFormData({
        ...formData,
        rules: formData.rules?.filter((_, i) => i !== index) || []
      });
    };

    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Policy Name</label>
            <input
              type="text"
              value={formData.policy_name}
              onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter policy name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Policy Type</label>
            <select
              value={formData.policy_type}
              onChange={(e) => setFormData({ ...formData, policy_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="content_filter">Content Filter</option>
              <option value="privacy">Privacy Protection</option>
              <option value="access_control">Access Control</option>
              <option value="content_validation">Content Validation</option>
              <option value="ai_analysis">AI Analysis</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe what this policy does"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Roles</label>
            <div className="space-y-2">
              {['admin', 'analyst', 'user'].map(role => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.applicable_roles?.includes(role)}
                    onChange={(e) => {
                      const roles = formData.applicable_roles || [];
                      if (e.target.checked) {
                        setFormData({ ...formData, applicable_roles: [...roles, role] });
                      } else {
                        setFormData({ ...formData, applicable_roles: roles.filter(r => r !== role) });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'draft' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Rules Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Policy Rules</h4>
          
          {/* Existing Rules */}
          {formData.rules && formData.rules.length > 0 && (
            <div className="space-y-3 mb-4">
              {formData.rules.map((rule, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{rule.name}</h5>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {rule.type}
                        </span>
                        {rule.enforcement_actions.map((action, i) => (
                          <span key={i} className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => removeRule(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Rule */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-3">Add New Rule</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="content_filter">Content Filter</option>
                  <option value="role_restriction">Role Restriction</option>
                  <option value="content_length">Content Length</option>
                  <option value="ai_analysis">AI Analysis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rule name"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what this rule does"
              />
            </div>

            {/* Rule-specific fields */}
            {newRule.type === 'content_filter' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Blocked Terms (comma-separated)</label>
                <input
                  type="text"
                  value={newRule.blocked_terms?.join(', ') || ''}
                  onChange={(e) => setNewRule({ 
                    ...newRule, 
                    blocked_terms: e.target.value.split(',').map(term => term.trim()).filter(term => term)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="violence, hate, discrimination"
                />
              </div>
            )}

            {newRule.type === 'content_length' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Length</label>
                  <input
                    type="number"
                    value={newRule.min_length || ''}
                    onChange={(e) => setNewRule({ ...newRule, min_length: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                  <input
                    type="number"
                    value={newRule.max_length || ''}
                    onChange={(e) => setNewRule({ ...newRule, max_length: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Enforcement Actions</label>
              <div className="flex flex-wrap gap-2">
                {['warn', 'block', 'escalate', 'review'].map(action => (
                  <label key={action} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRule.enforcement_actions?.includes(action)}
                      onChange={(e) => {
                        const actions = newRule.enforcement_actions || [];
                        if (e.target.checked) {
                          setNewRule({ ...newRule, enforcement_actions: [...actions, action] });
                        } else {
                          setNewRule({ ...newRule, enforcement_actions: actions.filter(a => a !== action) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{action}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={addRule}
              disabled={!newRule.name}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              Add Rule
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.policy_name}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Policy</span>
          </button>
        </div>
      </div>
    );
  };

  const handleSavePolicy = (policy: Policy) => {
    if (selectedPolicy) {
      // Update existing policy
      setPolicies(policies.map(p => p.policy_id === policy.policy_id ? policy : p));
    } else {
      // Add new policy
      setPolicies([...policies, policy]);
    }
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedPolicy(null);
  };

  // Check if user has permission to manage policies
  const canManagePolicies = user?.permissions?.includes('admin') || user?.permissions?.includes('policy_manage');

  if (!canManagePolicies) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">📋 Policy Management</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-800 text-lg">Access Denied</p>
          <p className="text-yellow-600 mt-2">You don't have permission to manage policies. Contact your administrator for access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📋 Policy Management</h1>
        <button
          onClick={handleCreatePolicy}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Policy</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-700">Manage governance policies that control AI system behavior, content filtering, and access control.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search policies..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="content_filter">Content Filter</option>
              <option value="privacy">Privacy</option>
              <option value="access_control">Access Control</option>
              <option value="content_validation">Content Validation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Policies List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rules
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPolicies.map((policy) => (
                <tr key={policy.policy_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{policy.policy_name}</div>
                      <div className="text-sm text-gray-500">{policy.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(policy.policy_type)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {policy.policy_type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(policy.status)}
                      <span className={`ml-2 text-sm font-medium capitalize ${
                        policy.status === 'active' ? 'text-green-600' :
                        policy.status === 'inactive' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {policy.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {policy.applicable_roles.map((role) => (
                        <span
                          key={role}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {policy.rules.length} rule{policy.rules.length !== 1 ? 's' : ''}
                
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(policy.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(policy.policy_id)}
                        className={`px-2 py-1 rounded text-xs ${
                          policy.status === 'active'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {policy.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEditPolicy(policy)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePolicy(policy.policy_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Policy</h2>
            </div>
            <div className="p-6">
              <PolicyForm
                onSave={handleSavePolicy}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Policy Modal */}
      {showEditModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Policy</h2>
            </div>
            <div className="p-6">
              <PolicyForm
                policy={selectedPolicy}
                onSave={handleSavePolicy}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedPolicy(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyManagement;