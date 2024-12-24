import { useEffect, useState, useRef, useCallback, SetStateAction } from 'react';
import '../../src/components/CalendarList.css'
import axiosInstance from '../utils/axiosInstance';
import { Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
const DashboardListComponent = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const hasFetched = useRef(false);
    useEffect(() => {
        if (!hasFetched.current) {
            fetchEvents();
            hasFetched.current = true;
        }
    }, []);
    const fetchEvents = useCallback(async () => {
        try {
            const uuidfromlocalstorage = localStorage.getItem('userid');
            const accessToken = localStorage.getItem('accessToken');
            const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/calendar/getallscheduledcalendarstilldate/${uuidfromlocalstorage}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, []);
    // Pagination logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = events.slice(indexOfFirstRecord, indexOfLastRecord);
    const paginate = (pageNumber: SetStateAction<number>) => setCurrentPage(pageNumber);
    const handleRecordsChange = (e: any) => setRecordsPerPage(e.target.value);
    const getStatusColor = (status: any) => {
        switch (status) {
            case 1:
                return 'green';
            case 0:
                return 'gray';
            default:
                return 'black';
        }
    };
    return (
        <div>
            {loading ? (
                <div className="loader-container">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <div className="dashboard-contents">
                    <h1>List of Tasks</h1>
                    <hr className="divider" />
                    <div className="pagination-container">
                        <select onChange={handleRecordsChange} value={recordsPerPage}>
                            <option value="5">5</option>
                            <option value="15">15</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="table-container">
                        <table className="events-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((event: any) => (
                                    <tr key={event._id}>
                                        <td>{event.title}</td>
                                        <td>{event.description}</td>
                                        <td>{format(new Date(event.start), 'PPPpp')}</td>
                                        <td>{format(new Date(event.end), 'PPPpp')}</td>
                                        <td>
                                            <span style={{ color: getStatusColor(event.ActiveFlag) }}>
                                                {event.ActiveFlag === 1 ? 'Active' : 'Completed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination-buttons">
                            {Array.from({ length: Math.ceil(events.length / recordsPerPage) }, (_, index) => (
                                <button key={index + 1} onClick={() => paginate(index + 1)} className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}>
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DashboardListComponent;