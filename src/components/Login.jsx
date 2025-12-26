import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(userId, password);
    } catch (err) {
      console.log(err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-6 rounded w-80">
        <h2 className="text-lg mb-4 text-center text-white font-bold">OHC BKC</h2>

        <input
          className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
          placeholder="Username"
          onChange={e => setUserId(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 p-2 rounded text-white"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
