import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './Viewmledgerstudadmin';

export default function NewDashmledgerstudadmin() {
    return (
        <AdminLayout title="Student Ledger">
            <ViewPage />
        </AdminLayout>
    );
}
