import { useEffect, useMemo, useState } from 'react';
import { listFeedback } from '../api';
import Modal from './Modal.jsx';

function downloadCSV(rows) {
  if (!rows?.length) return;
  const headers = ['id', 'name', 'email', 'message', 'created_at'];
  const esc = (v = '') => `"${String(v).replaceAll('"', '""')}"`;
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => esc(r[h] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `feedback_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


export default function AdminPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(50);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'created_at', dir: 'desc' });
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

 // const onView = (r) => { setSelected(r); setOpen(true); };

  function viewRecord(r) {
    setSelected(r);
    setOpen(true);
  }
  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await listFeedback({ limit });
      setRows(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setError(e.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [limit]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (q) {
      out = rows.filter((r) =>
        [r.id, r.name, r.email, r.message]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...out].sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      if (sort.key === 'created_at') {
        return (new Date(va || 0) - new Date(vb || 0)) * dir;
      }
      return String(va ?? '').localeCompare(String(vb ?? '')) * dir;
    });
  }, [rows, query, sort]);

  function toggleSort(key) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  }

  return (
    <div className="card">
      <h2>Admin Panel</h2>
      <div className="toolbar" style={{ flexWrap: 'wrap' }}>
        <label>
          Show
          <input
            type="number"
            min={1}
            max={200}
            value={limit}
            onChange={(e) => setLimit(Math.min(Math.max(Number(e.target.value) || 50, 1), 200))}
            style={{ width: 64, marginLeft: 8 }}
          />
          records
        </label>
        <input
          placeholder="Search (name, email, message)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
        />
        <button onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        <button onClick={() => downloadCSV(filtered)} disabled={!filtered.length}>
          Export CSV
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {!error && !loading && !filtered.length && <p className="success">No feedback yet.</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th onClick={() => toggleSort('id')} style={{ cursor: 'pointer' }}>
                ID {sort.key === 'id' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
                Name {sort.key === 'name' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => toggleSort('email')} style={{ cursor: 'pointer' }}>
                Email {sort.key === 'email' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Message</th>
              <th onClick={() => toggleSort('created_at')} style={{ cursor: 'pointer' }}>
                Created {sort.key === 'created_at' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td>
                  {r.email}
                </td>
                <td style={{ maxWidth: 420, whiteSpace: 'pre-wrap' }}>{r.message}</td>
                <td>{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</td>
                <td>
                  <button onClick={() => viewRecord(r)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal open={open} title={selected ? `Feedback #${selected.id} | ${selected.created_at ? new Date(selected.created_at).toLocaleString() : ""}` : "Feedback details"} onClose={() => setOpen(false)}>
          {selected && (
              <div className="feedback-details">

                <ul>
                  <li>
                    Name: {selected.name}
                  </li>
                  <li>
                    Email: {selected.email}
                  </li>
                  <li>
                    Message: <br/>
                    {selected.message}
                  </li>
                </ul>
              </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
