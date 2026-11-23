import React, { useState } from "react";

// Embedded styles to ensure single-file compatibility and reliability
const styles = `
/* -----------------------------------------------------------
   THEME VARIABLES
   Centralized colors for the SIB Theme (Navy & Gold)
----------------------------------------------------------- */
:root {
  --sib-navy: #0a2342;
  --sib-navy-light: #153359;
  --sib-gold: #d4b896;
  --sib-gold-hover: #bfa07a;
  --sib-bg: #f9f7f3;
  --sib-white: #ffffff;
  --sib-text-main: #1f2937;
  --sib-text-light: #6b7280;
  --sib-border: #e5e7eb;
  --sib-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --sib-shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

/* -----------------------------------------------------------
   SECTION LAYOUT
----------------------------------------------------------- */
.sib-contact-section {
  background-color: var(--sib-bg);
  padding: 5rem 1.5rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--sib-text-main);
  display: flex;
  justify-content: center;
}

.sib-container {
  width: 100%;
  max-width: 1100px;
}

/* -----------------------------------------------------------
   HEADER
----------------------------------------------------------- */
.sib-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 3.5rem auto;
}

.sib-tag {
  display: inline-block;
  background-color: var(--sib-gold);
  color: var(--sib-navy);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.35rem 1rem;
  border-radius: 99px;
  margin-bottom: 1rem;
}

.sib-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--sib-navy);
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.sib-subtitle {
  color: var(--sib-text-light);
  font-size: 1.1rem;
  line-height: 1.6;
}

/* -----------------------------------------------------------
   GRID LAYOUT
----------------------------------------------------------- */
.sib-content-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 2rem;
  align-items: start;
}

/* -----------------------------------------------------------
   CARDS & INFO COLUMN
----------------------------------------------------------- */
.sib-info-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sib-card {
  background: var(--sib-white);
  border: 1px solid var(--sib-border);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--sib-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Info Card Specifics */
.info-card {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--sib-shadow-hover);
}

.icon-wrapper {
  background-color: rgba(212, 184, 150, 0.2);
  color: var(--sib-navy);
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.25rem;
  flex-shrink: 0;
}

.icon-wrapper svg {
  width: 24px;
  height: 24px;
}

.info-text h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--sib-navy);
  margin: 0 0 0.25rem 0;
}

.info-text address,
.info-text a {
  font-style: normal;
  color: var(--sib-text-light);
  font-size: 0.95rem;
  line-height: 1.5;
}

.link-hover {
  transition: color 0.2s;
}

.info-card:hover .link-hover {
  color: var(--sib-navy-light);
  text-decoration: underline;
}

/* -----------------------------------------------------------
   SOCIAL FOLLOW CARD
----------------------------------------------------------- */
.social-follow-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-follow-header h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--sib-navy);
  margin: 0 0 0.25rem 0;
}

.social-follow-header p {
  color: var(--sib-text-light);
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
}

.social-links-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--sib-border);
  background-color: #faf9f6;
  text-decoration: none;
  transition: all 0.2s ease;
  color: inherit;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10, 35, 66, 0.08);
  border-color: var(--sib-gold);
}

.social-btn-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.social-btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.social-btn-icon.instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: #fff;
}

.social-btn-icon.facebook {
  background-color: #1877f2;
  color: #fff;
}

.social-btn-text h5 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--sib-navy);
}

.social-btn-text span {
  font-size: 0.75rem;
  color: var(--sib-text-light);
}

.social-arrow-icon {
  color: #9ca3af;
  transition: transform 0.2s ease, color 0.2s ease;
}

.social-btn:hover .social-arrow-icon {
  color: var(--sib-navy);
  transform: translate(2px, -2px);
}

/* -----------------------------------------------------------
   NATIVE CONTACT FORM CARD
----------------------------------------------------------- */
.contact-form-card {
  padding: 2.25rem;
  display: flex;
  flex-direction: column;
}

.contact-form {
  width: 100%;
}

.form-header-internal {
  margin-bottom: 1.75rem;
}

.form-header-internal h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--sib-navy);
  margin: 0 0 0.35rem 0;
}

.form-header-internal p {
  color: var(--sib-text-light);
  font-size: 0.95rem;
  margin: 0;
}

.required-star {
  color: #dc2626;
  font-weight: 700;
}

.form-grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
}

.form-grid-row .form-group {
  margin-bottom: 0;
}

.form-group label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--sib-navy);
  margin-bottom: 0.45rem;
}

.form-input {
  width: 100%;
  padding: 0.85rem 1rem;
  background-color: #fcfcfc;
  border: 1px solid var(--sib-border);
  border-radius: 0.65rem;
  font-size: 1rem;
  color: var(--sib-text-main);
  transition: all 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--sib-navy);
  background-color: var(--sib-white);
  box-shadow: 0 0 0 3px rgba(10, 35, 66, 0.12);
}

textarea.form-input {
  resize: vertical;
  min-height: 120px;
}

.form-alert {
  padding: 0.85rem 1rem;
  border-radius: 0.65rem;
  font-size: 0.88rem;
  font-weight: 500;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-alert.error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.sib-btn-primary {
  width: 100%;
  padding: 1rem;
  background-color: var(--sib-navy);
  color: var(--sib-white);
  border: none;
  border-radius: 0.65rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: background-color 0.2s, transform 0.1s, opacity 0.2s;
  box-shadow: 0 4px 6px -1px rgba(10, 35, 66, 0.15);
}

.sib-btn-primary:hover:not(:disabled) {
  background-color: var(--sib-navy-light);
  transform: translateY(-1px);
  box-shadow: 0 6px 10px -1px rgba(10, 35, 66, 0.2);
}

.sib-btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.sib-btn-primary:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.spinner-icon {
  width: 18px;
  height: 18px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Success State */
.form-success-state {
  text-align: center;
  padding: 3.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.success-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #ecfdf5;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
}

.success-icon-wrapper svg {
  width: 32px;
  height: 32px;
}

.form-success-state h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--sib-navy);
  margin: 0 0 0.5rem 0;
}

.form-success-state p {
  color: var(--sib-text-light);
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 440px;
  margin: 0 auto;
}

.sib-btn-secondary {
  margin-top: 1.75rem;
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: var(--sib-navy);
  border: 1.5px solid var(--sib-navy);
  border-radius: 0.5rem;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sib-btn-secondary:hover {
  background-color: var(--sib-navy);
  color: #fff;
  transform: translateY(-1px);
}

/* -----------------------------------------------------------
   MOBILE RESPONSIVENESS
----------------------------------------------------------- */
@media (max-width: 900px) {
  .sib-content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .sib-info-column {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .sib-card.info-card {
    flex: 1;
    min-width: 280px;
  }

  .social-follow-card {
    flex: 1;
    min-width: 280px;
  }
}

@media (max-width: 650px) {
  .sib-contact-section {
    padding: 3rem 1rem;
  }
  
  .sib-title {
    font-size: 2rem;
  }
  
  .form-grid-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-grid-row .form-group {
    margin-bottom: 1.25rem;
  }
  
  .contact-form-card {
    padding: 1.5rem 1.25rem;
  }
}
`;

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    business: "",
    message: ""
  });

  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your phone number.");
      return;
    }

    if (!formData.message.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your message.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_SERVER || "";
      const response = await fetch(`${backendUrl}/public/contact-us`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to send message. Please try again later.");
      }
    } catch (err) {
      console.error("Contact form submission error:", err);
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <section id="contact" className="sib-contact-section">
        <div className="sib-container">
          
          {/* Section Header */}
          <header className="sib-header">
            <span className="sib-tag">Get In Touch</span>
            <h2 className="sib-title">Connect With SIB</h2>
            <p className="sib-subtitle">
              Have questions? Join our thriving community of business leaders today.
            </p>
          </header>

          <div className="sib-content-grid">
            
            {/* Left Column: Contact Information */}
            <div className="sib-info-column">
              
              {/* Location Card */}
              <a
                href="https://maps.app.goo.gl/oQvWDiGHgVvDCnvWA?g_st=ipc"
                target="_blank"
                rel="noopener noreferrer"
                className="sib-card info-card"
              >
                <div className="icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="info-text">
                  <h4>Visit Office</h4>
                  <address>
                    Erode, Tamil Nadu
                  </address>
                </div>
              </a>

              {/* Phone Card */}
              <div className="sib-card info-card">
                <div className="icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="info-text">
                  <h4>Call Us</h4>
                  <a href="tel:+919842761144" className="link-hover">+91 9842761144</a>
                </div>
              </div>

              {/* Email Card */}
              <div className="sib-card info-card">
                <div className="icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="info-text" style={{ minWidth: 0 }}>
                  <h4>Email Us</h4>
                  <a 
                    href="mailto:senguntharinbusinesserode@gmail.com" 
                    className="link-hover" 
                    style={{ wordBreak: 'break-all', fontSize: '0.88rem' }}
                  >
                    senguntharinbusinesserode@gmail.com
                  </a>
                </div>
              </div>

              {/* Follow Us Card */}
              <div className="sib-card social-follow-card">
                <div className="social-follow-header">
                  <h4>Follow Us</h4>
                  <p>Stay updated with member stories, events & business reels.</p>
                </div>

                <div className="social-links-list">
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/sengunthar_in_business/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn"
                    aria-label="Follow SIB on Instagram"
                  >
                    <div className="social-btn-left">
                      <div className="social-btn-icon instagram">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </div>
                      <div className="social-btn-text">
                        <h5>Instagram</h5>
                        <span>@sengunthar_in_business</span>
                      </div>
                    </div>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="social-arrow-icon">
                      <path d="M7 17l9.2-9.2M17 17V8H8" />
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/profile.php?id=61584546941155&sk=reels_tab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn"
                    aria-label="Follow SIB on Facebook"
                  >
                    <div className="social-btn-left">
                      <div className="social-btn-icon facebook">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <div className="social-btn-text">
                        <h5>Facebook</h5>
                        <span>Sengunthar In Business</span>
                      </div>
                    </div>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="social-arrow-icon">
                      <path d="M7 17l9.2-9.2M17 17V8H8" />
                    </svg>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Native SIB Contact Form */}
            <div className="sib-card contact-form-card">
              {status === "success" ? (
                <div className="form-success-state">
                  <div className="success-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3>Message Sent Successfully!</h3>
                  <p>
                    Thank you for reaching out to Sengunthar In Business. Your message has been forwarded to our leadership team. We will get in touch with you shortly.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => {
                      setStatus("idle");
                      setFormData({ name: "", email: "", phone: "", business: "", message: "" });
                    }}
                    className="sib-btn-secondary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <div className="form-header-internal">
                    <h3>Send a Message</h3>
                    <p>Fill out the form below and our team will get back to you shortly.</p>
                  </div>

                  {status === "error" && (
                    <div className="form-alert error">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{errorMessage || "Failed to send message. Please try again."}</span>
                    </div>
                  )}

                  <div className="form-grid-row">
                    <div className="form-group">
                      <label htmlFor="name">
                        Full Name <span className="required-star">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input" 
                        placeholder="e.g. Siva Kumar" 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">
                        Email Address <span className="required-star">*</span>
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input" 
                        placeholder="e.g. siva@example.com" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-grid-row">
                    <div className="form-group">
                      <label htmlFor="phone">
                        Phone Number <span className="required-star">*</span>
                      </label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input" 
                        placeholder="e.g. +91 98765 43210" 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="business">Business Name (Optional)</label>
                      <input 
                        type="text" 
                        id="business" 
                        name="business" 
                        value={formData.business}
                        onChange={handleChange}
                        className="form-input" 
                        placeholder="e.g. SIB Textiles" 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">
                      Message <span className="required-star">*</span>
                    </label>
                    <textarea 
                      id="message" 
                      name="message" 
                      value={formData.message}
                      onChange={handleChange}
                      className="form-input" 
                      rows="4" 
                      placeholder="How can we assist you or connect with your business?" 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="sib-btn-primary" 
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <>
                        <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
