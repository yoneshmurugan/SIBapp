import './LeadersStyle.css'
import data from '../../data/MainPage/Leaders.json'

function Leaders() {

    const renderLeaders = () => {
        return data.map((leader, index) => (
            // Changed div to 'a' tag for redirection logic
            <a 
                href={leader.website || "#"} 
                className="new-leader-card new-premium-card" 
                key={index}
                target="_blank" 
                rel="noopener noreferrer"
            >
                <div className="new-leader-avatar">
                    <img src={leader.img} alt="image" height="100px" width="200px" loading="lazy" />
                </div>
                <div className="new-leader-info">
                    <div className="new-position">{leader.position}</div>
                    <h3 className="new-name">{leader.name}</h3>
                    <p className="new-business">{leader.business}</p>
                    <div className="new-contact-info">
                        <span className="new-phone">{leader.phone}</span>
                    </div>
                </div>
            </a>
        ));
    };

    return (
        <div className="led">
            <section id="leadership" className="leadership">
                {/* <div className="section-bg parallax-bg"></div> */}
                <div className="container">
                    <div className="section-header">
                        <div className="section-tag">Executive Committee</div>
                        <h2 className="section-title" style={{ color: 'white' }}>Guiding Excellence</h2>
                        <p className="section-subtitle">Visionary leaders driving our community towards prosperity</p>
                    </div>
                    <div className="leadership-grid">
                        {renderLeaders()}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Leaders