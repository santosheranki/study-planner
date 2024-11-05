import React, { useState } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import '../../src/login.css';
import 'font-awesome/css/font-awesome.min.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const keyBase64 = 'vI7cGtC3P7FAmG4+jL+VORhxPaF++5FZml+Kv3o4Rsw='; // Your 32-byte key in base64
const key = CryptoJS.enc.Base64.parse(keyBase64);
const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [invalidpassword, setinvalidpassword] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [formErrors, setFormErrors] = useState({ username: '', password: '' });
    const [touched, setTouched] = useState({ username: false, password: false });
    const navigate = useNavigate();
    const isFormValid = () => {
        const emailPattern = /^[a-zA-Z]+([.-]?[a-zA-Z0-9]+)*@([a-zA-Z]+([.-]?[a-zA-Z]))[.]{1}[a-zA-Z]{2,}$/;
        return emailPattern.test(username) && password.length > 8;
    };
    const handleLogin = async () => {
        const emailPattern = /^[a-zA-Z]+([.-]?[a-zA-Z0-9]+)*@([a-zA-Z]+([.-]?[a-zA-Z]))[.]{1}[a-zA-Z]{2,}$/;
        if (!emailPattern.test(username)) {
            setFormErrors((prevErrors) => ({ ...prevErrors, username: 'Please enter a valid email address.' }));
            return;
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
                username,
                password, // Send plain text password
            });
            console.log('Login successful:', response);
            if (response?.data?.result === 1) {
                localStorage.setItem('accessToken', response?.data?.accessToken);
                localStorage.setItem('refreshToken', response?.data?.refreshToken);
                navigate('/dashboard');
                localStorage.setItem('userid', response?.data?.userID);
                localStorage.setItem('userwelcomename', response?.data?.userwelcomename);
            }
            else if (response.data.result === 0 && response.data.message === 'Invalid password') {
                console.log("invalid passwrod");
                setinvalidpassword(true);
            }
            else {
                console.error("error");
            }
        } catch (error: any) {
            console.error('Error logging in:', error.response);
            if (error.response.data.result === 0 && error.response.data.message === 'User not found') {
                toast.error('The user ID entered does not exist. Please check the user ID and password');
                setTimeout(() => {
                    setUsername('');
                    setPassword('');
                }, 5000);
            }
            if (error.response.data.result === 0 && error.response.data.message === 'Invalid password') {
                toast.error('Invalid Password, Please re-check');
                setTimeout(() => {
                    setPassword('');
                }, 5000);
            }
        }
    };
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };
    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };
    const handleregister = () => {
        navigate('/register');
        setPassword('');
        setUsername('');
    }
    const handleBlur = (field: string) => {
        setTouched({ ...touched, [field]: true });
        if (field === 'username') {
            const emailPattern = /^[a-zA-Z]+([.-]?[a-zA-Z0-9]+)*@([a-zA-Z]+([.-]?[a-zA-Z]))[.]{1}[a-zA-Z]{2,}$/;
            if (!emailPattern.test(username)) {
                setFormErrors((prevErrors) => ({ ...prevErrors, username: 'Please enter a valid email address.' }));
            } else {
                setFormErrors((prevErrors) => ({ ...prevErrors, username: '' }));
            }
        } else if (!password) {
            setFormErrors((prevErrors) => ({ ...prevErrors, password: 'Please enter a password.' }));
        } else {
            setFormErrors((prevErrors) => ({ ...prevErrors, password: '' }));
        }
    };
    return (
        <div className="htmlcontent">
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h2>Login</h2>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    className={`form-control ${formErrors.username && touched.username ? 'is-invalid' : ''}`}
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onBlur={() => handleBlur('username')}
                                    required
                                />
                                {formErrors.username && touched.username && (
                                    <div className="invalid-feedback">{formErrors.username}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-group">
                                    <input
                                        type={passwordVisible ? 'text' : 'password'}
                                        className={`form-control ${formErrors.password && touched.password ? 'is-invalid' : ''}`}
                                        id="password"
                                        maxLength={64}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => handleBlur('password')}
                                        required
                                    />
                                    <div className="input-group-append">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={togglePasswordVisibility}
                                        >
                                            <i className={`fa ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`} />
                                        </button>
                                    </div>
                                </div>
                                {formErrors.password && touched.password && (
                                    <div className="invalid-feedback">{formErrors.password}</div>
                                )}
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary btn-block"
                                onClick={handleLogin}
                                disabled={!isFormValid()}
                            >
                                Login
                            </button>
                            <br />
                            <div className="d-flex justify-content-center">
                                <a onClick={handleForgotPassword}>Forgot Password?</a>
                            </div>
                            <label htmlFor="" className='d-flex justify-content-center'> No Account?  <a href="" onClick={handleregister}  >Create one </a> </label>
                            {invalidpassword && (
                                <div className="alert alert-danger" role="alert">
                                    Oops! Invalid password. Please check and try again.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login;