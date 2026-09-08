import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ViewPage from './HostelRoomPage';

export default function NewHostelRoomPage() {
    return (
        <AdminLayout title="Hostel Rooms">
            <ViewPage />
        </AdminLayout>
    );
}
