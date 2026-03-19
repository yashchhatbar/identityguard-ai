import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, BrainCircuit, Users, AlertTriangle, ShieldCheck } from 'lucide-react';

const FraudMonitor = () => {
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Live polling Phase 11 & 13
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const [alertsRes, statsRes] = await Promise.all([
                fetch('http://localhost:8000/api/admin/fraud-alerts', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('http://localhost:8000/api/system/security-status')
            ]);

            if (alertsRes.ok) {
                const data = await alertsRes.json();
                setAlerts(data.data);
            }
            if (statsRes.ok) {
                const st = await statsRes.json();
                setStats(st);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'bg-danger text-white';
            case 'HIGH': return 'bg-warning text-dark';
            case 'MEDIUM': return 'bg-info text-dark';
            default: return 'bg-secondary text-white';
        }
    };

    return (
        <div className="container py-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h2 className="fw-bold d-flex align-items-center gap-2">
                        <BrainCircuit className="text-primary" size={32} />
                        Autonomous AI Security Center
                    </h2>
                    <p className="text-muted">Live Fraud Analysis & Identity Farm Sweeps</p>
                </div>
            </div>

            {stats && (
                <div className="row g-4 mb-5">
                    <div className="col-md-3">
                        <div className="glass-card p-4 h-100 bg-white">
                            <h6 className="text-muted mb-2 d-flex align-items-center gap-2">
                                <ShieldAlert size={18} /> Active Alerts
                            </h6>
                            <h3 className="fw-bold m-0">{stats.fraud_alert_count}</h3>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="glass-card p-4 h-100 bg-white">
                            <h6 className="text-muted mb-2 d-flex align-items-center gap-2">
                                <Users size={18} /> Deep Clusters Detected
                            </h6>
                            <h3 className="fw-bold m-0">{stats.cluster_activity}</h3>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="glass-card p-4 h-100 bg-white">
                            <h6 className="text-muted mb-2 d-flex align-items-center gap-2">
                                <AlertTriangle size={18} /> 24H Blocked Sweeps
                            </h6>
                            <h3 className="fw-bold m-0">{stats.suspicious_registrations_24h}</h3>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className={`glass-card p-4 h-100 ${stats.system_risk_level === 'ELEVATED' ? 'bg-danger bg-opacity-10 border-danger' : 'bg-success bg-opacity-10 border-success'}`}>
                            <h6 className="text-muted mb-2 d-flex align-items-center gap-2">
                                <ShieldCheck size={18} /> Risk Stance
                            </h6>
                            <h3 className={`fw-bold m-0 ${stats.system_risk_level === 'ELEVATED' ? 'text-danger' : 'text-success'}`}>{stats.system_risk_level}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-card bg-white overflow-hidden">
                <div className="p-4 border-bottom bg-light">
                    <h5 className="m-0 fw-bold">Live AI Investigation Reports</h5>
                </div>
                <div className="table-responsive">
                    <table className="table modern-table mb-0">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Target ID</th>
                                <th>Event Trigger</th>
                                <th>Risk Matrix</th>
                                <th>AI Diagnosis Report</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Scanning Neural Network...</td></tr>
                            ) : alerts.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4 text-muted border-0">No active fraud signatures detected in sector.</td></tr>
                            ) : (
                                alerts.map((alert, index) => (
                                    <motion.tr
                                        key={alert.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <td className="align-middle text-muted small">{new Date(alert.timestamp).toLocaleString()}</td>
                                        <td className="align-middle fw-bold">{alert.user_id || 'System Block'}</td>
                                        <td className="align-middle">{alert.trigger}</td>
                                        <td className="align-middle">
                                            <span className={`badge ${getRiskColor(alert.risk_level)} px-2 py-1`}>
                                                {alert.risk_level} ({alert.risk_score.toFixed(2)})
                                            </span>
                                        </td>
                                        <td className="align-middle w-50 pointer-event">
                                            <div className="bg-light p-2 rounded small text-secondary font-monospace">
                                                {alert.ai_analysis}
                                            </div>
                                        </td>
                                        <td className="align-middle">
                                            <button className="btn btn-sm btn-outline-danger">Purge</button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FraudMonitor;
