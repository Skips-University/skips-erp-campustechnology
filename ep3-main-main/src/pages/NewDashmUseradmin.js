import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './ViewmUseradmin.js';

export default function NewDashmUseradmin() {
    return (
        <AdminLayout title="Employee list">
            <ViewPage />
        </AdminLayout>
    );
}
