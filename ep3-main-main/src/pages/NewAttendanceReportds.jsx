import React from 'react';
import AdminLayout from '../components/AdminLayout';
import AttendanceReportds from './AttendanceReportds';

export default function NewAttendanceReportds() {
    return (
        <AdminLayout title="Attendance Report">
            <AttendanceReportds />
        </AdminLayout>
    );
}
