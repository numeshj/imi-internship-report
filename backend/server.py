import pickle
from pathlib import Path
from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import hashlib
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import fuzz
import numpy as np
import json
import time

MODEL_PATH = Path(__file__).parent / 'model' / 'qa_model.pkl'

class Query(BaseModel):
    question: str
    top_k: int = 1
    threshold: float = 0.15
    user_id: str | None = None

class SessionInit(BaseModel):
    name: str
    email: str

app = FastAPI(title="Internship Chatbot API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

_cache = None
_user_sessions: dict[str, dict] = {}

def load_model():
    global _cache
    if _cache is None:
        if not MODEL_PATH.exists():
            raise RuntimeError("Model not trained. Run train_chatbot.py first.")
        with open(MODEL_PATH, 'rb') as f:
            _cache = pickle.load(f)
    return _cache

@app.get('/health')
async def health():
    return { 'status': 'ok' }

@app.post('/session/init')
async def session_init(payload: SessionInit):
    # Simple deterministic user id from email
    email_norm = payload.email.strip().lower()
    if not email_norm:
        raise HTTPException(status_code=400, detail='Email required')
    user_id = hashlib.sha256(email_norm.encode()).hexdigest()[:16]
    if user_id not in _user_sessions:
        _user_sessions[user_id] = {
            'name': payload.name.strip() or 'User',
            'email': email_norm,
            'history': []  # list of {q,a,score,time}
        }
    return { 'user_id': user_id, 'name': _user_sessions[user_id]['name'] }

def build_results(question: str, top_k: int, threshold: float):
    data = load_model()
    q_lower = question.lower()
    vec = data['vectorizer'].transform([q_lower])
    sims = cosine_similarity(vec, data['X']).flatten()

    # Fuzzy scores (scaled 0-1) on normalized questions if available
    norm_list = data.get('normalized_questions') or [q.lower() for q in data['questions']]
    canon = data.get('canonical_questions') or data['questions']
    fuzzy_scores = [fuzz.token_set_ratio(q_lower, nq)/100.0 for nq in norm_list]

    # Hybrid score: weighted combination
    hybrid = 0.65 * sims + 0.35 * np.array(fuzzy_scores)
    idxs = hybrid.argsort()[::-1]
    results = []
    for i in idxs:
        base_score = float(hybrid[i])
        if base_score < threshold: break
        results.append({
            'question': data['questions'][i],
            'canonical': canon[i],
            'answer': data['answers'][i],
            'score': base_score,
            'tfidf': float(sims[i]),
            'fuzzy': float(fuzzy_scores[i])
        })
        if len(results) >= top_k:
            break
    return results

@app.post('/chat')
async def chat(q: Query):
    results = build_results(q.question, q.top_k, q.threshold)
    if not results:
        return { 'answer': None, 'message': 'No confident match. Please rephrase or try a more specific question.', 'results': [] }
    best = results[0]
    # Markdown now excludes sources; UI will render sources separately from results list
    md = f"**Answer:** {best['answer']}\n\n**Confidence:** {best['score']:.2f}"
    # Record history per user if provided
    if q.user_id and q.user_id in _user_sessions:
        _user_sessions[q.user_id]['history'].append({
            'q': q.question,
            'a': best['answer'],
            'score': best['score'],
            't': time.time()
        })
    return { 'answer': best['answer'], 'results': results, 'markdown': md }

@app.post('/chat/stream')
async def chat_stream(q: Query):
    results = build_results(q.question, q.top_k, q.threshold)
    if not results:
        def gen_empty():
            yield 'data: ' + json.dumps({'event':'done','answer':None,'message':'No confident match'}) + '\n\n'
        return StreamingResponse(gen_empty(), media_type='text/event-stream')

    best = results[0]
    answer = best['answer']
    sources = [ { 'question': r['canonical'], 'score': r['score'] } for r in results ]

    def token_stream():
        # Log once before tokens
        if q.user_id and q.user_id in _user_sessions:
            _user_sessions[q.user_id]['history'].append({
                'q': q.question,
                'a': '',
                'score': best['score'],
                't': time.time()
            })
        yield 'data: ' + json.dumps({'event':'meta','sources':sources,'confidence':best['score']}) + '\n\n'
        tokens = answer.split()
        buf = ''
        for t in tokens:
            buf += (t + ' ')
            time.sleep(0.03)
            yield 'data: ' + json.dumps({'event':'token','text':t + ' '}) + '\n\n'
        # Update final answer in history
        if q.user_id and q.user_id in _user_sessions:
            hist = _user_sessions[q.user_id]['history']
            if hist:
                hist[-1]['a'] = answer
        yield 'data: ' + json.dumps({'event':'done'}) + '\n\n'

    return StreamingResponse(token_stream(), media_type='text/event-stream')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8001)
