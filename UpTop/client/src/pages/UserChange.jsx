import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UserChange = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const API = "http://127.0.0.1:8000/";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({}); // Maydonlar bo'yicha xatolar
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    birth_date: "",
    is_active: false,
    is_staff: false,
    is_superuser: false,
    is_student: false,
    is_teacher: false,
    bio: "",
    certificates: "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/api/users/all-users/${username}/`);
        setUser(res.data);
        setForm({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          email: res.data.email || "",
          phone_number: res.data.phone_number || "",
          birth_date: res.data.birth_date || "",
          is_active: res.data.is_active || false,
          is_staff: res.data.is_staff || false,
          is_superuser: res.data.is_superuser || false,
          is_student: res.data.is_student || false,
          is_teacher: res.data.is_teacher || false,
          bio: res.data.is_teacher ? (await fetchTeacherData(res.data.id)).bio : "",
          certificates: res.data.is_teacher ? (await fetchTeacherData(res.data.id)).certificates : "",
          password: "",
          confirm_password: "",
        });
      } catch (err) {
        setError(err.response?.data?.error || "Foydalanuvchi ma'lumotlari topilmadi");
      } finally {
        setLoading(false);
      }
    };

    const fetchTeacherData = async (userId) => {
      try {
        const res = await axios.get(`${API}/api/users/teachers/?user_id=${userId}`);
        return res.data.results[0] || { bio: "", certificates: "" };
      } catch {
        return { bio: "", certificates: "" };
      }
    };

    fetchUser();
  }, [username]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" }); // Xato xabarini tozalash
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});
    if (form.password && form.password !== form.confirm_password) {
      setErrors({ confirm_password: "Parollar mos kelmaydi" });
      return;
    }
    try {
      const formData = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number,
        birth_date: form.birth_date || null, // Bo'sh bo'lsa null yuborish
        is_active: form.is_active,
        is_staff: form.is_staff,
        is_superuser: form.is_superuser,
        is_student: form.is_student,
        is_teacher: form.is_teacher,
        bio: form.is_teacher ? form.bio : "",
        certificates: form.is_teacher ? form.certificates : "",
      };
      if (form.password) formData.password = form.password;
      await axios.put(`${API}/api/users/all-users/${username}/`, formData);
      if (form.password) {
        await axios.post(`${API}/api/users/users/${username}/reset-password/`, { password: form.password });
      }
      navigate("/users/allusers");
    } catch (err) {
      const errorData = err.response?.data || { detail: "Ma'lumotlarni yangilashda xato yuz berdi" };
      if (typeof errorData === "object" && !errorData.detail) {
        setErrors(errorData); // Maydonlar bo'yicha xatolar
      } else {
        setError(JSON.stringify(errorData));
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Change User: {username}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Username (o'zgartirib bo'lmaydi)</label>
          <input
            className="w-full p-2 border rounded bg-gray-100"
            type="text"
            value={username}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium">First Name (ixtiyoriy)</label>
          <input
            className="w-full p-2 border rounded"
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
          />
          {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Last Name (ixtiyoriy)</label>
          <input
            className="w-full p-2 border rounded"
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
          />
          {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Email Address (ixtiyoriy)</label>
          <input
            className="w-full p-2 border rounded"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Phone Number (ixtiyoriy)</label>
          <input
            className="w-full p-2 border rounded"
            type="text"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
          />
          {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Birth Date (ixtiyoriy, YYYY-MM-DD)</label>
          <input
            className="w-full p-2 border rounded"
            type="date"
            name="birth_date"
            value={form.birth_date}
            onChange={handleChange}
          />
          {errors.birth_date && <p className="text-red-500 text-sm">{errors.birth_date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">New Password (ixtiyoriy)</label>
          <input
            className="w-full p-2 border rounded"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Yangi parol kiritish"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Confirm Password (ixtiyoriy)</label>
          <input
            className="w-full p-2 border rounded"
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            placeholder="Parolni tasdiqlash"
          />
          {errors.confirm_password && <p className="text-red-500 text-sm">{errors.confirm_password}</p>}
        </div>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="mr-2"
            />
            Active
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_staff"
              checked={form.is_staff}
              onChange={handleChange}
              className="mr-2"
            />
            Staff status
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_superuser"
              checked={form.is_superuser}
              onChange={handleChange}
              className="mr-2"
            />
            Superuser status
          </label>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_student"
              checked={form.is_student}
              onChange={handleChange}
              className="mr-2"
            />
            Is Student
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_teacher"
              checked={form.is_teacher}
              onChange={handleChange}
              className="mr-2"
            />
            Is Teacher
          </label>
        </div>
        {form.is_teacher && (
          <>
            <div>
              <label className="block text-sm font-medium">Bio (ixtiyoriy)</label>
              <textarea
                className="w-full p-2 border rounded"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="O'qituvchi bio"
              />
              {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Certificates (ixtiyoriy)</label>
              <textarea
                className="w-full p-2 border rounded"
                name="certificates"
                value={form.certificates}
                onChange={handleChange}
                placeholder="Sertifikatlar"
              />
              {errors.certificates && <p className="text-red-500 text-sm">{errors.certificates}</p>}
            </div>
          </>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UserChange;