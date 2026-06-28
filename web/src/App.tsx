import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthChange } from './lib/auth';
import type { User } from 'firebase/auth';
import Login from './pages/Login';
import Layout from './components/Layout';
import Today from './pages/Today';
import Goals from './pages/Goals';
import GoalDetail from './pages/GoalDetail';
import Activity from './pages/Activity';
import SnapToPlanPage from './pages/SnapToPlan';
import Premium from './pages/Premium';
import Settings from './pages/Settings';

export default function App() {
  const [user, setUser] = useState<User | null | 'loading'>('loading');

  useEffect(() => {
    return onAuthChange(setUser);
  }, []);

  if (user === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surf-base">
        <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={user ? <Layout user={user} /> : <Navigate to="/login" />}>
        <Route index element={<Today user={user!} />} />
        <Route path="goals" element={<Goals />} />
        <Route path="goals/:id" element={<GoalDetail />} />
        <Route path="activity" element={<Activity />} />
        <Route path="snap" element={<SnapToPlanPage />} />
        <Route path="premium" element={<Premium />} />
        <Route path="settings" element={<Settings user={user!} />} />
      </Route>
    </Routes>
  );
}
