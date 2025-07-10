import React, { useState } from 'react';
import { Shield, Search, AlertTriangle, FileText, Lightbulb, MessageSquare, TrendingUp, CheckCircle, Activity, Database, Clock, Calendar, Download, RefreshCw, Settings } from 'lucide-react';
import { usePromptAnalysis, useOutputAudit, useAdvisory } from '../hooks/useGovernance';

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

  // ... rest of the component code ...

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