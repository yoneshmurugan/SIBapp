import React, { useEffect, useRef } from "react";

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
  grid-template-columns: 1fr 1.6fr; /* Info is smaller, Form is larger */
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
  background-color: rgba(212, 184, 150, 0.2); /* Transparent Gold */
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
   CTA / JOIN CARD
----------------------------------------------------------- */
.cta-card {
   /* Distinct border */
  text-align: center;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cta-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--sib-shadow-hover);
}

.cta-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--sib-navy);
  margin-bottom: 0.75rem;
}

.cta-desc {
  color: var(--sib-text-light);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.sib-cta-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--sib-navy);
  color: var(--sib-white);
  padding: 0.85rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.sib-cta-btn:hover {
  background-color: var(--sib-navy-light);
  transform: translateY(-1px);
}

/* -----------------------------------------------------------
   FORM STYLES
----------------------------------------------------------- */
.jotform-container {
  background: var(--sib-white);
  border: 1px solid var(--sib-border);
  border-radius: 1rem;
  padding: 0.75rem;
  box-shadow: var(--sib-shadow);
  min-height: 560px;
  width: 100%;
  overflow: hidden;
}

.jotform-container iframe {
  width: 100% !important;
  border: none !important;
}

.contact-form {
  padding: 2.5rem;
}

.form-header-internal {
  margin-bottom: 2rem;
}

.form-header-internal h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sib-navy);
  margin: 0 0 0.5rem 0;
}

.form-header-internal p {
  color: var(--sib-text-light);
  font-size: 0.95rem;
}

.form-grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.form-grid-row .form-group {
  margin-bottom: 0;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--sib-navy);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.85rem 1rem;
  background-color: #fcfcfc;
  border: 1px solid var(--sib-border);
  border-radius: 0.5rem;
  font-size: 1rem; /* 16px prevents iOS zoom */
  color: var(--sib-text-main);
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--sib-navy);
  background-color: var(--sib-white);
  box-shadow: 0 0 0 3px rgba(10, 35, 66, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 120px;
}

/* Submit Button */
.sib-btn-primary {
  width: 100%;
  padding: 1rem;
  background-color: var(--sib-navy);
  color: var(--sib-white);
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: background-color 0.2s, transform 0.1s;
}

.sib-btn-primary:hover {
  background-color: var(--sib-navy-light);
  transform: translateY(-1px);
}

.sib-btn-primary:active {
  transform: translateY(0);
}

/* Form Message */
.form-message {
  margin-top: 1.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-message.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.form-message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* -----------------------------------------------------------
   MOBILE RESPONSIVENESS
----------------------------------------------------------- */
@media (max-width: 900px) {
  .sib-content-grid {
    grid-template-columns: 1fr; /* Stack layout */
    gap: 2rem;
  }
  
  .sib-info-column {
    flex-direction: row; /* Horizontal info cards on tablets */
    flex-wrap: wrap;
  }
  
  .sib-card.info-card {
    flex: 1;
    max-width: 350px;
  }

  .cta-card {
    flex: 1;
    min-width: 300px;
  }
}

@media (max-width: 650px) {
  .sib-contact-section {
    padding: 3rem 1rem;
  }

  .sib-title {
    font-size: 2rem;
  }

  .sib-info-column {
    flex-direction: column; /* Back to vertical stack on phone */
  }

  .form-grid-row {
    grid-template-columns: 1fr; /* Stack form inputs */
    gap: 0;
  }
  
  .form-grid-row .form-group {
    margin-bottom: 1.5rem;
  }

  .jotform-container {
  background: var(--sib-white);
  border: 1px solid var(--sib-border);
  border-radius: 1rem;
  padding: 0.75rem;
  box-shadow: var(--sib-shadow);
  min-height: 560px;
  width: 100%;
  overflow: hidden;
}

.jotform-container iframe {
  width: 100% !important;
  border: none !important;
}

.contact-form {
    padding: 1.5rem;
  }
}
`;

function Contact() {
  const jotformRef = useRef(null);

  useEffect(() => {
    const container = jotformRef.current;
    if (!container) return;

    // Clear to avoid duplicate embeds on re-render / hot reload
    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://form.jotform.com/jsform/263192106281048";
    script.type = "text/javascript";
    script.async = true;
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="info-text">
                  <h4>Visit Office</h4>
                  <address>
                    {/* H96 Shop No5, Periyar Nagar Main Road,<br />
                    Erode - 638001, Tamil Nadu */}
                  </address>
                </div>
              </a>

              {/* Phone Card */}
              <div className="sib-card info-card">
                <div className="icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div className="info-text">
                  <h4>Call Us</h4>
                  <a href="tel:+919842761144" className="link-hover">+91 9842761144</a>
                </div>
              </div>

            </div>

            {/* Right Column: Embedded JotForm */}
            <div 
              ref={jotformRef} 
              className="sib-card jotform-container"
            />

          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
