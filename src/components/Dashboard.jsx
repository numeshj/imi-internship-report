import React from "react";
import { Link } from 'react-router-dom';
import "./Dashboard.css";

// Data placeholders (will be replaced with real internship content later)
const progressMetrics = [
  { label: "Overall", value: 78 },
  { label: "Frontend", value: 85 },
  { label: "Backend", value: 65 },
  { label: "Collaboration", value: 90 },
  { label: "Learning", value: 88 }
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
  return (
    <div className="dashboard-container" style={{paddingTop:'40px'}}>
      <section className="dashboard-welcome">
        <div className="intro-panel">
          <h2>Numesh- Internship Journey (Summary)</h2>
            <p className="lead">This interactive report captures the highlights of your 3–month journey at IMI Games: delivery, learning velocity, collaboration, and impact. The content below will be replaced with real data you provide next.</p>
            <div className="quick-stats">
              <span className="stat-chip">3 MONTHS</span>
              <span className="stat-chip">IMI GAMES</span>
              <span className="stat-chip">SOFTWARE ENGINEER INTERN</span>
              <span className="stat-chip">GROWTH MODE</span>
            </div>
            <div style={{marginTop:'34px',display:'flex',gap:'18px',flexWrap:'wrap'}}>
              <Link to="/assignments" className="badge" style={{textDecoration:'none'}}>Explore Assignments →</Link>
              <Link to="/technologies" className="badge" style={{textDecoration:'none'}}>Technologies →</Link>
              <Link to="/patterns" className="badge" style={{textDecoration:'none'}}>Patterns →</Link>
            </div>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Progress Metrics</h3>
            <div className="progress-group">
              {progressMetrics.map(m => (
                <div key={m.label} className="progress-row">
                  <label>{m.label}</label>
                  <div className="progress-bar" style={{"--value": m.value + '%'}}><span /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-card">
            <h3>Timeline</h3>
            <ul className="timeline">
              {timeline.map((t,i) => (
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
          <div className="dashboard-card">
            <h3>Skills & Focus</h3>
            <div className="tech-tags">
              {skillTags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
            <div style={{marginTop:'10px', display:'flex', gap:'10px', flexWrap:'wrap'}}>
              <span className="badge ok">Growth</span>
              <span className="badge warn">Iteration</span>
              <span className="badge danger">Challenges</span>
            </div>
            <p>Will replace with measurable narrative (e.g. code reviews, velocity, shipped modules).</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
