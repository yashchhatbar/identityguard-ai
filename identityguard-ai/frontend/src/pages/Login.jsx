import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import AuthForm from '../components/AuthForm';
import { useNotifications } from '../components/NotificationsProvider';
import { apiRequest } from '../lib/api';
import { persistSession } from '../lib/auth';

const initialState = { email: '', password: '' };

export default function Login() {
    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { notify } = useNotifications();

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        try {
            const payload = await apiRequest('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            persistSession(payload);
            notify('Signed in successfully.', 'success');
            navigate(location.state?.from || '/dashboard');
        } catch (error) {
            notify(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="app-shell flex min-h-[calc(100vh-160px)] items-center justify-center py-16">
            <AuthForm
                title="Sign in to your workspace"
                subtitle="Access the verification dashboard and continue face registration or matching flows."
                fields={[
                    { name: 'email', type: 'email', label: 'Email', placeholder: 'founder@company.com' },
                    { name: 'password', type: 'password', label: 'Password', placeholder: 'Enter your password' },
                ]}
                values={form}
                onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))}
                onSubmit={handleSubmit}
                loading={loading}
                actionLabel="Sign in"
                footer={(
                    <p>
                        Need an account? <Link to="/register" className="font-semibold text-sky-700">Create one here</Link>.
                    </p>
                )}
            />
        </section>
    );
}
