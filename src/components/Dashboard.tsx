import { useEffect, useState } from 'react';
import Headercomponent from './Header';
import '../../src/components/Dashboard.css';
import CategoriesComponent from './Categories';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { refreshAccessToken } from '../utils/authUtils';
import axiosInstance from '../utils/axiosInstance';
const DashboardComponent = () => {
    const navigate = useNavigate();
    const [categoriesCount, setCategoriesCount] = useState(0);
    const [scheduledTasksCount, setScheduledTasksCount] = useState(0);
    const [closedscheduledtasks, setClosedScheduledTasks] = useState(0);
    const [todaysTasksCount, setTodaysTasksCount] = useState(0);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchCategoryCount = async () => {
            try {
                const uuidfromlocalstorage = localStorage.getItem('userid');
                const accessToken = localStorage.getItem('accessToken');
                const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/calendar/getcount/${uuidfromlocalstorage}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (response.data && response.data.categoriescount !== undefined) {
                    setCategoriesCount(response.data.categoriescount);
                    setScheduledTasksCount(response.data.scheduledtaskscount);
                    setClosedScheduledTasks(response.data.closedscheduledtasks);
                }
            } catch (error: any) {
                console.error('Error fetching categories count:', error);
                if (error.response && error.response.status === 403) {
                    await refreshAccessToken();
                }
            }
        };
        const getscheduledcalendar = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const uuidfromlocalstorage = localStorage.getItem('userid');
                const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/calendar/getscheduledcalendar/${uuidfromlocalstorage}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const today = new Date().toISOString().split('T')[0];
                const todayTasks = response.data.filter((task: any) => task.start.split('T')[0] === today);
                setTodaysTasksCount(todayTasks.length);
            } catch (error: any) {
                console.error("Error fetching Active Calendars", error.message);
            }
        };
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchCategoryCount(), getscheduledcalendar()]);
            setLoading(false);
        };
        loadData();
    }, []);
    const handleCategories = () => {
        navigate('/categories');
    }
    const loggedinUsername = localStorage.getItem('userwelcomename');
    return (
        <div>
            <Headercomponent />
            {loading ? (
                <div className="loader-container">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <div className="dashboard-content">
                    <h1>Welcome {loggedinUsername},</h1>
                    <hr className="divider" />
                    <div className="container-fluid">
                        <div className="row">
                            <Card
                                icon="fas fa-table"
                                title="Total Categories"
                                count={categoriesCount}
                                color="gray"
                                background="#deffdd"
                            />
                            <Card
                                icon="fas fa-calendar-day"
                                title="Today's Scheduled Tasks"
                                count={todaysTasksCount}
                                color="blue"
                                background="#ffcde7"
                            />
                            <Card
                                icon="fas fa-calendar-alt"
                                title="Overall Active Scheduled Tasks"
                                count={scheduledTasksCount}
                                onClick={handleCategories}
                                background="#ccadeb"
                                color="yellow"
                                style={{ cursor: 'pointer' }}
                            />
                            <Card
                                icon="fas fa-calendar-alt"
                                title="Overall Completed Tasks"
                                count={closedscheduledtasks}
                                color="yellow"
                                background="#fcffc8"
                            />
                        </div>
                        <CategoriesComponent />
                    </div>
                </div>
            )}
        </div>
    );
};
const Card = ({ title, count, color, background, onClick, style }: any) => {
    return (
        <div className="col-md-3">
            <div
                className={`card mb-4 shadow-sm bg-${color}`}
                style={{ backgroundColor: background, ...style }}
                onClick={onClick}
            >
                <div className="card-body d-flex align-items-center">
                    <div>
                        <h5 className="card-title mb-0" style={{ fontSize: '1em' }}>{title}</h5>
                        <h2 className="card-count">{count}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DashboardComponent;