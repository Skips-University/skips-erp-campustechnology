import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './OEDashboardds';

export default function NewOEDashboardds() {
    return (
        <AdminLayout title="OE Dashboard">
            <ViewPage />
        </AdminLayout>
    );
}
