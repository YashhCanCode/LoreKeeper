import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Send,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  MessageSquarePlus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface DashboardProps {
  onBackToLanding: () => void;
}

interface DocumentInfo {
  document_id: string;
  filename: string;
  uploaded_at: string;
  chunk_count: number;
}

interface SourceChunk {
  document_id: string;
  filename: string;
  chunk_text: string;
  chunk_index: number;
  page_number?: number | null;
  relevance_score: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  sources: SourceChunk[];
}

interface ChatSessionInfo {
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface Contradiction {
  issue: string;
  existing_lore: string;
  source_filename: string;
  source_chunk_index?: number | null;
}

type Tab = 'chat' | 'consistency';

export default function Dashboard({ onBackToLanding }: DashboardProps) {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>('chat');

  // Chat session state
  const [sessions, setSessions] = useState<ChatSessionInfo[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'ask' | 'create'>('ask');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Consistency check state
  const [consistencyText, setConsistencyText] = useState('');
  const [consistencyLoading, setConsistencyLoading] = useState(false);
  const [consistencyResult, setConsistencyResult] = useState<{
    has_contradictions: boolean;
    contradictions: Contradiction[];
    message: string;
  } | null>(null);

  const fetchDocuments = async () => {
    setDocsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/documents`);
      if (!res.ok) throw new Error('Failed to load documents');
      const data = await res.json();
      setDocuments(data.documents);
      setError(null);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setDocsLoading(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error('Failed to load chat');
      const data = await res.json();
      setMessages(
        (data.messages || []).map((m: any) => ({
          role: m.role,
          text: m.content,
          sources: m.sources || [],
        }))
      );
      setActiveSessionId(sessionId);
    } catch (err: any) {
      setError(err.message || 'Failed to load chat session');
    }
  };

  const createSession = async (selectAfterCreate = true) => {
    try {
      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to create chat');
      const session: ChatSessionInfo = await res.json();
      setSessions((prev) => [session, ...prev]);
      if (selectAfterCreate) {
        setMessages([]);
        setActiveSessionId(session.session_id);
      }
      return session;
    } catch (err: any) {
      setError(err.message || 'Failed to create chat');
      return null;
    }
  };

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/sessions`);
      if (!res.ok) throw new Error('Failed to load chats');
      const data = await res.json();
      const list: ChatSessionInfo[] = data.sessions || [];
      setSessions(list);
      if (list.length > 0) {
        await loadSession(list[0].session_id);
      } else {
        await createSession();
      }
    } catch (err: any) {
      console.error('Failed to load chats', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleNewChat = async () => {
    await createSession();
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete chat');
      const remaining = sessions.filter((s) => s.session_id !== sessionId);
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          await loadSession(remaining[0].session_id);
        } else {
          await createSession();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete chat');
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`${API_BASE}/api/documents`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.detail || `Failed to upload ${file.name}`);
        }
      } catch (err: any) {
        setError(err.message || `Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchDocuments();
  };

  const handleDelete = async (documentId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete document');
      setDocuments((prev) => prev.filter((d) => d.document_id !== documentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const handleSendMessage = async () => {
    const query = chatInput.trim();
    if (!query || chatLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: query, sources: [] }]);
    setChatInput('');
    setChatLoading(true);

    const isCreative = chatMode === 'create';
    const endpoint = isCreative ? '/api/chat/creative' : '/api/chat';
    const body = isCreative
      ? { prompt: query, session_id: activeSessionId }
      : { query, session_id: activeSessionId };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Chat request failed');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: isCreative ? data.content : data.answer, sources: data.sources || [] },
      ]);
      // Refresh session list so titles/ordering stay in sync
      fetchSessionListQuietly();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Error: ${err.message || 'Something went wrong.'}`, sources: [] },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchSessionListQuietly = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sessions`);
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      // ignore - non-critical refresh
    }
  };

  const handleCheckConsistency = async () => {
    const text = consistencyText.trim();
    if (!text || consistencyLoading) return;

    setConsistencyLoading(true);
    setConsistencyResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/consistency/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Consistency check failed');
      setConsistencyResult(data);
    } catch (err: any) {
      setConsistencyResult({
        has_contradictions: false,
        contradictions: [],
        message: `Error: ${err.message || 'Something went wrong.'}`,
      });
    } finally {
      setConsistencyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-black flex flex-col font-dashboard pt-20 text-purple-50">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <button
          onClick={onBackToLanding}
          className="p-2 rounded-lg hover:bg-white/5 text-purple-300 hover:text-white transition-colors cursor-pointer"
          title="Back to landing page"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-white">LoreKeeper</h1>
        <span className="text-xs text-purple-300/50">Chat Workspace</span>
      </header>

      {error && (
        <div className="mx-6 mt-4 px-4 py-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex min-h-0 max-w-7xl w-full mx-auto p-6 gap-6">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 flex flex-col gap-5 min-h-0">
          {/* Chats */}
          <div className="flex flex-col gap-2 min-h-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Chats</h2>
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep-purple-700 hover:bg-deep-purple-600 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                New
              </button>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
              {sessionsLoading ? (
                <div className="flex items-center gap-2 text-sm text-purple-300/50 px-1 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading chats...
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-purple-300/40 px-1 py-2">No chats yet.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.session_id}
                    onClick={() => loadSession(session.session_id)}
                    className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      activeSessionId === session.session_id
                        ? 'bg-deep-purple-700/50 border-soft-pink/30'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-purple-300 shrink-0" />
                    <p className="flex-1 min-w-0 text-sm text-white truncate">{session.title}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.session_id);
                      }}
                      className="p-1 text-purple-300/40 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="flex flex-col gap-2 min-h-0 flex-1 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Documents</h2>
              <button
                onClick={handleUploadClick}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep-purple-700 hover:bg-deep-purple-600 text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.markdown"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
              {docsLoading ? (
                <div className="flex items-center gap-2 text-sm text-purple-300/50 px-1 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading documents...
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-purple-300/40 px-1 py-2">
                  No documents yet. Upload PDF, TXT, or Markdown files to get started.
                </p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03]"
                  >
                    <FileText className="w-4 h-4 text-purple-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{doc.filename}</p>
                      <p className="text-xs text-purple-300/40">{doc.chunk_count} chunks</p>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.document_id)}
                      className="p-1 text-purple-300/40 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 flex flex-col min-w-0 rounded-xl border border-white/10 bg-white/[0.02]">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'text-white border-b-2 border-soft-pink'
                  : 'text-purple-300/50 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Chat
            </button>
            <button
              onClick={() => setActiveTab('consistency')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'consistency'
                  ? 'text-white border-b-2 border-soft-pink'
                  : 'text-purple-300/50 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Consistency Check
            </button>
          </div>

          {/* Chat tab */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {messages.length === 0 && !chatLoading && (
                  <p className="text-sm text-purple-300/40">
                    Upload your documents, then ask me anything about them. I only answer from what you've uploaded.
                  </p>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col gap-1.5 max-w-[80%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-deep-purple-700 text-white rounded-tr-sm'
                          : 'bg-white/5 border border-white/10 text-purple-100 rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, idx) => (
                          <span
                            key={idx}
                            title={src.chunk_text}
                            className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-purple-300/70"
                          >
                            {src.filename}
                            {src.page_number ? ` · p.${src.page_number}` : ` · chunk ${src.chunk_index}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="self-start flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-purple-300/60 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <div className="flex items-center gap-2 px-4 pt-3">
                <button
                  type="button"
                  onClick={() => setChatMode('ask')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    chatMode === 'ask'
                      ? 'bg-deep-purple-700 text-white'
                      : 'bg-white/5 text-purple-300/60 hover:text-white'
                  }`}
                >
                  Ask
                </button>
                <button
                  type="button"
                  onClick={() => setChatMode('create')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    chatMode === 'create'
                      ? 'bg-deep-purple-700 text-white'
                      : 'bg-white/5 text-purple-300/60 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> Create
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 p-4 pt-2 border-t border-white/10"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    chatMode === 'create'
                      ? 'Describe what to create (a character, scene, plot twist)...'
                      : 'Ask anything about your documents...'
                  }
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-soft-pink/60 placeholder-purple-300/30"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2.5 rounded-lg bg-deep-purple-700 hover:bg-deep-purple-600 text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Consistency tab */}
          {activeTab === 'consistency' && (
            <div className="flex-1 flex flex-col min-h-0 p-5 gap-4">
              <p className="text-sm text-purple-300/50">
                Paste a new paragraph to check it against your uploaded documents for contradictions.
              </p>
              <textarea
                value={consistencyText}
                onChange={(e) => setConsistencyText(e.target.value)}
                placeholder="Paste new manuscript text here..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white resize-none focus:outline-none focus:border-soft-pink/60 placeholder-purple-300/30"
              />
              <button
                onClick={handleCheckConsistency}
                disabled={consistencyLoading || !consistencyText.trim()}
                className="self-start flex items-center gap-2 px-4 py-2.5 rounded-lg bg-deep-purple-700 hover:bg-deep-purple-600 text-white text-sm font-medium disabled:opacity-40 transition-colors cursor-pointer"
              >
                {consistencyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Check Consistency
              </button>

              {consistencyResult && (
                <div className="flex flex-col gap-3">
                  {consistencyResult.has_contradictions ? (
                    consistencyResult.contradictions.map((c, i) => (
                      <div key={i} className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/25 flex gap-3">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-rose-300 font-medium">{c.issue}</p>
                          <p className="text-purple-200/70 mt-1">Existing detail: {c.existing_lore}</p>
                          <p className="text-purple-300/40 text-xs mt-1">
                            Source: {c.source_filename}
                            {c.source_chunk_index != null ? ` · chunk ${c.source_chunk_index}` : ''}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/25 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <p className="text-sm text-emerald-300">{consistencyResult.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
