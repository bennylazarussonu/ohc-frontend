import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaBell, FaPlus, FaPenToSquare, FaTrash, FaThumbtackSlash } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";

function Notifications({user}) {
    const [notifications, setNotifications] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [expiresAt, setExpiresAt] = useState("");


    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        let res;
        if(user.role === "EMPLOYEE" || user.role === "DOCTOR"){
            res = await api.get("/api/notifications/active");
        }else{
            res = await api.get("/api/notifications/");
        }
        setNotifications(res.data);
    };

    const expireNotification = async (n) => {
        try {
            await api.put(`/api/notifications/${n.id}`, {
                status: "inactive",
            });

            fetchNotifications(); // refresh list
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/api/notifications/${id}`);
            fetchNotifications();
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    const createNotification = async () => {
        try {
            const formattedExpiry = expiresAt
                ? new Date(expiresAt).toISOString()
                : undefined;

            if (!title.trim()) {
                alert("Title is required");
                return;
            }


            await api.post("/api/notifications", {
                title,
                message,
                expires_at: formattedExpiry
            });

            setShowForm(false);
            setTitle("");
            setMessage("");
            setExpiresAt("");

            fetchNotifications();
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };


    return (
        <div className="w-full space-y-4">
            <div className="bg-gray-800 p-4 rounded-xl">
                <div className="w-full flex justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FaBell />
                        <h2 className="font-bold text-lg">NOTIFICATIONS</h2>
                    </div>
                    <div>
                        {user.role === "ADMIN" && (
                            <button
                            onClick={() => {
                                setShowForm(true);

                                const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
                                const pad = (n) => n.toString().padStart(2, "0");

                                const year = defaultExpiry.getFullYear();
                                const month = pad(defaultExpiry.getMonth() + 1);
                                const day = pad(defaultExpiry.getDate());
                                const hours = pad(defaultExpiry.getHours());
                                const minutes = pad(defaultExpiry.getMinutes());

                                setExpiresAt(`${year}-${month}-${day}T${hours}:${minutes}`);

                            }}

                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                        >

                            <FaPlus className="font-bold text-sm" />
                            <p className="text-sm">Add New</p>
                        </button>
                        )}
                    </div>
                </div>
                {/* <div className="w-full grid grid-cols-3 gap-4">
                    <div className="bg-gray-900 p-4 rounded">
                        <h1 className="text-lg font-bold">TITLE</h1>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repudiandae, recusandae aspernatur? Consequatur non ex dolorem fugiat? Saepe voluptatum earum dolores laborum fugiat, nam cupiditate ipsa quae quia exercitationem architecto et!</p>
                        <p className="text-xs text-gray-400 flex justify-end">1hr ago</p>
                        <div className="flex justify-between items-center my-1">
                            <button className="text-sm rounded p-2 font-semibold bg-orange-500 flex items-center gap-1">
                                <FaThumbtackSlash className="text-lg" />
                                Unpublish
                            </button>
                            <div>
                                <button className="text-sm rounded mx-1 p-2 font-semibold text-yellow-500"><FaPenToSquare className="text-lg" /></button>
                                <button className="text-sm rounded mx-1 p-2 font-semibold text-red-600"><FaTrash className="text-lg" /></button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded">
                        hello
                    </div>
                    <div className="bg-gray-900 p-4 rounded">
                        hello
                    </div>
                </div> */}
                {showForm && (
                    <div className="bg-gray-900 p-4 rounded mb-4 space-y-3">
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <FaPlus className="text-sm" />
                            New Notification
                        </h1>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800"
                        />

                        <textarea
                            placeholder="Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800"
                        />

                        <p>Will become inactive at: <b>{expiresAt}</b></p>
                        <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-gray-600 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={createNotification}
                                className="px-4 py-2 bg-green-600 rounded"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                )}

                <div className="w-full grid grid-cols-3 gap-4">
                    {notifications.map((n) => (
                        <div key={n.id} className="bg-gray-900 p-5 rounded">
                            <div className="flex justify-between mb-3">
                                <h1 className="text-lg font-bold">{n.title}</h1>
                                <p className={`text-sm p-1 rounded font-semibold ${n.status === "active" ? "border-green-500 border text-green-500" : "border-red-500 border text-red-500"}`}>
                                    {n.status.toUpperCase()}
                                </p>
                            </div>
                            <div className="h-[100px] overflow-scroll no-scrollbar">
                                <p>{n.message}</p>
                            </div>
                            <p className="text-xs text-gray-400 flex justify-end">
                                {new Date(n.published_at).toLocaleString()}
                            </p>

                            {user.role === "ADMIN" && (
                            <div className="flex justify-between items-center my-1">
                                {n.status === "active" && (
                                    <button
                                        onClick={() => expireNotification(n)}
                                        className="text-sm rounded p-2 font-semibold bg-orange-500 flex items-center gap-1"
                                    >
                                        <FaThumbtackSlash className="text-lg" />
                                        Unpublish
                                    </button>
                                )}
                                {n.status === "inactive" && n.expired_at && (
                                    <p className="text-red-500 text-sm font-semibold">
                                        Expired at: {new Date(n.expired_at).toLocaleString()}
                                    </p>
                                )}
                                <div>
                                    <button
                                        onClick={() => deleteNotification(n.id)}
                                        className="text-sm rounded mx-1 p-2 font-semibold text-red-600"
                                    >
                                        <FaTrash className="text-lg" />
                                    </button>
                                </div>
                            </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default Notifications;