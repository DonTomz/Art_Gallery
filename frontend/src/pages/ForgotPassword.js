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
            const { data } = await axios.post('https://art-gallery-kmgs.onrender.com/api/auth/forgot-password', { email });
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
        <div className="min-h-screen flex items-center justify-center  bg-cover bg-center">
            <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-bold text-center mb-6">Forgot Password</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        aria-label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    {emailError && <p className="text-red-500">{emailError}</p>}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                        {loading ? 'Processing...' : 'Submit'}
                    </button>
                </form>
                {message && (
                    <p className={`mt-4 text-center ${message.includes('sent') ? 'text-green-500' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
