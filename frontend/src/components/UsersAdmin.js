import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';

function UsersAdmin({ user }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiFetch('/auth/users')
      .then(r => r.json())
      .then(setUsers);
  }, []);

  return (
    <div>
      <h2>Manage Users</h2>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.UserID}>
              <td>{u.FullName}</td>
              <td>{u.Email}</td>
              <td>{u.Role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersAdmin;