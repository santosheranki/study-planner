import Headercomponent from './Header';
import '../../src/components/Dashboard.css'
import CategoriesComponent from './Categories';
const DashboardComponent = () => {
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
                            count={5}
                            color="gray"
                        />
                        <Card
                            icon="fas fa-calendar-day"
                            title="Today's Scheduled Tasks"
                            count={2}
                            color="blue"
                        />
                        <Card
                            icon="fas fa-calendar-alt"
                            title="Upcoming Scheduled Tasks"
                            count={2}
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