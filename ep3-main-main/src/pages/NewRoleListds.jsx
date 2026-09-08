import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './ViewRoleListds';

export default function NewRoleListds() {
    return (
        <AdminLayout title="Role Management">
            <ViewPage />
        </AdminLayout>
    );
}
