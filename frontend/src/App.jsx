import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserRound, CalendarCheck, Building2, Activity } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Departments from './pages/Departments';

function App() {
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity size={28} color="#3b82f6" />
          <span>CareFlow</span>
        </div>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/patients" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Users size={20} /> Patients
          </NavLink>
          <NavLink to="/doctors" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <UserRound size={20} /> Doctors
          </NavLink>
          <NavLink to="/appointments" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <CalendarCheck size={20} /> Appointments
          </NavLink>
          <NavLink to="/departments" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Building2 size={20} /> Departments
          </NavLink>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        <Routes>
           <Route path="/" element={<Dashboard />} />
           <Route path="/patients" element={<Patients />} />
           <Route path="/doctors" element={<Doctors />} />
           <Route path="/appointments" element={<Appointments />} />
           <Route path="/departments" element={<Departments />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
