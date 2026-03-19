import React from 'react';
import { motion } from 'framer-motion';

const RegisterForm = ({ formData, setFormData, onSubmit }) => {
    return (
        <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={onSubmit}
        >
            <div className="mb-4">
                <label className="form-label text-muted small fw-bold text-uppercase">Full Name</label>
                <input
                    type="text"
                    className="modern-input"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div className="mb-4">
                <label className="form-label text-muted small fw-bold text-uppercase">Email Address</label>
                <input
                    type="email"
                    className="modern-input"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
            <div className="mt-5">
                <button type="submit" className="btn btn-modern w-100">
                    Continue to Biometrics
                </button>
            </div>
        </motion.form>
    );
};

export default RegisterForm;
