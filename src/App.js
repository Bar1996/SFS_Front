import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './style/styles.css';
import StartScreen from './StartScreen';
import Register from './Register';
import Login from './Login';
import Home from './Home';

function App() {
    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android|iPad|iPhone|iPod/.test(userAgent)) {
        setIsMobile(true);
      }
    }, []);
  
    if (isMobile) {
      return (
        <div className="mobile-warning">
          <h1>Access Denied</h1>
          <p>This site is not available on mobile devices. Please visit using a desktop or laptop.</p>
        </div>
      );
    }
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
