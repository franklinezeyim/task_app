import './commentSection.css'
import { useState } from 'react'

const sample = [
  {
    id: 1,
    author: 'Jane Cooper',
    avatar: 'JC',
    text: 'Great post! Very insightful — thanks for sharing.',
    time: Date.now() - 1000 * 60 * 5,
    likes: 2,
    liked: false,
    replies: [
      { id: 11, author: 'Albert Flores', avatar: 'AF', text: 'Agreed!', time: Date.now() - 1000 * 60 * 2 },
    ],
  },
  {
    id: 2,
    author: 'Cody Fisher',
    avatar: 'CF',
    text: "I found this helpful — especially the examples.",
    time: Date.now() - 1000 * 60 * 60,
    likes: 0,
    liked: false,
    replies: [],
  },
]

const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'Just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

const EMOJIS = ['👍','❤️','😂','🎉','👏','😮','😢','🔥','💯','🙌','🤔','😄']

const CommentSection = () => {
  const [comments, setComments] = useState(sample)
  const [text, setText] = useState('')
  const [replyMap, setReplyMap] = useState({})
  const [showEmoji, setShowEmoji] = useState(false)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const addComment = () => {
    const t = text.trim()
    if (!t && !image) return
    const newItem = { id: Date.now(), author: 'You', avatar: 'Y', text: t, image: imagePreview || null, time: Date.now(), likes: 0, liked: false, replies: [] }
    setComments(prev => [newItem, ...prev])
    setText('')
    setImage(null)
    setImagePreview(null)
    setShowEmoji(false)
  }

  const toggleLike = (id) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c))
  }

  const toggleReplyInput = (id) => {
    setReplyMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const addReply = (id, replyText, replyImagePreview = null) => {
    const t = replyText.trim()
    if (!t && !replyImagePreview) return
    setComments(prev => prev.map(c => c.id === id ? { ...c, replies: [...c.replies, { id: Date.now(), author: 'You', avatar: 'Y', text: t, image: replyImagePreview, time: Date.now() }] } : c))
    setReplyMap(prev => ({ ...prev, [id]: false }))
  }

  return (
    <div className="cs-root">
      <div className="cs-new">
        <div className="cs-avatar">Y</div>
        <div className="cs-input">
          <textarea
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />
          <div className="cs-tools">
            <div className="cs-left-tools">
              <button className="cs-tool" type="button" onClick={() => setShowEmoji(s => !s)} aria-label="emoji">😊</button>
              <label className="cs-tool cs-photo">
                📷
                <input type="file" accept="image/*" style={{display:'none'}} onChange={(e)=>{
                  const f = e.target.files && e.target.files[0]
                  if (f){
                    setImage(f)
                    const url = URL.createObjectURL(f)
                    setImagePreview(url)
                  }
                  e.target.value = null
                }} />
              </label>
            </div>
            <div className="cs-right-tools">
              <button className="cs-btn" disabled={text.trim() === '' && !imagePreview} onClick={addComment}>Comment</button>
            </div>
          </div>

          {showEmoji && (
            <div className="cs-emoji-picker">
              {EMOJIS.map(e => (
                <button key={e} type="button" className="cs-emoji" onClick={()=> setText(prev => (prev + e))}>{e}</button>
              ))}
            </div>
          )}

          {imagePreview && (
            <div className="cs-img-preview">
              <img src={imagePreview} alt="preview" />
              <button type="button" className="cs-remove-img" onClick={()=>{ URL.revokeObjectURL(imagePreview); setImage(null); setImagePreview(null); }}>✕</button>
            </div>
          )}
        </div>
      </div>

      <div className="cs-list">
        {comments.map(c => (
          <div className="cs-item" key={c.id}>
            <div className="cs-left">
              <div className="cs-avatar">{c.avatar}</div>
            </div>
            <div className="cs-right">
              <div className="cs-header">
                <span className="cs-author">{c.author}</span>
                <span className="cs-time">{timeAgo(c.time)}</span>
              </div>
              <div className="cs-text">{c.text}</div>
              <div className="cs-actions-row">
                <button className={`cs-action ${c.liked ? 'active' : ''}`} onClick={() => toggleLike(c.id)}>
                  Like {c.likes ? <span className="cs-count">{c.likes}</span> : null}
                </button>
                <button className="cs-action" onClick={() => toggleReplyInput(c.id)}>Reply</button>
              </div>

              {replyMap[c.id] && (
                <ReplyBox onAdd={(t, imgPreview) => addReply(c.id, t, imgPreview)} />
              )}

              {c.replies && c.replies.length > 0 && (
                <div className="cs-replies">
                  {c.replies.map(r => (
                    <div className="cs-reply" key={r.id}>
                      <div className="cs-avatar small">{r.avatar}</div>
                      <div>
                        <div className="cs-header">
                          <span className="cs-author">{r.author}</span>
                          <span className="cs-time">{timeAgo(r.time)}</span>
                        </div>
                        <div className="cs-text">{r.text}</div>
                        {r.image && <div className="cs-reply-img"><img src={r.image} alt="reply-img"/></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ReplyBox = ({ onAdd }) => {
  const [val, setVal] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [img, setImg] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  return (
    <div className="cs-reply-box">
      <textarea rows={2} value={val} placeholder="Write a reply..." onChange={(e)=>setVal(e.target.value)} />
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:8}}>
          <button className="cs-tool" type="button" onClick={() => setShowEmoji(s=>!s)}>😊</button>
          <label className="cs-tool cs-photo">📷
            <input type="file" accept="image/*" style={{display:'none'}} onChange={(e)=>{
              const f = e.target.files && e.target.files[0]
              if (f){
                setImg(f)
                const url = URL.createObjectURL(f)
                setImgPreview(url)
              }
              e.target.value = null
            }} />
          </label>
        </div>
        <div className="cs-actions">
          <button className="cs-btn" disabled={val.trim() === '' && !imgPreview} onClick={()=>{ onAdd(val, imgPreview); setVal(''); setImg(null); setImgPreview(null)}}>Reply</button>
        </div>
      </div>
      {showEmoji && (
        <div className="cs-emoji-picker reply">
          {EMOJIS.map(e => (
            <button key={e} type="button" className="cs-emoji" onClick={()=> setVal(prev => prev + e)}>{e}</button>
          ))}
        </div>
      )}
      {imgPreview && (
        <div className="cs-img-preview">
          <img src={imgPreview} alt="preview" />
          <button type="button" className="cs-remove-img" onClick={()=>{ URL.revokeObjectURL(imgPreview); setImg(null); setImgPreview(null); }}>✕</button>
        </div>
      )}
    </div>
  )
}

export default CommentSection