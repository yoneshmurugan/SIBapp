import './ObjectiveStyle.css'
import data from '../../data/MainPage/objectives.json'

function Objective() {

    const renderObjectives = data.map((objective, index) => (
        <div className="objective-card" key={index}>
            <div className="objective-keyword">
                <h4>{objective.title}</h4>
                <span>{objective.translation}</span>
            </div>
            <div className="objective-details">
                <p>{objective.description}</p>
            </div>
        </div>
    ));

    return (
        <div className='objective'>
            <section className="objectives-section">
                <h2 className="section-title">Our Objectives</h2>

                <div className="objectives-container">
                    <div className="objectives-image">
                        <img src="/assets/objective.avif" alt="Community Objectives Illustration" />
                    </div>

                    <div className="objectives-grid">
                        {renderObjectives}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Objective