import './App.css';
import Login from './components/login';
import Register from './components/Register';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DashboardComponent from './components/Dashboard';
import ToastService from './components/Toast';
import Protected from './protectedroute/protectedRoute';
import CategoriesComponent from './components/Categories';
import CalendarComponent from './components/CalendarTask';
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
          <Route path="/categories" element={<CategoriesComponent />} />
          <Route path="/task" element={<CalendarComponent />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;