import { useLocation } from 'react-router-dom';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AnimatedRoute({ children }) {
  const location = useLocation();
  const pageRef = useRef();

  useLayoutEffect(() => {
    const tl = gsap.timeline();

    tl.to(pageRef.current, {
      scale: 0.8,
      x: '-30vw',
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    });

    tl.fromTo(
      pageRef.current,
      {
        scale: 0.8,
        x: '30vw',
        opacity: 0
      },
      {
        scale: 1,
        x: '0vw',
        opacity: 1,
        duration: 0.2,
        ease: 'power4.out',
        clearProps: 'all'
      }
    );
  }, [location]);

  return (
    <div
      id="page"
      ref={pageRef}
      style={{
        minHeight: '100vh',
        width: '100%',
        willChange: 'transform,opacity'
      }}
    >
      {children}
    </div>
  );
}
