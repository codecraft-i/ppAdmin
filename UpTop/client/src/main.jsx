import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import App from './App';
import Home from './pages/Home';
import AddUser from './pages/AddUser';
import UsersStudents from './pages/UsersStudents';
import TeachersPage from './pages/TeachersPage';
import AllUsersPage from './pages/AllUsers';
import UserChange from './pages/UserChange';
import Login from './pages/Login';


const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="users/add/user" element={<AddUser />} />
            <Route path="users/students" element={<UsersStudents />} />
            <Route path="users/teachers" element={<TeachersPage />} />
            <Route path="users/allusers" element={<AllUsersPage />} />
            <Route path="users/allusers/:username/change" element={<UserChange />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);