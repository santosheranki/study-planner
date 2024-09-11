import { useEffect, useState } from 'react';
import Headercomponent from './Header';
import '../../src/components/Categories.css';
import { Table, Pagination, Form, Placeholder } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
const CategoriesComponent = () => {
    const [items, setItems] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(8);
    const [loading, setLoading] = useState(true); // Add loading state
    const location = useLocation();
    const pathname = location.pathname;
    const uuidfromlocalstorage = localStorage.getItem('userid');
    useEffect(() => {
        handleGetCategories();
    }, []);
    const handleGetCategories = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/getcategories`);
            const tableCategories = await response.data.map(({ categoryid, title }: any) => ({
                categoryid,
                title
            }));
            handleLogin(tableCategories);
        } catch (error: any) {
            console.error("Error fetching categories", error.message);
        }
    };
    const getCategoryTitle = (categoryId: any, categoriesList: Array<any>) => {
        const category = categoriesList.find(cat => cat.categoryid === categoryId);
        return category ? category.title : 'Unknown Category';
    };
    const handleLogin = async (categoriesList: Array<any>) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/gettabletasks/${uuidfromlocalstorage}`);
            if (response && response.data) {
                const fetchedItems = response.data.map((item: any) => ({
                    id: item._id,
                    dateCreated: new Date(item.createdDate).toLocaleDateString(),
                    scheduledDate: new Date(item.start).toLocaleDateString() + ' ' + new Date(item.start).toLocaleTimeString(),
                    taskTitle: item.title,
                    category: getCategoryTitle(item.category, categoriesList),
                    status: item.ActiveFlag === 1 ? 'Active' : 'Completed',
                }));
                fetchedItems.sort((a: any, b: any) => (a.status === 'Active' ? -1 : 1));
                setItems(fetchedItems);
                setLoading(false); // Hide loader after data is fetched
            }
        } catch (error: any) {
            console.error('Error fetching tasks:', error.response);
        }
    };
    const indexOfLastItem = currentPage * recordsPerPage;
    const indexOfFirstItem = indexOfLastItem - recordsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / recordsPerPage);
    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
    const handleRecordsPerPageChange = (e: any) => {
        setRecordsPerPage(Number(e.target.value));
    };
    return (
        <>
            {pathname === '/dashboard' ? '' : <Headercomponent />}
            <div className="container-fluid">
                <h2 className="mb-4">List of Tasks</h2>
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
                            <th>Task Created Date</th>
                            <th>Task Scheduled Date</th>
                            <th>Task Title</th>
                            <th>Category</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Render skeleton loaders while loading
                            [...Array(recordsPerPage)].map((_, idx) => (
                                <tr key={idx}>
                                    <td><Placeholder as="p" animation="glow"><Placeholder xs={7} /></Placeholder></td>
                                    <td><Placeholder as="p" animation="glow"><Placeholder xs={10} /></Placeholder></td>
                                    <td><Placeholder as="p" animation="glow"><Placeholder xs={6} /></Placeholder></td>
                                    <td><Placeholder as="p" animation="glow"><Placeholder xs={5} /></Placeholder></td>
                                    <td><Placeholder as="p" animation="glow"><Placeholder xs={4} /></Placeholder></td>
                                </tr>
                            ))
                        ) : (
                            currentItems.map(item => (
                                <tr key={item.id} className="fade-in-row">
                                    <td>{item.dateCreated}</td>
                                    <td>{item.scheduledDate}</td>
                                    <td>{item.taskTitle}</td>
                                    <td>{item.category}</td>
                                    <td>
                                        <span className={`badge ${item.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
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
            </div>
        </>
    );
};
export default CategoriesComponent;