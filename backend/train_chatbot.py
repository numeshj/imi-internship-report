import json
from pathlib import Path
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import nltk
from rapidfuzz import fuzz

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

DATA_OUT = Path(__file__).parent / 'model'
DATA_OUT.mkdir(exist_ok=True)

# Base FAQ / knowledge pairs (can be extended)
RAW_PAIRS = [
    ("what is the internship period", "The internship period covers the first 3 months focusing on 61 incremental engineering assignments."),
    ("company name", "The internship was completed at IMI Games."),
    ("what was your role", "I served as a Software Engineer Intern focusing on React, browser APIs, and real-time features."),
    ("how many assignments", "There were 61 core assignments spanning state management, media, ML, games and networking."),
    ("list core competencies", "Core competencies include React & state management, algorithmic reasoning, browser/media APIs, real-time systems, data & ML integration, UX design, and defensive coding."),
    ("face detection challenge", "Performance was improved by shifting rapid mutations into refs with requestAnimationFrame to minimize React re-renders."),
    ("ocr preprocessing", "Canvas is upscaled and converted to a Blob before passing to Tesseract for better recognition fidelity."),
    ("websocket filtering", "Ping/pong control frames are filtered out before appending user-visible chat messages."),
]

# Simple synonym / alias expansions to increase recall
SYNONYMS = {
    r"internship period": ["intern duration", "internship time", "duration of internship"],
    r"company": ["organization", "firm", "studio"],
    r"assignments": ["tasks", "exercises", "challenges"],
    r"core competencies": ["skills", "key skills", "strengths"],
    r"face detection": ["facial detection", "face tracking"],
    r"ocr": ["text recognition", "optical character recognition"],
    r"websocket": ["ws", "socket"],
}

def normalize(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r"[^a-z0-9\s]+", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()

# Load extended data from front-end reportData.js (simplistic parse)
REPORT_JS = Path(__file__).parent.parent / 'src' / 'data' / 'reportData.js'
if REPORT_JS.exists():
    text = REPORT_JS.read_text(encoding='utf-8')
    # Extract assignments lines: title and logic
    assign_matches = re.findall(r"id:\s*(\d+),\s*\n\s*title: '([^']+)'[\s\S]*?logic: '([^']+)'", text)
    for _id, title, logic in assign_matches:
        base_title = title.lower().strip()
        if base_title.endswith(' logic') or ' logic ' in base_title or base_title.startswith('logic '):
            q = f"assignment {_id} {base_title}".strip()
        else:
            q = f"assignment {_id} {base_title} logic"
        a = logic
        RAW_PAIRS.append((q, a))
    # Patterns
    pattern_matches = re.findall(r"name: '([^']+)'[\s\S]*?description: '([^']+)'", text)
    for name, desc in pattern_matches:
        RAW_PAIRS.append((f"pattern {name.lower()}", desc))

# Deduplicate
seen = set()
PAIRS = []  # list of (question, answer, canonical)
for q,a in RAW_PAIRS:
    base_q = q.strip().lower()
    key = (base_q, a.strip())
    if key in seen:
        continue
    seen.add(key)
    PAIRS.append((base_q, a, base_q))
    # expand synonyms by replacing phrase with each alias (lightweight data augmentation)
    for pattern, alts in SYNONYMS.items():
        if re.search(pattern, base_q):
            for alt in alts:
                aug_q = re.sub(pattern, alt, base_q)
                aug_key = (aug_q, a.strip())
                if aug_key in seen:
                    continue
                seen.add(aug_key)
                PAIRS.append((aug_q, a, base_q))

questions = [q for q,_,_ in PAIRS]
answers = [a for _,a,_ in PAIRS]
canonicals = [c for _,_,c in PAIRS]

# Store normalized variant list for fuzzy scoring later
normalized = [normalize(q) for q in questions]

# Vectorize
vectorizer = TfidfVectorizer(ngram_range=(1,2), min_df=1, stop_words='english')
X = vectorizer.fit_transform(questions)

MODEL_PATH = DATA_OUT / 'qa_model.pkl'
with open(MODEL_PATH, 'wb') as f:
    pickle.dump({
        'vectorizer': vectorizer,
        'X': X,
        'questions': questions,
        'answers': answers,
    'normalized_questions': normalized,
    'canonical_questions': canonicals
    }, f)

print(f"Trained QA model on {len(PAIRS)} pairs. Saved to {MODEL_PATH}")
