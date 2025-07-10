import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Shield, Eye, Target, Activity, RefreshCw, Download, Filter, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface User {
  username: string;
  role: string;
  permissions: string[];
}

interface RiskAssessmentProps {
  user: User | null;
}

interface RiskMetric {
  id: string;
  name: string;
  category: string;
  current_score: number;
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface ThreatVector {
  id: string;
  name: string;
  probability: number;
  impact: number;
  risk_score: number;
  category: string;
  mitigation_status: 'none' | 'partial' | 'complete';
  last_detected: string;
}

interface RiskEvent {
  id: string;
  timestamp: string;
  event_type: string;
  severity: string;
  description: string;
  affected_systems: string[];
  status: 'open' | 'investigating' | 'mitigated' | 'closed';
  assigned_to?: string;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [threatVectors, setThreatVectors] = useState<ThreatVector[]>([]);
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Initialize with sample data
  useEffect(() => {
    const sampleRiskMetrics: RiskMetric[] = [
      {
        id: 'bias_risk',
        name: 'AI Bias Risk',
        category: 'Content Quality',
        current_score: 3.2,
        threshold: 5.0,
        trend: 'down',
        last_updated: '2024-01-07T14:30:00Z',
        severity: 'medium',
        description: 'Risk of biased outputs in AI-generated content'
      },
      {
        id: 'privacy_risk',
        name: 'Privacy Exposure Risk',
        category: 'Data Protection',
        current_score: 2.1,
        threshold: 3.0,
        trend: 'stable',
        last_updated: '2024-01-07T14:25:00Z',
        severity: 'low',
        description: 'Risk of exposing personal or sensitive information'
      },
      {
        id: 'compliance_risk',
        name: 'Compliance Violation Risk',
        category: 'Regulatory',
        current_score: 1.8,
        threshold: 4.0,
        trend: 'down',
        last_updated: '2024-01-07T14:20:00Z',
        severity: 'low',
        description: 'Risk of violating regulatory compliance requirements'
      },
      {
        id: 'security_risk',
        name: 'Security Breach Risk',
        category: 'Security',
        current_score: 4.5,
        threshold: 6.0,
        trend: 'up',
        last_updated: '2024-01-07T14:35:00Z',
        severity: 'medium',
        description: 'Risk of security vulnerabilities and breaches'
      },
      {
        id: 'toxicity_risk',
        name: 'Content Toxicity Risk',
        category: 'Content Quality',
        current_score: 2.8,
        threshold: 4.0,
        trend: 'stable',
        last_updated: '2024-01-07T14:15:00Z',
        severity: 'low',
        description: 'Risk of generating toxic or harmful content'
      },
      {
        id: 'operational_risk',
        name: 'Operational Risk',
        category: 'Operations',
        current_score: 6.2,
        threshold: 7.0,
        trend: 'up',
        last_updated: '2024-01-07T14:40:00Z',
        severity: 'high',
        description: 'Risk of operational failures and system downtime'
      }
    ];

    const sampleThreatVectors: ThreatVector[] = [
      {
        id: 'prompt_injection',
        name: 'Prompt Injection Attacks',
        probability: 0.7,
        impact: 0.8,
        risk_score: 5.6,
        category: 'Security',
        mitigation_status: 'partial',
        last_detected: '2024-01-07T13:45:00Z'
      },
      {
        id: 'data_poisoning',
        name: 'Data Poisoning',
        probability: 0.3,
        impact: 0.9,
        risk_score: 2.7,
        category: 'Data Integrity',
        mitigation_status: 'complete',
        last_detected: '2024-01-06T09:20:00Z'
      },
      {
        id: 'model_extraction',
        name: 'Model Extraction',
        probability: 0.4,
        impact: 0.7,
        risk_score: 2.8,
        category: 'Intellectual Property',
        mitigation_status: 'partial',
        last_detected: '2024-01-07T11:15:00Z'
      },
      {
        id: 'adversarial_examples',
        name: 'Adversarial Examples',
        probability: 0.6,
        impact: 0.6,
        risk_score: 3.6,
        category: 'Model Robustness',
        mitigation_status: 'none',
        last_detected: '2024-01-07T14:10:00Z'
      },
      {
        id: 'privacy_inference',
        name: 'Privacy Inference Attacks',
        probability: 0.5,
        impact: 0.8,
        risk_score: 4.0,
        category: 'Privacy',
        mitigation_status: 'partial',
        last_detected: '2024-01-07T12:30:00Z'
      }
    ];

    const sampleRiskEvents: RiskEvent[] = [
      {
        id: 'event_001',
        timestamp: '2024-01-07T14:30:00Z',
        event_type: 'High Bias Detection',
        severity: 'medium',
        description: 'AI output flagged for potential gender bias in hiring recommendations',
        affected_systems: ['Output Auditor', 'HR Assistant'],
        status: 'investigating',
        assigned_to: 'security_team'
      },
      {
        id: 'event_002',
        timestamp: '2024-01-07T13:45:00Z',
        event_type: 'Prompt Injection Attempt',
        severity: 'high',
        description: 'Detected attempt to inject malicious instructions into user prompt',
        affected_systems: ['Prompt Guard', 'Policy Enforcer'],
        status: 'mitigated',
        assigned_to: 'security_team'
      },
      {
        id: 'event_003',
        timestamp: '2024-01-07T12:15:00Z',
        event_type: 'Privacy Violation',
        severity: 'high',
        description: 'System attempted to process content containing PII data',
        affected_systems: ['Privacy Filter', 'Data Handler'],
        status: 'closed',
        assigned_to: 'privacy_team'
      },
      {
        id: 'event_004',
        timestamp: '2024-01-07T11:30:00Z',
        event_type: 'Compliance Alert',
        severity: 'low',
        description: 'Minor policy violation detected in content generation',
        affected_systems: ['Policy Enforcer'],
        status: 'closed'
      },
      {
        id: 'event_005',
        timestamp: '2024-01-07T10:45:00Z',
        event_type: 'Anomalous Activity',
        severity: 'medium',
        description: 'Unusual pattern detected in user request frequency',
        affected_systems: ['Activity Monitor', 'Rate Limiter'],
        status: 'open',
        assigned_to: 'ops_team'
      }
    ];

    setRiskMetrics(sampleRiskMetrics);
    setThreatVectors(sampleThreatVectors);
    setRiskEvents(sampleRiskEvents);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setLoading(false);
  };

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      risk_metrics: riskMetrics,
      threat_vectors: threatVectors,
      risk_events: riskEvents,
      overall_risk_score: calculateOverallRiskScore()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk_assessment_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateOverallRiskScore = () => {
    const totalScore = riskMetrics.reduce((sum, metric) => sum + metric.current_score, 0);
    return (totalScore / riskMetrics.length).toFixed(1);
  };

  const getRiskColor = (score: number, threshold: number) => {
    const percentage = (score / threshold) * 100;
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-orange-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'mitigated': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMitigationColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'none': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Prepare chart data
  const riskTrendData = [
    { time: '00:00', overall: 3.2, bias: 3.5, privacy: 2.1, security: 4.2 },
    { time: '04:00', overall: 3.0, bias: 3.2, privacy: 2.0, security: 4.1 },
    { time: '08:00', overall: 3.4, bias: 3.8, privacy: 2.3, security: 4.5 },
    { time: '12:00', overall: 3.1, bias: 3.1, privacy: 2.1, security: 4.3 },
    { time: '16:00', overall: 3.3, bias: 3.2, privacy: 2.1, security: 4.5 },
    { time: '20:00', overall: 3.2, bias: 3.2, privacy: 2.1, security: 4.5 }
  ];

  const riskDistribution = riskMetrics.map(metric => ({
    name: metric.name,
    value: metric.current_score,
    color: metric.severity === 'high' ? '#ef4444' : 
           metric.severity === 'medium' ? '#f59e0b' : '#10b981'
  }));

  const threatImpactData = threatVectors.map(threat => ({
    name: threat.name,
    probability: threat.probability * 10,
    impact: threat.impact * 10,
    risk_score: threat.risk_score
  }));

  const radarData = [
    { subject: 'Content Quality', A: 3.0, fullMark: 10 },
    { subject: 'Data Protection', A: 2.1, fullMark: 10 },
    { subject: 'Security', A: 4.5, fullMark: 10 },
    { subject: 'Compliance', A: 1.8, fullMark: 10 },
    { subject: 'Operations', A: 6.2, fullMark: 10 },
    { subject: 'Privacy', A: 2.8, fullMark: 10 }
  ];

  const tabs = [
    { id: 'overview', label: 'Risk Overview', icon: Eye },
    { id: 'metrics', label: 'Risk Metrics', icon: Activity },
    { id: 'threats', label: 'Threat Vectors', icon: Target },
    { id: 'events', label: 'Risk Events', icon: AlertTriangle }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Risk Score</p>
              <p className="text-3xl font-bold text-gray-900">{calculateOverallRiskScore()}</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">-0.3 from yesterday</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Threats</p>
              <p className="text-3xl font-bold text-gray-900">{threatVectors.length}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm font-medium text-red-600">+2 new threats</span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Events</p>
              <p className="text-3xl font-bold text-gray-900">
                {riskEvents.filter(e => e.status === 'open' || e.status === 'investigating').length}
              </p>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">-1 resolved</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mitigation Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round((threatVectors.filter(t => t.mitigation_status !== 'none').length / threatVectors.length) * 100)}%
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+5% improvement</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Trends (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={2} name="Overall" />
              <Line type="monotone" dataKey="bias" stroke="#ef4444" strokeWidth={2} name="Bias" />
              <Line type="monotone" dataKey="privacy" stroke="#10b981" strokeWidth={2} name="Privacy" />
              <Line type="monotone" dataKey="security" stroke="#f59e0b" strokeWidth={2} name="Security" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Radar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Profile Radar</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} />
            <Radar name="Risk Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {riskMetrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{metric.name}</h4>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(metric.severity)}`}>
                {metric.severity}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Score</span>
                <span className={`text-2xl font-bold ${getRiskColor(metric.current_score, metric.threshold)}`}>
                  {metric.current_score.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metric.current_score / metric.threshold >= 0.8 ? 'bg-red-500' :
                    metric.current_score / metric.threshold >= 0.6 ? 'bg-orange-500' :
                    metric.current_score / metric.threshold >= 0.4 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((metric.current_score / metric.threshold) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>Threshold: {metric.threshold}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{metric.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Trend:</span>
                <div className="flex items-center">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <div className="h-4 w-4 bg-gray-400 rounded-full mr-1"></div>
                  )}
                  <span className="capitalize">{metric.trend}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span>Last updated: {new Date(metric.last_updated).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderThreats = () => (
    <div className="space-y-6">
      {/* Threat Impact Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Threat Impact Matrix</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={threatImpactData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="probability" fill="#3b82f6" name="Probability" />
            <Bar dataKey="impact" fill="#ef4444" name="Impact" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Threat Vectors List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Threat Vectors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mitigation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Detected
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {threatVectors.map((threat) => (
                <tr key={threat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{threat.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {threat.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        threat.risk_score >= 5 ? 'text-red-600' :
                        threat.risk_score >= 3 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {threat.risk_score.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${threat.probability * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{Math.round(threat.probability * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${threat.impact * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{Math.round(threat.impact * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMitigationColor(threat.mitigation_status)}`}>
                      {threat.mitigation_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(threat.last_detected).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['open', 'investigating', 'mitigated', 'closed'].map((status) => {
          const count = riskEvents.filter(e => e.status === status).length;
          return (
            <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600 capitalize">{status} Events</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Events List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Risk Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affected Systems
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {riskEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.event_type}</div>
                      <div className="text-sm text-gray-500">{event.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {event.affected_systems.map((system, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                        >
                          {system}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.assigned_to || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'metrics':
        return renderMetrics();
      case 'threats':
        return renderThreats();
      case 'events':
        return renderEvents();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">⚠️ Risk Assessment</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <p className="text-orange-700">
          Real-time risk assessment and threat analysis for AI governance systems. 
          Last updated: {lastRefresh.toLocaleString()}
        </p>
      </div>

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

export default RiskAssessment;