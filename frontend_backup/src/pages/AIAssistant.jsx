import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, HelpCircle, Loader2 } from 'lucide-react';
import { aiService } from '../services/api';

const QUICK_QUESTIONS = [
  "How was my productivity this week?",
  "What should I focus on today?",
  "Which habits am I missing most?",
  "Why did my consistency change?",
  "How accurate is my planning?",
  "Give me a weekly productivity summary.",
  "What patterns do you see in my productivity?",
  "Help me plan tomorrow."
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm your **AI Productivity Assistant**. I can analyze your tasks, habits, streaks, focus sessions, and consistency metrics to help you plan smarter and stay consistent. How can I help you today?",
      context: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryContext, setSummaryContext] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsgId = Date.now();
    const userMessageObj = { id: userMsgId, sender: 'user', text: query };

    setMessages(prev => [...prev, userMessageObj]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const response = await aiService.chat(query);
      const aiMessageObj = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.message || 'I have analyzed your data.',
        context: response.summaryContext
      };
      setMessages(prev => [...prev, aiMessageObj]);
      if (response.summaryContext) {
        setSummaryContext(response.summaryContext);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMessageObj = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'AI assistant is temporarily unavailable. Please try again.',
        isError: true
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col space-y-4 pb-20 md:pb-4">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">AI Productivity Assistant</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Understand your progress. Plan smarter. Stay consistent.
          </p>
        </div>
      </div>

      {/* QUICK STATS SUMMARY BANNER (Optional factual insights) */}
      {summaryContext && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-card border border-border rounded-xl text-xs">
          <div>
            <span className="text-muted-foreground block">Today's Consistency</span>
            <span className="font-bold text-sm text-primary">
              {summaryContext.consistency?.current != null ? Math.round(summaryContext.consistency.current) + '%' : 'Not enough data'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Current Streak</span>
            <span className="font-bold text-sm text-orange-400">
              {summaryContext.consistency?.currentStreak != null ? summaryContext.consistency.currentStreak + ' days' : '0 days'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Tasks Planned/Done</span>
            <span className="font-bold text-sm">
              {summaryContext.tasks ? `${summaryContext.tasks.completed}/${summaryContext.tasks.planned}` : '0/0'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Habit Completion</span>
            <span className="font-bold text-sm text-emerald-400">
              {summaryContext.habits?.completionPercentage != null ? Math.round(summaryContext.habits.completionPercentage) + '%' : 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* QUICK QUESTIONS CAROUSEL / GRID */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Questions</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="shrink-0 text-xs px-3 py-2 bg-secondary/60 hover:bg-secondary border border-border/80 rounded-lg text-foreground transition-colors disabled:opacity-50 text-left whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 bg-card border border-border rounded-xl p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none font-medium'
                  : msg.isError
                  ? 'bg-destructive/10 border border-destructive/30 text-destructive rounded-tl-none'
                  : 'bg-secondary/40 border border-border/60 text-foreground rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-xl rounded-tl-none text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Analyzing your productivity data...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="relative">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your productivity..."
          rows={2}
          disabled={loading}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none pr-12 disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputMessage.trim() || loading}
          className="absolute right-3 bottom-4 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
