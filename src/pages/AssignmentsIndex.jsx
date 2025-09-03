import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { assignments } from '../data/reportData';
import { motion, AnimatePresence } from 'framer-motion';
import '../components/Dashboard.css';
import './AssignmentsPage.css';

const conceptsSet = [...new Set(assignments.flatMap(a => a.concepts || []))];

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    show: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.015, type: 'spring', stiffness: 180, damping: 20 } })
};

const AssignmentsIndex = () => {
    const [query, setQuery] = useState('');
    const [conceptFilter, setConceptFilter] = useState('');

    const filtered = useMemo(() => assignments.filter(a => {
        const q = query.toLowerCase();
        const matchText = !q || [a.title, a.logic, a.learning, (a.concepts || []).join(' ')].some(v => (v || '').toLowerCase().includes(q));
        const matchConcept = !conceptFilter || (a.concepts || []).includes(conceptFilter);
        return matchText && matchConcept;
    }), [query, conceptFilter]);

    return (
        <div className="dashboard-container assignments-page">
            <div className="assignments-inner">
                <h2 className="assignments-title">Assignments Overview <span style={{ fontSize: '0.55em', color: 'var(--text-dim)' }}>{filtered.length} / {assignments.length}</span></h2>
                <div className="assignments-filters">
                    <input
                        placeholder="Search title / logic / concept..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="ui-input" style={{ flex: '1 1 320px' }}
                    />
                    <select value={conceptFilter} onChange={e => setConceptFilter(e.target.value)}
                        className="ui-select" style={{ flex: '0 0 240px' }}>
                        <option value="">All Concepts</option>
                        {conceptsSet.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {conceptFilter && (
                        <button onClick={() => setConceptFilter('')} className="badge" style={{ cursor: 'pointer' }}>Clear</button>
                    )}
                </div>
                <div className="dashboard-cards assignments-grid">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((a, i) => (
                            <motion.div layout key={a.id} className="dashboard-card assignment-card" variants={cardVariants} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.9 }} custom={i}>
                                <h3>{a.id}. {a.title}</h3>
                                <p>{a.logic}</p>
                                {a.concepts && (
                                    <div className="assignment-tags">
                                        {a.concepts.slice(0, 5).map(c => <span key={c} className="tag">{c}</span>)}
                                        {a.concepts.length > 5 && <span className="badge">+{a.concepts.length - 5}</span>}
                                    </div>
                                )}
                                <div className="assignment-meta">
                                    <Link to={`/assignments/${a.id}`}>View details →</Link>
                                    {a.file && <code style={{ fontSize: '0.65rem', opacity: 0.7 }}>{a.file}</code>}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AssignmentsIndex;
