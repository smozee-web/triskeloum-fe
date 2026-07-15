import React from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-900/20 blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-red-900/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 text-center">
                <div className="mb-8">
                    <h1 className="text-4xl font-light tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 mb-4">
                        USRATUL AZKAAR
                    </h1>
                    <p className="text-amber-500/80 text-lg mb-2">Cabinet digital de développement spirituel</p>
                    <p className="text-gray-400">L'inscription n'est pas encore disponible</p>
                </div>

                <div className="mt-8">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/30"
                    >
                        Retour à la connexion
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;