import { useEffect, useState, useRef, useCallback } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../src/components/accountSettings.css';
import Headercomponent from './Header';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const emailPattern = /^[a-zA-Z]+([.-]?[a-zA-Z0-9]+)*@([a-zA-Z]+([.-]?[a-zA-Z]))[.]{1}[a-zA-Z]{2,}$/;
const validationSchema = Yup.object().shape({
    username: Yup.string()
        .matches(emailPattern, 'Invalid email format')
        .required('Username is required'),
});
const raiseTicketValidationSchema = Yup.object().shape({
    username: Yup.string()
        .matches(emailPattern, 'Invalid email format')
        .required('Username is required'),
    title: Yup.string().required('Ticket title is required'),
    description: Yup.string().required('Ticket description is required'),
    ticketType: Yup.string().required('Ticket type is required'), // Validation for ticketType dropdown
});
const changePasswordSchema = Yup.object().shape({
    username: Yup.string()
        .matches(emailPattern, 'Invalid email format')
        .required('Username is required'),
    oldPassword: Yup.string()
        .required('Old Password is required'),
    newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/\d/, 'Password must contain at least one number')
        .matches(/[@$!%*?&]/, 'Password must contain at least one special character')
        .required('New Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm Password is required'),
});
const AccountSetting: React.FC = () => {
    const [ticketCategories, setTicketCategories] = useState<any[]>([]);
    const [isGoogleUser, setIsGoogleUser] = useState(localStorage.getItem('isGoogleUser') === 'true');
    const checkAdminUser = localStorage.getItem('adminUser') === 'true';
    const hasFetched = useRef(false);
    useEffect(() => {
        setIsGoogleUser(localStorage.getItem('isGoogleUser') === 'true');
        if (!hasFetched.current) {
            handleGetCategoryTypes();
            hasFetched.current = true;
        }
    }, [localStorage.getItem('isGoogleUser')]);
    const handleGetCategoryTypes = useCallback(async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/auth/getticketcategorytypes`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (response && response.data) {
                localStorage.setItem('categoryTypeItems', JSON.stringify(response?.data));
                const ticketCategoriesList = response.data.map(({ title, categoryId }: any) => ({
                    title,
                    categoryId
                }));
                setTicketCategories(ticketCategoriesList);
            }
        } catch (error: any) {
            toast.error("something failed, please try later");
        }
    }, []);
    const navigate = useNavigate();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
    const [isRaiseTicketModalVisible, setIsRaiseTicketModalVisible] = useState(false);
    const accessToken = localStorage.getItem('accessToken');
    const handleViewTicketsPage = () => {
        navigate('/viewtickets');
    }
    const handleDelete = async (values: { username: string }) => {
        const isGoogleUser = localStorage.getItem('isGoogleUser') === 'true';
        const userId = isGoogleUser ? localStorage.getItem('googleId') : localStorage.getItem('userid')
        let payload: any = {
            username: values?.username,
        };
        if (isGoogleUser) {
            payload.googleId = userId;
        } else {
            payload.uuid = userId;
        }
        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/auth/delete-user`, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (response.data.result === 1) {
                toast.success('User deleted successfully!');
                setIsDeleteModalVisible(false);
                localStorage.clear();
                navigate('/');
            } else {
                toast.error(response.data.message || 'An error occurred while deleting the user.');
            }
        } catch (error: any) {
            if (error.response) {
                toast.error(error.response.data.message || 'An error occurred. Please try again.');
            } else if (error.request) {
                toast.error('No response received from the server. Please try again later.');
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
        }
    };
    const handleRaiseTicket = async (values: any) => {
        const isGoogleUser = localStorage.getItem('isGoogleUser') === 'true';
        const userId = isGoogleUser ? localStorage.getItem('googleId') : localStorage.getItem('userid')
        let payload: any = {
            title: values?.title,
            isGoogleUser: localStorage.getItem('isGoogleUser') === 'true',  // This will directly convert to true or false
            username: values?.username,
            categoryId: parseInt(values?.ticketType),
            description: values?.description
        }
        if (isGoogleUser) {
            payload.googleId = userId;
        } else {
            payload.uuid = userId;
        }
        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/auth/raiseticket`, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (response.data?.result === 1) {
                toast.success("Ticket Raised Successfully");
                setIsRaiseTicketModalVisible(false);
            }
        } catch (error: any) {
            console.log(error);
            if (error.response?.status === 400 && error?.response?.data?.message === 'User not found') {
                toast.error("User not found");
            }
            if (error?.response?.status === 400 && error?.response?.data?.message === 'There is already a request with the same category. Please wait for a response.') {
                toast.error("There is already a request with the same category. Please wait for a response.");
            }
        }
    }
    const handleChangePassword = async (values: { username: string, oldPassword: string, newPassword: string, confirmPassword: string }, { setFieldValue }: any) => {
        const payload = {
            username: values.username,
            uuid: localStorage.getItem('userid'),
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword
        };
        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/auth/change-password`, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (response.data.result === 1) {
                toast.success('Password changed successfully!');
                setIsChangePasswordModalVisible(false);
                localStorage.clear();
                navigate('/');
            } else {
                setTimeout(() => {
                    setFieldValue('oldPassword', '');
                    setFieldValue('newPassword', '');
                    setFieldValue('confirmPassword', '');
                }, 2000);
                toast.error(response.data.message || 'An error occurred while changing the password.');
            }
        } catch (error: any) {
            setTimeout(() => {
                setFieldValue('oldPassword', '');
                setFieldValue('newPassword', '');
                setFieldValue('confirmPassword', '');
            }, 2000);
            if (error.response) {
                toast.error(error.response.data.message || 'An error occurred. Please try again.');
            } else if (error.request) {
                toast.error('No response received from the server. Please try again later.');
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
        }
    };
    return (
        <>
            <Headercomponent />
            <div className="container-fluid mt-4">
                <h2 className="mb-3">Account Settings</h2>
                <hr />
                <p>Your details</p>
                {checkAdminUser ? (
                    <p>Role: Admin</p>
                ) : (
                    <p>Role: User</p>
                )}
                <p>Display Name : {localStorage.getItem('userwelcomename')}</p>
                <p>Username : {localStorage.getItem('username')}</p>
                {!isGoogleUser && (
                    <div className="cardma mb-4" style={{ maxWidth: '500px' }}>
                        <h5>Change Your Password</h5>
                        <p className="text-muted">
                            Keep your account secure by updating your password regularly.
                        </p>
                        <Button
                            onClick={() => setIsChangePasswordModalVisible(true)}
                            className="w-10 changingpassword"
                        >
                            Change Password
                        </Button>
                    </div>
                )}
                <div className="cardma mb-4" style={{ maxWidth: '500px' }}>
                    <h5>Help & Support</h5>
                    <p className='text-muted'>
                        Found an issue? Please raise a ticket, and we’ll resolve it promptly!
                    </p>
                    <Button
                        onClick={() => setIsRaiseTicketModalVisible(true)}
                        className="w-10 changingpassword"
                    >
                        Raise a Ticket
                    </Button>
                    <Button
                        onClick={() => handleViewTicketsPage()}
                        className="w-10 mx-2 changingpassword"
                    >
                        View Tickets
                    </Button>
                </div>
                <div className="text-danger mb-3">
                    <h5>Danger Zone</h5>
                    <p>
                        Deleting your account is a permanent action and cannot be undone.
                        All your data will be lost.
                    </p>
                    <Button
                        variant="outline-danger"
                        onClick={() => setIsDeleteModalVisible(true)}
                        className="w-10"
                    >
                        Delete Account
                    </Button>
                </div>
                <Modal show={isDeleteModalVisible} onHide={() => setIsDeleteModalVisible(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Account Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={{ username: '' }}
                            validationSchema={validationSchema}
                            onSubmit={handleDelete}
                        >
                            {({ values, handleChange, setTouched }) => (
                                <FormikForm>
                                    <Form.Group controlId="formUsername">
                                        <Form.Label>Username</Form.Label>
                                        <Field
                                            type="text"
                                            name="username"
                                            placeholder="Enter Username at the time of creation"
                                            className="form-control"
                                            onCopy={(e: any) => e.preventDefault()}
                                            onPaste={(e: any) => e.preventDefault()}
                                            onCut={(e: any) => e.preventDefault()}
                                            onContextMenu={(e: any) => e.preventDefault()}
                                            onBlur={() => setTouched({ username: true })}
                                        />
                                        <ErrorMessage name="username" component="div" className="text-danger" />
                                    </Form.Group>
                                    <label className="colorlight"><span className='text-darker-danger'>*</span> Please Note that Deleting your account is a permanent action. Once the process begins, you will not be able to reactivate your account or retrieve any data or information.</label>
                                    <div className="handlebutton">
                                        <Button
                                            variant="danger"
                                            type="submit"
                                            disabled={!values.username.match(emailPattern)}
                                            className="d-block mx-auto"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </FormikForm>
                            )}
                        </Formik>
                    </Modal.Body>
                </Modal>
                <Modal show={isChangePasswordModalVisible} onHide={() => setIsChangePasswordModalVisible(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Change Password</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={{ username: '', oldPassword: '', newPassword: '', confirmPassword: '' }}
                            validationSchema={changePasswordSchema}
                            onSubmit={(values, formikHelpers) => handleChangePassword(values, formikHelpers)} // Pass the formikHelpers context here
                        >
                            {({ values, handleChange, setTouched }) => (
                                <FormikForm>
                                    <Form.Group controlId="formUsername">
                                        <Form.Label>Username</Form.Label>
                                        <Field
                                            type="text"
                                            name="username"
                                            placeholder="Enter Username"
                                            className="form-control"
                                            onCopy={(e: any) => e.preventDefault()}
                                            onPaste={(e: any) => e.preventDefault()}
                                            onCut={(e: any) => e.preventDefault()}
                                            onContextMenu={(e: any) => e.preventDefault()}
                                            onBlur={() => setTouched({ username: true })}
                                        />
                                        <ErrorMessage name="username" component="div" className="text-danger" />
                                    </Form.Group>
                                    <Form.Group controlId="formUsername">
                                        <Form.Label>Old Password</Form.Label>
                                        <Field
                                            type="text"
                                            name="oldPassword"
                                            placeholder="Enter current password"
                                            className="form-control"
                                            onCopy={(e: any) => e.preventDefault()}
                                            onPaste={(e: any) => e.preventDefault()}
                                            onCut={(e: any) => e.preventDefault()}
                                            onContextMenu={(e: any) => e.preventDefault()}
                                            onBlur={() => setTouched({ oldPassword: true })}
                                        />
                                        <ErrorMessage name="oldPassword" component="div" className="text-danger" />
                                    </Form.Group>
                                    <Form.Group controlId="formUsername">
                                        <Form.Label>New Password</Form.Label>
                                        <Field
                                            type="text"
                                            name="newPassword"
                                            placeholder="Enter new password"
                                            className="form-control"
                                            onCopy={(e: any) => e.preventDefault()}
                                            onPaste={(e: any) => e.preventDefault()}
                                            onCut={(e: any) => e.preventDefault()}
                                            onContextMenu={(e: any) => e.preventDefault()}
                                            onBlur={() => setTouched({ newPassword: true })}
                                        />
                                        <ErrorMessage name="newPassword" component="div" className="text-danger" />
                                    </Form.Group>
                                    <Form.Group controlId="formUsername">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Field
                                            type="text"
                                            name="confirmPassword"
                                            placeholder="Re-enter the new password"
                                            className="form-control"
                                            onCopy={(e: any) => e.preventDefault()}
                                            onPaste={(e: any) => e.preventDefault()}
                                            onCut={(e: any) => e.preventDefault()}
                                            onContextMenu={(e: any) => e.preventDefault()}
                                            onBlur={() => setTouched({ confirmPassword: true })}
                                        />
                                        <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                                    </Form.Group>
                                    <label className="colorlight2"><span className='text-darker-danger'>*</span> Updating your password is a permanent action. Once changed, the previous password cannot be recovered.</label>
                                    <div className="handlebutton">
                                        <Button
                                            type="submit"
                                            className="d-block mx-auto changingpassword"
                                        >
                                            Update Password
                                        </Button>
                                    </div>
                                </FormikForm>
                            )}
                        </Formik>
                    </Modal.Body>
                </Modal>
                <Modal show={isRaiseTicketModalVisible} onHide={() => setIsRaiseTicketModalVisible(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Raise A Ticket</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={{ username: '', description: '', title: '', ticketType: '' }}
                            validationSchema={raiseTicketValidationSchema}
                            onSubmit={handleRaiseTicket}
                        >
                            {({ errors, values, handleChange, setTouched, touched, isInvalid }: any) => (
                                <FormikForm>
                                    <Form.Group controlId="formUsername">
                                        <Form.Label>Username <span className="asterisk">*</span></Form.Label>
                                        <Field
                                            type="text"
                                            name="username"
                                            placeholder="Enter Username at the time of creation"
                                            className="form-control"
                                            onCopy={(e: any) => e.preventDefault()}
                                            onPaste={(e: any) => e.preventDefault()}
                                            onCut={(e: any) => e.preventDefault()}
                                            onContextMenu={(e: any) => e.preventDefault()}
                                            onBlur={() => setTouched({ username: true })}
                                        />
                                        <ErrorMessage name="username" component="div" className="text-danger" />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Ticket Title <span className="asterisk">*</span></Form.Label>
                                        <Field
                                            name="title"
                                            as={Form.Control}
                                            isInvalid={touched.title && !!errors.title}
                                            placeholder="Enter Title"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.title}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Type of Ticket <span className="asterisk">*</span></Form.Label>
                                        <Field
                                            as="select"
                                            name="ticketType"
                                            className="form-control"
                                            isInvalid={touched.ticketType && !!errors.ticketType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Ticket Type</option>
                                            {ticketCategories.map((category) => (
                                                <option key={category.categoryId} value={category.categoryId}>
                                                    {category.title}
                                                </option>
                                            ))}
                                        </Field>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.ticketType}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Description<span className='asterisk'>*</span></Form.Label>
                                        <Field
                                            name="description"
                                            as="textarea"
                                            placeholder="Describe your issue elaborately here"
                                            className="form-control"
                                            rows={3}
                                            isInvalid={touched.description && !!errors.description}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.description}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <label className="colorlight2">
                                        <span className='text-darker-danger'>*</span> Please do not provide any personal information, passwords, or sensitive details.
                                    </label>
                                    <div className="handlebutton">
                                        <Button type="submit" className="d-block mx-auto">
                                            Raise
                                        </Button>
                                    </div>
                                </FormikForm>
                            )}
                        </Formik>
                    </Modal.Body>
                </Modal>
            </div>
        </>
    );
};
export default AccountSetting;