import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const useAdminAuth = () => {
  const history = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');

    if (role === 'admin') {
      history('/admin');
      // Optionally show a session expired message
     
    }
    
  }, [history]);
};

export default useAdminAuth;