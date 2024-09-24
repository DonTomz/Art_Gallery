import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register'; 
import Users from './components/Usersi/Users';
import Painting from './pages/Painting';


function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  const openRegisterModal = () => setShowRegisterModal(true);
  const closeRegisterModal = () => setShowRegisterModal(false);

  return (
    <div className="App">
      <Router>
        <main className='min-h-[calc(100vh-10px)]  '>

        <Header openModal={openLoginModal} openRegisterModal={openRegisterModal} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/user" element={<Users/>}/>
          <Route path="/paint" element={<Painting/>}/>
        </Routes>
        </main>
        <Footer />
        <Login show={showLoginModal} handleClose={closeLoginModal} openRegisterModal={openRegisterModal} />
        <Register show={showRegisterModal} handleClose={closeRegisterModal} openLoginModal={openLoginModal} /> 
      </Router>
    </div>
  );
}

export default App;


