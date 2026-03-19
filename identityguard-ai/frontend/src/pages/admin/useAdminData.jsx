import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { apiRequest } from '../../lib/api';
import { getStoredToken } from '../../lib/auth';

const AdminDataContext = createContext(null);

function toQuery(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.set(key, String(value));
        }
    });
    const serialized = query.toString();
    return serialized ? `?${serialized}` : '';
}

function useProvideAdminData() {
    const [users, setUsers] = useState([]);
    const [usersMeta, setUsersMeta] = useState({ page: 1, page_size: 10, total: 0, pages: 0 });
    const [duplicates, setDuplicates] = useState([]);
    const [duplicatesMeta, setDuplicatesMeta] = useState({ page: 1, page_size: 10, total: 0, pages: 0 });
    const [analytics, setAnalytics] = useState({ summary: {}, charts: { daily: [] } });
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingDuplicates, setLoadingDuplicates] = useState(true);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = useCallback(async (params = {}) => {
        setLoadingUsers(true);
        setError('');
        try {
            const headers = { Authorization: `Bearer ${getStoredToken()}` };
            const payload = await apiRequest(`/admin/users${toQuery(params)}`, { headers });
            setUsers(payload.data || []);
            setUsersMeta(payload.meta || { page: 1, page_size: 10, total: 0, pages: 0 });
            return payload;
        } catch (loadError) {
            setError(loadError.message);
            throw loadError;
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    const fetchDuplicates = useCallback(async (params = {}) => {
        setLoadingDuplicates(true);
        setError('');
        try {
            const headers = { Authorization: `Bearer ${getStoredToken()}` };
            const payload = await apiRequest(`/admin/duplicates${toQuery(params)}`, { headers });
            setDuplicates(payload.data || []);
            setDuplicatesMeta(payload.meta || { page: 1, page_size: 10, total: 0, pages: 0 });
            return payload;
        } catch (loadError) {
            setError(loadError.message);
            throw loadError;
        } finally {
            setLoadingDuplicates(false);
        }
    }, []);

    const deleteUser = useCallback(async (userId) => {
        const headers = { Authorization: `Bearer ${getStoredToken()}` };
        return apiRequest(`/admin/user/${userId}`, { method: 'DELETE', headers });
    }, []);

    const fetchAnalytics = useCallback(async () => {
        setLoadingAnalytics(true);
        setError('');
        try {
            const headers = { Authorization: `Bearer ${getStoredToken()}` };
            const payload = await apiRequest('/admin/analytics', { headers });
            setAnalytics(payload.data || { summary: {}, charts: { daily: [] } });
            return payload;
        } catch (loadError) {
            setError(loadError.message);
            throw loadError;
        } finally {
            setLoadingAnalytics(false);
        }
    }, []);

    return useMemo(
        () => ({
            users,
            usersMeta,
            duplicates,
            duplicatesMeta,
            analytics,
            loadingUsers,
            loadingDuplicates,
            loadingAnalytics,
            error,
            fetchUsers,
            fetchDuplicates,
            fetchAnalytics,
            deleteUser,
        }),
        [users, usersMeta, duplicates, duplicatesMeta, analytics, loadingUsers, loadingDuplicates, loadingAnalytics, error, fetchUsers, fetchDuplicates, fetchAnalytics, deleteUser],
    );
}

export function AdminDataProvider({ children }) {
    const value = useProvideAdminData();
    return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
    return useContext(AdminDataContext);
}
