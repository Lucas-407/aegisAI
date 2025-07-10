import React, { useState } from 'react';
import { Shield, Search, AlertTriangle, FileText, Lightbulb, MessageSquare, TrendingUp, CheckCircle, Activity, Database, Clock, Calendar, Download, RefreshCw, Settings, Star } from 'lucide-react';
import { usePromptAnalysis, useOutputAudit, useAdvisory, useFeedbackSubmission } from '../hooks/useGovernance';

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
  
  // Advisory Agent state - moved to top level to avoid conditional hook calls
  const [advisoryType, setAdvisoryType] = useState('prompt_blocked');
  const [advisoryContext, setAdvisoryContext] = useState('');
  const [violations, setViolations] = useState<string[]>([]);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [newViolation, setNewViolation] = useState('');
  const [newRiskFactor, setNewRiskFactor] = useState('');
  
  // Policy Enforcer state - moved to top level to avoid hooks error
  const [testContent, setTestContent] = useState('');
  const [activityType, setActivityType] = useState('prompt_submission');
  const [enforcementResult, setEnforcementResult] = useState<any>(null);
  const [enforcementLoading, setEnforcementLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState('all');
  
  // Audit Logger state
  const [auditTimeRange, setAuditTimeRange] = useState('24h');
  const [auditFilter, setAuditFilter] = useState('all');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  
  // Feedback Agent state
  const [feedbackType, setFeedbackType] = useState('Bug Report');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Use governance hooks
  const { data: promptAnalysis, loading: promptLoading, error: promptError, analyzePrompt } = usePromptAnalysis();
  const { data: outputAudit, loading: outputLoading, error: outputError, auditOutput } = useOutputAudit();
  const { data: advisoryResult, loading: advisoryLoading, error: advisoryError, getAdvisory } = useAdvisory();
  const { data: feedbackResult, loading: feedbackLoading, error: feedbackError, submitFeedback } = useFeedbackSubmission();

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

  const handlePolicyEnforcement = async () => {
    if (!testContent.trim()) return;
    
    setEnforcementLoading(true);
    
    // Simulate policy enforcement
    setTimeout(() => {
      const mockResult = {
        allowed: Math.random() > 0.3,
        policy_results: [
          {
            policy_name: 'Content Safety Policy',
            allowed: Math.random() > 0.4,
            violations: Math.random() > 0.5 ? [] : ['Potential harmful content detected'],
            actions: Math.random() > 0.6 ? [] : ['warn']
          },
          {
            policy_name: 'Privacy Protection Policy',
            allowed: Math.random() > 0.2,
            violations: Math.random() > 0.7 ? [] : ['PII detected in content'],
            actions: Math.random() > 0.8 ? [] : ['block']
          }
        ],
        enforcement_actions: Math.random() > 0.5 ? [] : ['warn', 'review'],
        user_role: user?.role || 'user',
        activity_type: activityType
      };
      
      setEnforcementResult(mockResult);
      setEnforcementLoading(false);
    }, 1500);
  };

  const handleAdvisoryRequest = async () => {
    try {
      await getAdvisory({
        advisory_type: advisoryType,
        context: { description: advisoryContext },
        violations: violations,
        risk_factors: riskFactors
      });
    } catch (error) {
      console.error('Advisory request failed:', error);
    }
  };

  const addViolation = () => {
    if (newViolation.trim() && !violations.includes(newViolation.trim())) {
      setViolations([...violations, newViolation.trim()]);
      setNewViolation('');
    }
  };

  const removeViolation = (index: number) => {
    setViolations(violations.filter((_, i) => i !== index));
  };

  const addRiskFactor = () => {
    if (newRiskFactor.trim() && !riskFactors.includes(newRiskFactor.trim())) {
      setRiskFactors([...riskFactors, newRiskFactor.trim()]);
      setNewRiskFactor('');
    }
  };

  const removeRiskFactor = (index: number) => {
    setRiskFactors(riskFactors.filter((_, i) => i !== index));
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    
    // Simulate loading audit logs
    setTimeout(() => {
      const mockLogs = [
        {
          id: 'log_001',
          timestamp: '2024-01-07T14:30:00Z',
          agent_name: 'PromptGuardAgent',
          event_type: 'prompt_analysis',
          user_id: user?.username || 'unknown',
          activity_details: { prompt_length: 156, risk_score: 2.3 },
          compliance_status: 'compliant',
          risk_level: 'low'
        },
        {
          id: 'log_002',
          timestamp: '2024-01-07T14:25:00Z',
          agent_name: 'OutputAuditorAgent',
          event_type: 'output_audit',
          user_id: user?.username || 'unknown',
          activity_details: { output_length: 342, bias_score: 1.8 },
          compliance_status: 'compliant',
          risk_level: 'low'
        },
        {
          id: 'log_003',
          timestamp: '2024-01-07T14:20:00Z',
          agent_name: 'PolicyEnforcerAgent',
          event_type: 'policy_enforcement',
          user_id: user?.username || 'unknown',
          activity_details: { policies_checked: 3, violations: 0 },
          compliance_status: 'compliant',
          risk_level: 'low'
        }
      ];
      
      setAuditLogs(mockLogs);
      setAuditLoading(false);
    }, 1000);
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'Agent', 'Event Type', 'User', 'Compliance Status', 'Risk Level'],
      ...auditLogs.map(log => [
        log.timestamp,
        log.agent_name,
        log.event_type,
        log.user_id,
        log.compliance_status,
        log.risk_level
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    
    try {
      await submitFeedback({
        feedback_type: feedbackType,
        content: feedbackText,
        rating: feedbackRating,
        category: feedbackType.toLowerCase().replace(' ', '_'),
        anonymous: true
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFeedbackText('');
        setFeedbackRating(5);
      }, 2000);
    } catch (error) {
      console.error('Feedback submission failed:', error);
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
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    promptAnalysis.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    promptAnalysis.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {promptAnalysis.status}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{promptAnalysis.risk_score.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Risk Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{promptAnalysis.confidence.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Confidence</p>
                </div>
              </div>

              {promptAnalysis.policy_violations.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-red-800 mb-2">Policy Violations</h5>
                  {promptAnalysis.policy_violations.map((issue: string, index: number) => (
                    <div key={index} className="text-red-700 text-sm">• {issue}</div>
                  ))}
                </div>
              )}

              {promptAnalysis.content_flags.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-yellow-800 mb-2">Content Flags</h5>
                  {promptAnalysis.content_flags.map((flag: string, index: number) => (
                    <div key={index} className="text-yellow-700 text-sm">• {flag}</div>
                  ))}
                </div>
              )}

              {promptAnalysis.suggestions.length > 0 && (
                <div>
                  <h5 className="font-medium text-blue-800 mb-2">Suggestions</h5>
                  {promptAnalysis.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="text-blue-700 text-sm">• {suggestion}</div>
                  ))}
                </div>
              )}
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
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{outputAudit.bias_score?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-gray-600">Bias Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{outputAudit.toxicity_score?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-gray-600">Toxicity Level</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{outputAudit.fairness_score?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-gray-600">Fairness Rating</p>
              </div>
            </div>

            <div className="mb-4">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                outputAudit.audit_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                outputAudit.audit_status === 'REVIEW_RECOMMENDED' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {outputAudit.audit_status}
              </div>
            </div>

            {outputAudit.policy_violations?.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-red-800 mb-2">Policy Violations</h5>
                {outputAudit.policy_violations.map((violation: string, index: number) => (
                  <div key={index} className="text-red-700 text-sm">• {violation}</div>
                ))}
              </div>
            )}

            {outputAudit.recommendations?.length > 0 && (
              <div>
                <h5 className="font-medium text-blue-800 mb-2">Recommendations</h5>
                {outputAudit.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="text-blue-700 text-sm">• {rec}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderPolicyEnforcer = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">⚖️ Policy Enforcer Agent</h3>
        <p className="text-orange-700">Dynamically applies governance rules based on user roles and activity type.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content to Test</label>
              <textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter content to test against policies..."
              />
            </div>

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
                  <option value="data_access">Data Access</option>
                  <option value="admin_functions">Admin Functions</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Set</label>
                <select
                  value={selectedPolicy}
                  onChange={(e) => setSelectedPolicy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Policies</option>
                  <option value="content_safety">Content Safety</option>
                  <option value="privacy">Privacy Protection</option>
                  <option value="access_control">Access Control</option>
                </select>
              </div>
            </div>

            <button
              onClick={handlePolicyEnforcement}
              disabled={!testContent || enforcementLoading}
              className="w-full bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {enforcementLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{enforcementLoading ? 'Enforcing Policies...' : 'Test Policy Enforcement'}</span>
            </button>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">User Context</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">User:</span>
              <span className="text-sm font-medium">{user?.username || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Role:</span>
              <span className="text-sm font-medium">{user?.role || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Permissions:</span>
              <span className="text-sm font-medium">{user?.permissions?.join(', ') || 'None'}</span>
            </div>
          </div>

          {enforcementResult && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Enforcement Results</h5>
              
              <div className="mb-4">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  enforcementResult.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {enforcementResult.allowed ? 'ALLOWED' : 'BLOCKED'}
                </div>
              </div>

              <div className="space-y-3">
                {enforcementResult.policy_results.map((result: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{result.policy_name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.allowed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    {result.violations.length > 0 && (
                      <div className="text-xs text-red-600">
                        {result.violations.map((violation: string, i: number) => (
                          <div key={i}>• {violation}</div>
                        ))}
                      </div>
                    )}
                    {result.actions.length > 0 && (
                      <div className="text-xs text-orange-600 mt-1">
                        Actions: {result.actions.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAuditLogger = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">📊 Audit Logger Agent</h3>
        <p className="text-purple-700">Comprehensive logging of all interactions and agent decisions.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={auditTimeRange}
            onChange={(e) => setAuditTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <select
            value={auditFilter}
            onChange={(e) => setAuditFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Events</option>
            <option value="prompt_analysis">Prompt Analysis</option>
            <option value="output_audit">Output Audit</option>
            <option value="policy_enforcement">Policy Enforcement</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadAuditLogs}
            disabled={auditLoading}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${auditLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportAuditLogs}
            disabled={auditLogs.length === 0}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {auditLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading audit logs...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.agent_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.event_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.compliance_status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.compliance_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.risk_level === 'low' ? 'bg-green-100 text-green-800' :
                        log.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {auditLogs.length === 0 && !auditLoading && (
        <div className="text-center py-8 text-gray-500">
          <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No audit logs found. Click "Refresh" to load recent activity.</p>
        </div>
      )}
    </div>
  );

  const renderAdvisory = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">💡 Advisory Agent</h3>
        <p className="text-indigo-700">Provides explanations for rejected/modified requests and suggests compliant alternatives.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Advisory Type</label>
            <select
              value={advisoryType}
              onChange={(e) => setAdvisoryType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="prompt_blocked">Prompt Blocked</option>
              <option value="output_flagged">Output Flagged</option>
              <option value="policy_violation">Policy Violation</option>
              <option value="risk_warning">Risk Warning</option>
              <option value="general">General Guidance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Context Description</label>
            <textarea
              value={advisoryContext}
              onChange={(e) => setAdvisoryContext(e.target.value)}
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe the situation that needs advisory guidance..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Policy Violations</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newViolation}
                onChange={(e) => setNewViolation(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add a policy violation..."
                onKeyPress={(e) => e.key === 'Enter' && addViolation()}
              />
              <button
                onClick={addViolation}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {violations.map((violation, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                >
                  {violation}
                  <button
                    onClick={() => removeViolation(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Risk Factors</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newRiskFactor}
                onChange={(e) => setNewRiskFactor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add a risk factor..."
                onKeyPress={(e) => e.key === 'Enter' && addRiskFactor()}
              />
              <button
                onClick={addRiskFactor}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {riskFactors.map((factor, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                >
                  {factor}
                  <button
                    onClick={() => removeRiskFactor(index)}
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdvisoryRequest}
            disabled={advisoryLoading}
            className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
          >
            {advisoryLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{advisoryLoading ? 'Generating Advisory...' : 'Get Advisory Guidance'}</span>
          </button>
        </div>

        <div>
          {advisoryError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-800">Error: {advisoryError}</p>
            </div>
          )}

          {advisoryResult && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Advisory Guidance</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Primary Guidance</h5>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                    {advisoryResult.guidance?.primary_message || 'No specific guidance available.'}
                  </p>
                </div>

                {advisoryResult.guidance?.specific_issues?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-red-800 mb-2">Specific Issues</h5>
                    <ul className="space-y-1">
                      {advisoryResult.guidance.specific_issues.map((issue: string, index: number) => (
                        <li key={index} className="text-red-700 text-sm">• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {advisoryResult.alternatives?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">Suggested Alternatives</h5>
                    <div className="space-y-2">
                      {advisoryResult.alternatives.map((alt: any, index: number) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h6 className="font-medium text-blue-900">{alt.title}</h6>
                          <p className="text-blue-700 text-sm">{alt.description}</p>
                          {alt.example && (
                            <p className="text-blue-600 text-xs mt-1 italic">Example: {alt.example}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {advisoryResult.educational_content?.relevant_topics?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-green-800 mb-2">Educational Resources</h5>
                    <div className="space-y-1">
                      {advisoryResult.educational_content.relevant_topics.map((topic: string, index: number) => (
                        <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mr-2 mb-1">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Severity: <span className={`font-medium ${
                      advisoryResult.severity === 'high' ? 'text-red-600' :
                      advisoryResult.severity === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>{advisoryResult.severity}</span></span>
                    <span>Follow-up Required: {advisoryResult.follow_up_required ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!advisoryResult && !advisoryLoading && !advisoryError && (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Configure your advisory request and click "Get Advisory Guidance" to receive personalized recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-6">
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-pink-900 mb-2">💬 Feedback Agent</h3>
        <p className="text-pink-700">Collect user feedback anonymously to improve the governance system.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Usability Issue</option>
              <option>General Feedback</option>
              <option>Performance Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className={`p-1 ${star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">({feedbackRating} star{feedbackRating !== 1 ? 's' : ''})</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Please provide detailed feedback about your experience..."
            />
          </div>

          <button
            onClick={handleFeedbackSubmit}
            disabled={!feedbackText.trim() || feedbackLoading}
            className="w-full bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
          >
            {feedbackLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <MessageSquare className="h-4 w-4" />
            <span>{feedbackLoading ? 'Submitting...' : 'Submit Feedback'}</span>
          </button>

          {feedbackError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error: {feedbackError}</p>
            </div>
          )}

          {feedbackResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                {feedbackResult.acknowledgment || 'Thank you for your feedback! It has been submitted anonymously.'}
              </p>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Feedback Guidelines</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <h5 className="font-medium text-gray-800">Bug Reports</h5>
              <p className="text-sm text-gray-600">Describe the issue, steps to reproduce, and expected behavior.</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800">Feature Requests</h5>
              <p className="text-sm text-gray-600">Explain the desired functionality and how it would benefit users.</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800">Usability Issues</h5>
              <p className="text-sm text-gray-600">Share difficulties you encountered while using the system.</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800">General Feedback</h5>
              <p className="text-sm text-gray-600">Any other thoughts, suggestions, or observations.</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Privacy Notice</h5>
            <p className="text-sm text-blue-700">
              All feedback is collected anonymously. We do not store any personally identifiable information 
              with your feedback submissions. Your input helps us improve the governance system for all users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'prompt-guard':
        return renderPromptGuard();
      case 'output-auditor':
        return renderOutputAuditor();
      case 'policy-enforcer':
        return renderPolicyEnforcer();
      case 'audit-logger':
        return renderAuditLogger();
      case 'advisory':
        return renderAdvisory();
      case 'feedback':
        return renderFeedback();
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