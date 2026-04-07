import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPatients(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients', {
        patient_name: formData.name,
        phoneno: formData.phone
      });
      setFormData({ name: '', phone: '' });
      fetchPatients();
    } catch (err) {
      alert("Error adding patient. Check console.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("This will delete ALL related records. Continue?")) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      alert("Cannot delete patient");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Patient Management</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input 
          required 
          placeholder="Name" 
          style={{ marginRight: '10px', padding: '5px' }}
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
        />
        <input 
          placeholder="Phone" 
          style={{ marginRight: '10px', padding: '5px' }}
          value={formData.phone} 
          onChange={e => setFormData({...formData, phone: e.target.value})} 
        />
        <button type="submit" style={{ padding: '5px 10px' }}>Add Patient</button>
      </form>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.patient_id}>
              <td>{p.patient_id}</td>
              <td>{p.patient_name}</td>
              <td>{p.phoneno}</td>
              <td>
                <button onClick={() => handleDelete(p.patient_id)} style={{ color: 'red' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
