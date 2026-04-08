import { useState, useEffect } from 'react';
import { Stethoscope, Users, CreditCard, Building } from 'lucide-react';
import api from '../api/api';

export default function Dashboard() {
  const [docAppt, setDocAppt] = useState([]);
  const [deptPatients, setDeptPatients] = useState([]);
  const [billing, setBilling] = useState([]);
  const [rooms, setRooms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [r1, r2, r3, r4] = await Promise.all([
          api.get('/analytics/appointments-per-doctor'),
          api.get('/analytics/patients-per-department'),
          api.get('/analytics/billing-per-patient'),
          api.get('/analytics/room-occupancy')
        ]);
        setDocAppt(r1.data);
        setDeptPatients(r2.data);
        setBilling(r3.data);
        setRooms(r4.data);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading-spinner">Syncing Metrics...</div>;

  return (
    <div>
      <h1 className="page-title">Analytics Overview</h1>
      
      <div className="dashboard-grid">
        
        {/* Room Occupancy Card */}
        {rooms && (
          <div className="glass-card">
            <h3><Building size={20} /> Live Room Status</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="stat-value">{rooms.occupied_rooms}</div>
                <div style={{ color: 'var(--text-sub)' }}>Occupied Rooms</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{rooms.available_rooms}</div>
                <div style={{ color: 'var(--accent)' }}>Available</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
              <div style={{ width: `${(rooms.occupied_rooms / rooms.total_rooms) * 100}%`, height: '100%', background: 'var(--gradient)', borderRadius: '4px' }}></div>
            </div>
          </div>
        )}

        {/* Patients Per Department */}
        <div className="glass-card">
          <h3><Users size={20} /> Department Load</h3>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Patients Active</th>
                </tr>
              </thead>
              <tbody>
                {deptPatients.map((d, i) => (
                  <tr key={i}>
                    <td><strong>{d.dept_name}</strong></td>
                    <td><span className="badge">{d.total_patients}</span></td>
                  </tr>
                ))}
                {deptPatients.length === 0 && <tr><td colSpan="2" className="empty-state">No data available</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointments per doctor */}
        <div className="glass-card">
          <h3><Stethoscope size={20} /> Doctor Schedules</h3>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Appointments</th>
                </tr>
              </thead>
              <tbody>
                {docAppt.map((d, i) => (
                  <tr key={i}>
                    <td><strong>{d.doctor_name}</strong></td>
                    <td><span className="badge">{d.total_appointments}</span></td>
                  </tr>
                ))}
                {docAppt.length === 0 && <tr><td colSpan="2" className="empty-state">No data available</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Billing */}
        <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <h3><CreditCard size={20} /> Financial Ledger</h3>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Total Service Cost</th>
                  <th>Total Paid</th>
                  <th>Balance Ledger</th>
                </tr>
              </thead>
              <tbody>
                {billing.map((b, i) => (
                  <tr key={i}>
                    <td><strong>{b.patient_name}</strong></td>
                    <td>${b.total_service_cost}</td>
                    <td style={{ color: 'var(--accent)' }}>${b.total_paid}</td>
                    <td style={{ color: b.balance > 0 ? 'var(--danger)' : 'green', fontWeight: 700}}>
                      {b.balance > 0 ? `-$${b.balance}` : `$0`}
                    </td>
                  </tr>
                ))}
                {billing.length === 0 && <tr><td colSpan="4" className="empty-state">No data available</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
