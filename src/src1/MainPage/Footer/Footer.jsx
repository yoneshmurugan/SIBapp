import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, X, ChevronRight, Facebook, Instagram, Youtube } from 'lucide-react';
import PrivacyPanel from "../../../Settings/components/PrivacyPanel";


// REPLACE THIS with your actual Backend URL or import it
const Backend_Server_URL = import.meta.env.VITE_BACKEND_SERVER;

// --- MOCK DATA (Replace with your actual imports) ---
const socialData = [
    { name: "Facebook", link: "https://www.facebook.com/people/Sengunthar-In-Business/61580019027353/#", icon: <Facebook size={20} /> },
    { name: "Instagram", link: "https://www.instagram.com/sengunthar_in_business/", icon: <Instagram size={20} /> },
    { name: "YouTube", link: "#", icon: <Youtube size={20} /> }
];

const MockHeaderLinks = ({ isMember }) => (
    <>
        <a href="#" className="footer-link"><ChevronRight size={14} /> Home</a>
        <a href="#about" className="footer-link"><ChevronRight size={14} /> About Us</a>
        <a href="/public-members" className="footer-link"><ChevronRight size={14} /> Members Directory</a>
        <a href="/album" className="footer-link"><ChevronRight size={14} /> Events</a>
        {isMember && <a href="#" className="footer-link"><ChevronRight size={14} /> Member Portal</a>}
    </>
);

// --- MAIN COMPONENT ---
function Footer({ margin = "auto", ismember = false }) {
    const [isIsoOpen, setIsoOpen] = useState(false);

    // Initial stats state (with fallbacks matching your original hardcoded values)
    const [stats, setStats] = useState({
        members: 138,
        verticals: 15,
        chapters: 2 // Chapters is usually static or calculated differently, keeping default
    });

    // Fetch Dynamic Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (!Backend_Server_URL) return;

                const response = await fetch(`${Backend_Server_URL}/public/stats`);
                if (!response.ok) throw new Error('Network response was not ok');

                const apiData = await response.json();

                // Map API data to footer state
                setStats(prev => ({
                    ...prev,
                    members: apiData.membershipcount || prev.members,
                    verticals: apiData.verticalcount || prev.verticals,
                    chapters: apiData.chaptercount || prev.chapters,
                    // If your API returns years/chapters you can map them here
                }));
            } catch (error) {
                console.error("Failed to fetch dynamic stats for footer:", error);
                // Keep initial data as fallback
            }
        };

        fetchStats();
    }, []);

    // Toggle scroll lock when modal opens
    const toggleIsoModal = () => {
        setIsoOpen(!isIsoOpen);
        if (!isIsoOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="fot">
            {/* --- ISO POPUP MODAL --- */}
            {isIsoOpen && (
                <div className="iso-modal-overlay" onClick={toggleIsoModal}>
                    <div className="iso-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="iso-close-btn" onClick={toggleIsoModal}>
                            <X size={24} />
                        </button>
                        <div className="iso-modal-body">
                            <h3>ISO 9001:2015 Certified</h3>
                            <p>Certificate Number: SIB-2025-XX</p>
                            <div className="iso-certificate-placeholder">
                                {/* Replace src with your actual certificate image */}
                                <img
                                    src="/sibiso2.jpg"
                                    alt="ISO Certificate View"
                                />
                            </div>
                            <p className="iso-desc">Recognized for excellence in business community management and operational standards.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="member">
                <footer className="footer">
                    <div className="footer-bg"></div>
                    <div className="container">
                        <div className="footer-content">

                            {/* 1. BRANDING & ISO SECTION */}
                            <div className="footer-section brand-section">
                                <div className="brand-header">
                                    <div className="logo-group">
                                        {/* Main Logo */}
                                        <div className="logo-container">
                                            <div className="logo-placeholder" >
                                                <img
                                                    src="/logo.webp"
                                                    alt="SIB Logo"
                                                    className="logo-image"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = 'SIB' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="brand-divider"></div>

                                        {/* ISO Button (Clickable) */}
                                        <div className="iso-badge" onClick={toggleIsoModal} title="View ISO Certificate">
                                            <img
                                                src="/sibiso.png"
                                                alt="ISO Certified"
                                            />
                                            <span className="iso-badge-text">ISO 9001<br />Certified</span>
                                        </div>
                                    </div>

                                    <div className="brand-text">
                                        <h4>Sengunthar in Business</h4>
                                        <p className="tagline">Empowering Business Excellence Through Unity</p>
                                    </div>
                                </div>

                                <p className="about-text">
                                    A premier business community fostering growth, collaboration, and cultural heritage.
                                </p>

                                <div className="social-links">
                                    {socialData.map((social, index) => (
                                        <a href={social.link} className="social-link" target="_blank" key={index} aria-label={social.name}>
                                            <span className="social-icon">{social.icon}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* 2. QUICK LINKS */}
                            <div className="footer-section links-section">
                                <h4>Quick Links</h4>
                                <div className="footer-links">
                                    <MockHeaderLinks isMember={ismember} />
                                </div>
                            </div>

                            {/* 3. CONTACT & INFO (The "Valid Things") */}
                            <div className="footer-section contact-section">
                                <h4>Contact Us</h4>
                                <div className="contact-info">
                                    <div className="contact-item">
                                        <MapPin size={18} className="contact-icon" />
                                        {/* <p>H96 Shop No5, Periyar Nagar Main Road,<br/>Erode, Tamil Nadu - 638009</p> */}
                                    </div>
                                    <div className="contact-item">
                                        <Phone size={18} className="contact-icon" />
                                        <p>+91 9842761144</p>
                                    </div>
                                    <div className="contact-item">
                                        <Mail size={18} className="contact-icon" />
                                        <p>members@senguntharinbusiness.in</p>
                                    </div>
                                </div>

                                <div className="stats-grid">
                                    <div className="stat-box">
                                        <span className="stat-num">{stats.members}+</span>
                                        <span className="stat-label">Members</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-num">{stats.verticals}</span>
                                        <span className="stat-label">Verticals</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-num">{stats.chapters}+</span>
                                        <span className="stat-label">chapters</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM BAR */}
                        <div className="footer-bottom">
                            <div className="footer-divider"></div>
                            <div className="bottom-content">
                                <p>&copy; {currentYear} Sengunthar in Business (SIB). All rights reserved.
                                    <br />ISO 9001:2015 Certified</p>
                                <div className="legal-links">
                                    <a href="/privacy-policy">Privacy Policy</a>
                                    <span>•</span>
                                    <a href="/privacy-policy">Terms of Service</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* --- INLINE CSS (Copy this to your FooterStyle.css) --- */}
            <style jsx>{`
                :root {
                    --warm-gold: #BFA181;
                    --gold-hover: #d4b896;
                    --royal-blue: #002349;
                    --deep-blue: #00152e;
                    --cream: #F2F0EA;
                    --gradient-primary: linear-gradient(135deg, var(--royal-blue) 0%, #0056b3 100%);
                }

                /* Layout & Base */
                .fot .footer {
                    background: var(--royal-blue);
                    color: white;
                    position: relative;
                    overflow: hidden;
                    padding: 60px 20px 20px;
                    font-family: 'Inter', sans-serif;
                }

                .fot .footer-bg {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    opacity: 0.1;
                    background-image: radial-gradient(circle at 10% 20%, rgba(191,161,129,0.3) 0%, transparent 20%),
                                      radial-gradient(circle at 90% 80%, rgba(191,161,129,0.3) 0%, transparent 20%);
                    pointer-events: none;
                }

                .fot .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 2;
                }

                /* Grid Layout */
                .fot .footer-content {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1.2fr;
                    gap: 4rem;
                    margin-bottom: 3rem;
                }

                /* 1. Branding Section */
                .fot .brand-header {
                    margin-bottom: 1.5rem;
                }

                .fot .logo-group {
                    display: inline-flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                    background: rgba(255,255,255,0.08);
                    padding: 12px 24px;
                    border-radius: 60px;
                    border: 1px solid rgba(255,255,255,0.15);
                    backdrop-filter: blur(5px);
                }

                .fot .logo-placeholder {
                    width: 60px; height: 60px;
                    background: white;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }
                
                .fot .logo-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .fot .brand-divider {
                    width: 1px;
                    height: 35px;
                    background: rgba(255,255,255,0.2);
                }

                /* ISO Badge Styling */
                .fot .iso-badge {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .fot .iso-badge:hover {
                    transform: scale(1.05);
                    opacity: 1;
                }
                .fot .iso-badge img {
                    height: 60px;
                    width: auto;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                }
                .fot .iso-badge-text {
                    font-size: 0.7rem;
                    color: var(--warm-gold);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 700;
                    line-height: 1.2;
                }

                .fot .brand-text h4 {
                    font-size: 1.4rem;
                    color: white;
                    margin: 0 0 8px 0;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }
                .fot .tagline {
                    color: var(--warm-gold);
                    font-size: 0.95rem;
                    font-style: italic;
                    margin: 0;
                    opacity: 0.9;
                }
                .fot .about-text {
                    color: rgba(255,255,255,0.75);
                    line-height: 1.7;
                    margin-bottom: 2rem;
                    max-width: 90%;
                    font-size: 0.95rem;
                }

                /* Social Links */
                .fot .social-links {
                    display: flex; gap: 12px;
                }
                .fot .social-link {
                    width: 40px; height: 40px;
                    background: rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 50%;
                    color: white;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .fot .social-link:hover {
                    background: var(--warm-gold);
                    color: var(--royal-blue);
                    transform: translateY(-3px);
                    border-color: var(--warm-gold);
                    box-shadow: 0 5px 15px rgba(191, 161, 129, 0.3);
                }

                /* 2. Links Section */
                .fot h4 {
                    color: white;
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    position: relative;
                    display: inline-block;
                    font-weight: 600;
                }
                .fot h4::after {
                    content: '';
                    position: absolute;
                    left: 0; bottom: -8px;
                    width: 40px; height: 3px;
                    background: var(--warm-gold);
                    border-radius: 2px;
                }

                .fot .footer-links {
                    display: flex; flex-direction: column; gap: 14px;
                }
                .fot .footer-link {
                    color: rgba(255,255,255,0.7);
                    text-decoration: none;
                    display: flex; align-items: center; gap: 10px;
                    transition: 0.3s;
                    font-size: 0.95rem;
                }
                .fot .footer-link:hover {
                    color: var(--warm-gold);
                    transform: translateX(5px);
                }

                /* 3. Contact & Stats Section */
                .fot .contact-info {
                    display: flex; flex-direction: column; gap: 18px;
                    margin-bottom: 30px;
                }
                .fot .contact-item {
                    display: flex; gap: 14px;
                    align-items: flex-start;
                    color: rgba(255,255,255,0.85);
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
                .fot .contact-icon {
                    color: var(--warm-gold);
                    flex-shrink: 0;
                    margin-top: 4px;
                }

                .fot .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    border-top: 1px solid rgba(255,255,255,0.15);
                    padding-top: 25px;
                }
                .fot .stat-box {
                    text-align: center;
                }
                .fot .stat-num {
                    display: block;
                    color: var(--warm-gold);
                    font-weight: 800;
                    font-size: 1.25rem;
                    margin-bottom: 4px;
                }
                .fot .stat-label {
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Bottom Bar */
                .fot .footer-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    margin-bottom: 1.5rem;
                }
                .fot .bottom-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: rgba(255,255,255,0.5);
                    font-size: 0.85rem;
                }
                .fot .legal-links {
                    display: flex; gap: 20px;
                }
                .fot .legal-links a {
                    color: rgba(255,255,255,0.5);
                    text-decoration: none;
                    transition: 0.2s;
                }
                .fot .legal-links a:hover {
                    color: var(--warm-gold);
                }

                /* --- MODAL STYLES --- */
                .iso-modal-overlay {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100vw; height: 100vh;
                    background: rgba(0, 35, 73, 0.9);
                    backdrop-filter: blur(8px);
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    animation: fadeIn 0.3s ease;
                }
                
                .iso-modal-content {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    position: relative;
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                    animation: scaleIn 0.3s ease;
                }

                .iso-close-btn {
                    position: absolute;
                    top: 15px; right: 15px;
                    background: none; border: none;
                    cursor: pointer; color: #999;
                    transition: 0.2s;
                    padding: 5px;
                    border-radius: 50%;
                }
                .iso-close-btn:hover { background: #eee; color: #d00; transform: rotate(90deg); }

                .iso-modal-body h3 { color: var(--royal-blue); margin-top: 0; font-size: 1.5rem; }
                .iso-certificate-placeholder {
                    margin: 25px 0;
                    border: 12px solid var(--cream);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .iso-certificate-placeholder img {
                    width: 100%; height: auto; display: block;
                }
                .iso-desc { font-size: 0.95rem; color: #555; line-height: 1.6; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                /* --- MOBILE OPTIMIZATION --- */
                @media (max-width: 900px) {
                    .fot .footer-content {
                        grid-template-columns: 1fr 1fr;
                        gap: 3rem;
                    }
                    .fot .brand-section {
                        grid-column: span 2;
                        text-align: center;
                        display: flex; flex-direction: column; align-items: center;
                    }
                    .fot .about-text { max-width: 100%; text-align: center; }
                    .fot .brand-text h4 { margin-top: 1rem; }
                    .fot h4::after { left: 50%; transform: translateX(-50%); }
                    .fot h4 { text-align: center; display: block; }
                    .fot .contact-info, .fot .footer-links { align-items: center; text-align: center; }
                    .fot .contact-item { justify-content: center; }
                }

                @media (max-width: 600px) {
                    .fot .footer { padding: 40px 20px 30px; }
                    .fot .footer-content {
                        display: flex; flex-direction: column;
                        gap: 3rem;
                    }
                    .fot .brand-section, .fot .links-section, .fot .contact-section {
                        grid-column: span 1;
                        display: flex; flex-direction: column; align-items: center; text-align: center;
                    }
                    
                    /* Refine Logo Group for Mobile */
                    .fot .logo-group {
                        padding: 10px 20px;
                        width: auto;
                        min-width: 280px;
                        justify-content: center;
                    }
                    
                    .fot .stats-grid {
                        width: 100%;
                        gap: 10px;
                    }
                    
                    .fot .bottom-content {
                        flex-direction: column;
                        gap: 15px;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}

export default Footer;