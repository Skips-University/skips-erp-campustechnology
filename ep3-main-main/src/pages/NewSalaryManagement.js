import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './SalaryManagement';

export default function NewSalaryManagement() {
    return (
        <AdminLayout title="Payroll">
            <ViewPage />
        </AdminLayout>
    );
}
