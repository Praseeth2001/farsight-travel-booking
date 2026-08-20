import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PLP from './pages/PLP';
import PDP from './pages/PDP';
import Cart from './pages/Cart';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<PLP />} />
          <Route path="/packages/:id" element={<PDP />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>
    </>
  );
}
