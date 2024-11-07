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

const emailPattern = /^[a-zA-Z]+([.-]?[a-zA-Z0-9]+)*@([a-zA-Z]+([.-]?[a-zA-Z]))[.]{1}[a-zA-Z]{2,}$/;

const validationSchema = Yup.object().shape({
    username: Yup.string()
        .matches(emailPattern, 'Invalid email format')
        .required('Username is required'),
});

const AccountSetting: React.FC = () => {
    const navigate = useNavigate();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const handleDelete = async (values: { username: string }) => {
        const uuidfromlocalstorage = localStorage.getItem('userid');
        let payload = {
            username: values.username,
            uuid: uuidfromlocalstorage
        };
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/delete-user`, payload);
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
    return (
        <>
            <Headercomponent />
            <div className="container-fluid mt-4">
                <h2 className="mb-3">Account Settings</h2>
                <hr />
                <p>Your details</p>
                <p>Display Name : {localStorage.getItem('userwelcomename')}</p>
                <p>Username : {localStorage.getItem('username')}</p>
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
            </div>
        </>
    );
};
export default AccountSetting;