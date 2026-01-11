import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaKey, FaPlus, FaUser } from "react-icons/fa6";

function Staff() {
  const [users, setUsers] = useState([]);
  const [resetPwd, setResetPwd] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({
    userId: "",
    password: "staff$123"
  });

  const fetchUsers = async () => {
    const res = await api.get("/api/users");
    setUsers(res.data.slice(1)); // skipping admin
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetPassword = async () => {
    if (!resetPwd) return alert("Enter new password");

    await api.put(`/api/users/reset-password/${selectedUser._id}`, {
      newPassword: resetPwd
    });

    alert(`Password reset for ${selectedUser.userId}`);
    setSelectedUser(null);
    setResetPwd("");
  };

  const addStaff = async () => {
    if (!newUser.userId || !newUser.password) {
      return alert("Username and password required");
    }

    try {
      await api.post("/api/users/add-staff", newUser);
      alert("Staff created successfully");

      setNewUser({ userId: "", password: "staff$123" });
      setShowAdd(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create staff");
    }
  };

  return (
    <div className="w-full bg-gray-800 p-4 rounded-xl">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">STAFF MANAGEMENT</h2>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-sm flex items-center gap-2"
        >
          <FaPlus /> Add Staff
        </button>
      </div>

      {/* ADD STAFF PANEL */}
      {showAdd && (
        <div className="bg-gray-700 p-3 rounded mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FaUser />
            <span className="font-semibold">New Staff (EMPLOYEE)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <input
              placeholder="Username"
              className="p-2 bg-gray-600 rounded"
              value={newUser.userId}
              onChange={e =>
                setNewUser({ ...newUser, userId: e.target.value })
              }
            />

            <input
              placeholder="Password"
              className="p-2 bg-gray-600 rounded"
              value={newUser.password}
              onChange={e =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
          </div>

          <button
            onClick={addStaff}
            className="mt-3 bg-blue-600 px-4 py-1.5 rounded text-sm"
          >
            Create Staff
          </button>
        </div>
      )}

      {/* STAFF LIST */}
      <table className="w-full text-sm border">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-2 border">User ID</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="hover:bg-gray-700">
              <td className="p-2 border">{u.userId}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => setSelectedUser(u)}
                  className="bg-blue-600 px-2 py-1 rounded text-xs flex items-center gap-1 mx-auto"
                >
                  <FaKey /> Reset
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* RESET PASSWORD PANEL */}
      {selectedUser && (
        <div className="mt-4 bg-gray-700 p-3 rounded">
          <p className="text-sm mb-2">
            Reset password for <b>{selectedUser.userId}</b>
          </p>

          <input
            placeholder="New Password"
            className="p-2 bg-gray-600 rounded w-full mb-2"
            value={resetPwd}
            onChange={e => setResetPwd(e.target.value)}
          />

          <button
            onClick={resetPassword}
            className="bg-green-600 px-4 py-1 rounded"
          >
            Confirm Reset
          </button>
        </div>
      )}
    </div>
  );
}

export default Staff;
