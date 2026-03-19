import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import Navbar from './components/Navbar';
import NotificationsProvider from './components/NotificationsProvider';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop'; // ✅ ADD THIS
import { AdminDataProvider } from './pages/admin/useAdminData';

const Landing = lazy(() => import('./pages/Landing'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const Documentation = lazy(() => import('./pages/Documentation'));
const Support = lazy(() => import('./pages/Support'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminDuplicates = lazy(() => import('./pages/admin/AdminDuplicates'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

function RouteLoader() {
    return (
        <div className="app-shell py-16">
            <div className="surface-card animate-pulse p-8">
                <div className="h-5 w-32 rounded-full bg-slate-200" />
                <div className="mt-6 h-10 w-64 rounded-2xl bg-slate-200" />
                <div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
                <div className="mt-3 h-4 w-5/6 rounded-full bg-slate-100" />
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    <div className="h-32 rounded-3xl bg-slate-100" />
                    <div className="h-32 rounded-3xl bg-slate-100" />
                    <div className="h-32 rounded-3xl bg-slate-100" />
                </div>
            </div>
        </div>
    );
}

function AppShell() {
    return (
        <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#f2f6ff,transparent_30%),linear-gradient(180deg,#fcfdff_0%,#f5f8ff_45%,#eef4ff_100%)] text-slate-900">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,#dbe7ff,transparent_55%)]" />
            <Navbar />

            <main className="relative z-10">
                <Suspense fallback={<RouteLoader />}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* NEW ROUTES */}
                        <Route path="/docs" element={<Documentation />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsOfService />} />

                        <Route
                            path="/dashboard"
                            element={(
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            )}
                        />

                        <Route
                            path="/admin"
                            element={(
                                <ProtectedRoute role="admin">
                                    <AdminDataProvider>
                                        <AdminLayout />
                                    </AdminDataProvider>
                                </ProtectedRoute>
                            )}
                        >
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="duplicates" element={<AdminDuplicates />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <NotificationsProvider>
            <BrowserRouter>
                <ScrollToTop />
                <AppShell />
            </BrowserRouter>
        </NotificationsProvider>
    );
}