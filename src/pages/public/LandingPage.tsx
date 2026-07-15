import { useNavigate } from 'react-router-dom';
import { LanguageProvider } from '../../contexts/LanguageContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import FormationSection from './components/FormationSection';
import NaturalHealingSection from './components/NaturalHealingSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import FlameCustomCursor from '../../components/FlameCustomCursor';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-black landing-page-cursor">
        <FlameCustomCursor />
        <Header />
      
      <main>
        {/* Hero with Login Button */}
        <div className="relative">
          <HeroSection />
          <button
            onClick={() => navigate('/login')}
            className="fixed bottom-8 right-8 z-40 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/50 hover:scale-105"
            title="Login"
          >
            Login
          </button>
        </div>

        <ServicesSection />
        <FormationSection />
        <NaturalHealingSection />
        <AboutSection />
        <ContactSection />
      </main>

      <Footer />
      </div>
    </LanguageProvider>
  );
};

export default LandingPage;
