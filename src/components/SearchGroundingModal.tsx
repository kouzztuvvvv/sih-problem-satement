import React, { useState } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  BookOpen,
  Sparkles,
  Loader2,
  X,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuery?: string;
  patientContext?: string;
}

interface GroundedSource {
  title: string;
  uri: string;
}

interface GroundedResponse {
  answer: string;
  sources: GroundedSource[];
  model: string;
}

export const SearchGroundingModal: React.FC<SearchGroundingModalProps> = ({
  isOpen,
  onClose,
  defaultQuery = 'Latest ICMR guidelines for early knee osteoarthritis screening and diagnosis in rural India',
  patientContext,
}) => {
  const [query, setQuery] = useState(defaultQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroundedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestedQueries = [
    'Latest ICMR and WHO guidelines for knee osteoarthritis screening in rural communities',
    'Biomechanical impact of forehead strap load carriage (Namlo) on patellofemoral joint wear',
    'Epidemiological prevalence of knee osteoarthritis in North Eastern Region India hill states',
    'Effective isometric quadriceps rehabilitation protocols for grade 1 and 2 knee osteoarthritis',
    'Nutritional efficacy of fermented fish (Shidal) and soybean (Akhuni) for subchondral bone density'
  ];

  const handleSearch = async (queryText?: string) => {
    const q = queryText || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/research/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q.trim(),
          patientContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch search grounding research data.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Error executing search grounding query.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Grounded Clinical Research Intelligence
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300">
                  gemini-3.5-flash + Google Search
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live Google Search grounding for up-to-date osteoarthritis guidelines and epidemiological evidence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search latest clinical research, protocols, or guidelines..."
              className="w-full text-xs pl-10 pr-24 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
            />
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="absolute right-2 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm shadow-teal-600/20"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{loading ? 'Searching...' : 'Ground'}</span>
            </button>
          </div>

          {/* Quick Query Pill Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">
              Topics:
            </span>
            {suggestedQueries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 shrink-0 transition-colors cursor-pointer"
              >
                {item.slice(0, 42)}...
              </button>
            ))}
          </div>
        </div>

        {/* Body / Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <span className="font-bold block">Search Grounding Failed:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-teal-200 dark:border-teal-900/50 border-t-teal-600 animate-spin" />
                <Globe className="w-5 h-5 text-teal-600 absolute inset-0 m-auto" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Grounding with live Google Search...
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm">
                Retrieving peer-reviewed clinical data, ICMR advisories, and orthopaedic publications using gemini-3.5-flash.
              </p>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
              <BookOpen className="w-10 h-10 text-teal-500/50" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Search Live Medical Literature & Clinical Guidelines
              </p>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Click one of the suggested topics above or enter your query to fetch up-to-date, verified guidelines grounded with real-time web citations.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Grounded Synthesis */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Synthesized Evidence Report
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    Google Search Grounded
                  </span>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {result.answer}
                </div>
              </div>

              {/* Verified Web Citations & Sources */}
              {result.sources && result.sources.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-teal-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Grounded Web Citations & Sources ({result.sources.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-500 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 text-xs flex items-center justify-between gap-3 group transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-300 font-medium">
                            {source.title || source.uri}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Real-time citation verification with Gemini Search Grounding</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
