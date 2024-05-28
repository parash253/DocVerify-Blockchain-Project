import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Create a CSS file for styling if needed

const HomePage = () => {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="home-page">
      <div className="box" onClick={() => navigateTo('/issuer')}>
        Issuer
      </div>
      <div className="box" onClick={() => navigateTo('/viewer')}>
        Viewer
      </div>
      <div className="box" onClick={() => navigateTo('/verifier')}>
        Verifier
      </div>
    </div>
  );
};

export default HomePage;
