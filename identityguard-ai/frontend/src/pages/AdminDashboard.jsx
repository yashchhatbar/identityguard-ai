import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Fingerprint, ShieldAlert, Activity, LogOut, Trash2 } from 'lucide-react';

const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.05 },
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAdminData = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [resStats, resLogs, resUsers] = await Promise.all([
                fetch('http://localhost:8000/api/admin/stats', { headers }),
                fetch('http://localhost:8000/api/admin/logs', { headers }),
                fetch('http://localhost:8000/api/admin/users', { headers })
            ]);

            if (resStats.status === 401 || resLogs.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
                return;
            }

            const dataStats = await resStats.json();
            const dataLogs = await resLogs.json();
            const dataUsers = await resUsers.json();

            if (dataStats.status === 'success') setStats(dataStats.data);
            if (dataLogs.status === 'success') setLogs(dataLogs.data);
            if (dataUsers.status === 'success') setUsersList(dataUsers.data);

        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleNavigateSecurity = () => {
        navigate('/admin/fraud');
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to permanently delete this identity?")) return;

        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchAdminData(); // Refresh list
            }
        } catch (err) {
            console.error("Failed to delete user", err);
        }
    };

    if (loading) return <div className="min-vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading dashboard...</span></div></div>;

    const statCards = [
        { label: "Total Users", value: stats?.total_users, icon: <Users size={24} className="text-primary" /> },
        { label: "Face Embeddings", value: stats?.total_embeddings, icon: <Fingerprint size={24} className="text-success" /> },
        { label: "Duplicate Attempts", value: stats?.duplicate_attempts, icon: <ShieldAlert size={24} className="text-warning" /> },
        { label: "System Health", value: stats?.system_health, icon: <Activity size={24} className="text-info" /> }
    ];

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ duration: 0.4 }}
            className="page-transition-wrap bg-light py-5 min-vh-100"
        >
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0">Admin Dashboard</h2>
                    <div className="d-flex gap-2">
                        <button onClick={handleNavigateSecurity} className="btn btn-warning btn-sm d-flex align-items-center gap-2 text-dark fw-bold">
                            <ShieldAlert size={16} /> Fraud Monitor
                        </button>
                        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    {statCards.map((stat, index) => (
                        <div key={index} className="col-md-6 col-lg-3">
                            <motion.div
                                className="glass-card bg-white p-3 p-md-4 h-100 d-flex justify-content-between align-items-center border-0 shadow-sm"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div>
                                    <p className="text-muted small fw-bold text-uppercase mb-1">{stat.label}</p>
                                    <h3 className="fw-bold mb-0">{stat.value}</h3>
                                </div>
                                <div className="bg-light p-3 rounded-circle">
                                    {stat.icon}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>

                <div className="row g-4">
                    <div className="col-12">
                        <div className="glass-card bg-white p-3 p-md-4 border-0 shadow-sm h-100">
                            <h5 className="fw-bold mb-4">Registered Identities Database</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Embedding Vector ID</th>
                                            <th>Registration Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center py-4 text-muted">No users registered yet.</td></tr>
                                        ) : (
                                            usersList.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="text-muted fw-bold">usr_{user.id.toString().padStart(4, '0')}</td>
                                                    <td className="fw-medium">{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td><span className="badge bg-secondary bg-opacity-10 text-secondary fw-mono px-2 py-1">{user.embedding_id.substring(0, 12)}...</span></td>
                                                    <td className="small text-muted">{new Date(user.created_at).toLocaleString()}</td>
                                                    <td>
                                                        <button onClick={() => handleDeleteUser(user.id)} className="btn btn-sm btn-link text-danger p-0 d-flex align-items-center gap-1">
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="glass-card bg-white p-3 p-md-4 border-0 shadow-sm h-100">
                            <h5 className="fw-bold mb-4">Recent Duplicate AI Flags Logs</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>ID</th>
                                            <th>Timestamp</th>
                                            <th>Attempted Email</th>
                                            <th>Event Type</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center py-4 text-muted">No security events recorded.</td></tr>
                                        ) : (
                                            logs.map((log) => (
                                                <tr key={log.id}>
                                                    <td className="text-muted">#{log.id}</td>
                                                    <td className="small text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td>{log.email}</td>
                                                    <td className="fw-medium">{log.type}</td>
                                                    <td><span className="badge bg-danger rounded-pill px-3">{log.status}</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="glass-card bg-primary text-white p-3 p-md-4 border-0 shadow-sm h-100 d-flex flex-column justify-content-center align-items-center text-center">
                            <ShieldAlert size={64} className="mb-4 opacity-75" />
                            <h4 className="fw-bold">Security Module Active</h4>
                            <p className="opacity-75">The DeepFace ArcFace engine is currently enforcing the rule: One Real Human = One Account.</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
