import { useRef, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  onItemClick = null,
  navigationDelay = 400 // Delay in ms before navigating
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Find active index based on current URL
  const getActiveIndexFromLocation = () => {
    const index = items.findIndex(item => {
        if (item.href.startsWith('#')) return false; 
        return location.pathname === item.href;
    });
    return index !== -1 ? index : initialActiveIndex;
  };

  const [activeIndex, setActiveIndex] = useState(getActiveIndexFromLocation());

  useEffect(() => {
    setActiveIndex(getActiveIndexFromLocation());
  }, [location.pathname]);

  const noise = (n = 1) => n / 2 - Math.random() * n;
  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };
  const createParticle = (i, t, d, r) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };
  const makeParticles = element => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // do nothing
          }
        }, t);
      }, 30);
    }
  };
  const updateEffectPosition = element => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const handleInteraction = (e, index, href) => {
    e.preventDefault();
    const liEl = e.currentTarget.tagName === 'LI' ? e.currentTarget : e.currentTarget.parentElement;
    
    // Trigger Animation
    if (activeIndex !== index) {
        setActiveIndex(index);
        updateEffectPosition(liEl);
        if (textRef.current) {
            textRef.current.classList.remove('active');
            void textRef.current.offsetWidth;
            textRef.current.classList.add('active');
        }
    }

    // Delayed Navigation
    setTimeout(() => {
        if (onItemClick) onItemClick();
        
        // Handle Hash Links (including those starting with /#)
        if (href.includes('#')) {
            const hash = href.substring(href.indexOf('#'));
            const path = href.split('#')[0] || '/';
            
            if (location.pathname === path) {
                // Same page, just scroll to hash
                window.location.hash = hash;
            } else {
                // Different page, navigate then set hash
                navigate(path);
                setTimeout(() => {
                    window.location.hash = hash;
                }, 100);
            }
        } else {
            navigate(href);
        }
    }, navigationDelay);
  };

  const handleKeyDown = (e, index, href) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleInteraction(e, index, href);
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    }
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <>
      <style>
        {`
          :root {
            --linear-ease: linear(0, 0.068, 0.19 2.7%, 0.804 8.1%, 1.037, 1.199 13.2%, 1.245, 1.27 15.8%, 1.274, 1.272 17.4%, 1.249 19.1%, 0.996 28%, 0.949, 0.928 33.3%, 0.926, 0.933 36.8%, 1.001 45.6%, 1.013, 1.019 50.8%, 1.018 54.4%, 1 63.1%, 0.995 68%, 1.001 85%, 1);
            --color-1: #f59e0b; /* Vibrant Yellow */
            --color-2: #f59e0b;
            --color-3: #f59e0b;
            --color-4: #f59e0b;
          }
          .effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
            transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                        top 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                        width 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                        height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .effect.text {
            color: #f8fafc;
            transition: color 0.3s ease, left 0.4s cubic-bezier(0.4, 0, 0.2, 1), top 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.85rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            z-index: 2;
          }
          .effect.text.active {
            color: #002349;
          }
          :root.dark .effect.text.active {
            color: #f8fafc;
          }
          .effect.filter {
            background: var(--accent);
            border-radius: 12px;
            z-index: 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          :root.dark .effect.filter {
            background: rgba(255, 255, 255, 0.15);
            box-shadow: none;
          }
          li.active {
            color: #002349;
            text-shadow: none;
          }
          :root.dark li.active {
            color: white;
          }
          li.active::after {
            opacity: 1;
            transform: scale(1);
          }
          li::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.05);
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s ease;
            z-index: -1;
          }
          :root.dark li::after {
            background: rgba(255, 255, 255, 0.1);
          }
        `}
      </style>
      <div className="relative" ref={containerRef}>
        <nav className={`flex relative ${isMobile ? 'flex-col w-full' : ''}`} style={{ transform: 'translate3d(0,0,0.01px)' }}>
          <ul
            ref={navRef}
            className={`flex list-none p-0 m-0 relative z-[3] ${isMobile ? 'flex-col w-full gap-2' : 'gap-2'}`}
            style={{
              color: 'var(--text-primary)',
            }}
          >
            {items.map((item, index) => (
              <li
                key={index}
                className={`rounded-xl relative cursor-pointer transition-[background-color_color_box-shadow] duration-300 ease ${
                  activeIndex === index ? 'active' : ''
                } ${isMobile ? 'w-full' : ''}`}
                onPointerDown={e => handleInteraction(e, index, item.href)}
              >
                <span
                    className={`outline-none py-[0.6em] px-[0.9em] inline-block text-[0.85rem] font-bold uppercase tracking-widest ${isMobile ? 'w-full text-center' : ''}`}
                >
                    {item.label}
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <span className="effect filter" ref={filterRef} />
        <span className="effect text" ref={textRef} />
      </div>
    </>
  );
};

export default GooeyNav;
