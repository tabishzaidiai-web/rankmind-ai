'use client';

import { useState, useEffect } from 'react';
import { Terminal, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ActivityLog {
  id: string;
  agent_name: string;
  action_text: string;
  status: string;
  created_at: string;
}

export default function ActivityFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/activity-logs');
        const data = await res.json();
        if (!data.error) {
          setLogs(data);
        }
      } catch (e) {
        console.error('Failed to fetch logs', e);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 flex items-center justify-center h-[300px]">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[400px]">
      <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Agent Activity</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-bold uppercase">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[12px]">
        {logs.length === 0 ? (
          <div className="text-white/30 text-center py-10 italic">
            No agent activity recorded yet. Run an audit to see live logs.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-3 group">
              <div className="text-white/20 whitespace-nowrap">
                [{new Date(log.created_at).toLocaleTimeString([], { hour12: false })}]
              </div>
              <div className="flex-1">
                <span className={`font-bold ${
                  log.agent_name === 'RankBot' ? 'text-violet-400' :
                  log.agent_name === 'LinkBot' ? 'text-teal-400' :
                  log.agent_name === 'GEO-G' ? 'text-blue-400' :
                  'text-amber-400'
                }`}>
                  {log.agent_name}:
                </span>
                <span className="text-white/80 ml-2">{log.action_text}</span>
              </div>
              <div className="flex-shrink-0">
                {log.status === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="bg-white/5 px-4 py-2 border-t border-white/10 text-[10px] text-white/30 flex justify-between">
        <span>Visual Proof of Work Engine v1.0</span>
        <span>Auto-refreshing...</span>
      </div>
    </div>
  );
}
