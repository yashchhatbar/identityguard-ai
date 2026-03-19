import { useEffect } from 'react';

import LineChart from '../../components/LineChart';
import MetricCard from '../../components/MetricCard';
import MiniBarChart from '../../components/MiniBarChart';
import { useAdminData } from './useAdminData';

export default function AdminAnalytics() {
    const { users, duplicates, analytics, fetchAnalytics } = useAdminData();

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const daily = analytics.charts?.daily || [];
    const summary = analytics.summary || {};

    const roleBreakdown = [
        { label: 'Admins', value: users.filter((user) => user.role === 'admin').length },
        { label: 'Users', value: users.filter((user) => user.role !== 'admin').length },
    ];

    const enrollmentBreakdown = [
        { label: 'No face', value: users.filter((user) => !user.face_embeddings).length },
        { label: '1 face', value: users.filter((user) => user.face_embeddings === 1).length },
        { label: 'Multi-face', value: users.filter((user) => user.face_embeddings > 1).length },
    ];

    const duplicateBands = [
        { label: '70-79%', value: duplicates.filter((item) => item.similarity_score >= 0.7 && item.similarity_score < 0.8).length },
        { label: '80-89%', value: duplicates.filter((item) => item.similarity_score >= 0.8 && item.similarity_score < 0.9).length },
        { label: '90%+', value: duplicates.filter((item) => item.similarity_score >= 0.9).length },
    ];

    const averageSimilarity = duplicates.length
        ? `${((duplicates.reduce((sum, item) => sum + (item.similarity_score || 0), 0) / duplicates.length) * 100).toFixed(1)}%`
        : '0%';

    return (
        <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
                <MetricCard title="Average similarity" value={averageSimilarity} hint="Mean risk score across all duplicate alerts." accent="rose" />
                <MetricCard title="Enrolled users" value={users.filter((user) => user.face_embeddings > 0).length} hint="Users with at least one associated biometric record." accent="emerald" />
                <MetricCard title="Verification success" value={`${((summary.verification_success_rate || 0) * 100).toFixed(1)}%`} hint="Overall verification success rate from live verification events." accent="sky" />
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
                <MiniBarChart title="Role distribution" items={roleBreakdown} tone="sky" />
                <MiniBarChart title="Enrollment depth" items={enrollmentBreakdown} tone="emerald" />
                <MiniBarChart title="Duplicate severity" items={duplicateBands} tone="rose" />
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
                <LineChart
                    title="Daily registrations"
                    subtitle="New user creation over time."
                    data={daily}
                    dataKey="registrations"
                    color="#0f172a"
                />
                <LineChart
                    title="Duplicate trend"
                    subtitle="Daily duplicate detections surfaced by the AI pipeline."
                    data={daily}
                    dataKey="duplicates"
                    color="#e11d48"
                />
                <LineChart
                    title="Verification success rate"
                    subtitle="Daily verification success as a percentage."
                    data={daily}
                    dataKey="verification_success_rate"
                    color="#0284c7"
                    formatValue={(value) => `${(value * 100).toFixed(1)}%`}
                />
            </div>
        </div>
    );
}
