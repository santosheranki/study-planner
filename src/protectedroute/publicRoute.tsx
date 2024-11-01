// import { Navigate, useOutlet } from "react-router";
// const Public = () => {
//     const user: any = localStorage.getItem("userid");
//     const outlet = useOutlet();
//     if (!user) {
//         return <Navigate to="/login" />;
//     }
//     return <div>{outlet}</div>;
// };
// export default Public;
import { Navigate, useOutlet } from 'react-router-dom';

const Public = () => {
    const user = localStorage.getItem("userid"); // Change to a specific type if needed
    const outlet = useOutlet();

    if (user) {
        return <Navigate to="/dashboard" />; // Redirect to a dashboard or home page if the user is logged in
    }

    return <>{outlet}</>; // Render the outlet for public routes (like login)
};

export default Public;
