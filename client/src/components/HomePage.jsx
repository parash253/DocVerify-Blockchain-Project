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
       {/* Glitch Part Of Classified
      <div className="glitchpart">
        <div>
          <img className="glitch1" src="/classified.gif" alt="FireGiF" />
        </div>
      </div>
      <div className="box" onClick={() => navigateTo('/issuer')}>
        Issuer
      </div>
      <div className="box" onClick={() => navigateTo('/viewer')}>
        Viewer
      </div>
      <div className="box" onClick={() => navigateTo('/verifier')}>
        Verifier
      </div> */}

      <div className="glitchpart">
        <div>
          <img className="glitch1" src="/classified.gif" alt="FireGiF" />
        </div>
      </div>
      <section class="hero">
        <div class="container">
          <h1>Welcome to BlockChain</h1>
          <p>Seamless Verification For Your Credentials.</p>
          {/* <a href="#" class="btn">Get Started</a> */}
        </div>
      </section>
      <section class="features">
        <div class="container">
          <div class="feature" onClick={() => navigateTo('/issuer')}>
            <h2>Issuer </h2>
            <p>Organization like school, university, etc.</p>
          </div>
          <div class="feature" onClick={() => navigateTo('/viewer')}>
            <h2>Student</h2>
            <p>Any individual whose credentials is stored on Blockchain.</p>
          </div>
          <div class="feature" onClick={() => navigateTo('/verifier')}>
            <h2>Verifier </h2>
            <p>Any individual can verify any document</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
