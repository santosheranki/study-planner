import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import { useNavigate } from 'react-router-dom';
const keyBase64 = 'vI7cGtC3P7FAmG4+jL+VORhxPaF++5FZml+Kv3o4Rsw=';
const key = CryptoJS.enc.Base64.parse(keyBase64);
const encryptPassword = (password: any) => {
    const iv = CryptoJS.lib.WordArray.random(16); // 16-byte IV
    const encrypted = CryptoJS.AES.encrypt(password, key, { iv: iv });
    return `${iv.toString(CryptoJS.enc.Base64)}:${encrypted.toString()}`;
};
const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [formErrors, setFormErrors] = useState({ name: '', username: '', password: '' });
    const [touched, setTouched] = useState({ name: false, username: false, password: false });
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const handleRegister = async () => {
        const usernames = username;
        const passwords = password;
        const encryptedPassword = encryptPassword(passwords);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
                name: name,
                username: usernames,
                password: encryptedPassword
            });
            console.log("response", response, response.data)
            if (response.data.result === 1) {
                localStorage.setItem('userwelcomename', response.data.name)
                console.log('output came');
                setName('');
                setUsername('');
                setPassword('');
                toast.success('Registration success! Please login.');
            }
            console.log('Register response:', response.data);
        } catch (error) {
            toast.error('Duplicate Record! Please check the username entered');
        }
    };
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };
    const isFormValid = () => {
        const emailPattern = /^[a-zA-Z]+([.-]?[a-zA-Z0-9]+)*@([a-zA-Z]+([.-]?[a-zA-Z]))[.]{1}[a-zA-Z]{2,}$/;
        const namePattern = /^[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/;
        return (
            namePattern.test(name) &&
            emailPattern.test(username) &&
            password.length > 8
        );
    };
    const handleBlur = (field: string) => {
        setTouched({ ...touched, [field]: true });
        if (field === 'name') {
            const namePattern = /^[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/;
            if (!namePattern.test(name)) {
                setFormErrors((prevErrors) => ({ ...prevErrors, name: 'Name should only contain letters and spaces, and must start and end with a letter.' }));
            } else {
                setFormErrors((prevErrors) => ({ ...prevErrors, name: '' }));
            }
        } else if (field === 'username') {
            const emailPattern = /^[a-zA-Z]+([.-]?[a-zA-Z0-9]+)*@([a-zA-Z]+([.-]?[a-zA-Z]))[.]{1}[a-zA-Z]{2,}$/;
            if (!emailPattern.test(username)) {
                setFormErrors((prevErrors) => ({ ...prevErrors, username: 'Please enter a valid email address.' }));
            } else {
                setFormErrors((prevErrors) => ({ ...prevErrors, username: '' }));
            }
        }
    };
    const handleloginroute = () => {
        navigate('/');
    }
    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2>Register</h2>
                </div>
                <div className="card-body">
                    <form>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                className={`form-control ${formErrors?.name && touched.name ? 'is-invalid' : ''}`}
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => handleBlur('name')}
                                required
                            />
                            {formErrors.name && touched.name && (
                                <div className="invalid-feedback">{formErrors.name}</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">Register Email</label>
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
                            onClick={handleRegister}
                            disabled={!isFormValid()}
                        >
                            Register
                        </button>
                        <br />
                        <label htmlFor="">Having an Account? <a href="" onClick={handleloginroute}>Login</a></label>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default Register;