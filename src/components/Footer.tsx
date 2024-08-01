import { Nav } from 'react-bootstrap';
import '../../src/components/Header.css'
import { useNavigate } from 'react-router-dom';
import { MDBFooter } from 'mdb-react-ui-kit';
const FooterComponent = () => {
    const navigate = useNavigate();
    const handlelogout = () => {
        localStorage.clear();
        navigate('/');
    }
    return (
        <>
            <MDBFooter bgColor='light' className='text-center text-lg-left'>
                <div className='text-center p-3' style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                    &copy; {new Date().getFullYear()} Copyright:{' '}
                    <a className='text-dark' href='https://mdbootstrap.com/'>
                        MDBootstrap.com
                    </a>
                </div>
            </MDBFooter>
        </>
    );
};
export default FooterComponent;