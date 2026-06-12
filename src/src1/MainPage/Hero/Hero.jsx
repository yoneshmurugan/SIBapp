import React, { useEffect, useRef, useState } from 'react'
import './HeroStyle.css'
import data from '../../data/MainPage/HeroStats.json'

const Backend_Server_URL = import.meta.env.VITE_BACKEND_SERVER;

// 1. CONFIGURATION: Define the values you want to ADD to the backend data here.
// Example: If backend sends 2 chapters and you put 5 here, total will be 7.
const ADDITIONAL_VALUES = {
    chapters: 0,
    members: 0,
    verticals: 0,
    referrals: 2828,
    businessValue: 319495833 // e.g. adding 1 Lakh to business value
};

function Hero() {
    const statsRef = useRef(null);
    const typewriterRef = useRef(null);
    const isAnimatedRef = useRef(false);
    const animationFrameIds = useRef([]);

    // 2. OPTIMIZATION: Initialize state merging local JSON + Additional Values immediately
    // This prevents the numbers from looking "empty" before the API loads.
    const [stats, setStats] = useState(() => {
        return data.stats.map(stat => {
            // Map JSON keys to our config keys safely if needed, or just use initial values
            return stat; 
        });
    });

    // --- Helper: Format Indian Numbers ---
    const formatIndianNumber = (num) => {
        if (!num) return 0;
        const value = Number(num);
        if (value >= 10000000) return (value / 10000000).toFixed(1).replace(/\.0$/, '') + ' Cr+';
        if (value >= 100000) return (value / 100000).toFixed(1).replace(/\.0$/, '') + ' Lakh+';
        if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + ' K+';
        return value;
    };

    const handleRedirect = (link) => {
        if (link) window.location.href = link;
    };

    const clearRunningAnimations = () => {
        animationFrameIds.current.forEach(id => cancelAnimationFrame(id));
        animationFrameIds.current = [];
    };

    // --- Fetch & Calculation Logic ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${Backend_Server_URL}/public/stats`);
                if (!response.ok) throw new Error('Network response was not ok');

                const apiData = await response.json();

                // 3. LOGIC: Calculate Total (API Value + Additional Value)
                // We use Number() to ensure we don't accidentally concatenate strings (e.g. "5"+"2" = "52")
                const dynamicStats = [
                    { 
                        name: "Chapters", 
                        value: Number(apiData.chaptercount || 0) + ADDITIONAL_VALUES.chapters 
                    },
                    { 
                        name: "Members", 
                        value: Number(apiData.membershipcount || 0) + ADDITIONAL_VALUES.members 
                    },
                    { 
                        name: "Verticals", 
                        value: Number(apiData.verticalcount || 0) + ADDITIONAL_VALUES.verticals 
                    },
                    { 
                        name: "Referrals", 
                        value: Number(apiData.referralcount || 0) + ADDITIONAL_VALUES.referrals 
                    },
                    { 
                        name: "Business Value", 
                        value: Number(apiData.bussinessamount || 0) + ADDITIONAL_VALUES.businessValue 
                    }
                ];

                setStats(prevStats => {
                    const isDifferent = JSON.stringify(prevStats) !== JSON.stringify(dynamicStats);
                    return isDifferent ? dynamicStats : prevStats;
                });

            } catch (error) {
                console.error("Failed to fetch stats, falling back to local data:", error);
                // Optional: If fetch fails, you could setStats using just the ADDITIONAL_VALUES here
            }
        };

        fetchStats();
    }, []);

    // --- Animation Logic ---
    useEffect(() => {
        // Typewriter Effect
        const setupTypewriterEffect = () => {
            const typewriterElements = document.querySelectorAll('.hero .animate-typewriter');
            typewriterElements.forEach((element, index) => {
                const text = element.getAttribute('data-text') || element.textContent;
                const delay = parseInt(element.getAttribute('data-delay')) || index * 1000;
                
                element.textContent = '';
                element.style.width = '0';
                element.style.borderRight = '2px solid var(--warm-gold)'; // Ensure this var exists in CSS

                setTimeout(() => typeWriter(element, text), delay);
            });
        };

        const typeWriter = (element, text) => {
            let i = 0;
            element.style.width = 'auto';
            element.style.display = 'inline-block';
            
            // Optimization: Clear existing interval if any (safety check)
            if(element.typewriterTimer) clearInterval(element.typewriterTimer);

            element.typewriterTimer = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(element.typewriterTimer);
                    setTimeout(() => { element.style.borderRight = 'none'; }, 100);
                }
            }, 30);
        };

        // Counter Animation
        const animateCounters = (selector) => {
            const counters = document.querySelectorAll(selector);
            
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                if (isNaN(target)) return;

                const startValue = parseFloat(counter.getAttribute('data-current-value')) || 0;
                if (startValue === target) {
                    counter.textContent = formatIndianNumber(target); // Ensure formatting is correct even if no animation needed
                    return;
                }

                const duration = 2000;
                const startTime = performance.now();

                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    
                    const current = Math.floor(startValue + (target - startValue) * easeOutQuart);

                    counter.setAttribute('data-current-value', current);
                    counter.textContent = formatIndianNumber(current);

                    if (progress < 1) {
                        const id = requestAnimationFrame(animate);
                        animationFrameIds.current.push(id);
                    } else {
                        counter.textContent = formatIndianNumber(target);
                        counter.setAttribute('data-current-value', target);
                    }
                };

                const id = requestAnimationFrame(animate);
                animationFrameIds.current.push(id);
            });
        };

        // Update Animation if already visible and data changes
        if (isAnimatedRef.current) {
            clearRunningAnimations();
            requestAnimationFrame(() => animateCounters('.hero .stat-number'));
        }

        // Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isAnimatedRef.current) {
                    isAnimatedRef.current = true;
                    
                    // Trigger animations
                    setTimeout(setupTypewriterEffect, 500);
                    clearRunningAnimations();
                    setTimeout(() => animateCounters('.hero .stat-number'), 20);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        if (statsRef.current) observer.observe(statsRef.current);

        return () => {
            if (statsRef.current) observer.unobserve(statsRef.current);
            clearRunningAnimations();
        };
    }, [stats]); 

    return (
        <section id="home" className="hero" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px))' }}>
            <div className="hero-bg">
                <div className="hero-particles"></div>
                <div className="hero-shapes">
                    <div className="shape shape1"></div>
                    <div className="shape shape2"></div>
                    <div className="shape shape3"></div>
                </div>
            </div>
            <div className="container">
                <div className="hero-content">
                    <h1 className="hero-title" ref={typewriterRef}>
                        <span className="title-line animate-typewriter" data-text="Sengunthar in Business">
                            Sengunthar in Business
                        </span>
                    </h1>
                    <p className="hero-tagline animate-fade-up" data-delay="2000">
                        Empowering Business Excellence Through Unity
                    </p>
                    <p className="hero-description animate-fade-up" data-delay="2500">
                        Building a strong network of successful entrepreneurs and business leaders within the Sengunthar community across diverse industries
                    </p>
                    <div className="hero-image-section">
                        <a href="https://www.facebook.com/VoiceOfSengunthar" target="_blank" rel="noreferrer">
                            <img src="assets/nandhagopal.webp" alt="Founder" className="founder-image" />
                        </a>
                    </div>
                    <div className="hero-actions animate-fade-up" data-delay="3000">
                        {data.buttons.map((button, index) => (
                            <button key={index} className={`btn btn-${button.type}`} onClick={() => handleRedirect(button.link)}>
                                <span>{button.name}</span>
                                <div className="btn-glow">{button.content}</div>
                            </button>
                        ))}
                    </div>
                    <div className="hero-stats animate-fade-up" data-delay="3500" ref={statsRef}>
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item"> 
                                <span 
                                    className="stat-number" 
                                    data-count={stat.value} 
                                    data-current-value="0"
                                >
                                    0
                                </span>
                                <span className="stat-label">{stat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero