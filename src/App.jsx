import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Check, ListX } from 'lucide-react'

const PRI = {
  low:    { label: 'ต่ำ',  cls: 'bg-emerald-100 text-emerald-700', bar: '#10b981' },
  medium: { label: 'กลาง', cls: 'bg-amber-100 text-amber-700',     bar: '#f59e0b' },
  high:   { label: 'สูง',  cls: 'bg-rose-100 text-rose-700',       bar: '#f43f5e' },
}
const NEXT_PRI = { low: 'medium', medium: 'high', high: 'low' }
const FILTERS = [['all', 'ทั้งหมด'], ['active', 'ยังไม่เสร็จ'], ['done', 'เสร็จแล้ว']]

function TodoItem({ t, onToggle, onDelete, onEdit, onPri }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(t.text)
  const [leaving, setLeaving] = useState(false)
  const ref = useRef(null)
  useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

  const save = () => {
    const v = val.trim()
    if (v) onEdit(t.id, v)
    else setVal(t.text)
    setEditing(false)
  }
  const del = () => { setLeaving(true); setTimeout(() => onDelete(t.id), 250) }
  const p = PRI[t.pri]

  return (
    <li
      className={'item card flex items-center gap-3 p-3 sm:p-4 mb-2 ' + (leaving ? 'out' : '')}
      style={{ borderLeft: '4px solid ' + p.bar }}
    >
      <button
        onClick={() => onToggle(t.id)}
        aria-label="ทำเครื่องหมายเสร็จ"
        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-white"
        style={{
          background: t.done ? 'var(--accent)' : 'transparent',
          border: '2px solid ' + (t.done ? 'var(--accent)' : 'var(--line)'),
        }}
      >
        {t.done && <Check size={14} />}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={ref}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') { setVal(t.text); setEditing(false) }
            }}
            className="inp w-full rounded-lg px-2 py-1"
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            title="ดับเบิลคลิกเพื่อแก้ไข"
            className="block break-words cursor-text select-none"
            style={{
              textDecoration: t.done ? 'line-through' : 'none',
              color: t.done ? 'var(--muted)' : 'var(--text)',
            }}
          >
            {t.text}
          </span>
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
        className="shrink-0 p-2 rounded-lg hover:bg-rose-50 hover:text-rose-600"
        style={{ color: 'var(--muted)' }}
      >
        <Trash2 size={18} />
      </button>
    </li>
  )
}

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'ส่งรายงานประจำสัปดาห์', done: false, pri: 'high' },
    { id: 2, text: 'ซื้อของเข้าบ้าน', done: false, pri: 'medium' },
    { id: 3, text: 'อ่านหนังสือ 20 หน้า', done: true, pri: 'low' },
  ])
  const [text, setText] = useState('')
  const [pri, setPri] = useState('medium')
  const [filter, setFilter] = useState('all')
  const nextId = useRef(4)

  const add = () => {
    const v = text.trim()
    if (!v) return
    setTodos([{ id: nextId.current++, text: v, done: false, pri }, ...todos])
    setText('')
  }
  const toggle = (id) => setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const del = (id) => setTodos(todos.filter((t) => t.id !== id))
  const edit = (id, v) => setTodos(todos.map((t) => (t.id === id ? { ...t, text: v } : t)))
  const cyc = (id) => setTodos(todos.map((t) => (t.id === id ? { ...t, pri: NEXT_PRI[t.pri] } : t)))

  const remaining = todos.filter((t) => !t.done).length
  const doneCount = todos.length - remaining
  const shown = todos.filter((t) =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">รายการงานของฉัน</h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
        ดับเบิลคลิกที่งานเพื่อแก้ไข · แตะป้ายเพื่อเปลี่ยนความสำคัญ
      </p>

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
        <div className="flex items-center gap-2 mt-3">
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
          <TodoItem key={t.id} t={t} onToggle={toggle} onDelete={del} onEdit={edit} onPri={cyc} />
        ))}
      </ul>

      {shown.length === 0 && (
        <div className="card py-10 text-center" style={{ color: 'var(--muted)' }}>
          <div className="flex justify-center mb-2"><ListX size={40} /></div>
          {filter === 'all' ? 'ยังไม่มีงาน เพิ่มงานแรกได้เลย' : 'ไม่มีงานในหมวดนี้'}
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
    </div>
  )
}
