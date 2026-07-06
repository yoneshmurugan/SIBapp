import React, { useState, useEffect, useRef } from "react";

/**
 * --- ICONS ---
 * Lightweight, inline SVG components.
 * Explicitly setting background to transparent to avoid artifacts.
 */

// UPDATED: Reverted to Share Icon, but with explicit transparency settings
// to prevent the "square background" issue.
const IconShare = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    width="1em" 
    height="1em" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ background: 'transparent' }} // Explicitly prevent background
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const IconTimes = () => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 352 512" 
    height="1em" 
    width="1em" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ background: 'transparent' }}
  >
    <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.19 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.19 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/>
  </svg>
);

const IconYoutube = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/>
  </svg>
);

const IconFacebook = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
  </svg>
);

const IconInstagram = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.9 0-184.9zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
  </svg>
);

const FAB_STYLES = `
/* Scoped Variables */
.fab-container {
  --fab-primary: #208090;
  --fab-primary-hover: #1d7480;
  --fab-text: #134252;
  --fab-bg: #ffffff;
  --fab-shadow: rgba(0, 0, 0, 0.15);
  --fab-size: 60px;
  --fab-item-size: 50px;
  
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  /* Scroll Visibility Animation */
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.3s ease;
}

.fab-container.hidden {
  transform: translateY(100px);
  opacity: 0;
  pointer-events: none;
}

.fab-container.visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: all;
}

/* --- MAIN BUTTON --- */
.fab-main {
  width: var(--fab-size);
  height: var(--fab-size);
  background: var(--fab-primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  box-shadow: 0 4px 12px rgba(32, 128, 144, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 20;
  
  /* Prevent default browser focus outline from being ugly */
  outline: none;
}

.fab-main:focus-visible {
  box-shadow: 0 0 0 3px rgba(32, 128, 144, 0.5);
}

.fab-main:hover {
  background: var(--fab-primary-hover);
  box-shadow: 0 8px 20px rgba(32, 128, 144, 0.6);
  transform: scale(1.05);
}

.fab-main:active {
  transform: scale(0.95);
}

/* Rotate the icon wrapper when open */
.fab-main .icon-wrapper {
margin-left: 1rem; 
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  background: transparent; /* Ensure no background on wrapper */
}

.fab-main.open .icon-wrapper {
  transform: rotate(90deg);
}

.fab-main.open {
  background: var(--fab-primary-hover);
}

/* --- MENU ITEMS --- */
.fab-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  left: 0; 
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 15px;
  pointer-events: none;
}

.fab-menu.open {
  pointer-events: all;
}

.fab-item {
  width: var(--fab-item-size);
  height: var(--fab-item-size);
  background: white;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--fab-primary);
  
  /* Initial State (Hidden) */
  opacity: 0;
  transform: translateY(20px) scale(0.5);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 8px var(--fab-shadow);
  position: relative;
}

.fab-menu.open .fab-item {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.fab-item:hover {
  transform: scale(1.15) !important;
  box-shadow: 0 6px 16px var(--fab-shadow);
  z-index: 30;
}

/* --- BRAND COLORS --- */
.fab-item.youtube { color: #FF0000; }
.fab-item.youtube:hover { background: #FF0000; color: white; border-color: #FF0000; }

.fab-item.facebook { color: #1877F2; }
.fab-item.facebook:hover { background: #1877F2; color: white; border-color: #1877F2; }

.fab-item.instagram { color: #E4405F; }
.fab-item.instagram:hover { background: #E4405F; color: white; border-color: #E4405F; }

/* --- TOOLTIP LABELS --- */
.fab-item-label {
  position: absolute;
  right: 60px;
  background: var(--fab-text);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s ease;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.fab-item-label::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -4px;
  transform: translateY(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: transparent transparent transparent var(--fab-text);
}

.fab-item:hover .fab-item-label {
  opacity: 1;
  transform: translateX(0);
}

/* --- MOBILE RESPONSIVENESS --- */
@media (max-width: 768px) {
  .fab-container {
    bottom: 20px;
    right: 20px;
    --fab-size: 56px;
    --fab-item-size: 46px;
  }
  
  .fab-item-label {
    font-size: 12px;
    padding: 4px 8px;
  }
}
`;

const Fab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const fabRef = useRef(null);
  const lastScrollY = useRef(0);

  // Configuration for Social Links
  const socialLinks = [
    {
      id: "youtube",
      icon: <IconYoutube />,
      label: "YouTube",
      url: "https://youtube.com",
      className: "youtube"
    },
    {
      id: "facebook",
      icon: <IconFacebook />,
      label: "Facebook",
      url: "https://www.facebook.com/people/Sengunthar-In-Business/61580019027353/#",
      className: "facebook"
    },
    {
      id: "instagram",
      icon: <IconInstagram />,
      label: "Instagram",
      url: "https://www.instagram.com/sengunthar_in_business/",
      className: "instagram"
    }
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fabRef.current && !fabRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle Scroll (Hide on scroll down, show on scroll up)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const SCROLL_THRESHOLD = 50; // Buffer before hiding

      // Always show at top or if scrolling UP
      if (currentScrollY < SCROLL_THRESHOLD) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && !isOpen) {
        // Scrolling DOWN & Menu Closed -> Hide
        setIsVisible(false);
      } else {
        // Scrolling UP -> Show
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    closeMenu();
  };

  return (
    <>
      <style>{FAB_STYLES}</style>

      <div 
        className={`fab-container ${isVisible ? "visible" : "hidden"}`} 
        ref={fabRef}
      >
        <div className={`fab-menu ${isOpen ? "open" : ""}`} role="menu">
          {socialLinks.map((link, index) => (
            <button
              key={link.id}
              className={`fab-item ${link.className}`}
              onClick={() => handleLinkClick(link.url)}
              aria-label={link.label}
              role="menuitem"
              // Prevent tabbing to hidden items
              tabIndex={isOpen ? 0 : -1} 
              style={{ transitionDelay: `${isOpen ? index * 50 : 0}ms` }}
            >
              <span className="fab-item-label">{link.label}</span>
              {link.icon}
            </button>
          ))}
        </div>

        <button 
          className={`fab-main ${isOpen ? "open" : ""}`} 
          onClick={toggleMenu}
          aria-label={isOpen ? "Close Menu" : "Open Share Menu"}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="icon-wrapper">
             {isOpen ? <IconTimes /> : <IconShare />}
          </div>
        </button>
      </div>
    </>
  );
};

export default Fab;