import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, rupiah, getUser } from '../api';
import Status from '../components/Status';

const statusLabels = {
  pending: 'Menunggu',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

function toCsv(report) {
  const lines = [];
  lines.push('Laporan Penjualan Kriya Kita');
  lines.push(`Periode,${report.range.from} s.d. ${report.range.to}`);
  lines.push('');
  lines.push('Ringkasan');
  lines.push('Total Pesanan,Total Item Terjual,Total Omzet');
  lines.push(`${report.summary.total_orders},${report.summary.total_items},${report.summary.total_revenue}`);
  lines.push('');
  lines.push('Penjualan Harian');
  lines.push('Tanggal,Jumlah Pesanan,Omzet');
  report.daily.forEach(d => lines.push(`${d.date},${d.orders},${d.revenue}`));
  lines.push('');
  lines.push('Produk Terlaris');
  lines.push('Produk,Jumlah Terjual,Omzet');
  report.top_products.forEach(p => lines.push(`"${p.name}",${p.qty_sold},${p.revenue}`));
  return lines.join('\n');
}

function downloadCsv(report) {
  const blob = new Blob([toCsv(report)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-penjualan-${report.range.from}_${report.range.to}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const nav = useNavigate();
  const user = getUser();
  const [report, setReport] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (params = {}) => {
    setLoading(true);
    setError('');
    const query = new URLSearchParams(params).toString();
    api(`/admin/reports/sales${query ? `?${query}` : ''}`)
      .then(data => {
        setReport(data);
        setFrom(data.range.from);
        setTo(data.range.to);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role !== 'admin') { nav('/'); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  if (user?.role !== 'admin') return null;

  const applyFilter = e => {
    e.preventDefault();
    load({ from, to });
  };

  return (
    <div className="container page-shell">
      <Link className="back-link" to="/admin">← Dashboard</Link>
      <div className="admin-head">
        <div>
          <span className="eyebrow">LAPORAN</span>
          <h1>Laporan penjualan.</h1>
          <p>Pantau omzet, jumlah pesanan, dan produk terlaris pada periode tertentu.</p>
        </div>
        {report && (
          <button className="btn btn-secondary" onClick={() => downloadCsv(report)}>
            Unduh CSV
          </button>
        )}
      </div>

      <form className="filter-bar" onSubmit={applyFilter}>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} max={to || undefined} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} min={from || undefined} />
        <button className="btn btn-primary" type="submit">Terapkan</button>
      </form>

      {error && <Status type="error">{error}</Status>}
      {loading && <Status>Memuat laporan...</Status>}

      {!loading && report && (
        <>
          <div className="stats-grid">
            <div><span>Total pesanan</span><strong>{report.summary.total_orders}</strong></div>
            <div><span>Item terjual</span><strong>{report.summary.total_items}</strong></div>
            <div><span>Omzet periode ini</span><strong>{rupiah(report.summary.total_revenue)}</strong></div>
            <div>
              <span>Rata-rata / pesanan</span>
              <strong>
                {rupiah(report.summary.total_orders ? report.summary.total_revenue / report.summary.total_orders : 0)}
              </strong>
            </div>
          </div>

          <div className="admin-table-wrap" style={{ marginBottom: 20 }}>
            <div className="table-title">
              <h2>Penjualan harian</h2>
              <span>{report.range.from} – {report.range.to}</span>
            </div>
            {report.daily.length ? (
              <table className="simple-table">
                <thead>
                  <tr><th>Tanggal</th><th>Pesanan</th><th>Omzet</th></tr>
                </thead>
                <tbody>
                  {report.daily.map(d => (
                    <tr key={d.date}>
                      <td>{d.date}</td>
                      <td>{d.orders}</td>
                      <td>{rupiah(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Status>Belum ada transaksi pada periode ini.</Status>
            )}
          </div>

          <div className="admin-table-wrap" style={{ marginBottom: 20 }}>
            <div className="table-title">
              <h2>Produk terlaris</h2>
              <span>Top 10 berdasarkan jumlah terjual</span>
            </div>
            {report.top_products.length ? (
              <table className="simple-table">
                <thead>
                  <tr><th>Produk</th><th>Terjual</th><th>Omzet</th></tr>
                </thead>
                <tbody>
                  {report.top_products.map(p => (
                    <tr key={p.product_id}>
                      <td>{p.name}</td>
                      <td>{p.qty_sold}</td>
                      <td>{rupiah(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Status>Belum ada produk terjual pada periode ini.</Status>
            )}
          </div>

          <div className="admin-table-wrap">
            <div className="table-title">
              <h2>Status pesanan</h2>
              <span>Termasuk yang dibatalkan</span>
            </div>
            <table className="simple-table">
              <thead>
                <tr><th>Status</th><th>Jumlah</th></tr>
              </thead>
              <tbody>
                {report.status_breakdown.length ? report.status_breakdown.map(s => (
                  <tr key={s.status}>
                    <td>{statusLabels[s.status] || s.status}</td>
                    <td>{s.total}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={2}>Tidak ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}