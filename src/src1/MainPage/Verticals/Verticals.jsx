import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './Verticals.css';
// Ensure this path matches your project structure
import data from '../../data/MainPage/Verticals.json'; 

function Verticals() {
    // STATE:
    // domLoaded: Ensures we only render after hydration (prevents UI glitches).
    // initialSlides: We calculate this ONCE on mount to determine if we are starting on Mobile or Desktop.
    const [domLoaded, setDomLoaded] = useState(false);
    const [initialSlides, setInitialSlides] = useState(4); // Default to 4 (safe for desktop)

    useEffect(() => {
        // 1. Detect screen width immediately upon mount
        const updateInitialSlides = () => {
            const width = window.innerWidth;
            if (width < 600) {
                setInitialSlides(1);
            } else if (width < 900) {
                setInitialSlides(2);
            } else if (width < 1200) {
                setInitialSlides(3);
            } else {
                setInitialSlides(5);
            }
        };

        updateInitialSlides();
        setDomLoaded(true);
    }, []);

    // CONFIGURATION: 
    // We use standard Desktop-First logic but inject 'initialSlides' as the default.
    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        // DYNAMIC DEFAULT: This prevents the "Stretch" on desktop and "Squeeze" on mobile
        slidesToShow: initialSlides, 
        slidesToScroll: 1,
        autoplay: true,
        swipeToSlide: true,
        autoplaySpeed: 2500,
        pauseOnHover: false,
        arrows: false,
        cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
        // Standard Desktop-First Breakpoints (max-width)
        responsive: [
            {
                breakpoint: 1200, // < 1200px
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 900, // < 900px
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 600, // < 600px
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                    centerPadding: '20px',
                    dots: false 
                }
            }
        ]
    };

    const renderVerticals = () => {
        if (!data || data.length === 0) return <p className="text-center">No verticals available</p>;
        
        return data.map((vertical, index) => (
            <div className="slide-wrapper" key={index}>
                <div className="vertical-card flip-card">
                    <div className="flip-card-inner">
                        {/* Front Side */}
                        <div className="flip-card-front">
                            <div className="card-shine"></div>
                            <div className="vertical-image">
                                <img src={vertical.img} alt={vertical.title} loading="lazy" />
                            </div>
                            <div className="content-front">
                                <h3>{vertical.title}</h3>
                                {vertical.members && (
                                    <div className="member-badge">{vertical.members}</div>
                                )}
                            </div>
                        </div>
                        {/* Back Side */}
                        <div className="flip-card-back">
                            <div className="card-shine"></div>
                            <h4>{vertical.title}</h4>
                            <p>{vertical.description}</p>
                            <div className="stats">
                                <span className="stat-label">Active Network</span>
                                <span className="stat-value">{vertical.activeMembers}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className="ver">
            <section id="verticals" className="verticals">
                <div className="container">
                    <div className="section-header">
                        <div className="section-tag">Our Network</div>
                        <h2 className="section-title">Business Verticals</h2>
                        <p className="section-subtitle">Diverse industries united under one vision of excellence</p>
                    </div>
                    
                    <div className="verticals-slider-container">
                        {/* Only render slider when we know the screen size */}
                        {domLoaded && (
                            <Slider {...settings} key={initialSlides}>
                                {renderVerticals()}
                            </Slider>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Verticals;