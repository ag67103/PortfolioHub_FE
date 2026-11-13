import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const Register: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center section-obsidian relative overflow-hidden py-8">
            {/* Ambient blobs */}
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent-indigo/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-accent-cyan/6 rounded-full blur-3xl pointer-events-none" />

            <div className="obs-card w-full max-w-md mx-4 p-8 relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-indigo/10 border border-accent-indigo/30 rounded-xl mb-4">
                        <span className="font-grotesk font-bold text-accent-indigo text-lg">PH</span>
                    </div>
                    <h2 className="font-grotesk text-2xl font-bold text-ink-primary">Create account</h2>
                    <p className="text-ink-muted text-sm mt-1">Start building your portfolio</p>
                </div>

                <RegisterForm />

                <p className="mt-6 text-center text-ink-muted text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent-indigo hover:text-accent-cyan font-semibold transition-colors">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
