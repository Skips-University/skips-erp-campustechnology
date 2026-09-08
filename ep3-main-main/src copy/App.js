import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Profile from './Profile';
import LearningManagementSystem from './LearningManagementSystem';
import NAAC from './NAAC';
import Reports from './Reports';
import Parct1 from './pages/pract1';
import AddUser from './Crud/Add';
import EditUser from './Crud/Edit';
import DeleteUser from './Crud/Delete';
import ExportUsers from './Crud/Export';
import Viewcourse from './pages/Viewcourse';
import Viewcourse1 from './pages/Viewcourse1';
import Login from './pages/Login';
import Dashmcas11 from './pages/Dashmcas11';

import Dashmncas11 from './pages/Dashmncas11';
import Dashmncas11admin from './pages/Dashmncas11admin';
import Dashmncas12 from './pages/Dashmncas12';
import Dashmncas12admin from './pages/Dashmncas12admin';






function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/viewcourse1" element={<Viewcourse1 />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/learning-management-system" element={<LearningManagementSystem />} />
        <Route path="/naac" element={<NAAC />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/Parct1" element={<Parct1 />} />
        <Route path="/add" element={<AddUser />} />
        <Route path="/edit/:id" element={<EditUser />} />
        <Route path="/delete/:id" element={<DeleteUser />} />
        {/* <Route path="/users" element={<Users />} /> */}
        <Route path="/export" element={<ExportUsers />} />
        <Route path="/dashmcas11" element={<Dashmcas11 />} />
        <Route path="/dashmncas11" element={<Dashmncas11 />} />
        <Route path="/dashmncas11admin" element={<Dashmncas11admin />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/dashmncas12" element={<Dashmncas12 />} />
        <Route path="/dashmncas12admin" element={<Dashmncas12admin />} />


        
      </Routes>
    </Router>
  );
}

export default App;
