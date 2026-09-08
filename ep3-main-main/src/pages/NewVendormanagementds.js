import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './Vendormanagementds';

export default function NewVendormanagementds() {
    return (
        <AdminLayout title="Vendor Management">
            <ViewPage />
        </AdminLayout>
    );
}
