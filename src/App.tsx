import './App.css';
import Login from './components/login';
import Register from './components/Register';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardComponent from './components/Dashboard';
import ToastService from './components/Toast';
import Protected from './protectedroute/protectedRoute';
import Public from './protectedroute/publicRoute'; // Import the Public route component
import CategoriesComponent from './components/Categories';
import CalendarComponent from './components/CalendarTask';
import AccountSetting from './components/accountSettings';

function App() {
  return (
    <Router>
      <ToastService /> {/* Include the ToastService component */}
      <Routes>
        {/* Public Routes */}
        <Route element={<Public />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<Protected />}>
          <Route path="/home" element={<DashboardComponent />} />
          <Route path="/dashboard" element={<DashboardComponent />} />
          <Route path="/categories" element={<CategoriesComponent />} />
          <Route path="/task" element={<CalendarComponent />} />
          <Route path="/accountsettings" element={<AccountSetting />} />
        </Route>

        {/* Fallback Route for 404 Not Found */}
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
