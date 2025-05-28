import React, { useState } from 'react';
import './EventForm.css';

const EventForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    date: '',
    guests: '',
    message: '',
    recipeNFT: false,
    allergies: [],
    noAllergies: false,
    otherAllergies: ''
  });

  const commonAllergies = [
    // Food Allergies
    { value: 'nuts', label: 'Tree Nuts', category: 'Food Allergies' },
    { value: 'peanuts', label: 'Peanuts', category: 'Food Allergies' },
    { value: 'shellfish', label: 'Shellfish', category: 'Food Allergies' },
    { value: 'fish', label: 'Fish', category: 'Food Allergies' },
    { value: 'milk', label: 'Milk/Dairy', category: 'Food Allergies' },
    { value: 'eggs', label: 'Eggs', category: 'Food Allergies' },
    { value: 'soy', label: 'Soy', category: 'Food Allergies' },
    { value: 'wheat', label: 'Wheat/Gluten', category: 'Food Allergies' },
    { value: 'sesame', label: 'Sesame', category: 'Food Allergies' },
    { value: 'corn', label: 'Corn', category: 'Food Allergies' },
    { value: 'mustard', label: 'Mustard', category: 'Food Allergies' },
    { value: 'celery', label: 'Celery', category: 'Food Allergies' },
    { value: 'lupin', label: 'Lupin', category: 'Food Allergies' },
    { value: 'sulfites', label: 'Sulfites', category: 'Food Allergies' },
    
    // Dietary Restrictions
    { value: 'vegetarian', label: 'Vegetarian', category: 'Dietary Restrictions' },
    { value: 'vegan', label: 'Vegan', category: 'Dietary Restrictions' },
    { value: 'halal', label: 'Halal', category: 'Dietary Restrictions' },
    { value: 'kosher', label: 'Kosher', category: 'Dietary Restrictions' },
    { value: 'paleo', label: 'Paleo', category: 'Dietary Restrictions' },
    { value: 'keto', label: 'Keto', category: 'Dietary Restrictions' },
    { value: 'low-carb', label: 'Low Carb', category: 'Dietary Restrictions' },
    { value: 'low-sodium', label: 'Low Sodium', category: 'Dietary Restrictions' },
    { value: 'low-fat', label: 'Low Fat', category: 'Dietary Restrictions' },
    { value: 'sugar-free', label: 'Sugar Free', category: 'Dietary Restrictions' }
  ];

  const groupedAllergies = commonAllergies.reduce((acc, allergy) => {
    if (!acc[allergy.category]) {
      acc[allergy.category] = [];
    }
    acc[allergy.category].push(allergy);
    return acc;
  }, {});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'noAllergies') {
      setFormData(prevState => ({
        ...prevState,
        noAllergies: checked,
        allergies: checked ? [] : prevState.allergies,
        otherAllergies: checked ? '' : prevState.otherAllergies
      }));
    } else if (name === 'allergies') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prevState => ({
        ...prevState,
        allergies: selectedOptions
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateForm = () => {
    if (formData.noAllergies) return true;
    if (formData.allergies.length > 0) return true;
    if (formData.otherAllergies.trim().length > 0) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please indicate any allergies or dietary restrictions, or check the "No Allergies" box');
      return;
    }
    console.log('Form submitted:', formData);
  };

  return (
    <div className="container py-6">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="event-form">
            <h2 className="text-center mb-4">Book Your Event</h2>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      placeholder="Your Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <select
                      className="form-control"
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Event Type</option>
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate</option>
                      <option value="birthday">Birthday</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="number"
                      className="form-control"
                      name="guests"
                      placeholder="Number of Guests"
                      value={formData.guests}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group allergies-section">
                    <div className="mb-3">
                      <div className="form-check mb-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="noAllergies"
                          id="noAllergies"
                          checked={formData.noAllergies}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="noAllergies">
                          No Allergies or Dietary Restrictions
                        </label>
                      </div>
                      {!formData.noAllergies && (
                        <div className="allergies-container">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Select Common Allergies and Dietary Restrictions</label>
                            <p className="text-muted small mb-2">Hold Ctrl/Cmd to select multiple options</p>
                            <select
                              className="form-control allergies-select"
                              name="allergies"
                              multiple
                              value={formData.allergies}
                              onChange={handleChange}
                              required={!formData.noAllergies}
                              size="6"
                            >
                              {Object.entries(groupedAllergies).map(([category, allergies]) => (
                                <optgroup key={category} label={category}>
                                  {allergies.map(allergy => (
                                    <option key={allergy.value} value={allergy.value}>
                                      {allergy.label}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                            <small className="text-muted d-block mt-1">
                              Selected: {formData.allergies.length} items
                            </small>
                          </div>
                          <div className="mt-3">
                            <label className="form-label fw-bold">Other Allergies or Restrictions</label>
                            <textarea
                              className="form-control"
                              name="otherAllergies"
                              placeholder="Please specify any other allergies or dietary restrictions not listed above (max 500 characters)"
                              value={formData.otherAllergies}
                              onChange={handleChange}
                              rows="3"
                              maxLength="500"
                              required={!formData.noAllergies && formData.allergies.length === 0}
                            ></textarea>
                            <small className="text-muted d-block mt-1">
                              {formData.otherAllergies.length}/500 characters
                            </small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      name="message"
                      placeholder="Additional Details"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                    ></textarea>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="recipeNFT"
                      id="recipeNFT"
                      checked={formData.recipeNFT}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="recipeNFT">
                      Include NFT Recipe Rights
                    </label>
                  </div>
                </div>
                <div className="col-12 text-center">
                  <button type="submit" className="btn btn-primary py-3 px-5">
                    Book Now
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm; 