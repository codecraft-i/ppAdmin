import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AllUsersPage = () => {
  const API = "http://127.0.0.1:8000";
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        min_age: minAge,
        max_age: maxAge,
      };
      const res = await axios.get(`${API}/api/users/all-users/`, { params });
      setUsers(res.data.results);
      setTotal(res.data.filtered_count);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(fetchUsers, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, minAge, maxAge]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">All Users</h1>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by name or username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />
        <input
          type="number"
          placeholder="Min age"
          value={minAge}
          onChange={(e) => setMinAge(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />
        <input
          type="number"
          placeholder="Max age"
          value={maxAge}
          onChange={(e) => setMaxAge(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Total: <strong>{total}</strong>
      </p>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Username</th>
              <th className="p-2 text-left">First Name</th>
              <th className="p-2 text-left">Last Name</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Birth Date</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.first_name}</td>
                  <td className="p-2">{u.last_name}</td>
                  <td className="p-2">{u.phone_number}</td>
                  <td className="p-2">{u.birth_date}</td>
                  <td className="p-2">
                    <Link
                      to={`/users/allusers/${u.username}/change`}
                      className="text-blue-600 hover:underline"
                    >
                      Change
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllUsersPage;