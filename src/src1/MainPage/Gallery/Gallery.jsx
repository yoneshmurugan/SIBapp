import { Scale } from 'lucide-react';
import './GalleryStyle.css'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom';
function Gallery() {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const slidesRef = useRef([])
    const dotsRef = useRef([])

    const showSlide = (n) => {
        const slides = document.querySelectorAll('.slide')
        const dots = document.querySelectorAll('.dot')

        let newIndex = n
        if (n >= slides.length) {
            newIndex = 0
        }
        if (n < 0) {
            newIndex = slides.length - 1
        }

        slides.forEach(slide => slide.classList.remove('active'))
        dots.forEach(dot => dot.classList.remove('active'))

        slides[newIndex].classList.add('active')
        dots[newIndex].classList.add('active')

        setCurrentSlideIndex(newIndex)
    }

    const changeSlide = (n) => {
        showSlide(currentSlideIndex + n)
    }

    const currentSlide = (n) => {
        showSlide(n)
    }

    // Auto-slide every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            showSlide(currentSlideIndex + 1)
        }, 5000)

        return () => clearInterval(interval)
    }, [currentSlideIndex])

    return (
        <section id="gallery" className="gallery">
            <div className="glow-effect glow-effect-1"></div>
            <div className="glow-effect glow-effect-2"></div>

            <div className="container">
                <div className="section-header">
                    <div className="section-tag">Gallery</div>
                    <h2 className="section-title">Our Gallery Highlights</h2>
                    <p className="section-subtitle">Capturing moments of growth, unity, and community progress</p>
                </div>

                <div className="slideshow-container">
                    <Link to="/album">
                    <div className="slide active">
                        <img src="/Prosperity-focusedmovement(1).png" alt="Gallery Image 1"  />
                    </div>
                    <div className="slide">
                        <img src="/Prosperity-focusedmovement.png" alt="Gallery Image 2" />
                    </div>
                    <div className="slide">
                        <img src="/Prosperity-focusedmovement(2).png" alt="Gallery Image 3" />
                    </div>
                    <div className="slide">
                        <img src="/Prosperity-focusedmovement(3).png" alt="Gallery Image 4" />
                    </div>
                    <div className="slide">
                        <img src="/Prosperity-focusedmovement(4).png" alt="Gallery Image 5" />
                    </div>
                    </Link>

                    <button className="nav-button prev" onClick={() => changeSlide(-1)}>&#10094;</button>
                    <button className="nav-button next" onClick={() => changeSlide(1)}>&#10095;</button>

                    <div className="dots-container">
                        <span className="dot active" onClick={() => currentSlide(0)}></span>
                        <span className="dot" onClick={() => currentSlide(1)}></span>
                        <span className="dot" onClick={() => currentSlide(2)}></span>
                        <span className="dot" onClick={() => currentSlide(3)}></span>
                        <span className="dot" onClick={() => currentSlide(4)}></span>
                    </div>
                </div>

                <div className="gallery-footer">
                    <Link to="/album" className="see-more-btn">
                        See More Gallery
                        <span className="arrow-icon">→</span>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Gallery