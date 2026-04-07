import { useState, useEffect } from 'react';
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

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Appointment Management</h1>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>ID</th>
            <th>Date</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.appointment_id || item.app_id}>
              <td>{item.appointment_id || item.app_id}</td>
              <td>{item.app_date || item.date}</td>
              <td>{item.patient_name || item.patient_id}</td>
              <td>{item.doctor_name || item.doctor_id}</td>
              <td>{item.dept_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
