// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Hero } from './components/Hero/Hero';
import { ProofBar } from './components/ProofBar/ProofBar';
import { Benefits } from './components/Benefits/Benefits';
import { HowItWorks } from './components/HowItWorks/HowItWorks';
import { Dreams } from './components/Dreams/Dreams';
import { Testimonials } from './components/Testimonials/Testimonials';
import { Manifesto } from './components/Manifesto/Manifesto';
import { Prices } from './components/Prices/Prices';
import { Faq } from './components/Faq/Faq';
import { FinalCta } from './components/FinalCta/FinalCta';
import { Footer } from './components/Footer/Footer';
import { FloatingNav } from './components/FloatingNav/FloatingNav';
import { Checkout } from './pages/Checkout/Checkout';
import { Success } from './pages/Success/Success';
import { SetPassword } from './pages/SetPassword/SetPassword';
import { PrivacyPolicy, TermsOfUse } from './pages/Legal/Legal';

/**
 * Ordem da LP: prova → benefício → como fazer → aspiração → prova social →
 * manifesto → preço → objeções → CTA final.
 */
const Home = () => (
  <div className="app-container">
    <FloatingNav />
    <Hero />
    <ProofBar />
    <Benefits />
    <HowItWorks />
    <Dreams />
    <Testimonials />
    <Manifesto />
    <Prices />
    <Faq />
    <FinalCta />
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/sucesso" element={<Success />} />
        <Route path="/criar-senha" element={<SetPassword />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsOfUse />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
