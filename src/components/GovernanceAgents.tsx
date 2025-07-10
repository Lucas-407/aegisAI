import React, { useState } from 'react';
import { Shield, Search, AlertTriangle, FileText, Lightbulb, MessageSquare, TrendingUp, CheckCircle, Activity, Database, Clock, Calendar, Download, RefreshCw, Settings } from 'lucide-react';
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
  
  // Use governance hooks
  const { data: promptAnalysis, loading: promptLoading, error: promptError, analyzePrompt } = usePromptAnalysis();
  const { data: outputAudit, loading: outputLoading, error: outputError, auditOutput } = useOutputAudit();
  const { data: advisoryResult, loading: advisoryLoading, error: advisoryError, getAdvisory } = useAdvisory();

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

  const renderAdvisory = () => {
    const [advisoryType, setAdvisoryType] = useState('prompt_blocked');
    const [contextData, setContextData] = useState('');
    const [violations, setViolations] = useState<string[]>([]);
    const [riskFactors, setRiskFactors] = useState<string[]>([]);
    const [advisoryResult, setAdvisoryResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    // Sample advisory scenarios
    const advisoryScenarios = [
      {
        id: 'prompt_blocked',
        title: 'Prompt Blocked',
        description: 'Get guidance when a prompt is blocked due to policy violations',
        sampleContext: 'Generate a list of all employees with their personal information including social security numbers',
        sampleViolations: ['Privacy Policy Violation', 'PII Exposure Risk'],
        sampleRiskFactors: ['Data Privacy Risk', 'Compliance Violation']
      },
      {
        id: 'output_flagged',
        title: 'Output Flagged',
        description: 'Get recommendations when AI output is flagged for review',
        sampleContext: 'AI generated content about hiring practices that may contain bias',
        sampleViolations: ['Bias Detection', 'Fairness Concern'],
        sampleRiskFactors: ['Gender Bias', 'Discriminatory Language']
      },
      {
        id: 'policy_violation',
        title: 'Policy Violation',
        description: 'Get guidance on policy violations and compliance issues',
        sampleContext: 'User attempting to access administrative functions without proper authorization',
        sampleViolations: ['Access Control Policy', 'Role Restriction'],
        sampleRiskFactors: ['Unauthorized Access', 'Security Risk']
      },
      {
    const handleGetAdvisory = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock advisory response
      const mockAdvisory = {
        advisory_type: advisoryType,
        guidance: {
          primary_message: getAdvisoryMessage(advisoryType),
          specific_issues: violations,
          ai_guidance: generateAIGuidance(advisoryType, contextData, violations, riskFactors),
          action_required: determineRequiredAction(violations, riskFactors)
        },
        alternatives: generateAlternatives(advisoryType, violations),
        educational_content: {
          relevant_topics: getRelevantTopics(violations, riskFactors),
          recommended_resources: getRecommendedResources(violations, riskFactors),
          training_suggestions: getTrainingSuggestions(violations, riskFactors)
        },
        severity: determineSeverity(violations, riskFactors),
        follow_up_required: violations.length > 0 || riskFactors.length > 1
      };
      
      setAdvisoryResult(mockAdvisory);
      setLoading(false);
    };

    const getAdvisoryMessage = (type: string) => {
      const messages = {
        prompt_blocked: "Your prompt was blocked due to potential policy violations. Please review and modify your request to ensure compliance with our governance policies.",
        output_flagged: "The AI output was flagged for review due to potential bias or compliance concerns. Please consider the recommendations provided below.",
        policy_violation: "This action violates organizational policies. Please review the applicable guidelines and modify your approach.",
        risk_warning: "This activity has been flagged as potentially risky. Please proceed with caution and consider the mitigation strategies provided."
      };
      return messages[type as keyof typeof messages] || "Please review your request for compliance.";
    };

    const generateAIGuidance = (type: string, context: string, violations: string[], risks: string[]) => {
      const guidanceTemplates = {
        prompt_blocked: `Based on the analysis of your prompt, it appears to request access to sensitive personal information. This violates our privacy protection policies. To proceed, please:

1. Remove any requests for personally identifiable information (PII)
2. Focus on aggregate or anonymized data instead
3. Specify a legitimate business purpose for the information
4. Ensure compliance with data protection regulations

Consider rephrasing your request to focus on the business objective rather than specific personal details.`,
        
        output_flagged: `The generated content has been flagged for potential bias concerns. This may impact fairness and inclusivity. To improve the content:

1. Review the language for any generalizations or stereotypes
2. Use more inclusive and neutral terminology
3. Provide balanced perspectives on the topic
4. Consider the impact on different demographic groups

We recommend revising the content to ensure it meets our fairness and inclusion standards.`,
        
        policy_violation: `Your request conflicts with established governance policies. To resolve this:

1. Review the specific policy requirements mentioned
2. Ensure you have appropriate authorization for this action
3. Consider alternative approaches that comply with policies
4. Contact your administrator if you believe you should have access

Policy compliance is essential for maintaining security and governance standards.`,
        
        risk_warning: `The system has detected elevated risk factors in this activity. To mitigate risks:

1. Verify the legitimacy and necessity of this action
2. Implement additional security measures if proceeding
3. Monitor the activity closely for any anomalies
4. Document the business justification for the activity

Consider whether this activity is essential and if there are safer alternatives.`
      };
      
      return guidanceTemplates[type as keyof typeof guidanceTemplates] || "Please review the specific issues and recommendations provided.";
    };

    const generateAlternatives = (type: string, violations: string[]) => {
      const alternatives = [];
      
      if (violations.includes('Privacy Policy Violation') || violations.includes('PII Exposure Risk')) {
        alternatives.push({
          type: 'privacy_protection',
          title: 'Use Anonymized Data',
          description: 'Request aggregate or anonymized data instead of personal information',
          example: 'Instead of "employee names and SSNs", ask for "employee count by department"'
        });
      }
      
      if (violations.includes('Bias Detection') || violations.includes('Fairness Concern')) {
        alternatives.push({
          type: 'bias_mitigation',
          title: 'Use Inclusive Language',
          description: 'Rephrase using neutral, inclusive language that avoids assumptions',
          example: 'Use "candidates" instead of gender-specific terms, focus on qualifications'
        });
      }
      
      if (violations.includes('Access Control Policy')) {
        alternatives.push({
          type: 'access_control',
          title: 'Request Proper Authorization',
          description: 'Contact your administrator to request appropriate access permissions',
          example: 'Submit a formal access request through the proper channels'
        });
      }
      
      // Add general alternatives
      alternatives.push({
        type: 'general',
        title: 'Consult Documentation',
        description: 'Review our governance guidelines and best practices documentation',
        example: 'Check the AI usage policy and compliance handbook for guidance'
      });
      
      return alternatives.slice(0, 3); // Limit to 3 alternatives
    };

    const getRelevantTopics = (violations: string[], risks: string[]) => {
      const topics = new Set<string>();
      
      violations.concat(risks).forEach(item => {
        const itemLower = item.toLowerCase();
        if (itemLower.includes('bias') || itemLower.includes('fairness')) {
          topics.add('AI Bias and Fairness');
        }
        if (itemLower.includes('privacy') || itemLower.includes('pii')) {
          topics.add('Data Privacy and Protection');
        }
        if (itemLower.includes('security') || itemLower.includes('access')) {
          topics.add('AI Security and Access Control');
        }
        if (itemLower.includes('compliance') || itemLower.includes('policy')) {
          topics.add('Regulatory Compliance');
        }
      });
      
      return Array.from(topics);
    };

    const getRecommendedResources = (violations: string[], risks: string[]) => {
      const resources = [];
      const topics = getRelevantTopics(violations, risks);
      
      topics.forEach(topic => {
        switch (topic) {
          case 'AI Bias and Fairness':
            resources.push({
              title: 'AI Fairness Guidelines',
              description: 'Comprehensive guide to identifying and mitigating bias in AI systems',
              type: 'guide'
            });
            break;
          case 'Data Privacy and Protection':
            resources.push({
              title: 'Data Privacy Best Practices',
              description: 'Guidelines for handling personal and sensitive information',
              type: 'policy'
            });
            break;
          case 'AI Security and Access Control':
            resources.push({
              title: 'AI Security Framework',
              description: 'Security best practices for AI systems and access management',
              type: 'framework'
            });
            break;
          case 'Regulatory Compliance':
            resources.push({
              title: 'Compliance Handbook',
              description: 'Overview of regulatory requirements and compliance procedures',
              type: 'handbook'
            });
            break;
        }
      });
      
      return resources;
    };

    const getTrainingSuggestions = (violations: string[], risks: string[]) => {
      const topics = getRelevantTopics(violations, risks);
      const suggestions = [];
      
      topics.forEach(topic => {
        switch (topic) {
          case 'AI Bias and Fairness':
            suggestions.push('Complete the AI Ethics and Bias Awareness training module');
            break;
          case 'Data Privacy and Protection':
            suggestions.push('Take the Data Privacy and GDPR compliance course');
            break;
          case 'AI Security and Access Control':
            suggestions.push('Attend the AI Security and Access Management workshop');
            break;
          case 'Regulatory Compliance':
            suggestions.push('Review the Regulatory Compliance certification program');
            break;
        }
      });
      
      return suggestions;
    };

    const determineRequiredAction = (violations: string[], risks: string[]) => {
      if (violations.length > 0) {
        return 'modify_request';
      } else if (risks.length > 0) {
        return 'review_and_proceed';
      }
      return 'no_action_required';
    };

    const determineSeverity = (violations: string[], risks: string[]) => {
      const totalIssues = violations.length + risks.length;
      const hasHighSeverityKeywords = violations.concat(risks).some(item => 
        ['security', 'privacy', 'harmful', 'discrimination'].some(keyword => 
          item.toLowerCase().includes(keyword)
        )
      );
      
      if (hasHighSeverityKeywords || totalIssues >= 3) {
        return 'high';
      } else if (totalIssues >= 2) {
        return 'medium';
      }
      return 'low';
    };

    const loadScenario = (scenario: any) => {
      setAdvisoryType(scenario.id);
      setContextData(scenario.sampleContext);
      setViolations(scenario.sampleViolations);
      setRiskFactors(scenario.sampleRiskFactors);
      setAdvisoryResult(null);
    };

    const addViolation = (violation: string) => {
      if (violation && !violations.includes(violation)) {
        setViolations([...violations, violation]);
      }
    };

    const removeViolation = (index: number) => {
      setViolations(violations.filter((_, i) => i !== index));
    };

    const addRiskFactor = (risk: string) => {
      if (risk && !riskFactors.includes(risk)) {
        setRiskFactors([...riskFactors, risk]);
      }
    };

    const removeRiskFactor = (index: number) => {
      setRiskFactors(riskFactors.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">💡 Advisory Agent</h3>
          <p className="text-purple-700">Provides explanations for rejected/modified requests and suggests compliant alternatives.</p>
        </div>

        {/* Quick Scenarios */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Advisory Scenarios</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisoryScenarios.map((scenario) => (
              <div key={scenario.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => loadScenario(scenario)}>
                <h5 className="font-medium text-gray-900 mb-2">{scenario.title}</h5>
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadScenario(scenario);
                  }}
                  className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded hover:bg-purple-200 transition-colors"
                >
                  Load Scenario
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Advisory Configuration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Advisory Configuration</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Advisory Type</label>
                <select
                  value={advisoryType}
                  onChange={(e) => setAdvisoryType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="prompt_blocked">Prompt Blocked</option>
                  <option value="output_flagged">Output Flagged</option>
                  <option value="policy_violation">Policy Violation</option>
                  <option value="risk_warning">Risk Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Context Information</label>
                <textarea
                  value={contextData}
                  onChange={(e) => setContextData(e.target.value)}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe the situation that triggered the advisory request..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Violations</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a policy violation..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addViolation((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add a policy violation..."]') as HTMLInputElement;
                        if (input) {
                          addViolation(input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {violations.map((violation, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Factors</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a risk factor..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addRiskFactor((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add a risk factor..."]') as HTMLInputElement;
                        if (input) {
                          addRiskFactor(input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {riskFactors.map((risk, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                        {risk}
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
              </div>

              <button
                onClick={handleGetAdvisory}
                disabled={!contextData || loading}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{loading ? 'Generating Advisory...' : 'Get Advisory Guidance'}</span>
              </button>
            </div>

            {/* Advisory Results */}
            <div>
              {advisoryResult && (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-900">Advisory Summary</h5>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        advisoryResult.severity === 'high' ? 'bg-red-100 text-red-800' :
                        advisoryResult.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {advisoryResult.severity} severity
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{advisoryResult.guidance.primary_message}</p>
                    <div className="text-sm">
                      <span className="font-medium">Action Required: </span>
                      <span className="capitalize">{advisoryResult.guidance.action_required.replace('_', ' ')}</span>
                    </div>
                    {advisoryResult.follow_up_required && (
                      <div className="mt-2 text-sm text-orange-600">
                        ⚠️ Follow-up required
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-3">AI Guidance</h5>
                    <div className="text-sm text-blue-800 whitespace-pre-line">
                      {advisoryResult.guidance.ai_guidance}
                    </div>
                  </div>

                  {advisoryResult.alternatives.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-900 mb-3">Suggested Alternatives</h5>
                      <div className="space-y-3">
                        {advisoryResult.alternatives.map((alt: any, index: number) => (
                          <div key={index} className="bg-white border border-green-200 rounded-lg p-3">
                            <h6 className="font-medium text-green-900">{alt.title}</h6>
                            <p className="text-sm text-green-700 mt-1">{alt.description}</p>
                            {alt.example && (
                              <p className="text-sm text-green-600 mt-2 italic">Example: {alt.example}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {advisoryResult.educational_content.relevant_topics.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-900 mb-3">Educational Resources</h5>
                      
                      <div className="mb-4">
                        <h6 className="font-medium text-purple-800 mb-2">Relevant Topics</h6>
                        <div className="flex flex-wrap gap-2">
                          {advisoryResult.educational_content.relevant_topics.map((topic: string, index: number) => (
                            <span key={index} className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {advisoryResult.educational_content.recommended_resources.length > 0 && (
                        <div className="mb-4">
                          <h6 className="font-medium text-purple-800 mb-2">Recommended Resources</h6>
                          <div className="space-y-2">
                            {advisoryResult.educational_content.recommended_resources.map((resource: any, index: number) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium text-purple-900">{resource.title}</span>
                                <span className="text-purple-700"> - {resource.description}</span>
                                <span className="text-purple-600 text-xs ml-2">({resource.type})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {advisoryResult.educational_content.training_suggestions.length > 0 && (
                        <div>
                          <h6 className="font-medium text-purple-800 mb-2">Training Suggestions</h6>
                          <ul className="text-sm text-purple-700 space-y-1">
                            {advisoryResult.educational_content.training_suggestions.map((suggestion: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="text-purple-500 mr-2">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!advisoryResult && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Configure your advisory request and click "Get Advisory Guidance" to receive personalized recommendations.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Advisory Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Advisory Activity</h4>
          <div className="space-y-3">
            {[
              {
                timestamp: '2024-01-07 14:32:15',
                type: 'Prompt Blocked',
                severity: 'medium',
                summary: 'Privacy violation detected - provided guidance on data anonymization'
              },
              {
                timestamp: '2024-01-07 14:15:42',
                type: 'Output Flagged',
                severity: 'low',
                summary: 'Bias concern addressed - suggested inclusive language alternatives'
              },
              {
                timestamp: '2024-01-07 13:58:21',
                type: 'Policy Violation',
                severity: 'high',
                summary: 'Access control violation - directed to proper authorization process'
              },
              {
                timestamp: '2024-01-07 13:45:33',
                type: 'Risk Warning',
                severity: 'medium',
                summary: 'Security risk identified - provided mitigation strategies'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                      activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {activity.type}
                    </span>
                    <span className="text-sm text-gray-600">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{activity.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPolicyEnforcer = () => {
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
        return renderAuditLogger();
      case 'advisory':
        return renderAdvisory();
      case 'feedback':
        return renderPlaceholder('Feedback Agent', 'Collect and analyze user feedback to improve the governance system.');
      default:
        return renderPromptGuard();
    }
  };

  const renderAuditLogger = () => {
    // Mock audit data
    const auditStats = {
      total_logs_today: 12847,
      storage_locations: ['OpenSearch', 'DynamoDB'],
      retention_period: '90 days',
      compliance_rate: 99.8,
      last_backup: '2024-01-07T14:00:00Z',
      storage_usage: 78.5
    };

    const recentLogs = [
      {
        log_id: 'audit_20240107_143015_1234',
        timestamp: '2024-01-07T14:30:15Z',
        event_type: 'prompt_analysis',
        agent_name: 'PromptGuardAgent',
        user_id: 'demo_user_admin',
        user_role: 'admin',
        session_id: 'session_abc123',
        compliance_status: 'compliant',
        risk_level: 'low',
        performance_metrics: {
          processing_time: 245,
          memory_usage: 12.5,
          api_calls: 3
        },
        requires_attention: false
      },
      {
        log_id: 'audit_20240107_142845_5678',
        timestamp: '2024-01-07T14:28:45Z',
        event_type: 'output_audit',
        agent_name: 'OutputAuditorAgent',
        user_id: 'demo_user_analyst',
        user_role: 'analyst',
        session_id: 'session_def456',
        compliance_status: 'warning',
        risk_level: 'medium',
        performance_metrics: {
          processing_time: 1250,
          memory_usage: 28.3,
          api_calls: 7
        },
        requires_attention: true
      },
      {
        log_id: 'audit_20240107_142630_9012',
        timestamp: '2024-01-07T14:26:30Z',
        event_type: 'policy_enforcement',
        agent_name: 'PolicyEnforcerAgent',
        user_id: 'demo_user_user',
        user_role: 'user',
        session_id: 'session_ghi789',
        compliance_status: 'violation',
        risk_level: 'high',
        performance_metrics: {
          processing_time: 89,
          memory_usage: 8.7,
          api_calls: 2
        },
        requires_attention: true
      },
      {
        log_id: 'audit_20240107_142415_3456',
        timestamp: '2024-01-07T14:24:15Z',
        event_type: 'feedback_submission',
        agent_name: 'FeedbackAgent',
        user_id: 'demo_user_analyst',
        user_role: 'analyst',
        session_id: 'session_jkl012',
        compliance_status: 'compliant',
        risk_level: 'low',
        performance_metrics: {
          processing_time: 156,
          memory_usage: 5.2,
          api_calls: 1
        },
        requires_attention: false
      },
      {
        log_id: 'audit_20240107_142200_7890',
        timestamp: '2024-01-07T14:22:00Z',
        event_type: 'advisory_request',
        agent_name: 'AdvisoryAgent',
        user_id: 'demo_user_admin',
        user_role: 'admin',
        session_id: 'session_mno345',
        compliance_status: 'compliant',
        risk_level: 'low',
        performance_metrics: {
          processing_time: 890,
          memory_usage: 15.8,
          api_calls: 5
        },
        requires_attention: false
      }
    ];

    const logCategories = [
      { name: 'Prompt Analysis', count: 3247, percentage: 35.2 },
      { name: 'Output Audit', count: 2891, percentage: 31.4 },
      { name: 'Policy Enforcement', count: 1456, percentage: 15.8 },
      { name: 'Advisory Requests', count: 987, percentage: 10.7 },
      { name: 'Feedback Collection', count: 623, percentage: 6.9 }
    ];

    const storageMetrics = [
      { location: 'OpenSearch', status: 'healthy', logs_stored: 8945, last_sync: '2024-01-07T14:35:00Z' },
      { location: 'DynamoDB', status: 'healthy', logs_stored: 8945, last_sync: '2024-01-07T14:35:00Z' }
    ];

    const getComplianceColor = (status: string) => {
      switch (status) {
        case 'compliant': return 'bg-green-100 text-green-800';
        case 'warning': return 'bg-yellow-100 text-yellow-800';
        case 'violation': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getRiskColor = (level: string) => {
      switch (level) {
        case 'low': return 'bg-green-100 text-green-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'high': return 'bg-red-100 text-red-800';
        case 'critical': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStorageStatusColor = (status: string) => {
      switch (status) {
        case 'healthy': return 'text-green-600';
        case 'warning': return 'text-yellow-600';
        case 'error': return 'text-red-600';
        default: return 'text-gray-600';
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">📋 Audit Logger Agent</h3>
          <p className="text-purple-700">Comprehensive logging of all interactions and agent decisions to Amazon OpenSearch and DynamoDB.</p>
        </div>

        {/* Audit Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs Today</p>
                <p className="text-2xl font-bold text-gray-900">{auditStats.total_logs_today.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">+234 from yesterday</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{auditStats.compliance_rate}%</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">Excellent</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Usage</p>
                <p className="text-2xl font-bold text-gray-900">{auditStats.storage_usage}%</p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-medium text-blue-600">Normal</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Period</p>
                <p className="text-2xl font-bold text-gray-900">{auditStats.retention_period}</p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm font-medium text-gray-600">Policy compliant</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Audit Logs */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">Recent Audit Logs</h4>
                <div className="flex items-center space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                  <button className="text-sm text-green-600 hover:text-green-800">Export</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentLogs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.event_type.replace('_', ' ')}</div>
                            <div className="text-sm text-gray-500">ID: {log.log_id.split('_').pop()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.agent_name.replace('Agent', '')}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900">{log.user_id.replace('demo_user_', '')}</div>
                            <div className="text-sm text-gray-500">{log.user_role}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceColor(log.compliance_status)}`}>
                            {log.compliance_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(log.risk_level)}`}>
                            {log.risk_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar - Storage Status & Log Categories */}
          <div className="space-y-6">
            {/* Storage Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Storage Status</h4>
              <div className="space-y-4">
                {storageMetrics.map((storage, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900">{storage.location}</h5>
                      <span className={`text-sm font-medium ${getStorageStatusColor(storage.status)}`}>
                        {storage.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Logs: {storage.logs_stored.toLocaleString()}</p>
                      <p>Last sync: {new Date(storage.last_sync).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Log Categories */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Log Categories</h4>
              <div className="space-y-3">
                {logCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        <span className="text-sm text-gray-600">{category.count.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{category.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Processing Time</span>
                  <span className="text-sm font-medium text-gray-900">326ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="text-sm font-medium text-gray-900">14.1MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API Calls/min</span>
                  <span className="text-sm font-medium text-gray-900">3.6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium text-green-600">0.2%</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">System Health</span>
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Controls */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Audit Controls</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export Audit Report</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Logs</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              <Settings className="h-4 w-4" />
              <span>Configure Logging</span>
            </button>
          </div>
        </div>
      </div>
    );
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