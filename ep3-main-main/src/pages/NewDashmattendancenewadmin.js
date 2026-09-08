import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './Viewmattendancenewadmin';

export default function NewDashmattendancenewadmin() {
    return (
        <AdminLayout title="Coursewise Attendance">
            <ViewPage />
        </AdminLayout>
    );
}
