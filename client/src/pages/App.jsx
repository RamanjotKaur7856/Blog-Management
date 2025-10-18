import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './Home'
import Post from './Post'
import Login from './Login'
import NewPost from './NewPost'

export default function App() {
  const navigate = useNavigate()
  function logout() {
    localStorage.removeItem('token')
    navigate('/')
  }
  const authed = !!localStorage.getItem('token')
  return (
    <div>
      <nav className="nav">
        <div className="container nav-inner">
          <Link to="/" className="brand">Blog</Link>
          <div className="nav-right">
            <Link to="/new" className="btn primary">New Post</Link>
            {authed ? (
              <button className="btn" onClick={logout}>Logout</button>
            ) : (
              <Link to="/login" className="btn">Login</Link>
            )}
          </div>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route index element={<Home />} />
          <Route path="/post/:idOrSlug" element={<Post />} />
          <Route path="/login" element={<Login />} />
          <Route path="/new" element={<NewPost />} />
        </Routes>
      </main>
    </div>
  )
}


