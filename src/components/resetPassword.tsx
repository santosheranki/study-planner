import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../src/components/resetPassword.css';
const ResetPassword: React.FC = () => {
    const query = new URLSearchParams(useLocation().search);
    const username = query.get('username') || '';
    const resetToken = query.get('resetToken') || '';
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [touched, setTouched] = useState<{ newPassword?: boolean; confirmPassword?: boolean }>({});
    const [formErrors, setFormErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
    const validatePassword = () => {
        let errors: { newPassword?: string; confirmPassword?: string } = {};
        if (newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters long.';
        }
        if (newPassword !== confirmPassword) {
            errors.confirmPassword = "Passwords don't match.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleResetPassword = async () => {
        if (!validatePassword()) return;
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset-password`, {
                username,
                resetToken,
                newPassword,
            });
            toast.success(response.data.message);
            setNewPassword('');
            setConfirmPassword('');
            setTouched({});
            setFormErrors({});
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error resetting password');
        }
    };
    const handleBlur = (field: 'newPassword' | 'confirmPassword') => {
        setTouched({ ...touched, [field]: true });
        validatePassword();
    };
    return (
        <div className="reset-password-container">
            <div className="card-reset">
                <h2>Reset Password</h2>
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    maxLength={64}
                    className={`form-control ${formErrors.newPassword && touched.newPassword ? 'is-invalid' : ''}`}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => handleBlur('newPassword')}
                />
                {formErrors.newPassword && touched.newPassword && (
                    <div className="invalid-feedback">{formErrors.newPassword}</div>
                )}
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    maxLength={64}
                    className={`form-control ${formErrors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                />
                {formErrors.confirmPassword && touched.confirmPassword && (
                    <div className="invalid-feedback">{formErrors.confirmPassword}</div>
                )}
                <button
                    onClick={handleResetPassword}
                    disabled={!!Object.keys(formErrors).length}
                    className="btn-reset"
                >
                    Reset Password
                </button>
            </div>
        </div>
    );
};
export default ResetPassword;