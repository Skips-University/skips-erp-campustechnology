import React from 'react';
import AdminLayout from '../components/AdminLayout';
import Institutionsds from './Institutionsds';

export default function NewInstitutionsds() {
    return (
        <AdminLayout title="Manage Institutions">
            <Institutionsds />
        </AdminLayout>
    );
}
