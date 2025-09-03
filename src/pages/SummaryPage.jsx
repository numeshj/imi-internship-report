import React, { useState } from 'react';
import { summary } from '../data/reportData';
import { motion, AnimatePresence } from 'framer-motion';
import '../components/Dashboard.css';
import './SummaryPage.css';

/* -------------------- Animations -------------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 140, damping: 18 }
  })
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 }
  }
};

/* -------------------- Small SVG Icons (no extra deps) -------------------- */
const Icon = {
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h2a1 1 0 0 1 1 1v3H4V5a1 1 0 0 1 1-1h2V2Zm14 7H3v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9Zm-9 3h8v2h-8v-2Z"/></svg>
  ),
  building: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 21V5a2 2 0 0 1 2-2h7v7h7v11h-4v-4H7v4H3Zm4-8h3V9H7v4Zm0-6h3V5H7v2Zm5 6h3v-2h-3v2Zm0-4h3V7h-3v2Z"/></svg>
  ),
  badge: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 1 7 7c0 4.418-3.582 8-8 8a7 7 0 1 1 1-15ZM6 21l6-3l6 3v1H6v-1Z"/></svg>
  ),
  tasks: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m9.5 13.6l7.1-7.1l1.4 1.4l-8.5 8.5L6 12l1.4-1.4l2.1 3ZM4 19h16v2H4v-2Z"/></svg>
  ),
  spark: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m11 22l1.5-6.5L19 14l-6.5-1.5L11 6l-1.5 6.5L3 14l6.5 1.5L11 22Z"/></svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m13 5l7 7l-7 7v-4H4v-6h9V5Z"/></svg>
  )
};

/* -------------------- Accessible Accordion Item -------------------- */
const AccordionItem = ({ title, body, i }) => {
  const [open, setOpen] = useState(false);
  const id = `acc-${i}`;
  return (
    <div className="acc-item">
      <button
        className="acc-trigger"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-button`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="acc-title">{title}</span>
        <span className={`acc-caret ${open ? 'open' : ''}`} aria-hidden="true">▾</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="acc-panel"
          >
            <p>{body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SummaryPage = () => {
  return (
    <div className="dashboard-container summary-page">
      {/* ------------ Hero ------------- */}
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-dot a" />
          <div className="hero-dot b" />
          <div className="hero-dot c" />
        </div>
        <div className="hero-head">
          <div className="hero-icon">{Icon.spark}</div>
          <h1>Internship Summary</h1>
          <p className="summary-intro">{summary.introduction}</p>
        </div>

        <motion.div
          className="kpi-grid"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} custom={0} className="kpi-card">
            <div className="kpi-left">{Icon.calendar}</div>
            <div className="kpi-right">
              <span className="kpi-label">Period</span>
              <span className="kpi-value">{summary.period}</span>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} custom={1} className="kpi-card">
            <div className="kpi-left">{Icon.building}</div>
            <div className="kpi-right">
              <span className="kpi-label">Company</span>
              <span className="kpi-value">{summary.company}</span>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} custom={2} className="kpi-card">
            <div className="kpi-left">{Icon.badge}</div>
            <div className="kpi-right">
              <span className="kpi-label">Role</span>
              <span className="kpi-value">{summary.role}</span>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} custom={3} className="kpi-card">
            <div className="kpi-left">{Icon.tasks}</div>
            <div className="kpi-right">
              <span className="kpi-label">Total Assignments</span>
              <span className="kpi-value">{summary.totalAssignments}</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ------------ Quick Highlights ------------- */}
      <section className="highlights">
        <motion.h3 variants={fadeUp} initial="hidden" animate="show" custom={0}>
          At a Glance
        </motion.h3>
        <div className="chip-grids">
          <motion.div variants={stagger} initial="hidden" animate="show" className="chip-group">
            <h4>Goals Achieved</h4>
            <div className="chip-wrap">
              {summary.goalsAchieved.map((g, i) => (
                <motion.span key={g} variants={fadeUp} custom={i} className="chip">{g}</motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" animate="show" className="chip-group">
            <h4>Methodological Themes</h4>
            <div className="chip-wrap">
              {summary.methodologicalThemes.map((m, i) => (
                <motion.span key={m} variants={fadeUp} custom={i} className="chip ghost">{m}</motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" animate="show" className="chip-group">
            <h4>Core Competencies</h4>
            <div className="chip-wrap">
              {summary.coreCompetencies.map((c, i) => (
                <motion.span key={c} variants={fadeUp} custom={i} className="chip tone">{c}</motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------ What I Built (auto from your arrays) ------------- */}
      <section className="built-strip">
        <motion.h3 variants={fadeUp} initial="hidden" animate="show" custom={0}>
          What I Built
        </motion.h3>
        <motion.div
          className="built-cards"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} custom={0} className="built-card">
            <span className="pill">React + Hooks</span>
            <p>Composed interactive UIs with controlled state, side effects, and performance-oriented refs.</p>
          </motion.div>
          <motion.div variants={fadeUp} custom={1} className="built-card">
            <span className="pill">Canvas & Media</span>
            <p>Drawing tools, OCR (Tesseract), face detection (face-api), screen/video capture & playback.</p>
          </motion.div>
          <motion.div variants={fadeUp} custom={2} className="built-card">
            <span className="pill">Games & Geometry</span>
            <p>RequestAnimationFrame loops, collision checks, shuffle algorithms, grid/angle math.</p>
          </motion.div>
          <motion.div variants={fadeUp} custom={3} className="built-card">
            <span className="pill">Networking</span>
            <p>REST auth with token persistence and a live WebSocket chat with server broadcast.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* ------------ Challenges (accessible accordions) ------------- */}
      <section className="challenges">
        <motion.h3 variants={fadeUp} initial="hidden" animate="show" custom={0}>
          Challenges & Resolutions
        </motion.h3>
        <div className="acc-list">
          {summary.challenges.map((c, i) => (
            <AccordionItem key={c.challenge} title={c.challenge} body={c.resolution} i={i} />
          ))}
        </div>
      </section>

      {/* ------------ Roadmap / Next Steps ------------- */}
      <section className="roadmap">
        <motion.h3 variants={fadeUp} initial="hidden" animate="show" custom={0}>
          Next Steps
        </motion.h3>

        <ol className="timeline">
          {summary.nextSteps.map((n, i) => (
            <motion.li key={n} variants={fadeUp} initial="hidden" animate="show" custom={i} className="timeline-item">
              <div className="tl-marker" aria-hidden="true" />
              <div className="tl-content">
                <div className="tl-title">{n}</div>
                <div className="tl-bar">
                  <span className="tl-progress" style={{ width: `${Math.min(12 + i * 14, 96)}%` }} />
                </div>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="foot-note">
          <span className="muted">Tip:</span> Press <kbd>Tab</kbd> to navigate the challenge accordions; press <kbd>Enter</kbd> to expand/collapse.
        </div>
      </section>
    </div>
  );
};

export default SummaryPage;
