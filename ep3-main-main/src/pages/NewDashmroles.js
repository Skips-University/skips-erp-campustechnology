import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './Viewmroles';

export default function NewDashmroles() {
    return (
        <AdminLayout title="Role Management">
            <ViewPage />
        </AdminLayout>
    );
}
