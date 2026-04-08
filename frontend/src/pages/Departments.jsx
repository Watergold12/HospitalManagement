import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import api from '../api/api';

export default function Departments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    api.get('/departments')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner">Loading Records...</div>;

  return (
    <div>
      <h1 className="page-title">Department Logistics</h1>
      <div className="table-container" style={{ marginTop: '2rem' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location Route</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.dept_id}>
                <td><span className="badge">#{item.dept_id}</span></td>
                <td><strong>{item.dept_name}</strong></td>
                <td><Building2 size={16} style={{ display: 'inline', marginRight: '8px', color: 'var(--text-sub)' }}/> {item.location}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="3" className="empty-state">No departments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
