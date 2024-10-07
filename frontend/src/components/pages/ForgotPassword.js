import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailError('');
        
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(data.message);

            if (data.message && data.message.toLowerCase().includes('sent')) {
                alert('Password reset link has been sent to your email!');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error processing your request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <h2>Forgot Password</h2>
            <form className="forgot-password-form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    aria-label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {emailError && <p className="error-message">{emailError}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Submit'}
                </button>
            </form>
            {message && <p className={message.includes('sent') ? 'success-message' : 'error-message'}>{message}</p>}
        </div>
    );
};

export default ForgotPassword;

// import React, { useState } from 'react';
// import axios from 'axios';

// const ForgotPassword = ({ handleBack }) => {
//     const [email, setEmail] = useState('');
//     const [message, setMessage] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [emailError, setEmailError] = useState('');

//     const validateEmail = (email) => {
//         const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return regex.test(email);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setEmailError('');

//         if (!validateEmail(email)) {
//             setEmailError('Please enter a valid email address');
//             return;
//         }

//         setLoading(true);
//         try {
//             const { data } = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
//             setMessage(data.message);

//             if (data.message && data.message.toLowerCase().includes('sent')) {
//                 alert('Password reset link has been sent to your email!');
//             }
//         } catch (error) {
//             setMessage(error.response?.data?.message || 'Error processing your request');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="forgot-password-container p-6">
//             <h2 className="text-center text-2xl font-bold mb-4">Forgot Password</h2>
//             <form className="forgot-password-form flex flex-col" onSubmit={handleSubmit}>
//                 <input
//                     type="email"
//                     placeholder="Enter your email"
//                     aria-label="Email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     className="p-2 mb-3 rounded text-black"
//                 />
//                 {emailError && <p className="error-message text-red-500">{emailError}</p>}
//                 <button type="submit" disabled={loading} className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
//                     {loading ? 'Processing...' : 'Submit'}
//                 </button>
//             </form>
//             <button onClick={handleBack} className="mt-4 text-blue-500 underline hover:underline-offset-2">Back to Login</button>
//             {message && <p className={`mt-4 ${message.includes('sent') ? 'success-message text-green-500' : 'error-message text-red-500'}`}>{message}</p>}
//         </div>
//     );
// };

// export default ForgotPassword;
