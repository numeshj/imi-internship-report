import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';

// Persistent layout hosting the global navigation + theme toggle
const Layout = () => {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('imi-theme');
    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('imi-theme', theme);
  }, [theme]);

  const navItems = [
    ['Home', '/'],
    ['Summary', '/summary'],
    ['Assignments', '/assignments'],
    ['Technologies', '/technologies'],
    ['Patterns', '/patterns']
  ];

  return (
  <div className="app-shell">
      <header className="dashboard-header">
        <div className="dashboard-header-row">
          <div className="site-title-wrap">
            <h1 className="site-title">IMI Games Internship</h1>
            <p className="subtitle">3 Month Progress Report</p>
          </div>
          <div className="theme-toggle" role="radiogroup" aria-label="Theme toggle">
            <button className={theme==='light'? 'active':''} onClick={()=> setTheme('light')} aria-pressed={theme==='light'}><span>🌞</span><span>Light</span></button>
            <button className={theme==='dark'? 'active':''} onClick={()=> setTheme('dark')} aria-pressed={theme==='dark'}><span>🌜</span><span>Dark</span></button>
          </div>
        </div>
        <nav className="nav-bar">
          {navItems.map(([label, href]) => {
            const active = location.pathname === href || (href!== '/' && location.pathname.startsWith(href));
            return <Link key={href} to={href} className={`nav-link ${active? 'active':''}`}>{label}</Link>;
          })}
        </nav>
      </header>
      <main style={{minHeight:'100vh'}}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
