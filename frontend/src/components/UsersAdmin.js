import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

function UsersAdmin({ user }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API}/auth/users`, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': user?.Role || 'staff'
      }
    })
      .then(r => r.json())
      .then(setUsers)
      .catch(() => {});
  }, [user?.Role]);

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 28 }}>Manage Users</h1>
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">👥 Registered Users</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{users.length} users</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Full Name</th><th>Email</th><th>Role</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.UserID}>
                  <td style={{ color: 'var(--text-muted)' }}>#{u.UserID}</td>
                  <td style={{ fontWeight: 500 }}>{u.FullName}</td>
                  <td style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{u.Email}</td>
                  <td>
                    <span className={`badge ${u.Role === 'admin' ? 'badge-ordered' : 'badge-received'}`}>
                      {u.Role}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UsersAdmin;
