import { useState, useEffect } from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import api from '../api/api';

export default function Appointments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    api.get('/appointments')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner">Loading Schedules...</div>;

  return (
    <div>
      <h1 className="page-title">Appointment Routing</h1>
      <div className="table-container" style={{ marginTop: '2rem' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.appointment_id || item.app_id}>
                <td><span className="badge">#{item.appointment_id || item.app_id}</span></td>
                <td><Calendar size={14} style={{ display: 'inline', marginRight: '5px' }}/> {item.app_date || item.date}</td>
                <td><strong>{item.patient_name || item.patient_id}</strong></td>
                <td>{item.doctor_name || item.doctor_id}</td>
                <td>{item.department_name}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => alert("Delete unimplemented")}>
                    <Trash2 size={16} /> Cancel
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="6" className="empty-state">No appointments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
