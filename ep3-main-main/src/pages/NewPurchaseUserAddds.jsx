import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './ViewPurchaseUserAddds';

export default function NewPurchaseUserAddds() {
    return (
        <AdminLayout title="Purchase User Management">
            <ViewPage />
        </AdminLayout>
    );
}
