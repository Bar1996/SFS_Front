import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './style/styles.css';
import StartScreen from './StartScreen';
import Register from './Register';
import Login from './Login';
import Home from './Home';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StartScreen />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default App;
