import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './DashboardPurchaseds';

export default function NewDashboardPurchaseds() {
    return (
        <AdminLayout title="Purchase Dashboard">
            <ViewPage />
        </AdminLayout>
    );
}
