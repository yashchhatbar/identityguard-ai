import { Menu, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { clearSession, getStoredToken, getStoredUser } from '../lib/auth';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const token = getStoredToken();
    const user = getStoredUser();

    const links = [
        { to: '/', label: 'Product' },
        { to: '/pricing', label: 'Pricing' },
        { to: '/contact', label: 'Contact' },
        ...(token
            ? [{ to: '/dashboard', label: 'Dashboard' }]
            : [
                { to: '/login', label: 'Login' },
                { to: '/register', label: 'Register' },
            ]),
        ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
    ];

    function handleLogout() {
        clearSession();
        navigate('/');
    }

    // 🔥 Scroll effect (shadow + blur increase)
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 🔥 Close mobile menu on route change
    useEffect(() => {
        setOpen(false);
    }, [location]);

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/90 backdrop-blur shadow-sm border-b border-slate-200'
                : 'bg-white/70 backdrop-blur border-b border-slate-100'
                }`}
        >
            <div className="app-shell flex items-center justify-between py-7">

                {/* LOGO */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-soft">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-base font-semibold uppercase tracking-[0.22em] text-sky-700">
                            IdentityGuard
                        </p>
                        <p className="text-base text-slate-500">
                            Face de-duplication SaaS
                        </p>
                    </div>
                </Link>

                {/* DESKTOP NAV */}
                <nav className="hidden items-center gap-3 md:flex">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `px-4 py-2 text-base font-medium rounded-full transition ${isActive
                                    ? 'bg-slate-950 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    {/* CTA */}
                    {token ? (
                        <button
                            onClick={handleLogout}
                            className="ml-2 px-4 py-2 text-base rounded-full border border-slate-200 hover:bg-slate-100 transition"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/register"
                            className="ml-2 px-5 py-2 text-sm rounded-full bg-slate-950 text-white hover:bg-slate-800 transition"
                        >
                            Start free
                        </Link>
                    )}
                </nav>

                {/* MOBILE BUTTON */}
                <button
                    className="rounded-2xl border border-slate-200 bg-white p-3 md:hidden"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <X /> : <Menu />}
                </button>
            </div>

            {/* MOBILE MENU */}
            {open && (
                <div className="app-shell pb-4 md:hidden">
                    <div className="surface-card flex flex-col gap-2 p-3 animate-in fade-in zoom-in-95">

                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className="rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                            >
                                {link.label}
                            </NavLink>
                        ))}

                        {token ? (
                            <button
                                onClick={handleLogout}
                                className="mt-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/register"
                                className="mt-2 px-4 py-2 rounded-xl bg-slate-950 text-white text-center"
                            >
                                Start free
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}