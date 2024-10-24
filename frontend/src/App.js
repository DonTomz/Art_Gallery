import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation ,} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register'; 
import Users from './components/Usersinfo/Users';
import AddArtwork from './components/pages/AddArtwork';
import AdminPage from './components/Admin';
import Artist from './components/Usersinfo/Artists';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
import ArtworkDetail from './components/pages/ArtworkDetail';
import CartPage from './components/pages/Cart';
import ProfilePage from './components/pages/Profile';
import Category from './components/pages/Category';
import WishlistPage from './components/pages/WishList';
import EditArtwork from './components/pages/EditArtwork';
import ArtistArtworks from './components/ArtistArtworks';
// import PaymentPage from './components/pages/Payment';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
    // const userRole = localStorage.getItem('role'); 

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  const openRegisterModal = () => setShowRegisterModal(true);
  const closeRegisterModal = () => setShowRegisterModal(false);

  return (
    <div className="App">
      <Router>
        
        
          <HeaderWithConditionalRender 
            openLoginModal={openLoginModal} 
            openRegisterModal={openRegisterModal} 
          />
          <main className='min-h-[calc(100vh-10px)] flex flex-col'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/user" element={<Users />} />
            <Route path="/category/:category" element={<Category />} />
            <Route path="/add-artwork" element={<AddArtwork />} />
            

               <Route 
              path="/admin" 
              element={<AdminPage />} 
            />
            
            <Route path="/artist" element={<Artist />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/artworks/:id" element={<ArtworkDetail openModal={openLoginModal} />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path ="/wishlist" element={<WishlistPage/>}/>
            <Route path="/artist/artworks/edit/:id" element={<EditArtwork />} />
            <Route path="/artist/artworks" element={<ArtistArtworks />} />
            {/* <Route path='/payment' element ={<PaymentPage/>}/> */}
          </Routes>
        </main>
        <Footer />
        <Login show={showLoginModal} handleClose={closeLoginModal} openRegisterModal={openRegisterModal} />
        <Register show={showRegisterModal} handleClose={closeRegisterModal} openLoginModal={openLoginModal} />
        
      </Router>
    </div>
  );
}


// Component to conditionally render the Header
function HeaderWithConditionalRender({ openLoginModal, openRegisterModal }) {
  const location = useLocation();

  // Define the routes where you want to hide the header
  const hideHeaderRoutes = [ '/reset-password/:token'];

  return (
    !hideHeaderRoutes.includes(location.pathname) && (
      <Header openModal={openLoginModal} openRegisterModal={openRegisterModal} />
    )
  );
}

export default App;
