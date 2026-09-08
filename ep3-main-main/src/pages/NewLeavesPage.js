import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './LeavesPage';

export default function NewLeavesPage() {
    return (
        <AdminLayout title="Attendance & Leave">
            <ViewPage />
        </AdminLayout>
    );
}
