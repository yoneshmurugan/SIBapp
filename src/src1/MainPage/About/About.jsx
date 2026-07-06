import React from 'react';
import './AboutStyle.css';
import data from '../../data/MainPage/About.json';

function About() {

    const renderAbout = data.map((about, index) => {
        return (
            <div className="timeline-item-container" key={index}>
                <div className="timeline-item">
                    <h3>{about.title}</h3>
                    <p className="tamil">{about.description_tamil}</p>
                    <p className="en">{about.description_en}</p>
                </div>
                <div className="timeline-image">
                    <img src={about.image} alt={about.image_alt} />
                </div>
            </div>
        )
    })

    return (
        <section id="about" className="about">
            {/* Background container for the fixed watermark */}
            <div className="section-bg"></div>
            
            <div className="container">
                <div className="section-header">
                    <div className="section-tag">About Us</div>
                    <h2 className="section-title">Fostering Growth & Unity</h2>
                    <p className="section-subtitle">Building bridges between tradition and innovation in business excellence</p>
                </div>
                <div className="about-content">
                    {renderAbout}
                </div>
            </div>
        </section>
    );
}

export default About;