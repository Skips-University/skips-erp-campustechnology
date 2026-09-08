import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ApplicationReviewPage from './ApplicationReviewPage';

export default function NewApplicationReviewPage() {
    return (
        <AdminLayout title="Confirm Admission">
            <ApplicationReviewPage />
        </AdminLayout>
    );
}
