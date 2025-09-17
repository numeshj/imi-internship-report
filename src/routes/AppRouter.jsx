import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import SummaryPage from '../pages/SummaryPage';
import AssignmentsIndex from '../pages/AssignmentsIndex';
import AssignmentDetail from '../pages/AssignmentDetail';
import TechnologiesPage from '../pages/TechnologiesPage';
import PatternsPage from '../pages/PatternsPage';

const AppRouter = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      <Route element={<Layout />}> {/* persistent nav + theme */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/assignments" element={<AssignmentsIndex />} />
        <Route path="/assignments/:id" element={<AssignmentDetail />} />
        <Route path="/technologies" element={<TechnologiesPage />} />
        <Route path="/patterns" element={<PatternsPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
