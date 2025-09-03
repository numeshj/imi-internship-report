import React from 'react';
import { summary } from '../data/reportData';
import { motion } from 'framer-motion';
import '../components/Dashboard.css';
import './SummaryPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, type: 'spring', stiffness: 140, damping: 18 } })
};

const SummaryPage = () => {
  return (
    <div className="dashboard-container summary-page">
      <motion.h2 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{type:'spring',damping:20}}>Internship Summary</motion.h2>
      <motion.p variants={fadeUp} initial="hidden" animate="show" custom={0} className="summary-intro">{summary.introduction}</motion.p>
      <div className="summary-stats-grid">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="dashboard-card">
          <h3 style={{marginTop:0}}>At a Glance</h3>
          <ul>
            <li>Period: {summary.period}</li>
            <li>Company: {summary.company}</li>
            <li>Role: {summary.role}</li>
            <li>Total Assignments: {summary.totalAssignments}</li>
          </ul>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="dashboard-card summary-card-small">
          <h3 style={{marginTop:0}}>Goals Achieved</h3>
          <ul>
            {summary.goalsAchieved.map(g => <li key={g}>{g}</li>)}
          </ul>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="dashboard-card summary-card-small">
          <h3 style={{marginTop:0}}>Methodological Themes</h3>
          <ul>{summary.methodologicalThemes.map(m=> <li key={m}>{m}</li>)}</ul>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="dashboard-card">
          <h3 style={{marginTop:0}}>Core Competencies</h3>
          <div className="summary-competencies">
            {summary.coreCompetencies.map(c=> <span key={c} className="badge">{c}</span>)}
          </div>
        </motion.div>
      </div>
      <motion.h3 variants={fadeUp} initial="hidden" animate="show" custom={5} className="summary-section-title">Challenges & Resolutions</motion.h3>
      <div className="summary-challenges-grid">
        {summary.challenges.map((c,i)=>(
          <motion.div key={c.challenge} variants={fadeUp} initial="hidden" animate="show" custom={6+i} className="dashboard-card summary-challenge">
            <h4>{c.challenge}</h4>
            <p>{c.resolution}</p>
          </motion.div>
        ))}
      </div>
      <motion.h3 variants={fadeUp} initial="hidden" animate="show" custom={15} className="summary-section-title">Next Steps</motion.h3>
      <div className="summary-next">
        {summary.nextSteps.map(n => <motion.span variants={fadeUp} initial="hidden" animate="show" custom={16} key={n} className="tag">{n}</motion.span>)}
      </div>
    </div>
  );
};

export default SummaryPage;
