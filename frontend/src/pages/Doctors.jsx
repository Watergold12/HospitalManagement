import { useState, useEffect } from 'react';
import { Stethoscope, Trash2 } from 'lucide-react';
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

  if (loading) return <div className="loading-spinner">Loading Records...</div>;

  return (
    <div>
      <h1 className="page-title">Doctor Management</h1>
      <div className="table-container" style={{ marginTop: '2rem' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Specialization</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.doctor_id}>
                <td><span className="badge">#{item.doctor_id}</span></td>
                <td><strong>{item.name}</strong></td>
                <td>{item.specialization}</td>
                <td>{item.phone}</td>
                <td>{item.department_name || item.dept_name || item.dept_id}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => alert("Delete unimplemented per instruction")}>
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="6" className="empty-state">No doctors found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
