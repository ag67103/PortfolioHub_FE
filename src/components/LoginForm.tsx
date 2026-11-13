import React, { useState } from 'react';
import { login } from '../services/api';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            const response = await login(email, password);

            if (response.access_token) {
                localStorage.setItem('access_token', response.access_token);
                window.location.href = '/';
            }
        } catch (error: any) {
            const serverMessage = error.response?.data?.detail?.message || error.response?.data?.detail || error.response?.data?.message;
            setError(serverMessage || error.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const inputCls = "w-full px-4 py-3 rounded-lg bg-obsidian-surface border border-obsidian-border text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent-indigo focus:ring-2 focus:ring-accent-indigo/40";

    return (
        <form onSubmit={handleLogin} className="space-y-5">
            {error && (
                <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">{error}</div>
            )}
            <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-ink-secondary mb-1.5">Email</label>
                <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className={inputCls}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                />
            </div>

            <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-ink-secondary mb-1.5">Password</label>
                <div className="relative">
                    <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Your password"
                        className={`${inputCls} pr-16`}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-light hover:underline text-xs font-medium"
                        onClick={() => setShowPassword(v => !v)}
                        aria-pressed={showPassword}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-60"
                disabled={loading}
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default LoginForm;
