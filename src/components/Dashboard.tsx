import { useEffect, useState } from 'react';
import Headercomponent from './Header';
import '../../src/components/Dashboard.css';
import CategoriesComponent from './Categories';
import axios from 'axios';
const DashboardComponent = () => {
    const [categoriesCount, setCategoriesCount] = useState(0);
    const [scheduledTasksCount, setScheduledTasksCount] = useState(0);
    useEffect(() => {
        const fetchCategoryCount = async () => {
            try {
                const uuidfromlocalstorage = localStorage.getItem('userid');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getcount/${uuidfromlocalstorage}`);
                if (response.data && response.data.categoriescount !== undefined) {
                    setCategoriesCount(response.data.categoriescount);
                    setScheduledTasksCount(response.data.scheduledtaskscount);
                }
            } catch (error) {
                console.error('Error fetching categories count:', error);
            }
        };
        fetchCategoryCount();
    }, []);
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
                        />
                        <Card
                            icon="fas fa-calendar-day"
                            title="Today's Scheduled Tasks"
                            count={20}
                            color="blue"
                        />
                        <Card
                            icon="fas fa-calendar-alt"
                            title="Overall Scheduled Tasks"
                            count={scheduledTasksCount}
                            color="yellow"
                        />
                        <Card
                            icon="fas fa-calendar-alt"
                            title="Ongoing Tasks"
                            count={2}
                            color="yellow"
                        />
                    </div>
                    <CategoriesComponent />
                </div>
            </div>
        </div>
    );
};
const Card = ({ title, count, color }: any) => {
    return (
        <div className="col-md-3">
            <div className={`card mb-4 shadow-sm bg-${color}`}>
                <div className="card-body d-flex align-items-center">
                    <div>
                        <h5 className="card-title mb-0">{title}</h5>
                        <h2 className="card-count">{count}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DashboardComponent;