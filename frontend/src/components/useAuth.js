import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const useAuth = () => {
  const history = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId')

    if (role === 'admin') {
      history('/admin');
      // Optionally show a session expired message
     
    }
    else if (!userId){
      history('/')
    }
    
  }, [history]);
};

export default useAuth;