import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './PurchaseOrderDashboardds';

export default function NewPurchaseOrderDashboardds() {
    return (
        <AdminLayout title="Purchase Orders">
            <ViewPage />
        </AdminLayout>
    );
}
