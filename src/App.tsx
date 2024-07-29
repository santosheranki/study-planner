import React from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './components/login';
import Register from './components/Register';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DashboardComponent from './components/Dashboard';
import ToastService from './components/Toast';
import Protected from './protectedroute/protectedRoute';
function App() {
  return (
    <Router>
      <ToastService /> {/* Include the ToastService component */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Protected />}>
          <Route path="/home" element={<DashboardComponent />} />
          <Route path="/dashboard" element={<DashboardComponent />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;