import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import '../../src/components/CalendarTask.css';
import { toast } from 'react-toastify';
import Headercomponent from './Header';
const localizer = momentLocalizer(moment);
interface Event {
    title: string;
    start: Date;
    end: Date;
    category?: string;
    description?: string;
}
const CalendarComponent: React.FC = () => {
    const [eventsData, setEventsData] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState<{ title: string; categoryid: number }[]>([]);
    const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', category: '', description: '' });  // Add description field
    const [individualcard, setIndividualCard] = useState<any | null>(null);
    const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
        const now = new Date();
        if (start < now) {
            toast.error("You cannot select past dates.");
            return;
        }
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
            end: formatDate(end),
            category: '',
            description: ''
        });
        setIndividualCard(null);
        setShowModal(true);
    };
    const handleindividualcard = async (event: any) => {
        const uuidfromlocalstorage = localStorage.getItem('userid');
        const calid = event.calendarId;
        const response: any = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/getdetailedcalendarbyid/${uuidfromlocalstorage}/${calid}`);
        setIndividualCard(response.data[0]);
        setNewEvent({
            title: response.data[0].title,
            start: response.data[0].start.split('T')[0] + 'T' + response.data[0].start.split('T')[1],
            end: response.data[0].end.split('T')[0] + 'T' + response.data[0].end.split('T')[1],
            category: response.data[0].category.toString(),
            description: response.data[0].description || ''
        });
        setShowModal(true);
    };
    useEffect(() => {
        handleGetCategoryTypes();
        fetchScheduledEvents();
    }, []);
    const handleGetCategoryTypes = async () => {
        const userid = localStorage.getItem('userid');
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/getcategories`);
            if (response && response.data) {
                const categoriesList = response.data.map(({ title, categoryid }: any) => ({ title, categoryid }));
                localStorage.setItem('categories', JSON.stringify(categoriesList));
                setCategories(categoriesList);
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error.response);
        }
    };
    const fetchScheduledEvents = async () => {
        const userid = localStorage.getItem('userid');
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/getscheduledcalendar/${userid}`);
            if (response && response.data) {
                const fetchedEvents = response.data.map((event: any) => ({
                    title: event.title,
                    start: new Date(event.start),
                    end: new Date(event.end),
                    category: event.category,
                    calendarId: event.calendarId,
                    description: event.description || ''  // Add description field
                }));
                setEventsData(fetchedEvents);
            }
        } catch (error: any) {
            console.error('Error fetching scheduled events:', error.response);
            if (error.response.status === 404) setEventsData([]);
        }
    };
    const handleSave = async (values: any) => {
        const userid = localStorage.getItem('userid');
        const payload = {
            category: parseInt(values.category),
            title: values.title.toString(),
            start: values.start.toString(),
            end: values.end.toString(),
            uuid: userid?.toString(),
            calendarId: individualcard ? individualcard?.calendarId : '',
            description: values.description || '',
            ActiveFlag: 1,
        };
        const { title, start, end } = values;
        if (individualcard) {
            const updatedEvents = eventsData.map(event =>
                event.calendarId === individualcard.calendarId
                    ? { ...event, title, start: new Date(start), end: new Date(end), description: values.description }
                    : event
            );
            setEventsData(updatedEvents);
        } else {
            setEventsData([...eventsData, { title, start: new Date(start), end: new Date(end), description: values.description }]);
        }
        setShowModal(false);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/calendar/addcalendar`, payload);
            if (response.data.result === 1) {
                toast.success("Yay! Calendar Scheduled");
                fetchScheduledEvents();
            }
        } catch (error) {
            console.error('Error adding event:', error);
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
                    views={['month', 'week', 'day']}
                    events={eventsData}
                    style={{ height: "100vh" }}
                    onSelectEvent={handleindividualcard}
                    onSelectSlot={handleSelect}
                />
                <EventModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    handleSave={handleSave}
                    newEvent={newEvent}
                    categories={categories}
                    handleFetchEvents={fetchScheduledEvents}
                    individualcard={individualcard}
                />
            </div>
        </>
    );
};
const EventModal = ({ show, handleClose, handleSave, newEvent, categories, individualcard, handleFetchEvents }: any) => {
    const handleDelete = async () => {
        const payload = {
            uuid: localStorage.getItem('userid')?.toString(),
            calendarId: individualcard.calendarId,
        };
        try {
            const deletecall = await axios.post(`${process.env.REACT_APP_API_URL}/calendar/updateActiveFlag`, payload);
            if (deletecall.data.result === 1) {
                toast.success("Yay! You have completed a task!");
                handleClose();
                handleFetchEvents();
            }
        } catch (error: any) {
            toast.error("Uh-oh something went wrong. Please try again!");
            console.error('Error fetching categories:', error.message);
        }
    };
    const validationSchema = Yup.object({
        title: Yup.string().required('Event title is required'),
        start: Yup.date().required('Start date and time are required'),
        end: Yup.date()
            .required('End date and time are required')
            .min(Yup.ref('start'), 'End date and time cannot be before start date and time'),
        category: Yup.string().required('Category is required'),
        description: Yup.string()  // Add validation for description (optional)
    });
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{individualcard ? 'Edit Event' : 'Add New Event'}</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={newEvent}
                validationSchema={validationSchema}
                enableReinitialize
                onSubmit={(values, { resetForm }) => {
                    handleSave(values);
                    resetForm();
                }}
            >
                {({ errors, touched }: any) => (
                    <FormikForm>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>Event Title <span className='asterisk'>*</span></Form.Label>
                                <Field
                                    name="title"
                                    as={Form.Control}
                                    isInvalid={touched.title && !!errors.title}
                                />
                                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Category <span className='asterisk'>*</span></Form.Label>
                                <Field
                                    name="category"
                                    as="select"
                                    className="form-control"
                                    isInvalid={touched.category && !!errors.category}
                                >
                                    <option value="" label="Select category" />
                                    {categories.map((category: any, index: any) => (
                                        <option key={index} value={category.categoryid} label={category.title} />
                                    ))}
                                </Field>
                                <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Start Date & Time <span className='asterisk'>*</span></Form.Label>
                                <Field
                                    name="start"
                                    type="datetime-local"
                                    as={Form.Control}
                                    isInvalid={touched.start && !!errors.start}
                                />
                                <Form.Control.Feedback type="invalid">{errors.start}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>End Date & Time <span className='asterisk'>*</span></Form.Label>
                                <Field
                                    name="end"
                                    type="datetime-local"
                                    as={Form.Control}
                                    isInvalid={touched.end && !!errors.end}
                                />
                                <Form.Control.Feedback type="invalid">{errors.end}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Field
                                    name="description"
                                    as="textarea"
                                    className="form-control"
                                    rows={3}
                                    isInvalid={touched.description && !!errors.description}
                                />
                                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                            </Form.Group>
                        </Modal.Body>
                        {individualcard && (
                            <label className="colorlight"><span className='text-danger'>*</span> Please Note Mark as complete action is an Irreversible action.</label>
                        )}
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            {individualcard && (
                                <Button variant="success" onClick={() => handleDelete()}>
                                    Mark as Completed
                                </Button>
                            )}
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