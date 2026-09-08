import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './DashboardPageHostel';

export default function NewDashboardPageHostel() {
    return (
        <AdminLayout title="Hostel Dashboard">
            <ViewPage />
        </AdminLayout>
    );
}
