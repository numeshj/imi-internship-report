import React, { useEffect, useRef, useState } from 'react';
import { useChatEngine } from './useChatEngine';
import './chatStyles.css';

const ChatBot = () => {
  const { messages, send, retryLast, editLastUser, clear, streaming, abort, addAssistant, appendUser, startStreamingAssistant, updateLastAssistant, finalizeStreamingAssistant } = useChatEngine();
  const [backendMode, setBackendMode] = useState(false);
  const [checking, setChecking] = useState(false);
  const [useStream, setUseStream] = useState(true);
  const [apiBase, setApiBase] = useState('http://localhost:8001');
  const hadTokensRef = useRef(false); // track if any token arrived for current stream
  const [userId, setUserId] = useState(()=> localStorage.getItem('imi-user-id') || ''); 
  const [userName, setUserName] = useState(()=> localStorage.getItem('imi-user-name') || ''); 
  const [userEmail, setUserEmail] = useState(()=> localStorage.getItem('imi-user-email') || ''); 
  const [needsIdentity, setNeedsIdentity] = useState(()=> !localStorage.getItem('imi-user-id'));
  const panelRef = useRef(null);
  const dragState = useRef(null);
  const resizeState = useRef(null);
  const [sources, setSources] = useState([]); // meta sources for last answer
  const [confidence, setConfidence] = useState(null);
  const showSources = false; // disable sources display per user request

  const checkBackend = async () => {
    setChecking(true);
    const candidates = [ 'http://localhost:8001', 'http://127.0.0.1:8001', 'http://localhost:8000', 'http://127.0.0.1:8000' ];
    for(const base of candidates){
      try {
        const res = await fetch(base + '/health');
        if(res.ok){
          setApiBase(base);
          window.__CHAT_API_BASE = base;
          setBackendMode(true);
          break;
        }
      } catch(e){ /* try next */ }
    }
    setChecking(false);
  };

  useEffect(()=>{ window.__CHAT_API_BASE = apiBase; }, [apiBase]);

  useEffect(()=> { checkBackend(); }, []);

  // SSE UI updates
  useEffect(()=>{
  const handleStart = () => { hadTokensRef.current = false; startStreamingAssistant(); };
    const handleMeta = (e) => { const d = e.detail; setSources(d.sources||[]); setConfidence(d.confidence||null); };
  const handleToken = (e) => { hadTokensRef.current = true; updateLastAssistant(e.detail.text, { append:false }); };
    const handleDone = (e) => {
      const d = (e && e.detail) || {};
      const lastAssistant = [...messages].reverse().find(m=>m.role==='assistant');
      if(!hadTokensRef.current){
        const fallback = d.message || 'No confident match. Try rephrasing or narrow the topic (e.g. ask: "assignment 12 logic" or /help).';
        if(lastAssistant){
          updateLastAssistant(fallback, { append:false });
        } else {
          startStreamingAssistant();
          updateLastAssistant(fallback, { append:false });
        }
      }
      finalizeStreamingAssistant();
    };
    window.addEventListener('chat-stream-start', handleStart);
    window.addEventListener('chat-stream-meta', handleMeta);
    window.addEventListener('chat-stream-token', handleToken);
    window.addEventListener('chat-stream-done', handleDone);
    return () => {
      window.removeEventListener('chat-stream-start', handleStart);
      window.removeEventListener('chat-stream-meta', handleMeta);
      window.removeEventListener('chat-stream-token', handleToken);
      window.removeEventListener('chat-stream-done', handleDone);
    };
  }, [startStreamingAssistant, updateLastAssistant, finalizeStreamingAssistant, messages]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [editing, setEditing] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  /* ---- Identity & Session Handling ---- */
  const generateUserId = () => 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
  const submitIdentity = async (e) => {
    e.preventDefault();
    if(!userName.trim() || !userEmail.trim()) return;
    let id = userId;
    if(!id){
      id = generateUserId();
      setUserId(id);
      localStorage.setItem('imi-user-id', id);
    }
    localStorage.setItem('imi-user-name', userName.trim());
    localStorage.setItem('imi-user-email', userEmail.trim());
    setNeedsIdentity(false);
    try {
      const base = window.__CHAT_API_BASE || apiBase;
      const res = await fetch(base + '/session/init', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name:userName.trim(), email:userEmail.trim() }) });
      if(res.ok){
        const data = await res.json();
        if(data.user_id){
          setUserId(data.user_id);
          localStorage.setItem('imi-user-id', data.user_id);
        }
      }
    } catch(_){}
  };

  // If backend becomes available later and we already have identity, sync once
  useEffect(()=>{
    if(backendMode && userId && !needsIdentity){
      const base = window.__CHAT_API_BASE || apiBase;
      fetch(base + '/session/init', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name:localStorage.getItem('imi-user-name')||'', email:localStorage.getItem('imi-user-email')||'' }) }).catch(()=>{});
    }
  }, [backendMode, userId, needsIdentity, apiBase]);

  useEffect(()=>{
    if(open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(()=>{
    if(listRef.current){
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if(!input.trim()) return;
  if(needsIdentity){ return; }
    if(editing){
      editLastUser(input);
      setEditing(false);
    } else {
      if(backendMode){
        const question = input.trim();
        appendUser(question);
        if(useStream){
          startStream(question);
        } else {
          try {
            const r = await fetch(apiBase + '/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ question, top_k:3, user_id:userId }) });
            const data = await r.json();
            if(data.markdown){ addAssistant(data.markdown); setSources(data.results||[]); setConfidence(data.results?.[0]?.score || null); }
            else if(data.answer){ addAssistant(data.answer); }
            else if(data.message){ addAssistant(data.message); }
          } catch(e){ addAssistant('Backend error. Using local knowledge base.'); }
        }
      } else { send(input); }
    }
    setInput('');
  };

  const handleKey = (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      handleSend();
    }
  };

  const lastUserContent = (()=>{ const rev=[...messages].reverse(); const u = rev.find(m=>m.role==='user'); return u?.content||''; })();

  return (
    <>
      <button className="chat-launch" onClick={()=> setOpen(o=>!o)} aria-label={open? 'Close chat' : 'Open chat'}>
        {open ? '✖' : '💬'}
      </button>
      {open && (
        <div className="chat-panel draggable" ref={panelRef} role="dialog" aria-label="Assistant Chat" aria-modal="false">
          <div className="chat-header" onMouseDown={(e)=>{
            if(e.target.closest('.chat-actions')) return;
            const rect = panelRef.current.getBoundingClientRect();
            dragState.current = { x:e.clientX, y:e.clientY, left:rect.left, top:rect.top };
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', endDrag);
          }}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className="chat-title">Assistant{backendMode && <span style={{marginLeft:6,fontSize:'.6rem',letterSpacing:'.8px',fontWeight:600,opacity:.8}}>API</span>}</div>
              {!backendMode && !checking && <button onClick={checkBackend} className="retry-backend" title="Retry backend detection" style={{fontSize:'.55rem',letterSpacing:'.6px',padding:'4px 6px'}}>Check API</button>}
              {backendMode && <label style={{display:'flex',alignItems:'center',gap:4,fontSize:'.55rem'}}><input type="checkbox" checked={useStream} onChange={e=> setUseStream(e.target.checked)} />Stream</label>}
            </div>
            <div className="chat-actions">
              {streaming ? <button onClick={abort} title="Stop generating">■</button> : <button onClick={retryLast} title="Retry last">⟳</button>}
              <button onClick={()=> { setEditing(true); setInput(lastUserContent); }} disabled={!lastUserContent} title="Edit last user message">✎</button>
              <button onClick={clear} title="Clear conversation">🗑</button>
              <button onClick={()=> setOpen(false)} title="Close">–</button>
            </div>
            <div className="resizer" onMouseDown={(e)=>{
              e.stopPropagation();
              const rect = panelRef.current.getBoundingClientRect();
              resizeState.current = { x:e.clientX, y:e.clientY, w:rect.width, h:rect.height };
              document.addEventListener('mousemove', onResize);
              document.addEventListener('mouseup', endResize);
            }} />
          </div>
          <div className="chat-messages" ref={listRef}>
            {!messages.length && (
              <div className="chat-empty">
                <p><strong>Hello! 👋</strong> I'm your internship assistant. I can help you with:</p>
                <ul style={{margin: '8px 0', paddingLeft: '20px'}}>
                  <li>Assignment details: <code>/asg 29</code></li>
                  <li>Technology info: <code>/tech react</code></li>
                  <li>Design patterns: <code>/pattern singleton</code></li>
                  <li>Project summary: <code>/summary</code></li>
                </ul>
                <p>Just type a question or use the commands above!</p>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`chat-msg ${m.role} ${m.pending? 'pending':''}`}>
                <div className="chat-avatar" aria-hidden="true">{m.role === 'assistant' ? '🤖' : '🧑'}</div>
                <div className="chat-bubble" dangerouslySetInnerHTML={{__html: renderMarkdown(m.content)}} />
              </div>
            ))}
            {streaming && <div className="chat-msg assistant typing"><div className="chat-avatar">🤖</div><div className="chat-bubble"><span className="dots"><span>.</span><span>.</span><span>.</span></span></div></div>}
            {showSources && sources.length > 0 && (
              <div className="chat-msg assistant sources-block">
                <div className="chat-avatar" aria-hidden="true">📚</div>
                <div className="chat-bubble">
                  <strong>Sources</strong>{confidence!=null && <span style={{marginLeft:8, fontSize:'.65rem'}}>confidence {confidence.toFixed(2)}</span>}<br/>
                  <ul style={{paddingLeft:'18px',margin:'6px 0'}}>
                    {sources.map((s,i)=>(<li key={i} style={{fontSize:'.65rem',marginBottom:2}}>{s.question} <em style={{opacity:.6}}>({s.score.toFixed(2)})</em></li>))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input-bar">
            {editing && <div className="edit-indicator">Editing last message <button onClick={()=> { setEditing(false); setInput(''); }}>Cancel</button></div>}
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder={streaming? 'Wait for response or stop...' : 'Message...'}
              disabled={streaming}
              value={input}
              onChange={e=> setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className="send-btn" onClick={handleSend} disabled={!input.trim() || streaming}>{editing? 'Update' : 'Send'}</button>
          </div>
          {needsIdentity && (
            <div style={{position:'absolute',inset:0,backdropFilter:'blur(6px)',background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:18,zIndex:50}}>
              <form onSubmit={submitIdentity} style={{background:'var(--panel-bg,rgba(30,30,40,0.9))',border:'1px solid rgba(255,255,255,0.15)',borderRadius:14,padding:'18px 20px',width:'100%',maxWidth:360,color:'var(--text-color,#fff)',boxShadow:'0 4px 18px -4px rgba(0,0,0,0.6)'}}>
                <h3 style={{margin:'0 0 12px',fontSize:'1.05rem',letterSpacing:'.5px'}}>Identify Yourself</h3>
                <p style={{margin:'0 0 14px',fontSize:'.7rem',lineHeight:1.4,opacity:.85}}>Enter your name & email so the assistant keeps a private history just for you.</p>
                <label style={{display:'block',fontSize:'.6rem',letterSpacing:'.5px',opacity:.8,marginBottom:4}}>Name</label>
                <input value={userName} onChange={e=> setUserName(e.target.value)} required placeholder="Your name" style={{width:'100%',marginBottom:10,padding:'8px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.07)',color:'inherit',fontSize:'.7rem'}} />
                <label style={{display:'block',fontSize:'.6rem',letterSpacing:'.5px',opacity:.8,marginBottom:4}}>Email</label>
                <input type="email" value={userEmail} onChange={e=> setUserEmail(e.target.value)} required placeholder="you@example.com" style={{width:'100%',marginBottom:14,padding:'8px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.07)',color:'inherit',fontSize:'.7rem'}} />
                <button type="submit" style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontWeight:600,fontSize:'.75rem',letterSpacing:'.8px',cursor:'pointer'}}>Start Chatting</button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ---------- Helpers (Markdown & Drag) ------------- */
function renderMarkdown(md=''){
  const esc = (s)=> s.replace(/[&<>]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]));
  // Headings, bold, italics, code, lists
  const lines = md.split(/\n/);
  let out = [];
  let listBuf = [];
  const flushList = ()=> { if(listBuf.length){ out.push('<ul>' + listBuf.map(li=>`<li>${li}</li>`).join('') + '</ul>'); listBuf=[]; } };
  for(let raw of lines){
    let l = raw.trimEnd();
    if(/^\s*[-*+]\s+/.test(l)){ listBuf.push(esc(l.replace(/^[-*+]\s+/,'')).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>')); continue; }
    flushList();
    if(/^#{1,6}\s+/.test(l)){ const level = l.match(/^#+/)[0].length; const text = esc(l.replace(/^#{1,6}\s+/,'')); out.push(`<h${level} class="md-heading h${level}">${text}</h${level}>`); continue; }
    if(!l){ out.push('<br/>'); continue; }
    l = esc(l)
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/`([^`]+)`/g,'<code>$1</code>');
    out.push(`<p>${l}</p>`);
  }
  flushList();
  return out.join('\n');
}

function onDrag(e){
  if(!window.__chatDrag) return;
  const { node, startX, startY, left, top } = window.__chatDrag;
  const dx = e.clientX - startX; const dy = e.clientY - startY;
  node.style.left = left + dx + 'px';
  node.style.top = top + dy + 'px';
}
function endDrag(){
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
  window.__chatDrag = null;
}
function onResize(e){
  if(!window.__chatResize) return;
  const { node, startX, startY, w, h } = window.__chatResize;
  const dx = e.clientX - startX; const dy = e.clientY - startY;
  node.style.width = Math.max(300, w + dx) + 'px';
  node.style.height = Math.max(320, h + dy) + 'px';
}
function endResize(){
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', endResize);
  window.__chatResize = null;
}

// SSE streaming helper
function startStream(question){
  // Find ChatBot scope via DOM query (simplified: store state globally not shown here)
  if(!window.__chatStream){ window.__chatStream = {}; }
  const ctrl = new AbortController();
  const base = window.__CHAT_API_BASE || 'http://localhost:8001';
  const user_id = localStorage.getItem('imi-user-id') || null;
  fetch(base + '/chat/stream', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ question, top_k:3, user_id }), signal:ctrl.signal })
    .then(async res => {
      if(!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantBuffer = '';
      window.dispatchEvent(new CustomEvent('chat-stream-start'));
      while(true){
        const { value, done } = await reader.read();
        if(done) break;
        const chunk = decoder.decode(value, { stream:true });
        const events = chunk.split('\n\n').filter(Boolean);
        for(const ev of events){
          if(!ev.startsWith('data:')) continue;
            const jsonStr = ev.replace(/^data:\s*/,'');
            try {
              const data = JSON.parse(jsonStr);
              if(data.event === 'meta'){
                window.dispatchEvent(new CustomEvent('chat-stream-meta', { detail:data }));
              } else if(data.event === 'token'){
                assistantBuffer += data.text;
                window.dispatchEvent(new CustomEvent('chat-stream-token', { detail:{ text:assistantBuffer } }));
              } else if(data.event === 'done') {
                window.dispatchEvent(new CustomEvent('chat-stream-done', { detail:data }));
              }
            } catch(e){ /* ignore parse */ }
        }
      }
    }).catch(()=>{});
  window.__chatStream.abort = ()=> ctrl.abort();
}

export default ChatBot;
