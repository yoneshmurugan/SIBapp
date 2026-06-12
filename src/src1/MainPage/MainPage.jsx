import Header from "./Header/Header.jsx"
import Hero from "./Hero/Hero.jsx"
import Gallery from "./Gallery/Gallery.jsx"
import About from "./About/About.jsx"
import Objective from "./Objectives/Objective.jsx"
import Verticals from "./Verticals/Verticals.jsx"
import Leaders from "./Leaders/Leaders.jsx"
import Contact from "./Contacts/Contact.jsx"
import Footer from "./Footer/Footer.jsx"
import Fab from "./FAB/Fab.jsx"
import './style.css'

function MainPage() {
  return (
    <div className="sib pt-safe pb-safe overflow-hidden">
      <div className="h-full overflow-y-auto">
      <Header />
      <Hero />
      <Gallery />
      <About />
      <Objective />
      <Verticals />
      <Leaders />
      <Contact />
      <Footer />
      <Fab />
</div>
    </div>
  )
}

export default MainPage