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

  const d = new Date(`${date}T00:00:00`);

  if (Number.isNaN(d.getTime())) return date;

  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit'
  });
}

function cetakStruk(report) {
  if (!report) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 250]
  });

  let y = 10;

  const line = (text = '', size = 9, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.text(String(text), 5, y);
    y += size * 0.55 + 2;
  };

  const separator = () => {
    doc.setDrawColor(150);
    doc.line(5, y, 75, y);
    y += 4;
  };

  line('KRIYA KITA', 15, true);
  line('Laporan Penjualan', 10, true);

  y += 2;

  if (report.range) {
    line(
      `Periode: ${report.range.start || '-'} s/d ${report.range.end || '-'}`,
      8
    );
  }

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
      line(`${formatTanggal(item.date)} | ${item.orders ?? 0} pesanan`);
      line(`  ${rupiah(item.revenue ?? 0)}`, 8);
    });
  } else {
    line('Belum ada data.');
  }

  separator();

  line('PRODUK TERLARIS', 10, true);

  if (report.top_products?.length) {
    report.top_products.forEach((item, index) => {
      line(`${index + 1}. ${item.name}`);
      line(
        `   ${item.total_sold ?? 0} terjual | ${rupiah(item.revenue ?? 0)}`,
        8
      );
    });
  } else {
    line('Belum ada data.');
  }

  separator();

  line('STATUS PESANAN', 10, true);

  if (report.status_breakdown?.length) {
    report.status_breakdown.forEach((item) => {
      const label = statusLabels[item.status] || item.status;
      line(`${label}: ${item.total ?? 0}`);
    });
  } else {
    line('Belum ada data.');
  }

  separator();

  y += 3;
  line('Terima kasih.', 9, true);
  line('KRIYA KITA', 8);

  doc.save('laporan-penjualan-kriya-kita.pdf');
}

export default function AdminReports() {
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
  }, []);

  async function loadReport(customStart = startDate, customEnd = endDate) {
    try {
      setLoading(true);
      setError('');

      let url = '/admin/reports/sales';

      const params = new URLSearchParams();

      if (customStart) {
        params.append('start_date', customStart);
      }

      if (customEnd) {
        params.append('end_date', customEnd);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);

      setReport(response.data?.data || response.data);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Gagal mengambil laporan penjualan.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(e) {
    e.preventDefault();
    loadReport(startDate, endDate);
  }

  function resetFilter() {
    setStartDate('');
    setEndDate('');
    loadReport('', '');
  }

  const chartData =
    report?.daily?.map((item) => ({
      tanggal: formatTanggal(item.date),
      omzet: Number(item.revenue) || 0
    })) || [];

  if (loading) {
    return (
      <div className="admin-page">
        <Status>Memuat laporan penjualan...</Status>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">

        <div className="admin-header">
          <div>
            <span className="admin-kicker">ADMIN</span>
            <h1>Laporan Penjualan</h1>
            <p>
              Pantau omzet, pesanan, produk terlaris, dan status pesanan.
            </p>
          </div>

          <div className="admin-header-actions">
            <Link to="/admin" className="admin-btn secondary">
              ← Dashboard
            </Link>

            <button
              type="button"
              className="admin-btn"
              onClick={() => cetakStruk(report)}
              disabled={!report}
            >
              🧾 Cetak Struk PDF
            </button>
          </div>
        </div>

        <div className="admin-table-wrap" style={{ marginBottom: 20 }}>
          <div className="table-title">
            <h2>Filter laporan</h2>
            <span>Pilih periode penjualan</span>
          </div>

          <form
            onSubmit={handleFilter}
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              padding: 16,
              alignItems: 'end'
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  fontSize: 13
                }}
              >
                Tanggal mulai
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  fontSize: 13
                }}
              >
                Tanggal akhir
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="admin-input"
              />
            </div>

            <button type="submit" className="admin-btn">
              Terapkan
            </button>

            <button
              type="button"
              className="admin-btn secondary"
              onClick={resetFilter}
            >
              Reset
            </button>
          </form>
        </div>

        {error && (
          <div style={{ marginBottom: 20 }}>
            <Status>{error}</Status>
          </div>
        )}

        {report && (
          <>
            <div
              className="admin-stats"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
                marginBottom: 20
              }}
            >
              <div className="admin-stat-card">
                <span>Total pesanan</span>
                <strong>
                  {report.summary?.total_orders ?? 0}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>Total omzet</span>
                <strong>
                  {rupiah(report.summary?.total_revenue ?? 0)}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>Total produk terjual</span>
                <strong>
                  {report.summary?.total_items ?? 0}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>Produk terlaris</span>
                <strong>
                  {report.top_products?.[0]?.name || '-'}
                </strong>
              </div>
            </div>

            {/* DIAGRAM BATANG */}
            <div
              className="admin-table-wrap"
              style={{ marginBottom: 20 }}
            >
              <div className="table-title">
                <h2>Grafik omzet</h2>
                <span>Diagram batang per hari</span>
              </div>

              {chartData.length ? (
                <div
                  style={{
                    width: '100%',
                    height: 350,
                    padding: '10px 0'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 30,
                        bottom: 10
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="tanggal" />

                      <YAxis
                        tickFormatter={(value) =>
                          `Rp ${Number(value).toLocaleString('id-ID')}`
                        }
                      />

                      <Tooltip
                        formatter={(value) => rupiah(value)}
                      />

                      <Bar
                        dataKey="omzet"
                        name="Omzet"
                        fill="#8b5e3c"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Status>
                  Belum ada data omzet pada periode ini.
                </Status>
              )}
            </div>

            <div
              className="admin-table-wrap"
              style={{ marginBottom: 20 }}
            >
              <div className="table-title">
                <h2>Penjualan harian</h2>
                <span>Omzet berdasarkan tanggal</span>
              </div>

              {report.daily?.length ? (
                <div className="table-responsive">
                  <table className="admin-table">
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
                          <td>{item.date}</td>
                          <td>{item.orders ?? 0}</td>
                          <td>
                            {rupiah(item.revenue ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Status>
                  Belum ada data penjualan harian.
                </Status>
              )}
            </div>

            <div
              className="admin-table-wrap"
              style={{ marginBottom: 20 }}
            >
              <div className="table-title">
                <h2>Produk terlaris</h2>
                <span>Berdasarkan jumlah produk terjual</span>
              </div>

              {report.top_products?.length ? (
                <div className="table-responsive">
                  <table className="admin-table">
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
                          <td>{item.total_sold ?? 0}</td>
                          <td>
                            {rupiah(item.revenue ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Status>
                  Belum ada data produk terlaris.
                </Status>
              )}
            </div>

            <div
              className="admin-table-wrap"
              style={{ marginBottom: 20 }}
            >
              <div className="table-title">
                <h2>Status pesanan</h2>
                <span>Distribusi status pesanan</span>
              </div>

              {report.status_breakdown?.length ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Jumlah</th>
                      </tr>
                    </thead>

                    <tbody>
                      {report.status_breakdown.map((item, index) => (
                        <tr key={item.status || index}>
                          <td>
                            {statusLabels[item.status] ||
                              item.status}
                          </td>

                          <td>{item.total ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Status>
                  Belum ada data status pesanan.
                </Status>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}