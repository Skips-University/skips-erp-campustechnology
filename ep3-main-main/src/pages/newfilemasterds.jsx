import React from 'react';
import AdminLayout from "../components/AdminLayout";
import FileMasterds from "./filemasterds";

const NewFileMasterds = () => {
    return (
        <AdminLayout title="File Master">
            <FileMasterds />
        </AdminLayout>
    );
};

export default NewFileMasterds;
