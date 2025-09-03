import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAssignmentById } from '../data/reportData';
import { motion } from 'framer-motion';
import '../components/Dashboard.css';
import './AssignmentDetail.css';

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const assignment = getAssignmentById(id);

  if(!assignment){
    return (
      <div className="dashboard-container" style={{padding:'120px 42px'}}>
        <p><Link to="/assignments" style={{color:'var(--accent)' }}>&larr; Back</Link></p>
        <h2>Not Found</h2>
        <p>No assignment with id {id}.</p>
      </div>
    );
  }

  const index = assignment.id;
  const prev = index > 1 ? index - 1 : null;
  const next = index < 63 ? index + 1 : null;

  return (
    <div className="dashboard-container assignment-detail-page">
      <p><Link to="/assignments" className="back-link">&larr; All Assignments</Link></p>
      <motion.h2 layoutId={`asg-title-${assignment.id}`}>{assignment.id}. {assignment.title}</motion.h2>
      <div className="assignment-tags">
        {(assignment.concepts||[]).map(c => <span key={c} className="tag">{c}</span>)}
      </div>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{type:'spring',damping:22,stiffness:160}} className="dashboard-card assignment-detail-card">
        <h3>Logic & Learning</h3>
        <p>{assignment.logic}</p>
        {assignment.learning && <p className="learning">Learning Focus: {assignment.learning}</p>}
        {assignment.code && <pre className="assignment-code"><code>{assignment.code}</code></pre>}
        {assignment.file && <p className="assignment-file">File: {assignment.file}</p>}
      </motion.div>
      <div className="assignment-nav">
        <div>{prev && <button onClick={()=> navigate(`/assignments/${prev}`)} className="badge">&larr; {prev}</button>}</div>
        <div>{next && <button onClick={()=> navigate(`/assignments/${next}`)} className="badge">{next} &rarr;</button>}</div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
