import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
function App() {
  const [token, setToken] = useState(localStorage.getItem('credos_token'));
  const [dashboard, setDashboard] = useState(null);
  const login = async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const response = await fetch(`${API}/v1/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); const data = await response.json(); if (!response.ok) return alert(data.error); localStorage.setItem('credos_token', data.token); setToken(data.token); };
  const load = async () => { const response = await fetch(`${API}/v1/dashboard`, { headers: { authorization: `Bearer ${token}` } }); setDashboard(await response.json()); };
  if (!token) return <main className="card"><h1>CredOS</h1><p>Credit operations, in one place.</p><form onSubmit={login}><input name="email" type="email" defaultValue="admin@credos.local" /><input name="password" type="password" defaultValue="ChangeMe123!" /><button>Sign in</button></form></main>;
  return <main><header><h1>CredOS Operations</h1><button onClick={load}>Refresh dashboard</button></header>{dashboard ? <section className="metrics">{Object.entries(dashboard).map(([name, value]) => <article key={name}><small>{name}</small><strong>{value.toLocaleString()}</strong></article>)}</section> : <p>Load your receivables dashboard.</p>}</main>;
}
createRoot(document.getElementById('root')).render(<App />);
