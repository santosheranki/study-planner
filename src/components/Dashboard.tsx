import { useEffect, useState } from 'react';
import Headercomponent from './Header';
import '../../src/components/Dashboard.css';
import CategoriesComponent from './Categories';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DashboardComponent = () => {
    const navigate = useNavigate();
    const [categoriesCount, setCategoriesCount] = useState(0);
    const [scheduledTasksCount, setScheduledTasksCount] = useState(0);
    const [closedscheduledtasks, setClosedScheduledTasks] = useState(0);

    useEffect(() => {
        const fetchCategoryCount = async () => {
            try {
                const uuidfromlocalstorage = localStorage.getItem('userid');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getcount/${uuidfromlocalstorage}`);
                if (response.data && response.data.categoriescount !== undefined) {
                    setCategoriesCount(response.data.categoriescount);
                    setScheduledTasksCount(response.data.scheduledtaskscount);
                    setClosedScheduledTasks(response.data.closedscheduledtasks)
                }
            } catch (error) {
                console.error('Error fetching categories count:', error);
            }
        };
        const getscheduledcalendar = async () => {
            try {
                const uuidfromlocalstorage = localStorage.getItem('userid');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getscheduledcalendar/${uuidfromlocalstorage}`);
                console.log("responseindashboard", response.data);
            } catch (error: any) {
                console.error("Error fetching Active Calendars", error.message);
            }
        }
        getscheduledcalendar();
        fetchCategoryCount();
    }, []);

    const handleCategories = () => {
        navigate('/categories');
    }

    const loggedinUsername = localStorage.getItem('userwelcomename');

    return (
        <div>
            <Headercomponent />
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
                            count={20}
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
