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
          <h1>Welcome to BlockChain</h1>
          <p>Seamless Verification For Your Credentials.</p>
          {/* <a href="#" class="btn">Get Started</a> */}
        </div>
      </section>
      <section className="features">
        <div className="container">
          <div className="feature" onClick={() => navigateTo('/issuer')}>
            <h2>Issuer </h2>
            <p>Organization like school, university, etc.</p>
          </div>
          <div className="feature" onClick={() => navigateTo('/viewer')}>
            <h2>Student</h2>
            <p>Any individual whose credentials is stored on Blockchain.</p>
          </div>
          <div className="feature" onClick={() => navigateTo('/verifier')}>
            <h2>Verifier </h2>
            <p>Any individual can verify any document</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
