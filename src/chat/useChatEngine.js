import { useCallback, useEffect, useRef, useState } from 'react';
import { assignments, technologies, patterns, summary } from '../data/reportData';

/* Simple retrieval helpers */
const textCorpus = (() => {
  const techFlat = Object.entries(technologies).flatMap(([g, items]) => items.map(t => `${g}: ${t}`));
  const assignFlat = assignments.map(a => `ASG_${a.id} ${a.title} | ${a.logic} | ${a.learning} | ${(a.concepts||[]).join(',')}`);
  const patternFlat = patterns.map(p => `PATTERN ${p.name} ${p.description} ${p.snippet}`);
  return [...techFlat, ...assignFlat, ...patternFlat, summary.introduction];
})();

function scoreChunk(q, chunk){
  const terms = q.toLowerCase().split(/[^a-z0-9+]+/).filter(Boolean);
  let score = 0;
  for(const t of terms){
    if(chunk.toLowerCase().includes(t)) score += 1;
  }
  return score / (terms.length || 1);
}

function retrieve(query, limit=5){
  if(!query.trim()) return [];
  return textCorpus
    .map(c => ({ c, s: scoreChunk(query, c) }))
    .filter(o => o.s > 0)
    .sort((a,b)=> b.s - a.s)
    .slice(0, limit)
    .map(o => o.c);
}

function commandHelp(){
  return `Available commands:\n/help - show commands\n/clear - clear chat\n/summary - internship high level summary\n/tech <term> - search technologies\n/pattern <term> - search patterns\n/asg <id or term> - search assignments by id or term`;
}

function formatTech(term){
  const q = term.toLowerCase();
  const hits = Object.entries(technologies).flatMap(([g, items]) => items.filter(i => i.toLowerCase().includes(q)).map(i => `${g}: ${i}`));
  return hits.length ? hits.join('\n') : 'No technology matches.';
}

function formatPattern(term){
  const q = term.toLowerCase();
  const hits = patterns.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  return hits.length ? hits.map(p => `${p.name}: ${p.description}\n${p.snippet}`).join('\n\n') : 'No pattern matches.';
}

function formatAssignment(term){
  const id = Number(term);
  let hits = [];
  if(!isNaN(id)){
    const f = assignments.find(a => a.id === id);
    if(f) hits = [f];
  }
  if(!hits.length){
    const q = term.toLowerCase();
    hits = assignments.filter(a => a.title.toLowerCase().includes(q) || (a.concepts||[]).some(c => c.toLowerCase().includes(q)) || a.logic.toLowerCase().includes(q));
  }
  return hits.length ? hits.map(a => `ASG_${a.id} ${a.title}\nConcepts: ${(a.concepts||[]).join(', ')}\nLogic: ${a.logic}\nLearning: ${a.learning}`).join('\n\n') : 'No assignment matches.';
}

export function useChatEngine(){
  const [messages, setMessages] = useState(()=> {
    try {
      const uid = localStorage.getItem('imi-user-id') || 'default';
      const raw = localStorage.getItem('imi-chat-history-' + uid);
      if(raw){
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed)) return parsed.slice(-200); // cap
      }
    } catch(e){ /* ignore */ }
    return [];
  }); // {id, role:'user'|'assistant'|'system', content, pending}
  const [streaming, setStreaming] = useState(false);
  const ctr = useRef(0);
  const abortRef = useRef(null);

  const append = useCallback((msg)=> setMessages(m => [...m, { id: ++ctr.current, timestamp: Date.now(), ...msg }]), []);
  const appendUser = useCallback((content)=> append({ role:'user', content }), [append]);

  const addAssistant = useCallback((content, opts={}) => {
    const { replacePending=false } = opts;
    setMessages(m => {
      if(replacePending){
        const idx = m.findIndex(x => x.pending && x.role==='assistant');
        if(idx !== -1){
          const clone = [...m];
            clone[idx] = { ...clone[idx], content, pending:false };
            return clone;
        }
      }
      return [...m, { id: ++ctr.current, role:'assistant', content, pending:false, timestamp: Date.now() }];
    });
  }, []);

  const clear = useCallback(()=> setMessages([]), []);

  // Streaming helpers (for backend SSE mode)
  const startStreamingAssistant = useCallback(() => {
    setMessages(m => [...m, { id: ++ctr.current, role:'assistant', content:'', pending:true, timestamp: Date.now() }]);
  }, []);

  const updateLastAssistant = useCallback((content, { append=false } = {}) => {
    setMessages(m => {
      const idx = [...m].map(x=>x.role).lastIndexOf('assistant');
      if(idx === -1) return m;
      const clone = [...m];
      const prev = clone[idx];
      clone[idx] = { ...prev, content: append ? prev.content + content : content };
      return clone;
    });
  }, []);

  const finalizeStreamingAssistant = useCallback(() => {
    setMessages(m => {
      const idx = [...m].map(x=>x.role).lastIndexOf('assistant');
      if(idx === -1) return m;
      const clone = [...m];
      clone[idx] = { ...clone[idx], pending:false };
      return clone;
    });
  }, []);

  const handleCommand = useCallback((input)=>{
    const [cmd, ...rest] = input.trim().split(/\s+/);
    const arg = rest.join(' ');
    switch(cmd){
      case '/help': return commandHelp();
      case '/clear': clear(); return 'Chat cleared.';
      case '/reset': clear(); return 'Chat reset.';
      case '/export': return 'Copy below JSON:\n' + JSON.stringify(messages, null, 2).slice(0,4000);
      case '/summary': return summary.introduction;
      case '/tech': return arg ? formatTech(arg) : 'Usage: /tech <term>';
      case '/pattern': return arg ? formatPattern(arg) : 'Usage: /pattern <term>';
      case '/asg': return arg ? formatAssignment(arg) : 'Usage: /asg <id|term>';
      default: return null;
    }
  }, [clear, messages]);

  const send = useCallback(async (content) => {
    const trimmed = content.trim();
    if(!trimmed) return;

  append({ role:'user', content: trimmed });

    // Commands
    if(trimmed.startsWith('/')){
      const out = handleCommand(trimmed);
      if(out){ append({ role:'assistant', content: out }); return; }
    }

    // Build contextual answer
    const context = retrieve(trimmed, 4);
    const preface = context.length ? `I found some related context (top ${context.length}):\n` + context.map((c,i)=>`[${i+1}] ${c}`).join('\n') + '\n\n' : '';

    const reasoning = `User asked: "${trimmed}". I'll craft an answer drawing from internship data.`;
    const answerDraft = `${preface}${reasoning}\n\nSummary: ${summary.introduction}\n\nIf you need a specific assignment use /asg <id> or /asg <term>. For technologies try /tech <term>.`;

  const id = ++ctr.current;
  setMessages(m => [...m, { id, role:'assistant', content:'', pending:true, timestamp: Date.now() }]);
    setStreaming(true);

    // Simulated streaming
    const tokens = answerDraft.split(/(\s+)/);
    let idx = 0;
    abortRef.current = () => { idx = tokens.length; };
    while(idx < tokens.length){
      await new Promise(r => setTimeout(r, 25));
      const slice = tokens.slice(0, idx+1).join('');
      setMessages(m => m.map(msg => msg.id === id ? { ...msg, content: slice } : msg));
      idx++;
    }
    setMessages(m => m.map(msg => msg.id === id ? { ...msg, pending:false } : msg));
    setStreaming(false);
  }, [append, handleCommand]);

  const retryLast = useCallback(()=>{
    const lastUser = [...messages].reverse().find(m => m.role==='user');
    if(lastUser) send(lastUser.content + ' (rephrase)');
  }, [messages, send]);

  const editLastUser = useCallback((newContent)=>{
    const lastIndex = [...messages].map(m=>m.role).lastIndexOf('user');
    if(lastIndex === -1) return;
    const userMsg = messages[lastIndex];
    setMessages(m => m.filter(msg => msg.id !== userMsg.id));
    send(newContent);
  }, [messages, send]);

  const abort = useCallback(()=>{ if(abortRef.current) abortRef.current(); setStreaming(false); }, []);

  // Persist
  useEffect(()=>{
    try {
      const uid = localStorage.getItem('imi-user-id') || 'default';
      localStorage.setItem('imi-chat-history-' + uid, JSON.stringify(messages));
    } catch(e){ /* ignore */ }
  }, [messages]);

  return { messages, send, retryLast, editLastUser, clear, streaming, abort, addAssistant, appendUser, startStreamingAssistant, updateLastAssistant, finalizeStreamingAssistant };
}
