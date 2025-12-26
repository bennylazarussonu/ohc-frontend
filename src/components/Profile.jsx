import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);
      await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      alert("Password changed. Please login again.");
      logout();
    } catch {
      alert("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-gray-800 p-6 rounded mt-6">
      <h2 className="text-lg font-bold mb-4">My Profile</h2>

      <p className="text-sm text-gray-300 mb-1">
        User ID: <b>{user.userId}</b>
      </p>
      <p className="text-sm text-gray-300 mb-4">
        Role: <b>{user.role}</b>
      </p>

      <input
        type="password"
        placeholder="Current Password"
        className="w-full p-2 mb-2 bg-gray-700 rounded"
        onChange={e => setCurrentPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="New Password"
        className="w-full p-2 mb-4 bg-gray-700 rounded"
        onChange={e => setNewPassword(e.target.value)}
      />

      <button
        onClick={handleChangePassword}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded disabled:opacity-50"
      >
        {loading ? "Updating..." : "Change Password"}
      </button>
    </div>
  );
}

export default Profile;
