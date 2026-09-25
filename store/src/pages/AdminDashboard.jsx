import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api, rupiah, getUser, logout } from '../api';
import Status from '../components/Status';

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    setLoading(true);
    api('/admin/dashboard')
      .then(setStats)
      .catch((e) => setError(e.message || 'Gagal memuat dashboard.'))
      .finally(() => setLoading(false));
  }, [navigate, user]);

  const out = () => {
    logout();
    window.dispatchEvent(new Event('authchange'));
    navigate('/');
  };

  if (user?.role !== 'admin') return null;

  const chartData =
    stats?.daily_sales?.map((item) => ({
      tanggal: formatTanggal(item.date),
      omzet: Number(item.revenue) || 0,
      pesanan: Number(item.orders) || 0
    })) || [];

  return (
    <div className="container page-shell">
      <div className="admin-head">
        <div>
          <span className="eyebrow">ADMINISTRATOR</span>
          <h1>Ruang kendali.</h1>
          <p>Kelola katalog, pesanan, dan pantau omzet Kriya Kita.</p>
        </div>
        <button className="btn btn-secondary" onClick={out}>
          Keluar admin
        </button>
      </div>

      {error && <Status type="error">{error}</Status>}
      {loading && <Status>Memuat dashboard...</Status>}

      {stats && (
        <>
          <div className="stats-grid">
            <div>
              <span>Produk</span>
              <strong>{stats.products}</strong>
            </div>
            <div>
              <span>Pelanggan</span>
              <strong>{stats.users}</strong>
            </div>
            <div>
              <span>Pesanan</span>
              <strong>{stats.orders}</strong>
            </div>
            <div>
              <span>Omzet tercatat</span>
              <strong>{rupiah(stats.revenue)}</strong>
            </div>
          </div>

          {/* DIAGRAM BATANG 7 HARI TERAKHIR */}
          <div className="admin-table-wrap" style={{ marginBottom: 28 }}>
            <div className="table-title">
              <h2>Omzet 7 hari terakhir</h2>
              <span>Diagram batang harian</span>
            </div>
            {chartData.length ? (
              <div style={{ width: '100%', height: 300 }}>
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
              <Status>
                Belum ada data penjualan 7 hari terakhir. Buat pesanan dulu
                untuk melihat grafik.
              </Status>
            )}
          </div>

          <div className="admin-links">
            <Link to="/admin/products">
              <span>01</span>
              <div>
                <b>Kelola produk</b>
                <small>Tambah, edit, hapus dan atur stok.</small>
              </div>
              <span>→</span>
            </Link>
            <Link to="/admin/orders">
              <span>02</span>
              <div>
                <b>Kelola pesanan</b>
                <small>Perbarui status pesanan pelanggan.</small>
              </div>
              <span>→</span>
            </Link>
            <Link to="/admin/reports">
              <span>03</span>
              <div>
                <b>Laporan penjualan</b>
                <small>Omzet, produk terlaris, cetak struk PDF.</small>
              </div>
              <span>→</span>
            </Link>
            <Link to="/products">
              <span>04</span>
              <div>
                <b>Lihat toko</b>
                <small>Periksa tampilan katalog dari sisi pelanggan.</small>
              </div>
              <span>→</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
