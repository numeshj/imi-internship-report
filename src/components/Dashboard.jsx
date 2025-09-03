import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

/** Inline icons */
const Icon = {
  rocket: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2c3.5 0 6 2.5 6 6c0 1.4-.4 2.7-1.1 3.8l4.1 4.1l-2.1 2.1l-4.1-4.1c-1.1.7-2.4 1.1-3.8 1.1c-3.5 0-6-2.5-6-6S8.5 2 12 2Zm-7 12l3 1l-4 4l-2-2l3-3Zm4 6l1 3l-3-1l2-2Z" />
    </svg>
  ),
  target: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 1 1-7.07 2.93A10 10 0 0 1 12 2Zm0 3a7 7 0 1 0 7 7a7 7 0 0 0-7-7Zm0 3a4 4 0 1 1-4 4a4 4 0 0 1 4-4Z" />
    </svg>
  ),
  bolt: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="m13 2l-8 12h6l-2 8l8-12h-6l2-8Z" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="m9 16.2l-3.5-3.6L4 14.1L9 19l11-11l-1.5-1.5z" />
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="m13 5l7 7l-7 7v-4H4v-6h9V5Z" />
    </svg>
  ),
};

const progressMetrics = [
  { label: "Overall", value: 78 },
  { label: "Frontend", value: 85 },
  { label: "Backend", value: 65 },
  { label: "Collaboration", value: 90 },
  { label: "Learning", value: 88 },
];

const timeline = [
  { title: "Onboarding & Setup", text: "Environment configured, codebase exploration, initial documentation study." },
  { title: "First Feature PR", text: "Implemented UI component & passed code review best practices." },
  { title: "Mid Internship Milestone", text: "Delivered a mini-module integrating API + frontend state management." },
  { title: "Optimization & Refactor", text: "Improved performance, reduced bundle size, added accessibility adjustments." },
  { title: "Final Sprint", text: "Polishing features, writing docs, preparing presentation & knowledge transfer." }
];

const skillTags = ["React", "Vite", "REST", "Git", "UI/UX", "State Mgmt", "Performance", "Teamwork", "Problem Solving", "Testing"];

const Dashboard = () => {
  const overall = progressMetrics.find(m => m.label === "Overall")?.value ?? 0;

  return (
    <div className="dashboard-container">
      {/* Hero / KPIs */}
      <section className="dashboard-welcome">
        <div className="intro-panel">
          <div className="intro-top">
            <span className="hero-icon">{Icon.rocket}</span>
            <h2>Numesh — Internship Journey</h2>
            <p className="lead">
              A high-level snapshot of the 3-month journey: delivery, learning velocity,
              collaboration, and impact. Replace the placeholders with live data as you finalize.
            </p>
            <div className="quick-stats" aria-label="Context chips">
              <span className="stat-chip">3 MONTHS</span>
              <span className="stat-chip">IMI GAMES</span>
              <span className="stat-chip">SOFTWARE ENGINEER INTERN</span>
              <span className="stat-chip">GROWTH MODE</span>
            </div>
          </div>

          <div className="kpi-strip" role="list">
            <div className="kpi" role="listitem">
              <span className="kpi-label">Overall</span>
              <span className="kpi-value">{overall}%</span>
              <span className="kpi-spark" aria-hidden="true" />
            </div>
            <div className="kpi" role="listitem">
              <span className="kpi-label">Frontend</span>
              <span className="kpi-value">85%</span>
              <span className="kpi-spark" aria-hidden="true" />
            </div>
            <div className="kpi" role="listitem">
              <span className="kpi-label">Collaboration</span>
              <span className="kpi-value">90%</span>
              <span className="kpi-spark" aria-hidden="true" />
            </div>
            <div className="kpi" role="listitem">
              <span className="kpi-label">Learning</span>
              <span className="kpi-value">88%</span>
              <span className="kpi-spark" aria-hidden="true" />
            </div>
          </div>

          <div className="cta-row">
            <Link to="/assignments" className="cta">
              {Icon.arrow}
              Explore Assignments
            </Link>
            <Link to="/summary" className="cta ghost">
              {Icon.target}
              Read Summary
            </Link>
          </div>
        </div>

        {/* Cards */}
        <div className="dashboard-cards">
          {/* Progress */}
          <div className="dashboard-card">
            <h3>{Icon.bolt} Progress Overview</h3>

            <div className="progress-dial" role="img" aria-label={`Overall progress ${overall}%`}>
              <svg viewBox="0 0 120 120">
                <circle className="dial-track" cx="60" cy="60" r="50" />
                <circle
                  className="dial-indicator"
                  cx="60"
                  cy="60"
                  r="50"
                  style={{ "--percent": `${overall}` }}
                />
                <text x="60" y="66" textAnchor="middle" className="dial-text">
                  {overall}%
                </text>
              </svg>
            </div>

            <div className="progress-group" aria-label="Category progress">
              {progressMetrics.map((m) => (
                <div key={m.label} className="progress-row">
                  <label>{m.label}</label>
                  <div className="progress-bar" style={{ "--value": `${m.value}%` }}>
                    <span />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="dashboard-card">
            <h3>{Icon.target} Timeline</h3>
            <ul className="timeline" aria-label="Internship timeline">
              {timeline.map((t, i) => (
                <li key={i} className="timeline-item">
                  <div className="dot" />
                  <div>
                    <h4>{t.title}</h4>
                    <p>{t.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div className="dashboard-card">
            <h3>{Icon.check} Skills & Focus</h3>
            <div className="tech-tags">
              {skillTags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            <div className="legend">
              <span className="badge ok">Growth</span>
              <span className="badge warn">Iteration</span>
              <span className="badge danger">Challenges</span>
            </div>
            <p>
              Replace this with measurable narrative (e.g., PRs merged, cycle time improvements,
              shipped modules, lighthouse scores).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
