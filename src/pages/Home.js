import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <div className="hero-section text-center py-5">
        <div className="container">
          <h1 className="display-4 mb-4">Welcome to Plate Palate</h1>
          <p className="lead mb-4">
            Discover unique culinary experiences and NFT-powered recipes from world-class chefs
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/menu" className="btn btn-primary btn-lg">
              Explore Recipes
            </Link>
            <Link to="/events" className="btn btn-outline-primary btn-lg">
              Book an Event
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card text-center p-4">
              <h3>NFT Recipes</h3>
              <p>Own unique recipes as digital assets</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-4">
              <h3>Chef Events</h3>
              <p>Book private cooking experiences</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-4">
              <h3>Community</h3>
              <p>Connect with food enthusiasts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 