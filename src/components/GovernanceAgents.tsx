import React, { useState } from 'react';
import { Shield, Search, AlertTriangle, FileText, Lightbulb, MessageSquare } from 'lucide-react';
import { usePromptAnalysis, useOutputAudit } from '../hooks/useGovernance';

interface User {
  username: string;
  role: string;
  permissions: string[];
}

interface GovernanceAgentsProps {
  user: User | null;
}

const GovernanceAgents: React.FC<GovernanceAgentsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('prompt-guard');
  const [promptText, setPromptText] = useState('');
  const [outputText, setOutputText] = useState('');
  
  // Use governance hooks
  const { data: promptAnalysis, loading: promptLoading, error: promptError, analyzePrompt } = usePromptAnalysis();
  const { data: outputAudit, loading: outputLoading, error: outputError, auditOutput } = useOutputAudit();

  const tabs = [
    { id: 'prompt-guard', label: 'Prompt Guard', icon: Shield },
    { id: 'output-auditor', label: 'Output Auditor', icon: Search },
    { id: 'policy-enforcer', label: 'Policy Enforcer', icon: AlertTriangle },
    { id: 'audit-logger', label: 'Audit Logger', icon: FileText },
    { id: 'advisory', label: 'Advisory', icon: Lightbulb },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare }
  ];

  const handlePromptAnalysis = async () => {
    if (!promptText.trim()) return;
    
    try {
      await analyzePrompt(promptText);
    } catch (error) {
      console.error('Prompt analysis failed:', error);
    }
  };

  const handleOutputAudit = async () => {
    if (!outputText.trim()) return;
    
    try {
      await auditOutput(outputText, { prompt: promptText });
    } catch (error) {
      console.error('Output audit failed:', error);
    }
  };

  const renderPromptGuard = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">🛡️ Prompt Guard Agent</h3>
        <p className="text-blue-700">Screens GenAI inputs for compliance issues and potential risks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Prompt Input
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a prompt to test for compliance..."
          />
          <button
            onClick={handlePromptAnalysis}
            disabled={!promptText || promptLoading}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
          >
            {promptLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{promptLoading ? 'Analyzing...' : 'Analyze Prompt'}</span>
          </button>

          {promptError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error: {promptError}</p>
            </div>
          )}

          {promptAnalysis && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Analysis Results</h4>
              
              {/* Extract the actual prompt guard results */}
              {(() => {
                const promptGuardResult = promptAnalysis.prompt_guard || promptAnalysis;
                const policyEnforcerResult = promptAnalysis.policy_enforcer;
                
                return (
                  <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    promptGuardResult.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    promptGuardResult.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {promptGuardResult.status}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{promptGuardResult.risk_score?.toFixed(1) || '0.0'}</p>
                  <p className="text-sm text-gray-600">Risk Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{promptGuardResult.confidence?.toFixed(1) || '0.0'}%</p>
                  <p className="text-sm text-gray-600">Confidence</p>
                </div>
              </div>

              {promptGuardResult.policy_violations?.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-red-800 mb-2">Policy Violations</h5>
                  {promptGuardResult.policy_violations.map((issue: string, index: number) => (
                    <div key={index} className="text-red-700 text-sm">• {issue}</div>
                  ))}
                </div>
              )}

              {promptGuardResult.content_flags?.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-yellow-800 mb-2">Content Flags</h5>
                  {promptGuardResult.content_flags.map((flag: string, index: number) => (
                    <div key={index} className="text-yellow-700 text-sm">• {flag}</div>
                  ))}
                </div>
              )}

              {promptGuardResult.suggestions?.length > 0 && (
                <div>
                  <h5 className="font-medium text-blue-800 mb-2">Suggestions</h5>
                  {promptGuardResult.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="text-blue-700 text-sm">• {suggestion}</div>
                  ))}
                </div>
              )}
              
              {/* Show policy enforcement results if available */}
              {policyEnforcerResult && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-800 mb-2">Policy Enforcement</h5>
                  <div className="text-sm text-gray-600">
                    <p>Status: <span className={`font-medium ${policyEnforcerResult.allowed ? 'text-green-600' : 'text-red-600'}`}>
                      {policyEnforcerResult.allowed ? 'Allowed' : 'Blocked'}
                    </span></p>
                    <p>Policies Evaluated: {policyEnforcerResult.applicable_policies_count || 0}</p>
                    {policyEnforcerResult.enforcement_actions?.length > 0 && (
                      <p>Actions: {policyEnforcerResult.enforcement_actions.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">2024-01-0{i} 14:3{i}</p>
                <p className="text-sm text-gray-600">Status: {i % 2 === 0 ? 'APPROVED' : 'WARNING'}</p>
                <p className="text-sm text-gray-600">Risk: {(Math.random() * 10).toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOutputAuditor = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-900 mb-2">🔍 Output Auditor Agent</h3>
        <p className="text-green-700">Reviews GenAI outputs for bias, fairness, and compliance.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Output to Audit
          </label>
          <textarea
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Paste AI-generated content here for bias and fairness analysis..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Audit Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Bias Detection</option>
              <option>Toxicity Check</option>
              <option>Fairness Analysis</option>
              <option>Content Policy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sensitivity Level</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOutputAudit}
          disabled={!outputText || outputLoading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          {outputLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>{outputLoading ? 'Auditing...' : 'Audit Output'}</span>
        </button>

        {outputError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Error: {outputError}</p>
          </div>
        )}

        {outputAudit && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Audit Results</h4>
            
            {/* Extract the actual output auditor results */}
            {(() => {
              const outputAuditorResult = outputAudit.output_auditor || outputAudit;
              const policyEnforcerResult = outputAudit.policy_enforcer;
              
              return (
                <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{outputAuditorResult.bias_score?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-gray-600">Bias Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{outputAuditorResult.toxicity_score?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-gray-600">Toxicity Level</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{outputAuditorResult.fairness_score?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-gray-600">Fairness Rating</p>
              </div>
            </div>

            <div className="mb-4">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                outputAuditorResult.audit_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                outputAuditorResult.audit_status === 'REVIEW_RECOMMENDED' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {outputAuditorResult.audit_status || 'UNKNOWN'}
              </div>
            </div>

            {outputAuditorResult.policy_violations?.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-red-800 mb-2">Policy Violations</h5>
                {outputAuditorResult.policy_violations.map((violation: string, index: number) => (
                  <div key={index} className="text-red-700 text-sm">• {violation}</div>
                ))}
              </div>
            )}

            {outputAuditorResult.recommendations?.length > 0 && (
              <div>
                <h5 className="font-medium text-blue-800 mb-2">Recommendations</h5>
                {outputAuditorResult.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="text-blue-700 text-sm">• {rec}</div>
                ))}
              </div>
            )}
            
            {/* Show policy enforcement results if available */}
            {policyEnforcerResult && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-800 mb-2">Policy Enforcement</h5>
                <div className="text-sm text-gray-600">
                  <p>Status: <span className={`font-medium ${policyEnforcerResult.allowed ? 'text-green-600' : 'text-red-600'}`}>
                    {policyEnforcerResult.allowed ? 'Allowed' : 'Blocked'}
                  </span></p>
                  <p>Policies Evaluated: {policyEnforcerResult.applicable_policies_count || 0}</p>
                </div>
              </div>
            )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, description: string) => (
    <div className="text-center py-12">
      <div className="bg-gray-100 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
        <p className="text-sm text-gray-500 mt-4">This interface would be implemented here</p>
      </div>
    </div>
  );

  const renderPolicyEnforcer = () => {
    const [testContent, setTestContent] = useState('');
    const [activityType, setActivityType] = useState('prompt_submission');
    const [enforcementResult, setEnforcementResult] = useState<any>(null);
    const [enforcementLoading, setEnforcementLoading] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState('all');
    
    // Mock policy enforcement data
    const activePolicies = [
      {
        id: 'policy_001',
        name: 'Content Safety Policy',
        type: 'content_filter',
        status: 'active',
        rules: 3,
        last_triggered: '2024-01-07T14:30:00Z'
      },
      {
        id: 'policy_002',
        name: 'Privacy Protection Policy',
        type: 'privacy',
        status: 'active',
        rules: 2,
        last_triggered: '2024-01-07T13:45:00Z'
      },
      {
        id: 'policy_003',
        name: 'Role-Based Access Control',
        type: 'access_control',
        status: 'active',
        rules: 1,
        last_triggered: '2024-01-07T12:15:00Z'
      }
    ];

    const recentEnforcements = [
      {
        id: 1,
        timestamp: '2024-01-07T14:30:00Z',
        policy: 'Content Safety Policy',
        action: 'BLOCKED',
        reason: 'Harmful content detected',
        user_role: 'user',
        activity: 'prompt_submission'
      },
      {
        id: 2,
        timestamp: '2024-01-07T14:25:00Z',
        policy: 'Privacy Protection Policy',
        action: 'WARNING',
        reason: 'PII detected in content',
        user_role: 'analyst',
        activity: 'output_generation'
      },
      {
        id: 3,
        timestamp: '2024-01-07T14:20:00Z',
        policy: 'Role-Based Access Control',
        action: 'ALLOWED',
        reason: 'User has required permissions',
        user_role: 'admin',
        activity: 'policy_management'
      },
      {
        id: 4,
        timestamp: '2024-01-07T14:15:00Z',
        policy: 'Content Safety Policy',
        action: 'ESCALATED',
        reason: 'Multiple violations detected',
        user_role: 'user',
        activity: 'prompt_submission'
      }
    ];

    const handlePolicyTest = async () => {
      if (!testContent.trim()) return;
      
      setEnforcementLoading(true);
      
      // Simulate policy enforcement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock enforcement result
      const mockResult = {
        allowed: Math.random() > 0.3,
        policy_results: [
          {
            policy_name: 'Content Safety Policy',
            allowed: Math.random() > 0.4,
            violations: Math.random() > 0.6 ? [] : ['Potentially harmful content detected'],
            actions: Math.random() > 0.5 ? [] : ['warn'],
            rule_count: 3
          },
          {
            policy_name: 'Privacy Protection Policy',
            allowed: Math.random() > 0.2,
            violations: Math.random() > 0.7 ? [] : ['PII pattern detected'],
            actions: Math.random() > 0.6 ? [] : ['block'],
            rule_count: 2
          }
        ],
        enforcement_actions: Math.random() > 0.5 ? [] : ['warn', 'log'],
        applicable_policies_count: 2,
        user_role: user?.role?.toLowerCase() || 'user',
        activity_type: activityType,
        processed_at: new Date().toISOString()
      };
      
      setEnforcementResult(mockResult);
      setEnforcementLoading(false);
    };

    const getActionColor = (action: string) => {
      switch (action.toLowerCase()) {
        case 'allowed': return 'bg-green-100 text-green-800';
        case 'blocked': return 'bg-red-100 text-red-800';
        case 'warning': return 'bg-yellow-100 text-yellow-800';
        case 'escalated': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">⚖️ Policy Enforcer Agent</h3>
          <p className="text-orange-700">Dynamically applies governance rules based on user roles and activity type.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Policy Testing Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Content Input */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Policy Enforcement Testing</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="prompt_submission">Prompt Submission</option>
                      <option value="output_generation">Output Generation</option>
                      <option value="policy_management">Policy Management</option>
                      <option value="user_management">User Management</option>
                      <option value="data_access">Data Access</option>
                      <option value="system_configuration">System Configuration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Policy</label>
                    <select
                      value={selectedPolicy}
                      onChange={(e) => setSelectedPolicy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="all">All Active Policies</option>
                      {activePolicies.map(policy => (
                        <option key={policy.id} value={policy.id}>{policy.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content to Test
                  </label>
                  <textarea
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter content to test against active policies..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Current User Context</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Role:</strong> {user?.role || 'Unknown'}</p>
                    <p><strong>Permissions:</strong> {user?.permissions?.join(', ') || 'None'}</p>
                    <p><strong>Username:</strong> {user?.username || 'Anonymous'}</p>
                  </div>
                </div>

                <button
                  onClick={handlePolicyTest}
                  disabled={!testContent || enforcementLoading}
                  className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
                >
                  {enforcementLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{enforcementLoading ? 'Enforcing Policies...' : 'Test Policy Enforcement'}</span>
                </button>
              </div>
            </div>

            {/* Enforcement Results */}
            {enforcementResult && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4">Enforcement Results</h4>
                
                {/* Overall Result */}
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Overall Decision</h5>
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      enforcementResult.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {enforcementResult.allowed ? 'ALLOWED' : 'BLOCKED'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{enforcementResult.applicable_policies_count}</p>
                      <p className="text-sm text-gray-600">Policies Evaluated</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {enforcementResult.policy_results.filter((p: any) => !p.allowed).length}
                      </p>
                      <p className="text-sm text-gray-600">Violations Found</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{enforcementResult.enforcement_actions.length}</p>
                      <p className="text-sm text-gray-600">Actions Triggered</p>
                    </div>
                  </div>
                </div>

                {/* Policy Results */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Policy Evaluation Details</h5>
                  {enforcementResult.policy_results.map((result: any, index: number) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-medium text-gray-900">{result.policy_name}</h6>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          result.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.allowed ? 'PASSED' : 'FAILED'}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span>Rules Evaluated: {result.rule_count}</span>
                      </div>

                      {result.violations.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-800 mb-1">Violations:</p>
                          {result.violations.map((violation: string, vIndex: number) => (
                            <div key={vIndex} className="text-sm text-red-700">• {violation}</div>
                          ))}
                        </div>
                      )}

                      {result.actions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-orange-800 mb-1">Actions:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.actions.map((action: string, aIndex: number) => (
                              <span key={aIndex} className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Enforcement Actions */}
                {enforcementResult.enforcement_actions.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-medium text-yellow-900 mb-2">Enforcement Actions Applied</h5>
                    <div className="flex flex-wrap gap-2">
                      {enforcementResult.enforcement_actions.map((action: string, index: number) => (
                        <span key={index} className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Active Policies & Recent Activity */}
          <div className="space-y-6">
            {/* Active Policies */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Active Policies</h4>
              <div className="space-y-3">
                {activePolicies.map((policy) => (
                  <div key={policy.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900">{policy.name}</h5>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {policy.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Type: {policy.type}</p>
                      <p>Rules: {policy.rules}</p>
                      <p>Last triggered: {new Date(policy.last_triggered).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Enforcement Activity */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Recent Enforcement Activity</h4>
              <div className="space-y-3">
                {recentEnforcements.map((enforcement) => (
                  <div key={enforcement.id} className="border-l-4 border-gray-200 pl-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {new Date(enforcement.timestamp).toLocaleString()}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${getActionColor(enforcement.action)}`}>
                        {enforcement.action}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{enforcement.policy}</p>
                    <p className="text-xs text-gray-600">{enforcement.reason}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      <span>Role: {enforcement.user_role}</span> • 
                      <span> Activity: {enforcement.activity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy Statistics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Enforcement Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Enforcements Today</span>
                  <span className="text-sm font-medium text-gray-900">247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Blocked Actions</span>
                  <span className="text-sm font-medium text-red-600">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Warnings Issued</span>
                  <span className="text-sm font-medium text-yellow-600">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Allowed Actions</span>
                  <span className="text-sm font-medium text-green-600">179</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Compliance Rate</span>
                    <span className="text-sm font-medium text-blue-600">90.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'prompt-guard':
        return renderPromptGuard();
      case 'output-auditor':
        return renderOutputAuditor();
      case 'policy-enforcer':
        return renderPolicyEnforcer();
      case 'audit-logger':
        return renderPlaceholder('Audit Logger Agent', 'Comprehensive logging of all interactions and agent decisions.');
      case 'advisory':
        return renderPlaceholder('Advisory Agent', 'Provides explanations and suggests compliant alternatives.');
      case 'feedback':
        return renderPlaceholder('Feedback Agent', 'Collect and analyze user feedback to improve the governance system.');
      default:
        return renderPromptGuard();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🤖 Governance Agents</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default GovernanceAgents;