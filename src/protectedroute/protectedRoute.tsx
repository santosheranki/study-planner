import { Navigate, useOutlet } from 'react-router-dom';
const Protected = () => {
    const auth = localStorage.getItem('userid');
    const outlet = useOutlet();
    if (!auth) {
        return <Navigate to="/" />;
    }
    return <>{outlet}</>;
};
export default Protected;