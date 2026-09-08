import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './HostelBuildingPage';

export default function NewHostelBuildingPage() {
    return (
        <AdminLayout title="Hostel Buildings">
            <ViewPage />
        </AdminLayout>
    );
}
