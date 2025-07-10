import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Save, X, AlertTriangle, Shield, FileText, Users, Clock, Settings } from 'lucide-react';

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
  description?: string;
}

interface PolicyRule {
  type: string;
  name: string;
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
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // 模拟策略数据
  useEffect(() => {
    const mockPolicies: Policy[] = [
      {
        policy_id: 'policy_001',
        policy_name: 'Content Safety Policy',
        policy_type: 'content_filter',
        status: 'active',
        applicable_roles: ['admin', 'analyst', 'user'],
        applicable_activities: ['prompt_submission', 'output_generation'],
        description: '防止有害内容和不当语言的基础内容安全策略',
        rules: [
          {
            type: 'content_filter',
            name: 'Harmful Content Filter',
            blocked_terms: ['violence', 'hate', 'discrimination', 'harassment'],
            enforcement_actions: ['warn', 'block']
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-07T00:00:00Z'
      },
      {
        policy_id: 'policy_002',
        policy_name: 'Privacy Protection Policy',
        policy_type: 'privacy',
        status: 'active',
        applicable_roles: ['admin', 'analyst', 'user'],
        applicable_activities: ['all'],
        description: '保护个人信息和敏感数据的隐私策略',
        rules: [
          {
            type: 'content_filter',
            name: 'PII Detection',
            blocked_terms: ['ssn', 'social security', 'credit card', 'phone number'],
            enforcement_actions: ['block', 'escalate']
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-05T00:00:00Z'
      },
      {
        policy_id: 'policy_003',
        policy_name: 'Role-Based Access Control',
        policy_type: 'access_control',
        status: 'active',
        applicable_roles: ['user'],
        applicable_activities: ['admin_functions'],
        description: '基于用户角色的访问控制策略',
        rules: [
          {
            type: 'role_restriction',
            name: 'Admin Function Restriction',
            allowed_roles: ['admin'],
            restricted_activities: ['policy_management', 'user_management'],
            enforcement_actions: ['block']
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      },
      {
        policy_id: 'policy_004',
        policy_name: 'Content Length Policy',
        policy_type: 'content_validation',
        status: 'draft',
        applicable_roles: ['user', 'analyst'],
        applicable_activities: ['prompt_submission'],
        description: '限制输入内容长度的策略',
        rules: [
          {
            type: 'content_length',
            name: 'Maximum Content Length',
            max_length: 5000,
            min_length: 10,
            enforcement_actions: ['warn', 'block']
          }
        ],
        created_at: '2024-01-06T00:00:00Z',
        updated_at: '2024-01-06T00:00:00Z'
      }
    ];
    setPolicies(mockPolicies);
  }, []);

  // 过滤策略
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || policy.policy_type === filterType;
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // 创建新策略
  const createNewPolicy = () => {
    const newPolicy: Policy = {
      policy_id: `policy_${Date.now()}`,
      policy_name: '',
      policy_type: 'content_filter',
      status: 'draft',
      applicable_roles: ['user'],
      applicable_activities: ['all'],
      description: '',
      rules: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedPolicy(newPolicy);
    setIsCreating(true);
    setIsEditing(true);
    setViewMode('edit');
  };

  // 保存策略
  const savePolicy = () => {
    if (!selectedPolicy) return;

    if (isCreating) {
      setPolicies([...policies, selectedPolicy]);
      setIsCreating(false);
    } else {
      setPolicies(policies.map(p => 
        p.policy_id === selectedPolicy.policy_id 
          ? { ...selectedPolicy, updated_at: new Date().toISOString() }
          : p
      ));
    }
    setIsEditing(false);
    setViewMode('detail');
  };

  // 删除策略
  const deletePolicy = (policyId: string) => {
    if (confirm('确定要删除这个策略吗？')) {
      setPolicies(policies.filter(p => p.policy_id !== policyId));
      if (selectedPolicy?.policy_id === policyId) {
        setSelectedPolicy(null);
        setViewMode('list');
      }
    }
  };

  // 添加新规则
  const addRule = () => {
    if (!selectedPolicy) return;
    
    const newRule: PolicyRule = {
      type: 'content_filter',
      name: '',
      enforcement_actions: ['warn']
    };
    
    setSelectedPolicy({
      ...selectedPolicy,
      rules: [...selectedPolicy.rules, newRule]
    });
  };

  // 删除规则
  const removeRule = (index: number) => {
    if (!selectedPolicy) return;
    
    setSelectedPolicy({
      ...selectedPolicy,
      rules: selectedPolicy.rules.filter((_, i) => i !== index)
    });
  };

  // 更新规则
  const updateRule = (index: number, updatedRule: PolicyRule) => {
    if (!selectedPolicy) return;
    
    const newRules = [...selectedPolicy.rules];
    newRules[index] = updatedRule;
    
    setSelectedPolicy({
      ...selectedPolicy,
      rules: newRules
    });
  };

  // 策略类型图标
  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'content_filter': return <Shield className="h-5 w-5" />;
      case 'privacy': return <Eye className="h-5 w-5" />;
      case 'access_control': return <Users className="h-5 w-5" />;
      case 'content_validation': return <FileText className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  // 状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 渲染策略列表
  const renderPolicyList = () => (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 策略管理</h1>
          <p className="text-gray-600 mt-1">管理AI治理策略和规则</p>
        </div>
        
        {user?.permissions.includes('admin') && (
          <button
            onClick={createNewPolicy}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>创建策略</span>
          </button>
        )}
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="搜索策略名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有类型</option>
              <option value="content_filter">内容过滤</option>
              <option value="privacy">隐私保护</option>
              <option value="access_control">访问控制</option>
              <option value="content_validation">内容验证</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有状态</option>
              <option value="active">激活</option>
              <option value="inactive">停用</option>
              <option value="draft">草稿</option>
            </select>
          </div>
        </div>
      </div>

      {/* 策略列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPolicies.map((policy) => (
          <div key={policy.policy_id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  {getPolicyTypeIcon(policy.policy_type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{policy.policy_name}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(policy.status)}`}>
                    {policy.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setSelectedPolicy(policy);
                    setViewMode('detail');
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="查看详情"
                >
                  <Eye className="h-4 w-4" />
                </button>
                
                {user?.permissions.includes('admin') && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setIsEditing(true);
                        setViewMode('edit');
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="编辑"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePolicy(policy.policy_id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {policy.description || '暂无描述'}
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>适用角色: {policy.applicable_roles.join(', ')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>规则数量: {policy.rules.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>更新时间: {new Date(policy.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到策略</h3>
            <p className="text-gray-600">尝试调整搜索条件或创建新的策略</p>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染策略详情
  const renderPolicyDetail = () => {
    if (!selectedPolicy) return null;

    return (
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedPolicy.policy_name}</h1>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedPolicy.status)}`}>
                {selectedPolicy.status}
              </span>
            </div>
          </div>
          
          {user?.permissions.includes('admin') && !isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setViewMode('edit');
              }}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>编辑策略</span>
            </button>
          )}
        </div>

        {/* 策略信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">策略名称</label>
                <p className="text-gray-900">{selectedPolicy.policy_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">策略类型</label>
                <p className="text-gray-900">{selectedPolicy.policy_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">描述</label>
                <p className="text-gray-900">{selectedPolicy.description || '暂无描述'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">创建时间</label>
                <p className="text-gray-900">{new Date(selectedPolicy.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">更新时间</label>
                <p className="text-gray-900">{new Date(selectedPolicy.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">适用范围</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">适用角色</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPolicy.applicable_roles.map((role, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">适用活动</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPolicy.applicable_activities.map((activity, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 规则列表 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">策略规则</h3>
          {selectedPolicy.rules.length > 0 ? (
            <div className="space-y-4">
              {selectedPolicy.rules.map((rule, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{rule.name || `规则 ${index + 1}`}</h4>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {rule.type}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {rule.blocked_terms && (
                      <div>
                        <label className="font-medium text-gray-700">禁用词汇</label>
                        <p className="text-gray-600">{rule.blocked_terms.join(', ')}</p>
                      </div>
                    )}
                    {rule.required_terms && (
                      <div>
                        <label className="font-medium text-gray-700">必需词汇</label>
                        <p className="text-gray-600">{rule.required_terms.join(', ')}</p>
                      </div>
                    )}
                    {rule.allowed_roles && (
                      <div>
                        <label className="font-medium text-gray-700">允许角色</label>
                        <p className="text-gray-600">{rule.allowed_roles.join(', ')}</p>
                      </div>
                    )}
                    {rule.max_length && (
                      <div>
                        <label className="font-medium text-gray-700">最大长度</label>
                        <p className="text-gray-600">{rule.max_length}</p>
                      </div>
                    )}
                    <div>
                      <label className="font-medium text-gray-700">执行动作</label>
                      <p className="text-gray-600">{rule.enforcement_actions.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无规则</p>
          )}
        </div>
      </div>
    );
  };

  // 渲染策略编辑
  const renderPolicyEdit = () => {
    if (!selectedPolicy) return null;

    return (
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
                setViewMode(isCreating ? 'list' : 'detail');
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isCreating ? '创建策略' : '编辑策略'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
                setViewMode(isCreating ? 'list' : 'detail');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={savePolicy}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>保存策略</span>
            </button>
          </div>
        </div>

        {/* 编辑表单 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">策略名称</label>
                <input
                  type="text"
                  value={selectedPolicy.policy_name}
                  onChange={(e) => setSelectedPolicy({...selectedPolicy, policy_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入策略名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">策略类型</label>
                <select
                  value={selectedPolicy.policy_type}
                  onChange={(e) => setSelectedPolicy({...selectedPolicy, policy_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="content_filter">内容过滤</option>
                  <option value="privacy">隐私保护</option>
                  <option value="access_control">访问控制</option>
                  <option value="content_validation">内容验证</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={selectedPolicy.status}
                  onChange={(e) => setSelectedPolicy({...selectedPolicy, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">草稿</option>
                  <option value="active">激活</option>
                  <option value="inactive">停用</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={selectedPolicy.description || ''}
                  onChange={(e) => setSelectedPolicy({...selectedPolicy, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="输入策略描述"
                />
              </div>
            </div>
          </div>

          {/* 适用范围 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">适用范围</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">适用角色</label>
                <div className="space-y-2">
                  {['admin', 'analyst', 'user'].map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPolicy.applicable_roles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPolicy({
                              ...selectedPolicy,
                              applicable_roles: [...selectedPolicy.applicable_roles, role]
                            });
                          } else {
                            setSelectedPolicy({
                              ...selectedPolicy,
                              applicable_roles: selectedPolicy.applicable_roles.filter(r => r !== role)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">适用活动</label>
                <div className="space-y-2">
                  {['all', 'prompt_submission', 'output_generation', 'admin_functions'].map((activity) => (
                    <label key={activity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPolicy.applicable_activities.includes(activity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPolicy({
                              ...selectedPolicy,
                              applicable_activities: [...selectedPolicy.applicable_activities, activity]
                            });
                          } else {
                            setSelectedPolicy({
                              ...selectedPolicy,
                              applicable_activities: selectedPolicy.applicable_activities.filter(a => a !== activity)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{activity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 规则编辑 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">策略规则</h3>
            <button
              onClick={addRule}
              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>添加规则</span>
            </button>
          </div>
          
          {selectedPolicy.rules.length > 0 ? (
            <div className="space-y-4">
              {selectedPolicy.rules.map((rule, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">规则 {index + 1}</h4>
                    <button
                      onClick={() => removeRule(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">规则名称</label>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => updateRule(index, {...rule, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="输入规则名称"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">规则类型</label>
                      <select
                        value={rule.type}
                        onChange={(e) => updateRule(index, {...rule, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="content_filter">内容过滤</option>
                        <option value="role_restriction">角色限制</option>
                        <option value="content_length">内容长度</option>
                        <option value="ai_analysis">AI分析</option>
                      </select>
                    </div>
                    
                    {rule.type === 'content_filter' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">禁用词汇 (逗号分隔)</label>
                          <input
                            type="text"
                            value={rule.blocked_terms?.join(', ') || ''}
                            onChange={(e) => updateRule(index, {
                              ...rule, 
                              blocked_terms: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="输入禁用词汇"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">必需词汇 (逗号分隔)</label>
                          <input
                            type="text"
                            value={rule.required_terms?.join(', ') || ''}
                            onChange={(e) => updateRule(index, {
                              ...rule, 
                              required_terms: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="输入必需词汇"
                          />
                        </div>
                      </>
                    )}
                    
                    {rule.type === 'content_length' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">最大长度</label>
                          <input
                            type="number"
                            value={rule.max_length || ''}
                            onChange={(e) => updateRule(index, {...rule, max_length: parseInt(e.target.value) || undefined})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="输入最大长度"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">最小长度</label>
                          <input
                            type="number"
                            value={rule.min_length || ''}
                            onChange={(e) => updateRule(index, {...rule, min_length: parseInt(e.target.value) || undefined})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="输入最小长度"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">执行动作</label>
                      <div className="flex flex-wrap gap-2">
                        {['warn', 'block', 'escalate', 'review'].map((action) => (
                          <label key={action} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={rule.enforcement_actions.includes(action)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateRule(index, {
                                    ...rule,
                                    enforcement_actions: [...rule.enforcement_actions, action]
                                  });
                                } else {
                                  updateRule(index, {
                                    ...rule,
                                    enforcement_actions: rule.enforcement_actions.filter(a => a !== action)
                                  });
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无规则，点击"添加规则"开始创建</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 主渲染
  return (
    <div className="p-6">
      {viewMode === 'list' && renderPolicyList()}
      {viewMode === 'detail' && renderPolicyDetail()}
      {viewMode === 'edit' && renderPolicyEdit()}
    </div>
  );
};

export default PolicyManagement;