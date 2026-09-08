import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './ViewmUser';

export default function NewDashmuser() {
    return (
        <AdminLayout title="User Management">
            <ViewPage />
        </AdminLayout>
    );
}
