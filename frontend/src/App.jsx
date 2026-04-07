import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Departments from './pages/Departments';

function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar / Navbar */}
      <aside style={{ width: '250px', background: '#f4f4f4', padding: '20px', borderRight: '1px solid #ccc' }}>
        <h2>Hospital MS</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Dashboard</Link>
          <Link to="/patients" style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Patients</Link>
          <Link to="/doctors" style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Doctors</Link>
          <Link to="/appointments" style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Appointments</Link>
          <Link to="/departments" style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Departments</Link>
        </nav>
      </aside>
      
      {/* Main Content routing */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
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
