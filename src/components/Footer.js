import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5 className="mb-4">Plate Palate</h5>
            <p className="mb-4">
              Discover unique culinary experiences and NFT-powered recipes from world-class chefs.
            </p>
          </div>
          <div className="col-lg-4">
            <h5 className="mb-4">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-light text-decoration-none">About</Link>
              </li>
              <li className="mb-2">
                <Link to="/menu" className="text-light text-decoration-none">Menu</Link>
              </li>
              <li className="mb-2">
                <Link to="/events" className="text-light text-decoration-none">Events</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-light text-decoration-none">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h5 className="mb-4">Contact Info</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                123 Culinary Street, Foodie District, NY 10001
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                info@platepalate.com
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                +1 (555) 123-4567
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Plate Palate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 