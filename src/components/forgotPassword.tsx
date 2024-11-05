import React, { useState } from 'react';
import axios from 'axios';
import '../../src/components/forgotPassword.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const ForgotPassword: React.FC = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const [touched, setTouched] = useState<{ username?: boolean }>({});
    const [formErrors, setFormErrors] = useState<{ username?: string }>({});
    const emailPattern = /^[a-zA-Z]+([.-]?[a-zA-Z0-9]+)*@([a-zA-Z]+([.-]?[a-zA-Z]))[.]{1}[a-zA-Z]{2,}$/;
    const handleRequestReset = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, { username });
            toast.success(response.data.message);
            setUsername('');
            setFormErrors({});
            setTouched({});
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error sending reset link');
        }
    };
    const handlebacktologin = () => {
        navigate("/");
    }
    const handleBlur = (field: string) => {
        setTouched({ ...touched, [field]: true });
        if (field === 'username') {
            if (!emailPattern.test(username)) {
                setFormErrors((prevErrors) => ({ ...prevErrors, username: 'Please enter a valid email address.' }));
            } else {
                setFormErrors((prevErrors) => ({ ...prevErrors, username: '' }));
            }
        }
    };
    const isFormValid = () => {
        return emailPattern.test(username) && touched.username;
    };
    return (
        <div className="forgot-password-container">
            <div className="card-forgot">
                <h2>Forgot Password</h2>
                <input
                    type="text"
                    id="username"
                    className={`form-control ${formErrors.username && touched.username ? 'is-invalid' : ''}`}
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => handleBlur('username')}
                    required
                />
                {formErrors.username && touched.username && (
                    <div className="invalid-feedback">{formErrors.username}</div>
                )}
                <button onClick={handleRequestReset} disabled={!isFormValid()} className={`btn-reset ${!isFormValid() ? 'disabled' : ''}`} >
                    Send Reset Link
                </button>
                <br />
                <div>
                    <label className='backtologin' > <a onClick={handlebacktologin} >Back to Login</a></label>
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;