import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

   const handleRegister = async (e) => {
    e.preventDefault();
    
    const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      alert("Registration successful! Please login.");
      navigate('/login');
    } else {
      const data = await res.json();
      alert(data.msg || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-xl">
        <h3 className="text-2xl font-bold text-center">Create an account</h3>
        <form onSubmit={handleRegister}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-700">Email</label>
              <input type="email" placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700">Password</label>
              <input type="password" placeholder="Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex flex-col mt-6">
              <button className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-900">Register</button>
              <Link to="/login" className="text-sm text-center text-blue-600 hover:underline mt-4">Already have an account? Login</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;