import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../store/authStore';
import { requestJson } from '../utils/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const QUICK_PROMPTS = [
  'Best post-workout meal?',
  'How to improve sleep quality?',
  'Beginner push day routine?',
  'Recovery tips for sore muscles',
];

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-3 py-2">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-2 w-2 rounded-full bg-emerald-400/60 animate-typing-dot"
        style={{ animationDelay: `${i * 200}ms` }}
      />
    ))}
  </div>
);

const ChatPage = () => {
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState('');
  const [draftError, setDraftError] = useState('');
  const bottomRef = useRef(null);

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    setError('');
    try {
      const data = await requestJson(`${API_BASE_URL}/chat/history?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load chat history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const sendMessage = async (messageText) => {
    const message = String(messageText || '').trim();
    if (!message) {
      setDraftError('Message cannot be empty');
      return;
    }
    if (message.length > 1000) {
      setDraftError('Message must be 1000 characters or less');
      return;
    }
    setDraftError('');
    setIsSending(true);
    setError('');
    setLastFailedMessage('');
    try {
      const data = await requestJson(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      const nextMessages = Array.isArray(data.messages) ? data.messages : [];
      setMessages((prev) => [...prev, ...nextMessages]);
      setDraft('');
    } catch (sendError) {
      setError(sendError.message || 'Unable to send message');
      setLastFailedMessage(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(draft);
  };

  const handleRetry = async () => {
    if (lastFailedMessage) await sendMessage(lastFailedMessage);
  };

  const handleClear = async () => {
    setIsClearing(true);
    setError('');
    try {
      await requestJson(`${API_BASE_URL}/chat/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
      setLastFailedMessage('');
      setDraft('');
    } catch (clearError) {
      setError(clearError.message || 'Unable to clear chat history');
    } finally {
      setIsClearing(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setDraft(prompt);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] lg:h-[calc(100vh-3rem)] pt-10 lg:pt-0">
        {/* Chat header */}
        <header className="flex items-center justify-between gap-3 pb-4 border-b border-neutral-800/50 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🤖</span> AI Coach Chat
            </h1>
            <p className="text-xs text-neutral-500 mt-1">Ask about workouts, recovery, nutrition, and more.</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={isClearing || !hasMessages}
            className="btn-danger text-xs px-3 py-2"
          >
            {isClearing ? 'Clearing...' : 'Clear history'}
          </button>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {isLoadingHistory && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-xs text-neutral-500">Loading chat history...</p>
              </div>
            </div>
          )}

          {!isLoadingHistory && !hasMessages && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <span className="text-5xl mb-4">💬</span>
              <h2 className="text-lg font-bold text-white">Start a conversation</h2>
              <p className="text-sm text-neutral-500 mt-2 max-w-sm">
                Your AI fitness coach is ready to help with workout advice, recovery tips, and nutrition guidance.
              </p>

              {/* Quick prompts */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="rounded-xl border border-neutral-700/50 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800/60 hover:text-white hover:border-emerald-500/20 transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((item) => (
            <article
              key={item._id}
              className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[85%] ${item.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    item.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white font-bold'
                      : 'bg-neutral-800 text-lg'
                  }`}
                >
                  {item.role === 'user' ? 'Y' : '🤖'}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    item.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-600/20 to-cyan-600/15 border border-emerald-500/20 rounded-tr-md'
                      : 'glass rounded-tl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-100">{item.message}</p>
                  <p className="mt-2 text-[10px] text-neutral-600">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </article>
          ))}

          {isSending && (
            <article className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-lg flex-shrink-0">
                  🤖
                </div>
                <div className="glass rounded-2xl rounded-tl-md px-4 py-3">
                  <TypingIndicator />
                </div>
              </div>
            </article>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick prompts when have messages */}
        {hasMessages && !isSending && (
          <div className="flex gap-2 pb-2 overflow-x-auto flex-shrink-0">
            {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                className="rounded-lg border border-neutral-800/50 bg-neutral-900/40 px-2.5 py-1.5 text-[10px] text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors whitespace-nowrap flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <form className="flex-shrink-0 border-t border-neutral-800/50 pt-4 space-y-2" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-3">
              <p className="text-xs text-red-400 flex-1">{error}</p>
              {lastFailedMessage && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isSending}
                  className="btn-ghost text-amber-400 text-xs"
                >
                  Retry
                </button>
              )}
            </div>
          )}
          {draftError && <p className="text-xs text-red-400">{draftError}</p>}

          <div className="flex items-end gap-3">
            <textarea
              rows={2}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (event.target.value.trim().length <= 1000) setDraftError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (draft.trim()) handleSubmit(event);
                }
              }}
              placeholder="Ask your AI coach anything..."
              maxLength={1200}
              className="input-field flex-1 resize-none"
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              className="btn-primary h-[52px] px-5 flex-shrink-0"
            >
              {isSending ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </div>

          <p className="text-[10px] text-neutral-600 text-right">
            {draft.length}/1000
          </p>
        </form>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
