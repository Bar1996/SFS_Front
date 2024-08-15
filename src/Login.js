import React, { useState } from 'react';
import api from './api/ClientApi';
import { useNavigate } from 'react-router-dom';
import { setToken } from './common/tokenStorage';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Added loading state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                const { accessToken, refreshToken } = response.data;
                await setToken(accessToken, refreshToken);
                console.log('Login successful');
                navigate('/home');  // Redirect to the home page
            } else {
                console.error('Login failed:', response.data);
                setError(`Login failed: ${response.data}`);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="container">
            <h1>Login</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
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
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {loading && <div className="spinner"></div>} {/* Activity Indicator */}
            <p className="text-link">
                Don’t have an account?{' '}
                <button className="link-button" onClick={() => navigate('/register')}>
                    Register
                </button>
            </p>
        </div>
    );
};

export default Login;
