import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true); 
        try {
            const { data } = await axios.post(`https://art-gallery-kmgs.onrender.com/api/auth/resetpassword/${token}`, { password });
            setMessage(data.message);
            setError('');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error("Error resetting password:", error.response ? error.response.data : error.message);
            setError(error.response?.data?.message || "Error resetting password");
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white shadow-lg p-8 rounded-md w-full max-w-md">
                <h1 className="text-center text-3xl font-bold text-gray-800 mb-6">ART GALLERY</h1>
                <h2 className="text-xl text-gray-700 mb-4 text-center">Reset Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {loading ? "Resetting..." : "Submit"}
                    </button>
                </form>
                {error && <p className="text-red-600 text-center mt-4">{error}</p>}
                {message && <p className="text-green-600 text-center mt-4">{message}</p>}
            </div>
        </div>
    );
};

export default ResetPassword;
