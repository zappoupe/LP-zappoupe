// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Hero } from './components/Hero/Hero';
import { Features } from './components/Features/Features';
import { Prices } from './components/Prices/Prices';
import { Faq } from './components/Faq/Faq';
import { Footer } from './components/Footer/Footer';
import { FloatingNav } from './components/FloatingNav/FloatingNav';
import { Checkout } from './pages/Checkout/Checkout'; 
import { Success } from './pages/Success/Success'; 
import { SetPassword } from './pages/SetPassword/SetPassword'; // <-- Importe aqui

const Home = () => (
  <div className="app-container">
    <Hero /> 
    <Features />
    <Prices />
    <Faq />
    <Footer />
    <FloatingNav />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/sucesso" element={<Success />} />
        {/* Adicione a rota abaixo */}
        <Route path="/criar-senha" element={<SetPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;