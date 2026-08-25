import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { chatApi } from '@/api';
import type { ChatMessage } from '@/types';
import { ToMd } from '../../components/ToMd';

export default function ChatTab({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatApi.getHistory(projectId)
      .then(res => setMessages(res.data.messages || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userText = input.trim();
    setInput('');
    setSending(true);

    // Optimistic UI update
    const tempUserMsg: ChatMessage = { 
      role: 'user', 
      content: userText, 
      timestamp: new Date().toISOString(), 
      sources: [] 
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await chatApi.sendMessage(projectId, userText);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date().toISOString(),
        sources: res.data.sources || [],
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error answering your request. Please try again.', 
        timestamp: new Date().toISOString(), 
        sources: [] 
      }]);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 350 }} />;

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 120px)', 
        position: 'relative',
        margin: '-8px 0',
      }}
    >
      {/*  Messages Scroll Area  */}
      <div 
        ref={scrollRef} 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '12px 4px 100px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 20 
        }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px' }}>
            <div 
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Bot size={28} color="#a5b4fc" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Project Intelligence Assistant
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
              Ask anything about project scope, risks, timeline, deliverables, or document details.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              style={{ 
                display: 'flex', 
                gap: 14, 
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}
            >
              <div 
                style={{ 
                  width: 34, 
                  height: 34, 
                  borderRadius: '50%', 
                  background: msg.role === 'user' ? '#6366f1' : '#021023', 
                  border: msg.role === 'assistant' ? '1px solid rgba(99,102,241,0.3)' : 'none',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0 
                }}
              >
                {msg.role === 'user' ? <User size={16} color="#fff" /> : <Bot size={16} color="#a5b4fc" />}
              </div>
              
              <div style={{ maxWidth: '80%' }}>
                <div 
                  style={{
                    padding: '12px 18px',
                    borderRadius: 14,
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'var(--bg-surface)',
                    color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                    borderTopRightRadius: msg.role === 'user' ? 2 : 14,
                    borderTopLeftRadius: msg.role === 'assistant' ? 2 : 14,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div className={msg.role === 'assistant' ? 'markdown-body' : ''} style={{ color: 'inherit' }}>
                    <ToMd content={msg.content} />
                  </div>
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span>Source context:</span>
                    <span style={{ color: '#a5b4fc', fontWeight: 500 }}>{msg.sources.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div 
              style={{ 
                width: 34, 
                height: 34, 
                borderRadius: '50%', 
                background: '#021023', 
                border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Bot size={16} color="#a5b4fc" />
            </div>
            <div 
              style={{ 
                padding: '12px 18px', 
                borderRadius: 14, 
                borderTopLeftRadius: 2,
                background: 'var(--bg-surface)', 
                border: '1px solid var(--border)',
                display: 'flex', 
                alignItems: 'center',
                gap: 8,
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            >
              <Loader2 size={15} className="anim-spin" color="#a5b4fc" />
              <span>Analyzing document context...</span>
            </div>
          </div>
        )}
      </div>

      {/*  Fixed Prompt Input Area at Bottom  */}
      <form 
        onSubmit={handleSend} 
        style={{ 
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 0 8px',
          background: 'linear-gradient(to top, var(--bg-base) 80%, transparent)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}
      >
        <div 
          style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glow)',
            borderRadius: 14,
            padding: '4px 6px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <input
            type="text"
            className="input"
            placeholder="Ask about project risks, deliverables, or uploaded document details..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={sending}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              boxShadow: 'none', 
              padding: '12px 16px', 
              fontSize: 14,
              color: 'var(--text-primary)'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              flexShrink: 0,
              marginRight: 4,
            }}
          >
            <Send size={15} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
