import { Nav } from 'react-bootstrap';
import '../../src/components/Header.css'
import { useNavigate } from 'react-router-dom';
const Headercomponent = () => {
    const navigate = useNavigate();
    const handlelogout = () => {
        localStorage.clear();
        navigate('/');
    }
    return (
        <>
            <Nav className='background justify-content-end'>
                <Nav.Item>
                    <Nav.Link href="/dashboard" className='text-white'>Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-1" href="/task" className='text-white'>Manage Tasks</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="/categories" eventKey="link-1" className='text-white'>Categories</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="/accountsettings" eventKey="link-1" className='text-white'>Account</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-2" className='text-white' onClick={handlelogout}>Logout</Nav.Link>
                </Nav.Item>
            </Nav>
        </>
    );
};
export default Headercomponent;