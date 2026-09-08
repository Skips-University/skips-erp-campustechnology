import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './DeliveryDashboardds';

export default function NewDeliveryDashboardds() {
    return (
        <AdminLayout title="Delivery / Quality check">
            <ViewPage />
        </AdminLayout>
    );
}
