import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (savedToken) {
      setToken(savedToken);
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (token) {
      localStorage.setItem('admin_token', token);
      setAuthenticated(true);
    }
  };

  const fetchUsers = async (status = '') => {
    setLoading(true);
    try {
      const url = status
        ? `/api/admin/users?status=${status}`
        : '/api/admin/users';
      
      const res = await fetch(url, {
        headers: { 'x-admin-token': token }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        alert('Failed to fetch users');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const fetchDates = async (status = '') => {
    setLoading(true);
    try {
      const url = status
        ? `/api/admin/dates?status=${status}`
        : '/api/admin/dates';
      
      const res = await fetch(url, {
        headers: { 'x-admin-token': token }
      });
      
      if (res.ok) {
        const data = await res.json();
        setDates(data.dates || []);
      } else {
        alert('Failed to fetch dates');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        alert('User status updated');
        fetchUsers();
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const updateDateStatus = async (dateId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/dates/${dateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        alert('Date status updated');
        fetchDates();
      } else {
        alert('Failed to update date');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (!authenticated) {
    return (
      <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
        <Head>
          <title>Admin Login - Le Society</title>
        </Head>
        <h1>Admin Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Admin Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button type="submit" style={{ padding: '10px 20px' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Head>
        <title>Admin Dashboard - Le Society</title>
      </Head>
      <h1>Le Society Admin Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            background: activeTab === 'users' ? '#333' : '#ccc',
            color: activeTab === 'users' ? '#fff' : '#000'
          }}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('dates')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'dates' ? '#333' : '#ccc',
            color: activeTab === 'dates' ? '#fff' : '#000'
          }}
        >
          Date Posts
        </button>
      </div>

      {activeTab === 'users' && (
        <div>
          <h2>User Management</h2>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => fetchUsers()}>All Users</button>
            <button onClick={() => fetchUsers('pending')} style={{ marginLeft: '10px' }}>Pending</button>
            <button onClick={() => fetchUsers('verified')} style={{ marginLeft: '10px' }}>Verified</button>
            <button onClick={() => fetchUsers('blocked')} style={{ marginLeft: '10px' }}>Blocked</button>
          </div>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.status}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <button onClick={() => updateUserStatus(user.id, 'verified')}>Verify</button>
                      <button onClick={() => updateUserStatus(user.id, 'blocked')} style={{ marginLeft: '5px' }}>Block</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'dates' && (
        <div>
          <h2>Date Post Management</h2>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => fetchDates()}>All Dates</button>
            <button onClick={() => fetchDates('pending')} style={{ marginLeft: '10px' }}>Pending</button>
            <button onClick={() => fetchDates('verified')} style={{ marginLeft: '10px' }}>Verified</button>
            <button onClick={() => fetchDates('blocked')} style={{ marginLeft: '10px' }}>Blocked</button>
          </div>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Creator</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tier</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dates.map(date => (
                  <tr key={date.id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {date.creator?.username || 'Unknown'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{date.category}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{date.tier}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{date.status}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <button onClick={() => updateDateStatus(date.id, 'verified')}>Approve</button>
                      <button onClick={() => updateDateStatus(date.id, 'blocked')} style={{ marginLeft: '5px' }}>Block</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

