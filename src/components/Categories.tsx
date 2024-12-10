import { useEffect, useState } from 'react';
import Headercomponent from './Header';
import '../../src/components/Categories.css';
import { Table, Pagination, Form, Placeholder, Button, Modal } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Formik, Field, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';
interface Category {
    categoryid: any;
    title: any;
    reason: any;
    status: any; // Assuming you have status in your data
}
const CategoriesComponent = () => {
    const [items, setItems] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isEditing, setIsEditing] = useState(false); // Track if editing
    const [recordsPerPage, setRecordsPerPage] = useState(8);
    const [loading, setLoading] = useState(true); // Add loading state
    const [showModal, setShowModal] = useState(false); // State to control modal
    const location = useLocation();
    const pathname = location.pathname;
    useEffect(() => {
        handleGetCategories();
    }, []);
    const handleGetCategories = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/calendar/getcategories`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const tableCategories = response.data.map(({ categoryid, title, reason, activeFlag }: any) => ({
                categoryid,
                title,
                reason: reason || 'N/A', // Provide a default empty string if reason is not available
                status: activeFlag === 1 ? 'Active' : 'Inactive' // Map activeFlag to status
            }));
            setItems(tableCategories); // Set categories directly to items
            setLoading(false); // Hide loader after data is fetched
        } catch (error: any) {
            console.error("Error fetching categories", error.message);
        }
    };
    const handleEdit = async (category: any) => {
        setSelectedCategory(category);
        setIsEditing(true);
        handleShowModal();
        const uuidfromlocalstorage = localStorage.getItem('userid');
        let payload = {
            uuid: uuidfromlocalstorage,
            categoryid: category.categoryid
        }
        const accessToken = localStorage.getItem('accessToken');
        const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/calendar/getcategoriesbyid`, payload, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
    };
    const handleDelete = async (category: any) => {
        const uuidfromlocalstorage = localStorage.getItem('userid');
        let payload = {
            uuid: uuidfromlocalstorage,
            categoryid: category.categoryid
        }
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/calendar/deletecategory`, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            toast.success("Category deleted successfully");
            handleGetCategories();
        } catch (error: any) {
            toast.error("Error deleting category");
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
    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setSelectedCategory(null);
    };
    const validationSchema = Yup.object({
        title: Yup.string().required('Title is required'),
        description: Yup.string(),
    });
    const initialValues = {
        title: selectedCategory ? selectedCategory.title : '',
        description: selectedCategory ? selectedCategory.reason : '',
    };
    const handleSubmit = async (values: any) => {
        const uuidfromlocalstorage = localStorage.getItem('userid');
        const payload = {
            uuid: uuidfromlocalstorage,
            title: values.title || "",
            reason: values.description || "",
            categoryid: selectedCategory ? selectedCategory.categoryid : undefined, // Include categoryid if selectedCategory exists
        };
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/calendar/addcategories`, payload);
            if (response.data.result === 1) {
                toast.success(selectedCategory ? "Category Updated Successfully" : "Category Added Successfully");
            }
            handleCloseModal();
            handleGetCategories(); // Refresh the categories after adding/updating
        } catch (error: any) {
            toast.error("Uh-oh something went wrong. Please try again!");
        }
    };
    return (
        <>
            {pathname === '/dashboard' ? '' : <Headercomponent />}
            <div className="container-fluid">
                <h2 className="mb-4">{pathname === '/dashboard' ? 'List of Tasks' : 'List of Categories'}</h2>
                <div className="d-flex justify-content-end mb-4">
                    {pathname === '/dashboard' ? '' :
                        <Button className='btncolors' onClick={handleShowModal}>
                            Add Categories
                        </Button>
                    }
                </div>
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
                            <th>Title</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Action</th>
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
                            currentItems.map(item => (
                                <tr key={item.categoryid}>
                                    <td>{item.categoryid}</td>
                                    <td>{item.title}</td>
                                    <td>{item.reason}</td>
                                    <td>
                                        <span className={`badge ${item.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Button variant="warning" size="sm" onClick={() => handleEdit(item)}>Edit</Button>{' '}
                                        <Button variant="danger" className='my-2' size="sm" onClick={() => handleDelete(item)}>Delete</Button>
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
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Category' : 'Add Category'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched }: any) => (
                            <FormikForm>
                                <Form.Group>
                                    <Form.Label>Category Title <span className='asterisk'>*</span></Form.Label>
                                    <Field
                                        name="title"
                                        as={Form.Control}
                                        isInvalid={touched.title && !!errors.title}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="formDescription" className="mt-3">
                                    <Form.Label>Description</Form.Label>
                                    <Field
                                        name="description"
                                        as="textarea"
                                        rows={3}
                                        className="form-control"
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-end mt-4">
                                    <Button variant="primary" type="submit">
                                        {isEditing ? 'Update' : 'Add'}
                                    </Button>
                                </div>
                            </FormikForm>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </>
    );
};
export default CategoriesComponent;