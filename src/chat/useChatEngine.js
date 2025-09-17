import { useCallback, useEffect, useRef, useState } from 'react';
import { assignments, technologies, patterns, summary } from '../data/reportData';

/* Enhanced retrieval helpers */
const searchIndex = (() => {
  const index = [];

  // Index assignments
  assignments.forEach(a => {
    index.push({
      type: 'assignment',
      id: a.id,
      title: a.title,
      content: `${a.title} ${a.logic} ${a.learning} ${(a.concepts||[]).join(' ')}`,
      data: a
    });
  });

  // Index technologies
  Object.entries(technologies).forEach(([group, items]) => {
    items.forEach(tech => {
      index.push({
        type: 'technology',
        group: group,
        content: `${group} ${tech}`,
        data: { group, tech }
      });
    });
  });

  // Index patterns
  patterns.forEach(p => {
    index.push({
      type: 'pattern',
      name: p.name,
      content: `${p.name} ${p.description} ${p.snippet}`,
      data: p
    });
  });

  // Index summary
  index.push({
    type: 'summary',
    content: summary.introduction,
    data: summary
  });

  return index;
})();

function scoreItem(query, item){
  const terms = query.toLowerCase().split(/[^a-z0-9+]+/).filter(Boolean);
  if(terms.length === 0) return 0;

  const content = item.content.toLowerCase();
  let totalScore = 0;
  let matchedTerms = 0;
  let exactMatches = 0;

  for(const term of terms){
    if(term.length < 2) continue;

    if(content.includes(term)) {
      matchedTerms++;
      totalScore += 1;

      // Bonus for word boundaries
      const wordRegex = new RegExp(`\\b${term}\\b`, 'i');
      if(wordRegex.test(content)) {
        totalScore += 0.5;
        exactMatches++;
      }

      // Extra bonus for title matches
      if(item.title && item.title.toLowerCase().includes(term)) {
        totalScore += 1;
      }
    }
  }

  if(matchedTerms === 0) return 0;

  // Penalize if too few exact matches for longer queries
  if(terms.length > 2 && exactMatches < 1) return 0;

  const baseScore = matchedTerms / terms.length;
  const matchRatio = matchedTerms / terms.filter(t => t.length >= 2).length;

  return baseScore * (1 + matchRatio);
}

function retrieve(query, limit=3){
  if(!query.trim()) return [];

  const queryLength = query.trim().split(/\s+/).length;
  const minScore = queryLength === 1 ? 0.5 : 0.2; // Lower threshold for better results

  let results = searchIndex
    .map(item => ({ item, score: scoreItem(query, item) }))
    .filter(result => result.score >= minScore)
    .sort((a,b) => b.score - a.score)
    .slice(0, limit)
    .map(result => result.item);

  // If no results with high threshold, try with lower threshold
  if(results.length === 0 && minScore > 0.1) {
    results = searchIndex
      .map(item => ({ item, score: scoreItem(query, item) }))
      .filter(result => result.score >= 0.1)
      .sort((a,b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.item);
  }

  return results;
}

function commandHelp(){
  return `Available commands:\n/help - show commands\n/clear - clear chat\n/summary - internship high level summary\n/tech <term> - search technologies\n/pattern <term> - search patterns\n/asg <id or term> - search assignments by id or term`;
}

function isGreeting(query) {
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings', 'sup', 'yo', 'hiya', 'aloha', 'bonjour', 'hola'];
  const lowerQuery = query.toLowerCase().trim();
  return greetings.some(g => lowerQuery.includes(g)) || lowerQuery.length < 3;
}

function isConversational(query) {
  const convPatterns = ['how are you', 'what\'s up', 'how do you do', 'nice to meet', 'thank', 'thanks', 'bye', 'goodbye', 'see you', 'how\'s it going', 'what are you', 'who are you'];
  const lowerQuery = query.toLowerCase().trim();
  return convPatterns.some(p => lowerQuery.includes(p));
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

    // Handle greetings and conversational messages
    if(isGreeting(trimmed)) {
      const greetingResponse = "👋 **Hello! Welcome to your Internship Assistant!**\n\nI'm here to help you navigate your internship materials. Here's what I can do:\n\n📋 **Assignments:** Get details about specific assignments\n   • Try: `/asg 12` or `assignment 29`\n\n🛠️ **Technologies:** Learn about tools and frameworks\n   • Try: `/tech react` or `javascript technologies`\n\n🎯 **Design Patterns:** Explore coding patterns\n   • Try: `/pattern singleton` or `design patterns`\n\n📊 **Summary:** Overview of your internship\n   • Try: `/summary`\n\n💬 **Just ask me anything about your internship!**";
      append({ role:'assistant', content: greetingResponse });
      return;
    }

    if(isConversational(trimmed)) {
      const convResponse = "🤖 **I'm doing great, thanks for asking!**\n\nI'm your dedicated internship assistant, ready to help you with:\n\n• Assignment explanations and concepts\n• Technology details and usage\n• Design pattern implementations\n• Project summaries and insights\n\nWhat specific topic would you like to explore from your internship?";
      append({ role:'assistant', content: convResponse });
      return;
    }

    // Build contextual answer for actual queries
    const results = retrieve(trimmed, 2);

    if(results.length === 0) {
      const noMatchResponse = `I couldn't find specific matches for "${trimmed}" in your internship materials. Try:\n\n• /asg <id> for assignment details (e.g., /asg 12)\n• /tech <term> for technology info (e.g., /tech react)\n• /pattern <term> for design patterns\n• /summary for an overview`;
      append({ role:'assistant', content: noMatchResponse });
      return;
    }

    // Create accurate responses based on result type
    let answerDraft = '';

    if(results.length === 1) {
      const result = results[0];
      switch(result.type) {
        case 'assignment':
          answerDraft = `📋 **Assignment ${result.id}: ${result.title}**\n\n🔍 **Logic:** ${result.data.logic}\n\n📚 **Learning:** ${result.data.learning}\n\n🏷️ **Key Concepts:** ${(result.data.concepts||[]).join(', ')}\n\n💡 **What you'll learn:** This assignment focuses on ${result.data.logic.toLowerCase()}.`;
          break;
        case 'technology':
          answerDraft = `🛠️ **Technology: ${result.data.tech}**\n\n📂 **Category:** ${result.data.group}\n\n🔧 **Used in:** ${result.data.group} technologies for building robust applications.`;
          break;
        case 'pattern':
          answerDraft = `🎯 **Design Pattern: ${result.data.name}**\n\n📖 **Description:** ${result.data.description}\n\n💻 **Example Implementation:**\n${result.data.snippet}\n\n✨ **Benefits:** ${result.data.name} pattern helps with ${result.data.description.toLowerCase().includes('design') ? 'better code organization' : 'solving common design problems'}.`;
          break;
        case 'summary':
          answerDraft = `📊 **Internship Summary**\n\n${result.content}\n\n🎯 **Key Focus Areas:** Assignments, technologies, and design patterns covered in this internship.`;
          break;
        default:
          answerDraft = `📝 **Information Found:**\n\n${result.content}`;
      }
    } else {
      // Multiple results - provide summary with more context
      answerDraft = `🔍 I found ${results.length} relevant items for "${trimmed}":\n\n`;
      results.forEach((result, i) => {
        switch(result.type) {
          case 'assignment':
            answerDraft += `${i+1}. 📋 **Assignment ${result.id}:** ${result.title} - ${result.data.logic.substring(0, 50)}...\n`;
            break;
          case 'technology':
            answerDraft += `${i+1}. 🛠️ **${result.data.tech}** (${result.data.group})\n`;
            break;
          case 'pattern':
            answerDraft += `${i+1}. 🎯 **${result.data.name}** - ${result.data.description.substring(0, 60)}...\n`;
            break;
          default:
            answerDraft += `${i+1}. 📝 ${result.content.substring(0, 80)}...\n`;
        }
      });
      answerDraft += `\n💡 **Tip:** Use specific commands like /asg <id>, /tech <term>, or /pattern <term> for detailed information!`;
    }

    const id = ++ctr.current;
    setMessages(m => [...m, { id, role:'assistant', content:'', pending:true, timestamp: Date.now() }]);
    setStreaming(true);

    // Enhanced streaming with better timing and visual feedback
    const tokens = answerDraft.split(/(\s+)/);
    let idx = 0;
    const streamInterval = setInterval(() => {
      if(idx >= tokens.length) {
        clearInterval(streamInterval);
        setMessages(m => m.map(msg => msg.id === id ? { ...msg, pending:false } : msg));
        setStreaming(false);
        return;
      }

      const slice = tokens.slice(0, idx+1).join('').trim();
      setMessages(m => m.map(msg => msg.id === id ? { ...msg, content: slice } : msg));
      idx++;
    }, 35); // Slightly slower for better readability

    abortRef.current = () => {
      clearInterval(streamInterval);
      setStreaming(false);
    };
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