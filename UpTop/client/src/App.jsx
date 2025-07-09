import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export default function App() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <div style={{ padding: '20px' }}>
        <div className="flex justify-between items-center mb-4">
          <h1>Admin Panel</h1>
          {user && (
            <div className="flex items-center gap-4">
              <span>Welcome, {user.first_name || user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/">Home</Link> | 
          <Link to="/users/add/User">Add User</Link> | 
          <Link to="/users/students">All Students</Link> | 
          <Link to="/users/teachers">All Teachers</Link> |
          <Link to="/users/allusers">All Users</Link> ||||
        </nav>
        <Outlet />
      </div>
    </div>
  );
}