import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="container py-6">
        <div className="row">
          <div className="col-12">
            <div className="about-content">
              <h1 className="text-center">About Plate Palate</h1>
              <p className="lead">
                Plate Palate is a revolutionary platform that combines culinary excellence with blockchain technology,
                allowing chefs to create, share, and monetize their unique recipes through NFTs.
              </p>
              <div className="row mt-5">
                <div className="col-md-6">
                  <h3>Our Mission</h3>
                  <p>
                    We're dedicated to empowering chefs and food enthusiasts by providing a platform where
                    culinary creativity meets digital innovation. Our NFT-powered recipe marketplace ensures
                    that chefs receive proper recognition and compensation for their unique creations.
                  </p>
                </div>
                <div className="col-md-6">
                  <h3>Our Vision</h3>
                  <p>
                    We envision a future where every chef can protect their intellectual property while
                    sharing their passion for food with the world. Through blockchain technology, we're
                    creating a new paradigm for recipe ownership and culinary innovation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 