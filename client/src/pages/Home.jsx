import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState({ data: [], meta: { page: 1, total: 0, limit: 10 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const page = Number(searchParams.get('page') || 1)
  const q = searchParams.get('q') || ''
  const tag = searchParams.get('tag') || ''

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', '12')
        if (q) params.set('q', q)
        if (tag) params.set('tag', tag)
        const res = await fetch(`/api/posts?${params.toString()}`)
        const json = await res.json()
        setData(json)
      } catch (e) {
        setError('Failed to load posts')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [page, q, tag])

  return (
    <div>
      <div className="home-actions">
        <input
          placeholder="Search posts"
          value={q}
          onChange={e => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('q', e.target.value); p.set('page','1'); return p })}
        />
        <input
          placeholder="Filter tag"
          value={tag}
          onChange={e => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('tag', e.target.value); p.set('page','1'); return p })}
        />
      </div>
      {loading ? <p>Loading...</p> : error ? <p className="error">{error}</p> : (
        <div>
          <div className="grid">
            {data.data.map(post => (
              <div key={post.id} className="card">
                {post.imageUrl ? <div className="img"><img src={post.imageUrl} alt={post.title} /></div> : null}
                <div className="content">
                  <h3>{post.title}</h3>
                  <p>{String(post.content).slice(0, 120)}...</p>
                  <div className="meta">
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    <span>❤ {post.likes}</span>
                  </div>
                  <div className="actions">
                    <Link className="btn primary" to={`/post/${post.slug || post.id}`}>Read</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pager">
            <button className="btn" disabled={page<=1} onClick={()=>setSearchParams(prev=>{const p = new URLSearchParams(prev); p.set('page', String(page-1)); return p})}>Prev</button>
            <span>Page {page}</span>
            <button className="btn" disabled={(data.meta.total || 0) <= page*(data.meta.limit || 10)} onClick={()=>setSearchParams(prev=>{const p = new URLSearchParams(prev); p.set('page', String(page+1)); return p})}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}


