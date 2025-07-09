import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    date_of_birth: "",
    password: "",
    role: "student", // student yoki teacher
    bio: "",
    certificates: "",
  });

  const [usernameExists, setUsernameExists] = useState(false);

  // Real-time username check (debounced)
  useEffect(() => {
    if (form.username.trim() === "") {
      setUsernameExists(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      axios
        .get(`http://127.0.0.1:8000/api/users/check-username/?username=${form.username}`)
        .then((res) => {
          setUsernameExists(res.data.exists); // exists: true bo'lsa, mavjud
        })
        .catch((err) => {
          console.error("Username check error:", err);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [form.username]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    setForm({ ...form, role: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usernameExists) return;

    try {
      await axios.post("http://127.0.0.1:8000/api/users/users/", {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
        birth_date: form.date_of_birth,
        password: form.password,
        is_student: form.role === "student",
        is_teacher: form.role === "teacher",
        bio: form.role === "teacher" ? form.bio : "",
        certificates: form.role === "teacher" ? form.certificates : "",
      });

      // 👇 Rolga qarab navigate qilish
      if (form.role === "student") {
        navigate("/users/students");
      } else if (form.role === "teacher") {
        navigate("/users/teachers");
      }
    } catch (err) {
      console.error("User create error:", err);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Add User</h2>
      {usernameExists && (
        <p className="text-red-500">Username already exists. Try another.</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="date"
          name="date_of_birth"
          value={form.date_of_birth}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              name="role"
              value="student"
              checked={form.role === "student"}
              onChange={handleRoleChange}
            />{" "}
            Student
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={form.role === "teacher"}
              onChange={handleRoleChange}
            />{" "}
            Teacher
          </label>
        </div>

        {form.role === "teacher" && (
          <>
            <textarea
              className="w-full p-2 border rounded"
              name="bio"
              placeholder="Bio"
              value={form.bio}
              onChange={handleChange}
            />
            <textarea
              className="w-full p-2 border rounded"
              name="certificates"
              placeholder="Certificates"
              value={form.certificates}
              onChange={handleChange}
            />
          </>
        )}

        <button
          className={`px-4 py-2 rounded text-white ${
            usernameExists ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
          }`}
          type="submit"
          disabled={usernameExists}
        >
          Submit
        </button>
      </form>
    </div>
  );
}