import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './HeaderStyle.css';
import HeaderLinks from '../../Components/HeaderLinks.jsx';
import GooeyNav from './GooeyNav.jsx';
import navData from '../../data/MainPage/HeaderLinks.json';

function Header({ isMembers = false, style = {} }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSocials, setShowSocials] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // System Theme Support
    useEffect(() => {
        const root = document.documentElement;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = (e) => {
            if (e.matches) root.classList.add('dark');
            else root.classList.remove('dark');
        };
        apply(mq);
        mq.addEventListener('change', apply);
        
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            mq.removeEventListener('change', apply);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const socialLinks = {
        youtube: "https://www.youtube.com/",
        instagram: "https://www.instagram.com/sengunthar_in_business/",
        facebook: "https://www.facebook.com/people/Sengunthar-In-Business/61580019027353/#"
    };

    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const processedNavData = navData.map(link => {
        // If we're not on the home page, prepend / to hash links so they work
        const href = (!isHomePage && link.url.startsWith('#')) 
            ? `/${link.url}` 
            : link.url;
        return { label: link.name, href };
    });

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
    };

    const toggleSocials = () => {
        setShowSocials(!showSocials);
    };

    const popupStyle = {
        position: 'absolute',
        top: '125%', 
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#ffffff',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        zIndex: 1000,
        minWidth: 'max-content',
        alignItems: 'center',
        opacity: showSocials ? 1 : 0,
        visibility: showSocials ? 'visible' : 'hidden',
        transition: 'all 0.2s ease-in-out',
        marginTop: showSocials ? '0' : '-10px'
    };

    const arrowStyle = {
        position: 'absolute',
        top: '-6px',
        left: '50%',
        marginLeft: '-6px',
        width: '12px',
        height: '12px',
        backgroundColor: '#ffffff',
        transform: 'rotate(45deg)',
        borderLeft: '1px solid rgba(0,0,0,0.05)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
    };

    const iconStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer'
    };

    return (
        <div className="hed">
            <header className={`header ${scrolled ? 'scrolled' : ''}`} id="header" style={style}>
                <nav className="navbar">
                    <div className="container">
                        <div className="nav-brand">
                            <div 
                                className="logo-container" 
                                onClick={toggleSocials} 
                                style={{ cursor: 'pointer', position: 'relative' }}
                                title="Click to view Social Media"
                            >
                                <img
                                    src="/logo.webp"
                                    alt="Sengunthar in Business Logo"
                                    className="logo-image"
                                />
                                
                                <div className="social-popup" style={popupStyle}>
                                    <div style={arrowStyle}></div>
                                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" style={{ ...iconStyle, color: '#FF0000' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                                    </a>
                                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ ...iconStyle, color: '#E1306C' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                    </a>
                                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" style={{ ...iconStyle, color: '#1877F2' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    </a>
                                </div>
                            </div>

                            <div className="brand-info">
                                <span className="brand-text">Sengunthar in Business</span>
                            </div>
                        </div>

                        <div className="nav-menu desktop-menu">
                            <GooeyNav 
                                items={processedNavData}
                                particleCount={12}
                                animationTime={500}
                                colors={[1, 2, 3, 4]}
                            />
                        </div>

                        <div className={`burger-menu ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                            <span className="burger-line"></span>
                            <span className="burger-line"></span>
                            <span className="burger-line"></span>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Slide-over Menu */}
            <div className={`mobile-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}></div>
            <div className={`mobile-menu-panel ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    <GooeyNav 
                        items={processedNavData}
                        particleCount={10}
                        animationTime={400}
                        onItemClick={toggleMenu}
                        colors={[1, 2, 3, 4]}
                    />
                </div>
            </div>
        </div>
    );
}

export default Header;