import { useEffect, useState } from 'react';
import Headercomponent from './Header';
import '../../src/components/Categories.css'
import { Table, Pagination, Dropdown, Button, Form } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
const CategoriesComponent = () => {
    const [items, setItems] = useState(generateItems(20));
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(8);
    let title: any
    function generateItems(count: any) {
        return Array.from({ length: count }, (_, index) => ({
            id: index + 1,
            dateCreated: `2024-07-${String(index % 30 + 1).padStart(2, '0')}`,
            username: localStorage.getItem('userwelcomename'),
            category: `Category${(index % 5) + 1}`,
            tasktitle: `Category${(index % 5) + 1}`,
            status: index % 2 === 0 ? 'active' : 'closed',
        }));
    }
    const indexOfLastItem = currentPage * recordsPerPage;
    const indexOfFirstItem = indexOfLastItem - recordsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / recordsPerPage);
    const handlePageChange = (pageNumber: any) => setCurrentPage(pageNumber);
    const handleRecordsPerPageChange = (e: any) => setRecordsPerPage(Number(e.target.value));
    const location = useLocation();
    const pathname = location.pathname;
    const uuidfromlocalstorage = localStorage.getItem('userid');
    useEffect(() => {
        handleLogin();
    })
    const handleLogin = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getcategories/${uuidfromlocalstorage}`, {
            });
            if (response) {
                console.log("if condition entered in response", response.data);
                title = response.data.map((item: { title: any; }) => item.title)
                console.log("santosh", title)
            }
            console.log('Login successful:', response);
        } catch (error: any) {
            console.error('Error logging in:', error.response);
        }
    };
    return (
        <>{pathname === '/dashboard' ? '' : <Headercomponent />}
            <div className="container-fluid">
                <h2 className="mb-4">List of Categories</h2>
                <Form.Group controlId="recordsPerPage">
                    <Form.Label>Records Per Page</Form.Label>
                    <Form.Control as="select" value={recordsPerPage} onChange={handleRecordsPerPageChange}>
                        {[5, 15, 20, 50, 100].map(value => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <br />
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Date Created</th>
                            <th>Username</th>
                            <th>Category</th>
                            <th>Task Title</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(item => (
                            <tr key={item.id} className="fade-in-row">
                                <td>{item.dateCreated}</td>
                                <td>{item.username}</td>
                                <td>{item.category}</td>
                                <td>{item.tasktitle}</td>
                                <td>
                                    <span className={`badge ${item.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Pagination className='justify-content-end pagination-custom'>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <Pagination.Item
                            key={index + 1}
                            active={index + 1 === currentPage}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            </div></>
    );
};
export default CategoriesComponent;