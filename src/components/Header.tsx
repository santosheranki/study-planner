import { Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../../src/components/Header.css';

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
                    <Nav.Link as={Link} to="/dashboard" className='text-white'>Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/task" className='text-white'>Manage Tasks</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/categories" className='text-white'>Categories</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/accountsettings" className='text-white'>Account</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link className='text-white' onClick={handlelogout}>Logout</Nav.Link>
                </Nav.Item>
            </Nav>
        </>
    );
};

export default Headercomponent;
