import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './Viewmadmission';

export default function NewDashmadmission() {
    return (
        <AdminLayout title="Admission Dashboard">
            <ViewPage />
        </AdminLayout>
    );
}
