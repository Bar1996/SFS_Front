import React from 'react';
import { useNavigate } from 'react-router-dom';

const StartScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="container">
            <h1>Welcome to Our App</h1>
            <div className="button-container">
                <button onClick={() => navigate('/register')}>
                    Register
                </button>
                <button onClick={() => navigate('/login')}>
                    Login
                </button>
            </div>
        </div>
    );
};

export default StartScreen;
