import { useState, useRef, useEffect, useMemo } from 'react'
import { Plus, Trash2, Check, ListX, Search, CalendarDays, X, Layers } from 'lucide-react'

const PRI = {
  low:    { label: 'ต่ำ',  cls: 'bg-emerald-100 text-emerald-700', bar: '#10b981' },
  medium: { label: 'กลาง', cls: 'bg-amber-100 text-amber-700',     bar: '#f59e0b' },
  high:   { label: 'สูง',  cls: 'bg-rose-100 text-rose-700',       bar: '#f43f5e' },
}
const NEXT_PRI = { low: 'medium', medium: 'high', high: 'low' }
const CATS = {
  work:     { label: 'งาน',      cls: 'bg-blue-100 text-blue-700',     dot: '#3b82f6' },
  personal: { label: 'ส่วนตัว',  cls: 'bg-purple-100 text-purple-700', dot: '#a855f7' },
  shopping: { label: 'ช้อปปิ้ง', cls: 'bg-pink-100 text-pink-700',     dot: '#ec4899' },
  health:   { label: 'สุขภาพ',   cls: 'bg-teal-100 text-teal-700',     dot: '#14b8a6' },
}
const FILTERS = [['all', 'ทั้งหมด'], ['active', 'ยังไม่เสร็จ'], ['done', 'เสร็จแล้ว']]

const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const todayISO = () => toISO(new Date())
const offsetISO = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return toISO(d) }
const fmtDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

function dueInfo(t) {
  if (!t.due) return null
  const today = todayISO()
  if (t.done) return { cls: 'bg-gray-100 text-gray-500', text: fmtDate(t.due) }
  if (t.due < today) return { cls: 'bg-rose-100 text-rose-700', text: 'เลยกำหนด · ' + fmtDate(t.due) }
  if (t.due === today) return { cls: 'bg-yellow-100 text-yellow-800', text: 'วันนี้' }
  return { cls: 'bg-gray-100 text-gray-600', text: fmtDate(t.due) }
}

function TodoItem({ t, onToggle, onDelete, onUpdate, onPri }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(t.text)
  const [due, setDue] = useState(t.due)
  const [cat, setCat] = useState(t.cat)
  const [leaving, setLeaving] = useState(false)
  const ref = useRef(null)
  useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

  const start = () => { setVal(t.text); setDue(t.due); setCat(t.cat); setEditing(true) }
  const save = () => {
    const v = val.trim()
    if (v) onUpdate(t.id, { text: v, due, cat })
    setEditing(false)
  }
  const del = () => { setLeaving(true); setTimeout(() => onDelete(t.id), 250) }
  const p = PRI[t.pri]
  const c = CATS[t.cat]
  const d = dueInfo(t)

  return (
    <li
      className={'item card flex items-start gap-3 p-3 sm:p-4 mb-2 ' + (leaving ? 'out' : '')}
      style={{ borderLeft: '4px solid ' + p.bar }}
    >
      <button
        onClick={() => onToggle(t.id)}
        aria-label="ทำเครื่องหมายเสร็จ"
        className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center text-white"
        style={{
          background: t.done ? 'var(--accent)' : 'transparent',
          border: '2px solid ' + (t.done ? 'var(--accent)' : 'var(--line)'),
        }}
      >
        {t.done && <Check size={14} />}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              ref={ref}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="inp w-full rounded-lg px-2 py-1"
            />
            <div className="flex flex-wrap gap-2">
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="inp rounded-lg px-2 py-1 text-sm" />
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="inp rounded-lg px-2 py-1 text-sm">
                {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={save} className="px-3 py-1 rounded-lg text-sm text-white font-medium" style={{ background: 'var(--accent)' }}>บันทึก</button>
              <button onClick={() => setEditing(false)} className="px-3 py-1 rounded-lg text-sm" style={{ color: 'var(--muted)' }}>ยกเลิก</button>
            </div>
          </div>
        ) : (
          <>
            <span
              onDoubleClick={start}
              title="ดับเบิลคลิกเพื่อแก้ไข"
              className="block break-words cursor-text select-none"
              style={{
                textDecoration: t.done ? 'line-through' : 'none',
                color: t.done ? 'var(--muted)' : 'var(--text)',
              }}
            >
              {t.text}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + c.cls}>{c.label}</span>
              {d && (
                <span className={'text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ' + d.cls}>
                  <CalendarDays size={12} />{d.text}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => onPri(t.id)}
        title="เปลี่ยนความสำคัญ"
        className={'shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ' + p.cls}
      >
        {p.label}
      </button>
      <button
        onClick={del}
        aria-label="ลบ"
        className="shrink-0 p-2 -my-1 rounded-lg hover:bg-rose-50 hover:text-rose-600"
        style={{ color: 'var(--muted)' }}
      >
        <Trash2 size={18} />
      </button>
    </li>
  )
}

function Donut({ segments, percent }) {
  const r = 40
  const C = 2 * Math.PI * r
  const total = segments.reduce((s, x) => s + x.value, 0)
  let acc = 0
  return (
    <svg viewBox="0 0 100 100" width="96" height="96" role="img" aria-label={`เสร็จแล้ว ${percent}%`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="14" />
      {total > 0 && segments.map((s) => {
        const len = (s.value / total) * C
        const el = s.value > 0 && (
          <circle
            key={s.key} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc}
            transform="rotate(-90 50 50)"
          />
        )
        acc += len
        return el
      })}
      <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)">{percent}%</text>
    </svg>
  )
}

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'ส่งรายงานประจำสัปดาห์', done: false, pri: 'high', cat: 'work', due: offsetISO(-1) },
    { id: 2, text: 'ซื้อของเข้าบ้าน', done: false, pri: 'medium', cat: 'shopping', due: todayISO() },
    { id: 3, text: 'วิ่งสวนสาธารณะ 30 นาที', done: false, pri: 'low', cat: 'health', due: offsetISO(2) },
    { id: 4, text: 'อ่านหนังสือ 20 หน้า', done: true, pri: 'low', cat: 'personal', due: '' },
    { id: 5, text: 'เตรียมสไลด์ประชุม', done: false, pri: 'high', cat: 'work', due: offsetISO(3) },
  ])
  const [text, setText] = useState('')
  const [pri, setPri] = useState('medium')
  const [cat, setCat] = useState('personal')
  const [due, setDue] = useState('')
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [query, setQuery] = useState('')
  const nextId = useRef(6)

  const add = () => {
    const v = text.trim()
    if (!v) return
    setTodos([{ id: nextId.current++, text: v, done: false, pri, cat, due }, ...todos])
    setText('')
    setDue('')
  }
  const toggle = (id) => setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const del = (id) => setTodos(todos.filter((t) => t.id !== id))
  const update = (id, patch) => setTodos(todos.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  const cyc = (id) => setTodos(todos.map((t) => (t.id === id ? { ...t, pri: NEXT_PRI[t.pri] } : t)))

  const remaining = todos.filter((t) => !t.done).length
  const doneCount = todos.length - remaining

  const stats = useMemo(() => {
    const today = todayISO()
    const done = todos.filter((t) => t.done).length
    const overdue = todos.filter((t) => !t.done && t.due && t.due < today).length
    const active = todos.length - done - overdue
    const percent = todos.length ? Math.round((done / todos.length) * 100) : 0
    return { done, overdue, active, percent }
  }, [todos])

  const catCounts = useMemo(() => {
    const m = {}
    Object.keys(CATS).forEach((k) => (m[k] = todos.filter((t) => t.cat === k).length))
    return m
  }, [todos])

  const q = query.trim().toLowerCase()
  const shown = todos.filter((t) =>
    (filter === 'all' ? true : filter === 'active' ? !t.done : t.done) &&
    (catFilter === 'all' || t.cat === catFilter) &&
    (!q || t.text.toLowerCase().includes(q))
  )

  const chip = (key, label, count, dot) => (
    <button
      key={key}
      onClick={() => setCatFilter(key)}
      className={'side-btn shrink-0 flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium ' + (catFilter === key ? 'on' : '')}
    >
      <span className="flex items-center gap-2">
        {dot ? <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} /> : <Layers size={14} />}
        {label}
      </span>
      <span className="text-xs opacity-70">{count}</span>
    </button>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">รายการงานของฉัน</h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
        ดับเบิลคลิกที่งานเพื่อแก้ไข · แตะป้ายความสำคัญเพื่อเปลี่ยนระดับ
      </p>

      <div className="grid gap-4 md:grid-cols-[220px_1fr] items-start">
        <aside className="flex flex-col gap-4 md:sticky md:top-4">
          <nav className="card p-2 flex md:flex-col gap-1 overflow-x-auto" aria-label="หมวดหมู่">
            {chip('all', 'ทุกหมวด', todos.length)}
            {Object.entries(CATS).map(([k, v]) => chip(k, v.label, catCounts[k], v.dot))}
          </nav>

          <div className="card p-4">
            <h2 className="font-semibold mb-3 text-sm">สถิติ</h2>
            <div className="flex items-center gap-4">
              <Donut
                percent={stats.percent}
                segments={[
                  { key: 'done', value: stats.done, color: '#10b981' },
                  { key: 'active', value: stats.active, color: '#6366f1' },
                  { key: 'overdue', value: stats.overdue, color: '#f43f5e' },
                ]}
              />
              <ul className="text-sm space-y-1 list-none p-0 m-0">
                <li><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: '#10b981' }} />เสร็จแล้ว {stats.done}</li>
                <li><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: '#6366f1' }} />กำลังทำ {stats.active}</li>
                <li><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: '#f43f5e' }} />เลยกำหนด {stats.overdue}</li>
              </ul>
            </div>
            <p className="text-sm mt-3" style={{ color: 'var(--muted)' }}>
              งานทั้งหมด {todos.length} · เสร็จแล้ว {stats.percent}%
            </p>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="card p-3 sm:p-4 mb-4">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="เพิ่มงานใหม่..."
                className="inp flex-1 min-w-0 rounded-lg px-3 py-2.5"
              />
              <button
                onClick={add}
                className="shrink-0 flex items-center gap-1.5 px-4 rounded-lg text-white font-semibold"
                style={{ background: 'var(--accent)' }}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">เพิ่ม</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>ความสำคัญ:</span>
                {Object.entries(PRI).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setPri(k)}
                    className={'text-xs font-semibold px-3 py-1 rounded-full ' + v.cls}
                    style={{ outline: pri === k ? '2px solid ' + v.bar : 'none', outlineOffset: 2 }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                กำหนดส่ง:
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="inp rounded-lg px-2 py-1 text-sm" />
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                หมวด:
                <select value={cat} onChange={(e) => setCat(e.target.value)} className="inp rounded-lg px-2 py-1 text-sm">
                  {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}><Search size={16} /></span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหางาน..."
              aria-label="ค้นหางาน"
              className="inp w-full rounded-xl pl-9 pr-9 py-2.5"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="ล้างคำค้นหา" className="absolute right-2 top-1/2 -translate-y-1/2 p-1" style={{ color: 'var(--muted)' }}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-1 p-1 card mb-4" role="tablist">
            {FILTERS.map(([k, l]) => (
              <button
                key={k}
                role="tab"
                aria-selected={filter === k}
                onClick={() => setFilter(k)}
                className={'tab flex-1 py-2 rounded-lg text-sm font-medium ' + (filter === k ? 'on' : '')}
              >
                {l}
              </button>
            ))}
          </div>

          <ul className="list-none p-0 m-0">
            {shown.map((t) => (
              <TodoItem key={t.id} t={t} onToggle={toggle} onDelete={del} onUpdate={update} onPri={cyc} />
            ))}
          </ul>

          {shown.length === 0 && (
            <div className="card py-10 text-center" style={{ color: 'var(--muted)' }}>
              <div className="flex justify-center mb-2"><ListX size={40} /></div>
              {q ? `ไม่พบงานที่ตรงกับ "${query}"` : todos.length === 0 ? 'ยังไม่มีงาน เพิ่มงานแรกได้เลย' : 'ไม่มีงานในหมวดนี้'}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-sm">
            <span style={{ color: 'var(--muted)' }}>เหลืออีก {remaining} งาน</span>
            <button
              onClick={() => setTodos(todos.filter((t) => !t.done))}
              disabled={doneCount === 0}
              className="font-medium disabled:opacity-40"
              style={{ color: 'var(--accent)' }}
            >
              ล้างงานที่เสร็จแล้ว ({doneCount})
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
