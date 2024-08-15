import React, { useState } from 'react';
import api from './api/ClientApi';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Added loading state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        try {
            const response_mail = await api.post(`/auth/post_email`, { email });
            const response_password = await api.post(`/auth/post_password`, { password });

            if (response_mail.data !== "Email is available") {
                setError(response_mail.data);
                return;
            }

            if (response_password.data !== "Password received") {
                setError(response_password.data);
                return;
            }

            const response = await api.post('/auth/signup', { name, email, password });

            if (response.data.success) {
                alert("Registration successful! Please check your email for verification.");
                navigate('/login');
            } else {
                setError('Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Registration failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="container">
            <h1>Register</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            {loading && <div className="spinner"></div>} {/* Activity Indicator */}
            <p className="text-link">
                Already have an account?{' '}
                <button className="link-button" onClick={() => navigate('/login')}>
                    Login
                </button>
            </p>
        </div>
    );
};

export default Register;
