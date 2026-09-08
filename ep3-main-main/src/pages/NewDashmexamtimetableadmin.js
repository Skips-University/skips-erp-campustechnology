import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './Viewmexamtimetableadmin';

export default function NewDashmexamtimetableadmin() {
    return (
        <AdminLayout title="Exam time table">
            <ViewPage />
        </AdminLayout>
    );
}
