import React, { useState } from 'react';
import { patterns } from '../data/reportData';
import { motion, AnimatePresence } from 'framer-motion';
import '../components/Dashboard.css';
import './PatternsPage.css';

const PatternsPage = () => {
  const [open, setOpen] = useState(null);

  return (
    <div className="dashboard-container patterns-page">
      <h2>Patterns & Algorithms <span style={{fontSize:'0.55em',color:'var(--text-dim)'}}>{patterns.length}</span></h2>
      <div className="patterns-list">
        {patterns.map((p,i) => {
          const isOpen = open === i;
          return (
            <motion.div key={p.name} layout initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.02}} className={`dashboard-card pattern-card ${isOpen?'open':''}`} style={{border:isOpen?'1px solid var(--accent)':'1px solid var(--border-color)'}} onClick={()=> setOpen(isOpen?null:i)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:20}}>
                <h3>{p.name}</h3>
                <span className={`badge ${isOpen?'open':''}`}>{isOpen ? 'Close' : 'View'}</span>
              </div>
              <p>{p.description}</p>
              <AnimatePresence>{isOpen && (
                <motion.pre initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{type:'tween',duration:0.35}} className="pattern-snippet">
                  <code>{p.snippet}</code>
                </motion.pre>
              )}</AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PatternsPage;
