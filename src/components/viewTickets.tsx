import { useEffect, useState, useRef, useCallback } from 'react';
import Headercomponent from './Header';
import '../../src/components/Categories.css';
import { Table, Pagination, Form, Placeholder, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

const ViewTicketsComponent = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const indexOfLastItem = currentPage * recordsPerPage;
    const indexOfFirstItem = indexOfLastItem - recordsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / recordsPerPage);
    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleRecordsPerPageChange = (e: any) => {
        setRecordsPerPage(Number(e.target.value));
    };
    const hasFetched = useRef(false);
    useEffect(() => {
        if (!hasFetched.current) {
            handleGetTickets();
            hasFetched.current = true;
        }
    }, []);
    const handleGetTickets = useCallback(async () => {
        const username = localStorage.getItem('username');
        const googleId = localStorage.getItem('googleId');
        const uuid = localStorage.getItem('uuid');
        const isGoogleUser = localStorage.getItem('isGoogleUser') === 'true';
        const checkingUsername = localStorage.getItem('username') === 'santosherankicse90@gmail.com';
        let payload: any = {};
        if (checkingUsername) {
            payload = {};
        } else {
            payload = { username };
            if (isGoogleUser) {
                payload.googleId = googleId;
            } else {
                payload.uuid = uuid;
            }
        }
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/tickets/GetTicketsById`, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.data.result === 1) {
                const tableCategories = Array.isArray(response.data?.tickets) ?
                    response.data.tickets.map(({ categoryId, title, username, description, activeFlag, _id }: any) => ({
                        categoryId,
                        title,
                        username,
                        description,
                        activeFlag,
                        _id
                    })) : [];

                setItems(tableCategories);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
        }
    }, []);
    const isAdminUser = localStorage.getItem('adminUser') === 'true';
    const handleMarkAsClose = async (_id: string, username: string) => {
        const payload = {
            _id,
            username,
            isAdminUser
        };
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/tickets/markasclose`, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response?.data?.result === 1) {
                toast.success("Ticket Closed Successfully");
                handleGetTickets();
            } else {
                toast.error("Failed to close ticket");
            }
        } catch (error: any) {
            if (error?.response?.data?.result === 0 && error?.response?.data?.message === 'Ticket is already closed') {
                toast.error("Ticket is already closed");
            } else {
                toast.error("An error occurred while closing the ticket");
            }
        }
    };
    const handleSort = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };
    const sortedItems = [...items].sort((a, b) => {
        if (a.activeFlag === b.activeFlag) return 0;
        if (sortOrder === 'asc') {
            return a.activeFlag === 1 ? -1 : 1;
        } else {
            return a.activeFlag === 1 ? 1 : -1;
        }
    });
    const currentSortedItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <>
            {pathname === '/dashboard' ? '' : <Headercomponent />}
            <div className="container-fluid">
                <h2 className="mb-4">View Tickets</h2>
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
                            <th>Category ID</th>
                            <th>Category Name</th>
                            <th>Title</th>
                            <th>Reason</th>
                            <th onClick={handleSort} style={{ cursor: 'pointer' }}>
                                Status
                                {sortOrder === 'asc' ? ' ↑' : ' ↓'}
                            </th>
                            {isAdminUser && <th>Action</th>} {/* Conditionally show Action column */}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(recordsPerPage)].map((_, idx) => (
                                <tr key={idx}>
                                    <td><Placeholder as="p" animation="glow"><Placeholder xs={7} /></Placeholder></td>
                                    <td><Placeholder as="p" animation="glow"><Placeholder xs={10} /></Placeholder></td>
                                    <td><Placeholder as="p" animation="glow"><Placeholder xs={6} /></Placeholder></td>
                                    <td><Placeholder as="p" animation="glow"><Placeholder xs={5} /></Placeholder></td>
                                </tr>
                            ))
                        ) : (
                            currentSortedItems.map(item => {
                                const categoryTypeItems = JSON.parse(localStorage.getItem('categoryTypeItems') || '[]');
                                const category = categoryTypeItems.find((cat: any) => cat.categoryId === item.categoryId);
                                const categoryName = category ? category.title : 'Unknown Category';

                                return (
                                    <tr key={item._id}>
                                        <td>{item.categoryId}</td>
                                        <td>{categoryName}</td>
                                        <td>{item.title}</td>
                                        <td>{item.description}</td>
                                        <td>
                                            <span
                                                className={`badge ${item.activeFlag === 1 ? 'bg-success' : 'bg-danger'}`}
                                            >
                                                {item.activeFlag === 1 ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        {isAdminUser && ( // Only show button if adminUser is true
                                            <td>
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    onClick={() => handleMarkAsClose(item._id, item.username)}
                                                >
                                                    Mark as Close
                                                </Button>{' '}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
                <Pagination className="justify-content-end pagination-custom">
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
export default ViewTicketsComponent;