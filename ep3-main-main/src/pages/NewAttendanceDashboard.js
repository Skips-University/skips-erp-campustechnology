import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './AttendanceDashboard';

export default function NewAttendanceDashboard() {
    return (
        <AdminLayout title="Biometric attendance (Admin)">
            <ViewPage />
        </AdminLayout>
    );
}
