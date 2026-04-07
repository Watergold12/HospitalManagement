import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Doctors() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    api.get('/doctors')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Doctor Management</h1>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>ID</th>
            <th>Name</th>
            <th>Specialization</th>
            <th>Phone</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.doctor_id}>
              <td>{item.doctor_id}</td>
              <td>{item.doctor_name}</td>
              <td>{item.specialization}</td>
              <td>{item.phoneno}</td>
              <td>{item.department_name || item.dept_name || item.dept_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
