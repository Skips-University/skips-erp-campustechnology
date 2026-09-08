import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './DashboardCrmds';

export default function NewDashboardCrmds() {
    return (
        <AdminLayout title="Lead Dashboard">
            <ViewPage />
        </AdminLayout>
    );
}
