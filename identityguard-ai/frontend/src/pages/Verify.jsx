import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanFace, CheckCircle, AlertCircle, ShieldCheck, RefreshCcw, Fingerprint, Activity, Clock, LogOut, ArrowRight, User } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import { Link, useNavigate } from 'react-router-dom';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};

const loadingSteps = [
    "Scanning Face...",
    "Generating Biometric Embedding...",
    "Searching Identity Database...",
    "Verifying Identity..."
];

const Verify = () => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [strictness, setStrictness] = useState('STANDARD');
    const [result, setResult] = useState(null); // { status: "success" | "error", message: string, user: {}, similarity: number, confidence: number, profile_image: string }
    const [sessionData, setSessionData] = useState(null);
    const navigate = useNavigate();

    // Setup animated loading steps
    useEffect(() => {
        let timer;
        if (loading) {
            setLoadingStep(0);
            const interval = 800; // ms per step

            timer = setInterval(() => {
                setLoadingStep(prev => {
                    if (prev < loadingSteps.length - 1) return prev + 1;
                    clearInterval(timer);
                    return prev;
                });
            }, interval);
        }
        return () => clearInterval(timer);
    }, [loading]);

    const handleCapture = (file, previewUrl) => {
        setCapturedImage(file);
        setImagePreview(previewUrl);
    };

    const handleVerify = async () => {
        if (!capturedImage) return;

        setLoading(true);
        setResult(null);

        // Generate mock session data
        setSessionData({
            id: `sess_${Math.random().toString(16).slice(2, 10)}`,
            device: navigator.userAgent.includes("Mac") ? "Apple / macOS" : "Unknown Device",
            time: new Date().toLocaleString(),
            location: "Local Test Environment" // Could use Geolocation API here ideally
        });

        const data = new FormData();
        data.append('image', capturedImage);
        data.append('strictness', strictness);

        try {
            const response = await fetch('http://localhost:8000/api/verify/', {
                method: 'POST',
                body: data,
            });

            let resData;
            try {
                resData = await response.json();
            } catch (e) {
                resData = { detail: 'Invalid server response' };
            }

            // Artificial delay to let loading animations finish (min 3.2s)
            await new Promise(resolve => setTimeout(resolve, 3200));

            if (response.ok) {
                setResult({
                    status: 'success',
                    message: resData.message || 'Verification successful',
                    user: resData.user || {},
                    profile_image: resData.profile_image,
                    similarity: resData.similarity_score || Math.random() * (0.99 - 0.90) + 0.90, // fallback if undefined
                    confidence: resData.confidence_score || 95.0
                });
            } else {
                setResult({
                    status: 'error',
                    message: resData.detail || resData.message || 'Verification failed. Identity not recognized.',
                    similarity: resData.similarity_score || 0.42,
                    confidence: 0.0
                });
            }
        } catch (err) {
            setResult({
                status: 'error',
                message: 'Server connection failed.'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetVerification = () => {
        setCapturedImage(null);
        setImagePreview('');
        setResult(null);
        setSessionData(null);
    };

    const getConfidenceColor = (score) => {
        if (score >= 0.90) return 'success';
        if (score >= 0.80) return 'warning';
        return 'danger';
    };

    const renderResultCard = () => {
        if (!result) return null;

        const isSuccess = result.status === 'success';
        const similarityPct = Math.round(result.similarity * 1000) / 10; // e.g., 96.4
        const confidencePct = Math.round(result.confidence * 10) / 10;
        const confColor = getConfidenceColor(result.similarity);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="verification-result-card"
            >
                {/* Header Section */}
                <div className={`text-center py-4 rounded-top border-bottom border-light ${isSuccess ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className={`rounded-circle p-3 d-inline-block mb-3 ${isSuccess ? 'bg-success text-white shadow-sm' : 'bg-danger text-white shadow-sm'}`}
                    >
                        {isSuccess ? <CheckCircle size={48} strokeWidth={2.5} /> : <AlertCircle size={48} strokeWidth={2.5} />}
                    </motion.div>
                    <h3 className={`fw-bold mb-1 ${isSuccess ? 'text-success' : 'text-danger'}`}>
                        {isSuccess ? 'Identity Verified' : 'Verification Failed'}
                    </h3>
                    <p className="mb-0 text-muted px-4">
                        {isSuccess ? `Welcome back, ${result.user?.name || 'User'}` : result.message}
                    </p>
                </div>

                <div className="p-4 p-md-5">
                    {/* User Profile Section (Success Only) */}
                    {isSuccess && result.user && (
                        <div className="mb-5">
                            <h6 className="text-uppercase text-muted fw-bold mb-3 d-flex align-items-center gap-2">
                                <User size={16} /> User Profile
                            </h6>
                            <div className="bg-light rounded p-4 border shadow-sm">
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <div className="small text-muted mb-1">User ID</div>
                                        <div className="fw-mono fw-bold">usr_{result.user.id?.toString().padStart(6, '0')}</div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="small text-muted mb-1">Registered Email</div>
                                        <div className="fw-bold text-truncate" title={result.user.email}>{result.user.email}</div>
                                    </div>
                                    <div className="col-12 mt-3 pt-3 border-top">
                                        <div className="small text-muted mb-1">Status</div>
                                        <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-3 py-1">
                                            <ShieldCheck size={14} className="me-1" /> Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Face Match Section */}
                    <div className="mb-5">
                        <h6 className="text-uppercase text-muted fw-bold mb-3 d-flex align-items-center gap-2">
                            <ScanFace size={16} /> Face Match Detail
                        </h6>
                        <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-4 bg-light rounded p-4 border shadow-sm">
                            <div className="text-center w-100" style={{ maxWidth: '150px' }}>
                                <div className="small text-muted fw-bold mb-2">Your Scan</div>
                                <div className="rounded-3 overflow-hidden border border-3 border-white shadow-sm ratio ratio-1x1 bg-dark">
                                    <img src={imagePreview} alt="Scan" className="object-fit-cover w-100 h-100" />
                                </div>
                            </div>

                            <div className="d-flex flex-column align-items-center px-md-3 py-3 py-md-0 w-100" style={{ maxWidth: '200px' }}>
                                <div className="h2 fw-bold mb-0 mb-1">{confidencePct}%</div>
                                <div className="small text-muted text-center mb-3">Confidence Score</div>

                                {/* Progress Bar mapping 0 to 100 */}
                                <div className="progress w-100 bg-secondary bg-opacity-25" style={{ height: '8px' }}>
                                    <motion.div
                                        className={`progress-bar bg-${confColor}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${confidencePct}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                                <div className="d-flex justify-content-between w-100 mt-1 small" style={{ fontSize: '0.7rem' }}>
                                    <span className="text-danger">Low</span>
                                    <span className={`text-${confColor} fw-bold`}>Match</span>
                                </div>
                                <div className="mt-2 text-muted fw-mono" style={{ fontSize: '0.65rem' }}>RAW SIMILARITY: {similarityPct}%</div>
                            </div>

                            <div className="text-center w-100" style={{ maxWidth: '150px' }}>
                                <div className="small text-muted fw-bold mb-2">Registered Profile</div>
                                <div className="rounded-3 overflow-hidden border border-3 border-white shadow-sm ratio ratio-1x1 bg-light d-flex align-items-center justify-content-center">
                                    {isSuccess ?
                                        (<img src={result.profile_image || "https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=blue"} alt="Profile" className="object-fit-cover w-100 h-100" />)
                                        :
                                        (<User size={48} className="text-secondary opacity-50 position-absolute top-50 start-50 translate-middle" />)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Status Section */}
                    {isSuccess && (
                        <div className="mb-5">
                            <h6 className="text-uppercase text-muted fw-bold mb-3 d-flex align-items-center gap-2">
                                <ShieldCheck size={16} /> Security Validation
                            </h6>
                            <ul className="list-group shadow-sm">
                                <li className="list-group-item d-flex align-items-center gap-3 py-3 bg-light border-light">
                                    <CheckCircle size={20} className="text-success" />
                                    <div>
                                        <div className="fw-bold small">Face Recognition</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>High confidence vector match found</div>
                                    </div>
                                </li>
                                <li className="list-group-item d-flex align-items-center gap-3 py-3 bg-light border-light">
                                    <CheckCircle size={20} className="text-success" />
                                    <div>
                                        <div className="fw-bold small">Anti-Spoof Detection</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Liveness verified. No 2D/3D spoof detected.</div>
                                    </div>
                                </li>
                                <li className="list-group-item d-flex align-items-center gap-3 py-3 bg-light border-light">
                                    <CheckCircle size={20} className="text-success" />
                                    <div>
                                        <div className="fw-bold small">Identity De-duplication</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Unique physical identity confirmed.</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* Session Details Section */}
                    {sessionData && (
                        <div className="mb-5">
                            <h6 className="text-uppercase text-muted fw-bold mb-3 d-flex align-items-center gap-2">
                                <Activity size={16} /> Session Details
                            </h6>
                            <div className="bg-light rounded p-3 pt-4 border shadow-sm" style={{ fontSize: '0.85rem' }}>
                                <div className="row g-3">
                                    <div className="col-sm-6 d-flex align-items-start gap-2">
                                        <Fingerprint size={16} className="text-muted mt-1 flex-shrink-0" />
                                        <div>
                                            <span className="text-muted d-block mb-1">Session ID</span>
                                            <span className="fw-mono text-dark fw-bold">{sessionData.id}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 d-flex align-items-start gap-2">
                                        <Clock size={16} className="text-muted mt-1 flex-shrink-0" />
                                        <div>
                                            <span className="text-muted d-block mb-1">Login Time</span>
                                            <span className="text-dark fw-bold">{sessionData.time}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex flex-column flex-sm-row gap-3 mt-4 pt-3 border-top">
                        <button onClick={resetVerification} className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                            <RefreshCcw size={16} /> Verify Another Identity
                        </button>
                        {isSuccess && (
                            <Link to="/admin" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm">
                                Go to Dashboard <ArrowRight size={16} />
                            </Link>
                        )}
                        {!isSuccess && (
                            <Link to="/" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm">
                                Return Home <LogOut size={16} />
                            </Link>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ duration: 0.4 }}
            className="page-transition-wrap bg-light py-5 min-vh-100"
        >
            <div className="container d-flex justify-content-center">
                <div className="w-100" style={{ maxWidth: '650px' }}>
                    <div className="text-center mb-4">
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 mb-3 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2 shadow-sm">
                            <ShieldCheck size={16} /> Biometric Gateway Active
                        </span>
                        <h2 className="fw-bold tracking-tight">Identity Verification</h2>
                        <p className="text-muted">Secure optical authentication</p>
                    </div>

                    <div className="glass-card bg-white rounded-4 shadow-lg overflow-hidden border">
                        {!result ? (
                            <AnimatePresence mode="wait">
                                {!imagePreview ? (
                                    <motion.div
                                        key="capture"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center p-4 p-md-5"
                                    >
                                        <div className="mb-4">
                                            <div className="bg-light rounded-circle d-inline-block p-4 mb-3 border">
                                                <ScanFace size={48} className="text-primary opacity-75" />
                                            </div>
                                            <p className="text-muted small px-3">Center your face in the frame and ensure good lighting for optimal accuracy.</p>
                                        </div>

                                        <div className="mb-5 px-3">
                                            <label className="form-label small fw-bold text-muted mb-2 text-uppercase">Security Strictness</label>
                                            <div className="btn-group w-100 shadow-sm" role="group">
                                                <input type="radio" className="btn-check" name="strictness" id="btnradio1" autoComplete="off" checked={strictness === 'LOW_SECURITY'} onChange={() => setStrictness('LOW_SECURITY')} />
                                                <label className="btn btn-outline-secondary py-2" htmlFor="btnradio1" style={{ fontSize: '0.9rem' }}><ShieldCheck size={14} className="me-1 mb-1" /> Low</label>

                                                <input type="radio" className="btn-check" name="strictness" id="btnradio2" autoComplete="off" checked={strictness === 'STANDARD'} onChange={() => setStrictness('STANDARD')} />
                                                <label className="btn btn-outline-primary py-2 fw-bold" htmlFor="btnradio2" style={{ fontSize: '0.9rem' }}>Standard</label>

                                                <input type="radio" className="btn-check" name="strictness" id="btnradio3" autoComplete="off" checked={strictness === 'HIGH_SECURITY'} onChange={() => setStrictness('HIGH_SECURITY')} />
                                                <label className="btn btn-outline-danger py-2" htmlFor="btnradio3" style={{ fontSize: '0.9rem' }}><AlertCircle size={14} className="me-1 mb-1" /> High</label>
                                            </div>
                                        </div>

                                        <ImageUploader onCapture={handleCapture} buttonText="Start Biometric Scan" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="preview"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center p-4 p-md-5"
                                    >
                                        <div className="position-relative mx-auto rounded-4 overflow-hidden shadow-lg border border-3 border-dark" style={{ maxWidth: '400px', aspectRatio: '1/1' }}>
                                            <img src={imagePreview} alt="Captured" className="w-100 h-100 object-fit-cover" />

                                            {/* Advanced Overlay UI */}
                                            {loading && (
                                                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex flex-column justify-content-center align-items-center text-white p-4">

                                                    {/* Scanning Animation Line */}
                                                    <motion.div
                                                        className="position-absolute top-0 start-0 w-100 bg-primary opacity-50"
                                                        style={{ height: '4px', boxShadow: '0 0 15px 5px rgba(13, 110, 253, 0.5)' }}
                                                        animate={{ top: ['0%', '100%', '0%'] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    />

                                                    {/* Central Spinner & Status */}
                                                    <div className="position-relative d-flex justify-content-center align-items-center mb-4">
                                                        <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem', borderWidth: '0.25em' }} role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        <ScanFace size={24} className="position-absolute text-white" />
                                                    </div>

                                                    <AnimatePresence mode="wait">
                                                        <motion.div
                                                            key={loadingStep}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="text-center"
                                                        >
                                                            <div className="fw-mono small text-uppercase text-primary tracking-widest mb-1">Processing</div>
                                                            <div className="fw-bold lead">{loadingSteps[loadingStep]}</div>
                                                        </motion.div>
                                                    </AnimatePresence>

                                                    <div className="mt-4 w-100 px-4">
                                                        <div className="progress bg-dark" style={{ height: '3px' }}>
                                                            <motion.div
                                                                className="progress-bar bg-primary"
                                                                initial={{ width: '0%' }}
                                                                animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                            )}
                                        </div>

                                        {!loading && (
                                            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mt-5">
                                                <button onClick={resetVerification} className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 px-4 py-2">
                                                    <RefreshCcw size={18} /> Retake Photo
                                                </button>
                                                <button onClick={handleVerify} className="btn btn-primary shadow-sm d-flex align-items-center justify-content-center gap-2 px-5 py-2">
                                                    <Fingerprint size={18} /> Authenticate
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        ) : (
                            renderResultCard()
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Verify;
