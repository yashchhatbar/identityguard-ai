import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';

const VerifyForm = ({ imagePreview, loading, onRetake, onSubmit }) => {
    return (
        <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
        >
            <div className="mb-4 position-relative mx-auto rounded-4 overflow-hidden shadow-sm" style={{ maxWidth: '400px', aspectRatio: '1/1' }}>
                <img src={imagePreview} alt="Captured" className="w-100 h-100 object-fit-cover" />
                {loading && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex flex-column justify-content-center align-items-center text-white">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="fw-bold">Analyzing biometrics...</p>
                    </div>
                )}
            </div>

            {!loading && (
                <div className="d-flex gap-3 justify-content-center mt-4">
                    <button onClick={onRetake} className="btn btn-modern-secondary text-primary">
                        <RefreshCcw size={18} /> Retake
                    </button>
                    <button onClick={onSubmit} className="btn btn-modern px-5">
                        Attempt Login
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default VerifyForm;
