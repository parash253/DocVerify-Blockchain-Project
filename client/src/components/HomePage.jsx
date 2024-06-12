import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Create a CSS file for styling if needed

const HomePage = () => {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div>
      <div className="glitchpart">
        <div>
          <img className="glitch1" src="/classified.gif" alt="FireGiF" />
        </div>
      </div>
      <section className="hero">
        <div className="container">
          <h1>SPARROT</h1>
          <h1>Welcome to BlockChain</h1>
          <p>Seamless Verification For Your Credentials.</p>
        </div>
      </section>
      <div className="box-container">
        <div className="box" onClick={() => navigateTo('/issuer')}>
          <h2>Issuer Portal </h2>
          <p>Organization like school, university, etc.</p>
        </div>
        <div className="box" onClick={() => navigateTo('/viewer')}>
          <h2>Student Portal</h2>
          <p>Any individual whose credentials is stored on Blockchain.</p>
        </div>
        <div className="box" onClick={() => navigateTo('/verifier')}>
          <h2>Verifier Portal</h2>
          <p>Any individual can verify any document</p>
        </div>
      </div>

    </div>
  );
};
export default HomePage;
