import React from 'react';
import EventForm from '../components/EventForm';

const Events = () => {
  return (
    <div className="container-fluid py-6">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-4">Book Your Event</h1>
          <p className="lead">
            Create unforgettable culinary experiences with our expert chefs and NFT-powered recipes
          </p>
        </div>
        <EventForm />
      </div>
    </div>
  );
};

export default Events; 