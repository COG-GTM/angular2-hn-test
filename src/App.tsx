import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Menu from './pages/Menu';
import OurStory from './pages/OurStory';
import Reservations from './pages/Reservations';

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<Navigate to="/menu" replace />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/our-story" element={<OurStory />} />
                    <Route path="/reservations" element={<Reservations />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
