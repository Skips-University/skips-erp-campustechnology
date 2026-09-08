import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './PurchaseCellInventoryds';

export default function NewPurchaseCellInventoryds() {
    return (
        <AdminLayout title="Inventory Status">
            <ViewPage />
        </AdminLayout>
    );
}
