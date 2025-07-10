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

}

export default GovernanceAgents;