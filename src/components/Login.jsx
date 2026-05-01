import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaKey, FaLock, FaLockOpen } from "react-icons/fa6"

function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await login(userId, password);
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Outer container */}
      <div className="flex items-center justify-center h-screen bg-gray-900 text-xs">
        {/* Login box */}
        <div className="bg-gray-800 px-8 py-4 rounded-xl w-[350px] flex flex-col justify-center gap-2">
          <h2 className="text-2xl mb-4 text-center text-white font-bold">OHC BKC</h2>

          {/* Username and Password fields */}
          <div className="w-full flex items-center gap-4 text-md">
            <FaUser className="text-white text-[16px]" />
            <input
              className="w-full p-2 bg-gray-700  outline-none focus:ring-1 focus:ring-blue-400 rounded text-white"
              placeholder="Username"
              onChange={e => setUserId(e.target.value)}
            />
          </div>
          <div className="w-full mb-2 flex items-center gap-4">
            <FaKey className="text-white text-[16px]" />
            <input
              type="password"
              className="w-full p-2 bg-gray-700 outline-none focus:ring-1 focus:ring-blue-400 rounded text-white"
              placeholder="Password"
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="w-full flex items-center justify-center gap-4">
            <button
              onClick={handleLogin}
              className="bg-blue-600 flex hover:bg-blue-800 items-center p-3 gap-2 rounded text-white"
              disabled={loading}
            >
              {loading ? (<FaLockOpen />) : (<FaLock />)}
              {loading ? ("Logging in...") : ("Login")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
