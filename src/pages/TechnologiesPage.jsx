import React, { useState, useMemo } from 'react';
import { technologies } from '../data/reportData';
import { motion, AnimatePresence } from 'framer-motion';
import '../components/Dashboard.css';
import './TechnologiesPage.css';

const flatList = Object.entries(technologies).flatMap(([group, items]) => items.map(label => ({ group, label })));
const groups = Object.keys(technologies);

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  show: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.02 } }),
  exit: { opacity: 0, scale: 0.9 }
};

const TechnologiesPage = () => {
  const [groupFilter, setGroupFilter] = useState('');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => flatList.filter(t => {
    const matchGroup = !groupFilter || t.group === groupFilter;
    const matchQuery = !query || t.label.toLowerCase().includes(query.toLowerCase());
    return matchGroup && matchQuery;
  }), [groupFilter, query]);

  return (
    <div className="dashboard-container tech-page">
      <h2>Technologies & Libraries <span style={{fontSize:'0.55em',color:'var(--text-dim)'}}>{filtered.length}/{flatList.length}</span></h2>
      <div className="tech-filters">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..." style={{flex:'1 1 260px'}} />
        <select value={groupFilter} onChange={e=>setGroupFilter(e.target.value)} style={{flex:'0 0 220px'}}>
          <option value="">All Categories</option>
          {groups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        {groupFilter && <button onClick={()=> setGroupFilter('')}>Clear</button>}
      </div>
      <div className="tech-grid">
        <AnimatePresence mode="popLayout">
          {filtered.map((t,i) => (
            <motion.div key={t.group+ t.label} className="dashboard-card tech-card" variants={itemVariants} initial="hidden" animate="show" exit="exit" custom={i}>
              <span className="badge">{t.group}</span>
              <h3>{t.label}</h3>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TechnologiesPage;
