import { useState, useEffect } from 'react';
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

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Analytics Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Room Occupancy Card */}
        {rooms && (
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', minWidth: '250px' }}>
            <h3>Room Occupancy</h3>
            <p><strong>Total Rooms:</strong> {rooms.total_rooms}</p>
            <p><strong>Occupied:</strong> {rooms.occupied_rooms}</p>
            <p><strong>Available:</strong> {rooms.available_rooms}</p>
          </div>
        )}

        {/* Appointments per doctor */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', flex: '1 1 300px' }}>
          <h3>Appointments per Doctor</h3>
          <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                <th>Doctor</th>
                <th>Appointments</th>
              </tr>
            </thead>
            <tbody>
              {docAppt.map((d, i) => (
                <tr key={i}>
                  <td>{d.doctor_name}</td>
                  <td>{d.total_appointments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Patients per department */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', flex: '1 1 300px' }}>
          <h3>Patients per Department</h3>
          <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                <th>Department</th>
                <th>Patients</th>
              </tr>
            </thead>
            <tbody>
              {deptPatients.map((d, i) => (
                <tr key={i}>
                  <td>{d.dept_name}</td>
                  <td>{d.total_patients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Billing per Patient */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', flex: '1 1 100%' }}>
          <h3>Billing Overview</h3>
          <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                <th>Patient Name</th>
                <th>Total Service Cost</th>
                <th>Total Paid</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {billing.map((b, i) => (
                <tr key={i}>
                  <td>{b.patient_name}</td>
                  <td>${b.total_service_cost}</td>
                  <td>${b.total_paid}</td>
                  <td style={{ color: b.balance > 0 ? 'red' : 'green'}}>${b.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
