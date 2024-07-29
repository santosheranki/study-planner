import { Navigate, useOutlet } from "react-router";
const Public = () => {
    const user: any = localStorage.getItem("userid");
    const outlet = useOutlet();
    if (!user) {
        return <Navigate to="/login" />;
    }
    return <div>{outlet}</div>;
};
export default Public;