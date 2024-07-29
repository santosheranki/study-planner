import Headercomponent from './Header';
const DashboardComponent = () => {
    const loggedinUsername = localStorage.getItem('userwelcomename');
    return (
        <div>
            <Headercomponent />
            <h1>Welcome {loggedinUsername},</h1>
        </div>
    );
};
export default DashboardComponent;