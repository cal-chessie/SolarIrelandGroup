'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  BarChart3,
  Users,
  TrendingUp,
  Pause,
  Play,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ExperimentResult {
  experiment: {
    id: string;
    name: string;
    description: string;
    status: string;
    created_at: number;
    updated_at: number;
  };
  variants: Array<{
    id: string;
    name: string;
    description: string;
    traffic_weight: number;
    is_control: number;
    visitors: number;
    conversions: number;
    conversionRate: string;
  }>;
  conversionBreakdown: Array<{ variant_name: string; conversion_type: string; count: number }>;
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: string;
}

interface GlobalStats {
  totalExperiments: number;
  runningExperiments: number;
  totalAssignments: number;
  totalConversions: number;
}

export default function ABTestDashboard() {
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedExperiment, setExpandedExperiment] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [expRes, statsRes] = await Promise.all([
        fetch('/api/ab/experiments'),
        fetch('/api/ab/stats'),
      ]);
      const expData = await expRes.json();
      const statsData = await statsRes.json();
      setResults(expData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch A/B data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'paused' : 'running';
    await fetch('/api/ab/stats', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchData();
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      running: 'bg-green-400/10 text-green-400 border-green-400/20',
      paused: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
      stopped: 'bg-red-400/10 text-red-400 border-red-400/20',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${styles[status] || styles.running}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'running' ? 'bg-green-400 animate-pulse' : status === 'paused' ? 'bg-amber-400' : 'bg-red-400'}`} />
        {status}
      </span>
    );
  };

  const formatDate = (ts: number) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString('en-IE', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <FlaskConical className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-gray-500">Loading experiment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">A/B Testing</h2>
            <p className="text-xs text-gray-500">Live experiment results and conversion tracking</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: FlaskConical, label: 'Experiments', value: stats.totalExperiments, sub: `${stats.runningExperiments} running`, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { icon: Users, label: 'Total Visitors', value: stats.totalAssignments, sub: 'Unique visitors', color: 'text-sky-400', bg: 'bg-sky-400/10' },
            { icon: TrendingUp, label: 'Conversions', value: stats.totalConversions, sub: 'All types', color: 'text-green-400', bg: 'bg-green-400/10' },
            { icon: BarChart3, label: 'Avg. Rate', value: stats.totalAssignments > 0 ? ((stats.totalConversions / stats.totalAssignments) * 100).toFixed(1) + '%' : '0%', sub: 'Overall', color: 'text-violet-400', bg: 'bg-violet-400/10' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-md ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-3 h-3 ${stat.color}`} />
                </div>
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Experiment Cards */}
      <div className="space-y-3">
        {results.map((exp) => {
          const isExpanded = expandedExperiment === exp.experiment.id;
          const control = exp.variants.find((v) => v.is_control === 1);
          const treatment = exp.variants.find((v) => v.is_control === 0);

          // Calculate lift
          let lift: number | null = null;
          let liftDirection: 'up' | 'down' | null = null;
          if (control && treatment && Number(control.visitors) > 0) {
            const controlRate = Number(control.conversions) / Number(control.visitors);
            const treatmentRate = Number(treatment.conversions) / Number(treatment.visitors);
            if (controlRate > 0) {
              lift = ((treatmentRate - controlRate) / controlRate) * 100;
              liftDirection = lift >= 0 ? 'up' : 'down';
            }
          }

          return (
            <div
              key={exp.experiment.id}
              className="rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden"
            >
              {/* Experiment Header */}
              <button
                onClick={() => setExpandedExperiment(isExpanded ? null : exp.experiment.id)}
                className="w-full p-4 sm:p-5 text-left hover:bg-white/[0.01] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {statusBadge(exp.experiment.status)}
                      <span className="text-[10px] text-gray-600">
                        Since {formatDate(exp.experiment.created_at)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{exp.experiment.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{exp.experiment.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Lift indicator */}
                    {lift !== null && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                        lift >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {liftDirection === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(lift).toFixed(1)}%
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStatus(exp.experiment.id, exp.experiment.status); }}
                      className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                      {exp.experiment.status === 'running' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                  </div>
                </div>

                {/* Mini bar comparison (always visible) */}
                <div className="mt-3 flex items-center gap-4">
                  {exp.variants.map((v) => (
                    <div key={v.id} className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500 truncate">
                          {v.is_control ? 'Control' : 'Variant'}: {v.name}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">{v.conversionRate}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(Number(v.conversionRate) || 0, 100)}%`,
                            backgroundColor: v.is_control ? '#64748b' : '#f59e0b',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-600">{v.visitors} visitors</span>
                        <span className="text-[10px] text-gray-600">{v.conversions} conversions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-white/[0.04] p-4 sm:p-5 bg-white/[0.01]">
                  {/* Conversion breakdown table */}
                  {exp.conversionBreakdown.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Conversion Breakdown</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/[0.06]">
                              <th className="text-left py-2 pr-4 text-gray-500 font-medium">Variant</th>
                              <th className="text-left py-2 pr-4 text-gray-500 font-medium">Type</th>
                              <th className="text-right py-2 text-gray-500 font-medium">Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {exp.conversionBreakdown.map((row, i) => (
                              <tr key={`${row.variant_name}-${row.conversion_type}-${i}`} className="border-b border-white/[0.03]">
                                <td className="py-2 pr-4 text-gray-300">{row.variant_name}</td>
                                <td className="py-2 pr-4">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-gray-400">
                                    {row.conversion_type === 'cta_click' ? <Eye className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
                                    {row.conversion_type}
                                  </span>
                                </td>
                                <td className="py-2 text-right font-medium text-white">{row.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Variant details */}
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Variants</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {exp.variants.map((v) => (
                      <div key={v.id} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${v.is_control ? 'bg-gray-500' : 'bg-amber-400'}`} />
                          <span className="text-xs font-bold text-white">{v.name}</span>
                          <span className="text-[10px] text-gray-600">({v.traffic_weight}% traffic)</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-[10px] text-gray-600">Visitors</p>
                            <p className="text-sm font-bold text-white">{v.visitors}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-600">Conversions</p>
                            <p className="text-sm font-bold text-white">{v.conversions}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-600">Rate</p>
                            <p className="text-sm font-bold text-amber-400">{v.conversionRate}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {results.length === 0 && (
        <div className="text-center py-12">
          <FlaskConical className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No experiments configured yet</p>
        </div>
      )}
    </div>
  );
}
