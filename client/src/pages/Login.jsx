import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode==='register' ? { name, email, password } : { email, password })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed')
      localStorage.setItem('token', json.token)
      navigate('/')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="auth">
      <h2>{mode==='login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={submit}>
        {mode==='register' && (
          <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        )}
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit">{mode==='login' ? 'Login' : 'Register'}</button>
      </form>
      <button className="btn link" onClick={()=>setMode(mode==='login'?'register':'login')}>
        {mode==='login' ? 'Create an account' : 'Have an account? Login'}
      </button>
    </div>
  )
}


