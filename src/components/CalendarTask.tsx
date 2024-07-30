import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import events from './Events';
import Headercomponent from './Header';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { toast } from 'react-toastify';
const localizer = momentLocalizer(moment);
const CalendarComponent = () => {
    const [eventsData, setEventsData] = useState(events);
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', category: '' });
    const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };
        setNewEvent({
            title: '',
            start: formatDate(start),
            end: '',
            category: ''
        });
        setShowModal(true);
    };
    useEffect(() => {
        handleGetCategoryTypes();
    }, []);
    const handleGetCategoryTypes = async () => {
        const userid = localStorage.getItem('userid');
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getcategories/${userid}`);
            if (response && response.data) {
                const categoriesList = response.data.map(({ title, categoryid }: any) => ({ title, categoryid }));
                localStorage.setItem('categories', JSON.stringify(categoriesList));
                setCategories(categoriesList);
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error.response);
        }
    };
    const handleSave = async (values: any) => {
        const userid = localStorage.getItem('userid');
        const payload = {
            category: parseInt(values.category),
            title: values.title.toString(),
            start: values.start.toString(),
            end: values.end.toString(),
            uuid: userid?.toString()
        }
        const { title, start, end } = values;
        setEventsData([...eventsData, { title, start: new Date(start), end: new Date(end) }]);
        setShowModal(false);
        try {
            const response = await axios.post('http://localhost:3000/api/auth/addcalendar',
                payload
            );
            if (response.data.result === 1) {
                toast.success("Yay! Calendar Scheduled")
            }
            console.log("response", response, response.data)
            console.log('Register response:', response.data);
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };
    return (
        <>
            <Headercomponent />
            <div className="App">
                <br />
                <Calendar
                    selectable
                    localizer={localizer}
                    defaultDate={new Date()}
                    defaultView="month"
                    events={eventsData}
                    style={{ height: "100vh" }}
                    onSelectEvent={(event) => alert(event.title)}
                    onSelectSlot={handleSelect}
                />
                <EventModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    handleSave={handleSave}
                    newEvent={newEvent}
                    categories={categories}
                />
            </div>
        </>
    );
};
const EventModal = ({ show, handleClose, handleSave, newEvent, categories }: any) => {
    const validationSchema = Yup.object({
        title: Yup.string().required('Event title is required'),
        start: Yup.date().required('Start date and time are required'),
        end: Yup.date()
            .required('End date and time are required')
            .min(Yup.ref('start'), 'End date and time cannot be before start date and time'),
        category: Yup.string().required('Category is required')
    });
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Event</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={newEvent}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                    handleSave(values);
                    resetForm();
                }}
            >
                {({ errors, touched }: any) => (
                    <FormikForm>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>Event Title</Form.Label>
                                <Field
                                    name="title"
                                    as={Form.Control}
                                    isInvalid={touched.title && !!errors.title}
                                />
                                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Category</Form.Label>
                                <Field
                                    name="category"
                                    as="select"
                                    className="form-control"
                                    isInvalid={touched.category && !!errors.category}
                                >
                                    <option value="" label="Select category" />
                                    {categories.map((category: any, index: number) => (
                                        <option key={index} value={category.categoryid} label={category.title} />
                                    ))}
                                </Field>
                                <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Start Date & Time</Form.Label>
                                <Field
                                    name="start"
                                    type="datetime-local"
                                    as={Form.Control}
                                    isInvalid={touched.start && !!errors.start}
                                />
                                <Form.Control.Feedback type="invalid">{errors.start}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>End Date & Time</Form.Label>
                                <Field
                                    name="end"
                                    type="datetime-local"
                                    as={Form.Control}
                                    isInvalid={touched.end && !!errors.end}
                                />
                                <Form.Control.Feedback type="invalid">{errors.end}</Form.Control.Feedback>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </FormikForm>
                )}
            </Formik>
        </Modal>
    );
};
export default CalendarComponent;