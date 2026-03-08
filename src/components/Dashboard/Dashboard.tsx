import { BarChart3, TrendingUp, Download, AlertCircle, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import ProbabilityChart from '../Visualization/ProbabilityChart';
import TrendChart from '../Visualization/TrendChart';
import DistributionChart from '../Visualization/DistributionChart';
import ExportPanel from '../Export/ExportPanel';
import { formatProbabilitySimple, getTempUnitLabel } from '../../utils/weatherUtils';
import type { DashboardProps } from '../../types';

const Dashboard: React.FC<DashboardProps> = ({ location, queryParams, results, onNewQuery }) => {
  // Mock data for demonstration (replace with actual API results)
  const mockResults = {
    location,
    queryDate: queryParams.date,
    probabilities: queryParams.conditions.map((condition, index) => ({
      condition,
      probability: 35 + Math.random() * 40,
      mean: 70 + Math.random() * 20,
      median: 68 + Math.random() * 20,
      stdDev: 10 + Math.random() * 5,
      percentile25: 60,
      percentile75: 85,
      percentile90: 92
    })),
    trends: [],
    historicalData: {
      years: Array.from({ length: 20 }, (_, i) => 2004 + i),
      values: [[]]
    },
    summary: 'Based on historical data, there is a moderate to high likelihood of the selected weather conditions occurring on this date.',
    riskLevel: 'medium' as const,
    metadata: {
      dataSource: 'NASA POWER API',
      lastUpdated: new Date().toISOString(),
      yearsAnalyzed: 40
    }
  };

  const displayResults = results || mockResults;

  const getRiskBadge = () => {
    const config = {
      low: { icon: CheckCircle, text: 'Low Risk', color: 'bg-green-500/20 text-green-300 border-green-500/50' },
      medium: { icon: AlertTriangle, text: 'Medium Risk', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
      high: { icon: AlertCircle, text: 'High Risk', color: 'bg-red-500/20 text-red-300 border-red-500/50' }
    };

    const { icon: Icon, text, color } = config[displayResults.riskLevel];

    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{text}</span>
      </div>
    );
  };

  // Unit per condition (from the thresholds user selected)
  const getUnit = (condition: string) =>
    queryParams.thresholds.find(t => t.condition === condition)?.unit ?? (condition === 'hot' || condition === 'cold' ? '°F' : '');

  // One-line plain-language summary for quick understanding
  const getInShortSummary = () => {
    const probs = displayResults.probabilities;
    if (!probs.length) return null;
    const tempProbs = probs.filter(p => p.condition === 'hot' || p.condition === 'cold');
    const avgTemp = tempProbs.length ? tempProbs.reduce((a, p) => a + p.mean, 0) / tempProbs.length : null;
    const unit = tempProbs[0] ? getTempUnitLabel(tempProbs[0].condition, getUnit(tempProbs[0].condition)) : '°F';
    const parts: string[] = [];
    if (avgTemp != null) parts.push(`On this date it’s usually around ${Math.round(avgTemp)}${unit}.`);
    probs.forEach(p => {
      const simple = formatProbabilitySimple(p.probability);
      const label = p.condition === 'hot' ? 'very hot' : p.condition === 'cold' ? 'very cold' : p.condition;
      parts.push(`Chance of ${label}: ${simple}.`);
    });
    return parts.join(' ');
  };

  const inShort = getInShortSummary();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Weather Analysis Results
            </h2>
            <p className="text-gray-300">
              {location.name || location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Date: {queryParams.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex flex-col items-end space-y-3">
            {getRiskBadge()}
            <button onClick={onNewQuery} className="btn-secondary text-sm">
              New Query
            </button>
          </div>
        </div>
      </div>

      {/* In short — easy to understand in one line */}
      {inShort && (
        <div className="glass-card p-4 border-l-4 border-amber-500/60 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-200/90 mb-1">In short</p>
              <p className="text-gray-200 text-sm leading-relaxed">{inShort}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="glass-card p-6 border-l-4 border-nasa-blue">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-nasa-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-6 h-6 text-nasa-blue" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-3">Comprehensive Analysis Summary</h3>
            <div className="space-y-3 text-gray-300 leading-relaxed">
              {displayResults.summary.split('**').map((part, index) => {
                if (index % 2 === 1) {
                  // Bold text (between **)
                  return <strong key={index} className="text-white font-semibold">{part}</strong>;
                }
                // Regular text
                return <span key={index}>{part}</span>;
              })}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/10 text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Data Source: {displayResults.metadata.dataSource}</span>
              </div>
              <span className="text-gray-600">•</span>
              <div className="flex items-center space-x-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{displayResults.metadata.yearsAnalyzed} years analyzed (1981-2023)</span>
              </div>
              <span className="text-gray-600">•</span>
              <div className="flex items-center space-x-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Updated: {new Date(displayResults.metadata.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Probability Chart */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-nasa-blue" />
          <span>Probability Analysis</span>
        </h3>
        <ProbabilityChart data={displayResults.probabilities} units={displayResults.probabilities.map(p => getTempUnitLabel(p.condition, getUnit(p.condition)) || undefined)} />
      </div>

      {/* Historical Trends Chart */}
      {displayResults.trends && displayResults.trends.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-nasa-blue" />
            <span>Historical Trends Over Time</span>
          </h3>
          <TrendChart data={displayResults.trends} title="Weather Patterns: 43-Year Historical Analysis" />
          <div className="glass-card p-4 mt-4">
            <p className="text-sm text-gray-300">
              <strong>Trend Analysis:</strong> This chart shows how weather conditions have changed over the past {displayResults.metadata.yearsAnalyzed} years 
              for this specific date. An upward trend indicates conditions are becoming more extreme, while a downward trend suggests conditions are moderating over time.
            </p>
          </div>
        </div>
      )}

      {/* Individual Distributions */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-nasa-blue" />
          <span>Statistical Distributions</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {displayResults.probabilities.map((prob, index) => (
            <DistributionChart key={index} data={prob} unit={getTempUnitLabel(prob.condition, getUnit(prob.condition)) || undefined} />
          ))}
        </div>
      </div>

      {/* Detailed Statistics */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Detailed Statistics</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayResults.probabilities.map((prob, index) => {
            const unit = getTempUnitLabel(prob.condition, getUnit(prob.condition));
            const suffix = unit ? ` ${unit}` : '';
            const simpleLikelihood = formatProbabilitySimple(prob.probability);
            return (
              <div key={index} className="glass-card p-6">
                <h4 className="text-lg font-semibold text-white mb-4 capitalize">
                  {prob.condition} Conditions
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-400">Likelihood:</span>
                    <span className="text-white font-semibold">{prob.probability.toFixed(1)}% <span className="text-gray-400 font-normal text-sm">({simpleLikelihood})</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mean:</span>
                    <span className="text-white font-semibold">{prob.mean.toFixed(2)}{suffix}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Median:</span>
                    <span className="text-white font-semibold">{prob.median.toFixed(2)}{suffix}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">25th Percentile:</span>
                    <span className="text-white font-semibold">{prob.percentile25.toFixed(2)}{suffix}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">75th Percentile:</span>
                    <span className="text-white font-semibold">{prob.percentile75.toFixed(2)}{suffix}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">90th Percentile:</span>
                    <span className="text-white font-semibold">{prob.percentile90.toFixed(2)}{suffix}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Panel */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
          <Download className="w-6 h-6 text-nasa-blue" />
          <span>Export Data</span>
        </h3>
        <ExportPanel results={displayResults} />
      </div>
    </div>
  );
};

export default Dashboard;
