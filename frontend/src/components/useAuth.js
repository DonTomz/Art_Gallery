import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const useAuth = () => {
  const history = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');

    if (role === 'admin') {
      history('/admin');
      // Optionally show a session expired message
     
    }
    
  }, [history]);
};

export default useAuth;