import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../src/components/accountSettings.css';
import Headercomponent from './Header';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const emailPattern = /^[a-zA-Z]+([.-]?[a-zA-Z0-9]+)*@([a-zA-Z]+([.-]?[a-zA-Z]))[.]{1}[a-zA-Z]{2,}$/;

const validationSchema = Yup.object().shape({
    username: Yup.string()
        .matches(emailPattern, 'Invalid email format')
        .required('Username is required'),
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
    const navigate = useNavigate();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
    const accessToken = localStorage.getItem('accessToken');
    const handleDelete = async (values: { username: string }) => {
        const uuidfromlocalstorage = localStorage.getItem('userid');
        let payload = {
            username: values.username,
            uuid: uuidfromlocalstorage
        };
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
            console.error("Error while deleting", error);
        }
    };
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
            console.error("Error while changing password", error);
        }
    };
    return (
        <>
            <Headercomponent />
            <div className="container-fluid mt-4">
                <h2 className="mb-3">Account Settings</h2>
                <hr />
                <p>Your details</p>
                <p>Display Name : {localStorage.getItem('userwelcomename')}</p>
                <p>Username : {localStorage.getItem('username')}</p>
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
            </div>
        </>
    );
};
export default AccountSetting;