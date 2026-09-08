import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './JobApplicationPage';

export default function NewJobApplicationPage() {
    return (
        <AdminLayout title="Job Applications">
            <ViewPage />
        </AdminLayout>
    );
}
