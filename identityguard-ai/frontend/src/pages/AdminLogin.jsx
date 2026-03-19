import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, KeyRound, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formBody = new URLSearchParams();
            formBody.append('username', formData.username);
            formBody.append('password', formData.password);

            const response = await fetch('http://localhost:8000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody,
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('adminToken', data.access_token);
                navigate('/admin');
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Invalid admin credentials');
            }
        } catch (err) {
            setError('Could not connect to the authentication server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
        >
            <div className="w-100" style={{ maxWidth: '400px' }}>
                <div className="text-center mb-4">
                    <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-inline-block mb-3">
                        <Lock size={32} />
                    </div>
                    <h2 className="fw-bold">Admin access</h2>
                    <p className="text-muted">Sign in to manage the platform</p>
                </div>

                <div className="glass-card bg-white p-4">
                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 small py-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label text-muted small fw-bold">Username</label>
                            <div className="position-relative">
                                <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                                    <User size={18} />
                                </span>
                                <input
                                    type="text"
                                    className="modern-input ps-5"
                                    placeholder="admin"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold">Password</label>
                            <div className="position-relative">
                                <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                                    <KeyRound size={18} />
                                </span>
                                <input
                                    type="password"
                                    className="modern-input ps-5"
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-modern w-100" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-muted small mt-4">
                    IdentityGuard AI Enterprise Platform
                </p>
            </div>
        </motion.div>
    );
};

export default AdminLogin;
