import { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, FileText, History } from 'lucide-react';
import { generateSummary, getSummaries } from '../../api/summary';
import { formatDate } from '../../utils/formatDate';
import Loader from '../common/Loader';
import useSocket from '../../hooks/useSocket';

const SummaryPanel = ({ conversationId, onClose }) => {
  const [currentSummary, setCurrentSummary] = useState(null);
  const [pastSummaries, setPastSummaries] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('new_summary', ({ summary }) => {
        setCurrentSummary(summary);
      });
    }

    return () => {
      if (socket) socket.off('new_summary');
    };
  }, [conversationId, socket]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const { data } = await generateSummary(conversationId);
      setCurrentSummary(data);
      
      // Notify others via socket
      if (socket) {
        socket.emit('summary_created', { conversationId, summary: data });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleShowHistory = async () => {
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    setLoadingHistory(true);
    try {
      const { data } = await getSummaries(conversationId);
      setPastSummaries(data);
      setShowHistory(true);
    } catch (err) {
      setError('Failed to load past summaries');
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="w-80 h-full glass border-l border-dark-700/50 flex flex-col z-10 animate-slide-in-right">
      {/* Header */}
      <div className="px-5 py-4 border-b border-dark-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary-400" />
          <h3 className="font-semibold text-dark-100 text-sm">AI Summaries</h3>
        </div>
        <button onClick={onClose} className="p-1 text-dark-400 hover:text-dark-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Action Area */}
      <div className="p-5 border-b border-dark-700/50 bg-dark-800/30 space-y-3">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full btn-primary py-2.5 flex justify-center text-sm shadow-none"
        >
          {generating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Summarize Recent Chat
            </>
          )}
        </button>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>

      {/* Current Summary (generated this session) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {currentSummary ? (
          <div className="bg-dark-800/60 rounded-xl p-4 border border-dark-700/40 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-dark-400 uppercase tracking-wider font-semibold">
                {formatDate(currentSummary.createdAt)}
              </span>
              <span className="text-[10px] text-dark-500">
                By {currentSummary.generatedBy?.username}
              </span>
            </div>
            <ul className="space-y-2">
              {currentSummary.bullets.map((bullet, idx) => (
                <li key={idx} className="text-sm text-dark-200 flex items-start gap-2">
                  <span className="text-primary-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-dark-700/40">
              <p className="text-[10px] text-dark-500 text-right">
                Based on {currentSummary.messageCount} messages
              </p>
            </div>
          </div>
        ) : (
          !showHistory && (
            <div className="flex flex-col items-center justify-center h-full text-dark-500 gap-3">
              <FileText size={32} className="opacity-40" />
              <p className="text-sm text-center">Click above to generate a summary of recent chat messages.</p>
            </div>
          )
        )}

        {/* View History Toggle */}
        <button
          onClick={handleShowHistory}
          disabled={loadingHistory}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium
            text-dark-400 hover:text-dark-200 hover:bg-dark-800/60 transition-colors"
        >
          <History size={14} />
          {loadingHistory ? 'Loading...' : showHistory ? 'Hide History' : 'View Past Summaries'}
        </button>

        {/* Past Summaries */}
        {showHistory && pastSummaries.length > 0 && (
          <div className="space-y-3">
            {pastSummaries.map((summary) => (
              <div
                key={summary._id}
                className="bg-dark-800/40 rounded-xl p-3 border border-dark-700/30 animate-fade-in"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-dark-400 uppercase tracking-wider font-semibold">
                    {formatDate(summary.createdAt)}
                  </span>
                  <span className="text-[10px] text-dark-500">
                    By {summary.generatedBy?.username}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {summary.bullets.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-dark-300 flex items-start gap-2">
                      <span className="text-primary-500/60 mt-1 w-1 h-1 rounded-full bg-primary-500/60 flex-shrink-0" />
                      <span className="leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-dark-600 text-right mt-2">
                  {summary.messageCount} messages
                </p>
              </div>
            ))}
          </div>
        )}

        {showHistory && pastSummaries.length === 0 && !loadingHistory && (
          <p className="text-xs text-dark-500 text-center py-2">No past summaries found.</p>
        )}
      </div>
    </div>
  );
};

export default SummaryPanel;

