import React from 'react';

const Contact = () => {
  return (
    <div className="container py-6">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Contact Us</h1>
          <div className="row">
            <div className="col-md-6">
              <div className="contact-info">
                <h3>Get in Touch</h3>
                <p className="mb-4">
                  Have questions about our NFT recipes or event services? We'd love to hear from you!
                </p>
                <div className="mb-3">
                  <h5>Email</h5>
                  <p>info@platepalate.com</p>
                </div>
                <div className="mb-3">
                  <h5>Phone</h5>
                  <p>+1 (555) 123-4567</p>
                </div>
                <div className="mb-3">
                  <h5>Address</h5>
                  <p>
                    123 Culinary Street<br />
                    Foodie District<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <form className="contact-form">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Your Email"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Subject"
                    required
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Your Message"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 