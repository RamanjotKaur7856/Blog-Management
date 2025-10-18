import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NewPost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')||''}`
        },
        body: JSON.stringify({ title, content, imageUrl, tags })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed')
      navigate(`/post/${json.slug || json.id}`)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="form">
      <h2>New Post</h2>
      <form onSubmit={submit}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input placeholder="Image URL" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />
        <textarea placeholder="Content (supports HTML)" rows={10} value={content} onChange={e=>setContent(e.target.value)} />
        <input placeholder="Tags (comma separated)" value={tags} onChange={e=>setTags(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit">Publish</button>
      </form>
    </div>
  )
}


