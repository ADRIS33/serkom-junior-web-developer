import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api, rupiah, getUser } from '../api';
import Status from '../components/Status';

const statusLabels = {
  pending: 'Menunggu',
  paid: 'Dibayar',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

function formatTanggal(date) {
  if (!date) return '-';
  const raw = typeof date === 'string' ? date.slice(0, 10) : date;
  const d = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit'
  });
}

function formatTanggalLengkap(date) {
  if (!date) return '-';
  const raw = typeof date === 'string' ? date.slice(0, 10) : date;
  const d = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

/** Cetak struk / laporan ringkas dalam format PDF thermal-style */
function cetakStruk(report) {
  if (!report) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 280]
  });

  let y = 10;

  const line = (text = '', size = 9, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const maxWidth = 70;
    const lines = doc.splitTextToSize(String(text), maxWidth);
    lines.forEach((l) => {
      doc.text(l, 5, y);
      y += size * 0.5 + 1.5;
    });
  };

  const separator = () => {
    doc.setDrawColor(150);
    doc.line(5, y, 75, y);
    y += 4;
  };

  line('KRIYA KITA', 14, true);
  line('Laporan Penjualan', 10, true);
  y += 1;

  const rangeStart = report.range?.from || report.range?.start || '-';
  const rangeEnd = report.range?.to || report.range?.end || '-';
  line(`Periode: ${rangeStart} s/d ${rangeEnd}`, 8);
  line(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 7);
  separator();

  line('RINGKASAN', 10, true);
  if (report.summary) {
    line(`Total pesanan : ${report.summary.total_orders ?? 0}`);
    line(`Total omzet   : ${rupiah(report.summary.total_revenue ?? 0)}`);
    line(`Total produk  : ${report.summary.total_items ?? 0}`);
  }
  separator();

  line('PENJUALAN HARIAN', 10, true);
  if (report.daily?.length) {
    report.daily.forEach((item) => {
      line(
        `${formatTanggal(item.date)} | ${item.orders ?? 0} pesanan | ${rupiah(item.revenue ?? 0)}`,
        8
      );
    });
  } else {
    line('Belum ada data.', 8);
  }
  separator();

  line('PRODUK TERLARIS', 10, true);
  if (report.top_products?.length) {
    report.top_products.forEach((item, index) => {
      const sold = item.total_sold ?? item.qty_sold ?? 0;
      line(`${index + 1}. ${item.name}`, 8);
      line(`   ${sold} terjual | ${rupiah(item.revenue ?? 0)}`, 7);
    });
  } else {
    line('Belum ada data.', 8);
  }
  separator();

  line('STATUS PESANAN', 10, true);
  if (report.status_breakdown?.length) {
    report.status_breakdown.forEach((item) => {
      const label = statusLabels[item.status] || item.status;
      line(`${label}: ${item.total ?? 0}`, 8);
    });
  } else {
    line('Belum ada data.', 8);
  }
  separator();

  y += 2;
  line('Terima kasih.', 9, true);
  line('KRIYA KITA — Kerajinan lokal', 7);

  doc.save(
    `struk-laporan-${rangeStart}_${rangeEnd}.pdf`
  );
}

export default function AdminReports() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadReport(params = {}) {
    try {
      setLoading(true);
      setError('');

      const query = new URLSearchParams();
      if (params.from) query.append('from', params.from);
      if (params.to) query.append('to', params.to);
      const qs = query.toString();

      // api() mengembalikan JSON langsung (bukan axios)
      const data = await api(`/admin/reports/sales${qs ? `?${qs}` : ''}`);
      setReport(data);
      if (data?.range) {
        setFrom(data.range.from || data.range.start || '');
        setTo(data.range.to || data.range.end || '');
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.message || 'Gagal mengambil laporan penjualan.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(e) {
    e.preventDefault();
    loadReport({ from, to });
  }

  function resetFilter() {
    setFrom('');
    setTo('');
    loadReport({});
  }

  const chartData =
    report?.daily?.map((item) => ({
      tanggal: formatTanggal(item.date),
      omzet: Number(item.revenue) || 0,
      pesanan: Number(item.orders) || 0
    })) || [];

  if (loading) {
    return (
      <div className="container page-shell">
        <Status>Memuat laporan penjualan...</Status>
      </div>
    );
  }

  return (
    <div className="container page-shell">
      <Link className="back-link" to="/admin">
        ← Dashboard
      </Link>

      <div className="admin-head">
        <div>
          <span className="eyebrow">LAPORAN</span>
          <h1>Laporan penjualan.</h1>
          <p>
            Pantau omzet, pesanan, produk terlaris, dan status pesanan.
            Cetak struk PDF kapan saja.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => cetakStruk(report)}
            disabled={!report}
          >
            🧾 Cetak Struk PDF
          </button>
        </div>
      </div>

      <form
        className="filter-bar"
        onSubmit={handleFilter}
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'end',
          marginBottom: 24,
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: 16
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>
            Tanggal mulai
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            max={to || undefined}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>
            Tanggal akhir
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            min={from || undefined}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Terapkan
        </button>
        <button type="button" className="btn btn-secondary" onClick={resetFilter}>
          Reset
        </button>
      </form>

      {error && <Status type="error">{error}</Status>}

      {report && (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div>
              <span>Total pesanan</span>
              <strong>{report.summary?.total_orders ?? 0}</strong>
            </div>
            <div>
              <span>Total omzet</span>
              <strong>{rupiah(report.summary?.total_revenue ?? 0)}</strong>
            </div>
            <div>
              <span>Produk terjual</span>
              <strong>{report.summary?.total_items ?? 0}</strong>
            </div>
            <div>
              <span>Produk terlaris</span>
              <strong style={{ fontSize: 18 }}>
                {report.top_products?.[0]?.name || '-'}
              </strong>
            </div>
          </div>

          {/* DIAGRAM BATANG */}
          <div className="admin-table-wrap" style={{ marginBottom: 20 }}>
            <div className="table-title">
              <h2>Grafik omzet</h2>
              <span>Diagram batang per hari</span>
            </div>
            {chartData.length ? (
              <div style={{ width: '100%', height: 340 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
                    <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) =>
                        v >= 1_000_000
                          ? `${(v / 1_000_000).toFixed(1)}jt`
                          : v >= 1000
                            ? `${Math.round(v / 1000)}rb`
                            : String(v)
                      }
                    />
                    <Tooltip
                      formatter={(value, name) =>
                        name === 'omzet' ? rupiah(value) : value
                      }
                      labelFormatter={(label) => `Tanggal ${label}`}
                    />
                    <Bar
                      dataKey="omzet"
                      name="omzet"
                      fill="#8b5e3c"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Status>Belum ada data omzet pada periode ini.</Status>
            )}
          </div>

          <div className="admin-table-wrap" style={{ marginBottom: 20 }}>
            <div className="table-title">
              <h2>Penjualan harian</h2>
              <span>
                {formatTanggalLengkap(report.range?.from || report.range?.start)}{' '}
                — {formatTanggalLengkap(report.range?.to || report.range?.end)}
              </span>
            </div>
            {report.daily?.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Pesanan</th>
                      <th>Omzet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.daily.map((item, index) => (
                      <tr key={item.date || index}>
                        <td>{formatTanggalLengkap(item.date)}</td>
                        <td>{item.orders ?? 0}</td>
                        <td>{rupiah(item.revenue ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Status>Belum ada data penjualan harian.</Status>
            )}
          </div>

          <div className="admin-table-wrap" style={{ marginBottom: 20 }}>
            <div className="table-title">
              <h2>Produk terlaris</h2>
              <span>Berdasarkan jumlah produk terjual</span>
            </div>
            {report.top_products?.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Produk</th>
                      <th>Terjual</th>
                      <th>Omzet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.top_products.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.total_sold ?? item.qty_sold ?? 0}</td>
                        <td>{rupiah(item.revenue ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Status>Belum ada data produk terlaris.</Status>
            )}
          </div>

          <div className="admin-table-wrap" style={{ marginBottom: 20 }}>
            <div className="table-title">
              <h2>Status pesanan</h2>
              <span>Distribusi status pada periode</span>
            </div>
            {report.status_breakdown?.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.status_breakdown.map((item, index) => (
                      <tr key={item.status || index}>
                        <td>{statusLabels[item.status] || item.status}</td>
                        <td>{item.total ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Status>Belum ada data status pesanan.</Status>
            )}
          </div>
        </>
      )}
    </div>
  );
}
