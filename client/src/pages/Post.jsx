import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function Post() {
  const { idOrSlug } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [authorName, setAuthorName] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/posts/${idOrSlug}`)
      const p = await res.json()
      setPost(p)
      const cRes = await fetch(`/api/comments/post/${p.id}`)
      setComments(await cRes.json())
    }
    load()
  }, [idOrSlug])

  async function submitComment(e) {
    e.preventDefault()
    if (!post) return
    const res = await fetch(`/api/comments/post/${post.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')||''}` },
      body: JSON.stringify({ body: comment, authorName: authorName||'Guest' })
    })
    if (res.ok) {
      const c = await res.json()
      setComments(prev => [c, ...prev])
      setComment('')
    }
  }

  if (!post) return <p>Loading...</p>
  return (
    <div>
      <div className="single">
        <h1>{post.title}</h1>
        {post.imageUrl ? <div className="img big"><img src={post.imageUrl} alt={post.title} /></div> : null}
        <div className="body" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      <section className="comments">
        <h3>Comments</h3>
        <form onSubmit={submitComment} className="comment-form">
          <input placeholder="Your name" value={authorName} onChange={e=>setAuthorName(e.target.value)} />
          <textarea placeholder="Add a comment" value={comment} onChange={e=>setComment(e.target.value)} />
          <button className="btn primary" type="submit">Post</button>
        </form>
        <ul className="comment-list">
          {comments.map(c => (
            <li key={c._id}>
              <div className="comment-meta">
                <strong>{c.authorName}</strong>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}


