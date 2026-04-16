import { useState } from 'react';
import api from './api';

export default function Login({ setToken }) {
    const [email, setEmail] = useState('alice@example.com'); // Autofill de Alice (para facilidad en pruebas)
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/login', { email, password });
            const token = response.data.token;
            
            localStorage.setItem('token', token);
            setToken(token);
        } catch (err) {
            console.error('Error logueando:', err);
            setError('Credenciales inválidas o el servidor está caído.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#2c3e50' }}>Voces Críticas</h1>
                <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>Accede a tu cuenta institucional</p>
                
                {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="email" 
                        placeholder="Correo Electrónico" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                    />
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ padding: '12px', borderRadius: '6px', border: 'none', background: '#3498db', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Cargando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}
