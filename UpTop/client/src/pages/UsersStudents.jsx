import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentsPage = () => {
  const API = "http://127.0.0.1:8000/";
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        min_age: minAge,
        max_age: maxAge,
      };
      const res = await axios.get(`${API}/api/users/students/`, { params });
      setStudents(res.data.results);
      setTotal(res.data.filtered_count);  // faqat filtered count ishlatiladi
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(fetchStudents, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, minAge, maxAge]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Students</h1>

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
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">No students found.</td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-2">{s.user.username}</td>
                  <td className="p-2">{s.user.first_name}</td>
                  <td className="p-2">{s.user.last_name}</td>
                  <td className="p-2">{s.user.phone_number}</td>
                  <td className="p-2">{s.user.birth_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentsPage;