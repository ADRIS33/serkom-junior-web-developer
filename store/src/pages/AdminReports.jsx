import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { api, rupiah, getUser } from '../api';
import Status from '../components/Status';

const statusLabels = {
  pending: 'Menunggu',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

function cetakStruk(report) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 250]
  });

  let y = 10;

  // =========================
  // HEADER
  // =========================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('KRIYA KITA', 40, y, {
    align: 'center'
  });

  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  doc.text(
    'Laporan Penjualan',
    40,
    y,
    { align: 'center' }
  );

  y += 5;

  doc.text(
    'Kerajinan lokal Indonesia',
    40,
    y,
    { align: 'center' }
  );

  y += 7;

  doc.line(5, y, 75, y);

  y += 6;

  // =========================
  // PERIODE
  // =========================

  doc.setFontSize(8);

  doc.text('Periode', 5, y);

  doc.text(
    `${report.range.from} s.d. ${report.range.to}`,
    75,
    y,
    { align: 'right' }
  );

  y += 6;

  doc.line(5, y, 75, y);

  y += 7;

  // =========================
  // RINGKASAN
  // =========================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  doc.text(
    'RINGKASAN',
    5,
    y
  );

  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  doc.text(
    'Total pesanan',
    5,
    y
  );

  doc.text(
    String(report.summary.total_orders),
    75,
    y,
    { align: 'right' }
  );

  y += 5;

  doc.text(
    'Item terjual',
    5,
    y
  );

  doc.text(
    String(report.summary.total_items),
    75,
    y,
    { align: 'right' }
  );

  y += 5;

  doc.text(
    'Total omzet',
    5,
    y
  );

  doc.text(
    rupiah(report.summary.total_revenue),
    75,
    y,
    { align: 'right' }
  );

  y += 5;

  const average =
    report.summary.total_orders
      ? report.summary.total_revenue /
        report.summary.total_orders
      : 0;

  doc.text(
    'Rata-rata / pesanan',
    5,
    y
  );

  doc.text(
    rupiah(average),
    75,
    y,
    { align: 'right' }
  );

  y += 7;

  doc.line(5, y, 75, y);

  y += 7;

  // =========================
  // PENJUALAN HARIAN
  // =========================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  doc.text(
    'PENJUALAN HARIAN',
    5,
    y
  );

  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  doc.text(
    'Tanggal',
    5,
    y
  );

  doc.text(
    'Pesanan',
    43,
    y,
    { align: 'center' }
  );

  doc.text(
    'Omzet',
    75,
    y,
    { align: 'right' }
  );

  y += 4;

  doc.line(5, y, 75, y);

  y += 5;

  if (report.daily.length) {

    report.daily.forEach((item) => {

      doc.text(
        String(item.date),
        5,
        y
      );

      doc.text(
        String(item.orders),
        43,
        y,
        { align: 'center' }
      );

      doc.text(
        rupiah(item.revenue),
        75,
        y,
        { align: 'right' }
      );

      y += 5;

    });

  } else {

    doc.text(
      'Tidak ada transaksi.',
      5,
      y
    );

    y += 5;

  }

  y += 2;

  doc.line(5, y, 75, y);

  y += 7;

  // =========================
  // PRODUK TERLARIS
  // =========================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  doc.text(
    'PRODUK TERLARIS',
    5,
    y
  );

  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  doc.text(
    'Produk',
    5,
    y
  );

  doc.text(
    'Qty',
    43,
    y,
    { align: 'center' }
  );

  doc.text(
    'Omzet',
    75,
    y,
    { align: 'right' }
  );

  y += 4;

  doc.line(5, y, 75, y);

  y += 5;

  if (report.top_products.length) {

    report.top_products.forEach((item) => {

      let name =
        item.name || 'Produk';

      if (name.length > 24) {
        name =
          name.substring(0, 24) +
          '...';
      }

      doc.text(
        name,
        5,
        y
      );

      doc.text(
        String(item.qty_sold),
        43,
        y,
        { align: 'center' }
      );

      doc.text(
        rupiah(item.revenue),
        75,
        y,
        { align: 'right' }
      );

      y += 5;

    });

  } else {

    doc.text(
      'Belum ada produk terjual.',
      5,
      y
    );

    y += 5;

  }

  y += 2;

  doc.line(5, y, 75, y);

  y += 7;

  // =========================
  // STATUS PESANAN
  // =========================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  doc.text(
    'STATUS PESANAN',
    5,
    y
  );

  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (report.status_breakdown.length) {

    report.status_breakdown.forEach((item) => {

      doc.text(
        statusLabels[item.status] ||
        item.status,
        5,
        y
      );

      doc.text(
        String(item.total),
        75,
        y,
        { align: 'right' }
      );

      y += 5;

    });

  } else {

    doc.text(
      'Tidak ada data.',
      5,
      y
    );

    y += 5;

  }

  y += 3;

  doc.line(5, y, 75, y);

  y += 7;

  // =========================
  // FOOTER
  // =========================

  doc.setFontSize(8);

  doc.text(
    'Terima kasih telah menggunakan',
    40,
    y,
    { align: 'center' }
  );

  y += 4;

  doc.text(
    'Kriya Kita.',
    40,
    y,
    { align: 'center' }
  );

  y += 5;

  doc.setFontSize(7);

  doc.text(
    new Date().toLocaleString('id-ID'),
    40,
    y,
    { align: 'center' }
  );

  // =========================
  // SIMPAN PDF
  // =========================

  doc.save(
    `struk-kriya-kita-${report.range.from}_${report.range.to}.pdf`
  );
}

export default function AdminReports() {

  const nav = useNavigate();

  const user = getUser();

  const [report, setReport] =
    useState(null);

  const [from, setFrom] =
    useState('');

  const [to, setTo] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  // =========================
  // LOAD REPORT
  // =========================

  const load = (params = {}) => {

    setLoading(true);

    setError('');

    const query =
      new URLSearchParams(
        params
      ).toString();

    api(
      `/admin/reports/sales${
        query
          ? `?${query}`
          : ''
      }`
    )
      .then((data) => {

        setReport(data);

        setFrom(
          data.range.from
        );

        setTo(
          data.range.to
        );

      })
      .catch((e) => {

        setError(
          e.message
        );

      })
      .finally(() => {

        setLoading(false);

      });
  };

  // =========================
  // CHECK ADMIN
  // =========================

  useEffect(() => {

    if (user?.role !== 'admin') {

      nav('/');

      return;
    }

    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  if (user?.role !== 'admin') {
    return null;
  }

  // =========================
  // FILTER
  // =========================

  const applyFilter = (e) => {

    e.preventDefault();

    load({
      from,
      to
    });

  };

  return (

    <div className="container page-shell">

      {/* BACK */}

      <Link
        className="back-link"
        to="/admin"
      >
        ← Dashboard
      </Link>

      {/* HEADER */}

      <div className="admin-head">

        <div>

          <span className="eyebrow">
            LAPORAN
          </span>

          <h1>
            Laporan penjualan.
          </h1>

          <p>
            Pantau omzet, jumlah pesanan,
            dan produk terlaris pada periode tertentu.
          </p>

        </div>

        {report && (

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() =>
              cetakStruk(report)
            }
          >
            🧾 Cetak Struk PDF
          </button>

        )}

      </div>

      {/* FILTER */}

      <form
        className="filter-bar"
        onSubmit={applyFilter}
      >

        <input
          type="date"
          value={from}
          onChange={(e) =>
            setFrom(e.target.value)
          }
          max={
            to || undefined
          }
        />

        <input
          type="date"
          value={to}
          onChange={(e) =>
            setTo(e.target.value)
          }
          min={
            from || undefined
          }
        />

        <button
          className="btn btn-primary"
          type="submit"
        >
          Terapkan
        </button>

      </form>

      {/* ERROR */}

      {error && (

        <Status type="error">
          {error}
        </Status>

      )}

      {/* LOADING */}

      {loading && (

        <Status>
          Memuat laporan...
        </Status>

      )}

      {/* REPORT */}

      {!loading &&
        report && (

        <>

          {/* STATISTIK */}

          <div className="stats-grid">

            <div>

              <span>
                Total pesanan
              </span>

              <strong>
                {report.summary.total_orders}
              </strong>

            </div>

            <div>

              <span>
                Item terjual
              </span>

              <strong>
                {report.summary.total_items}
              </strong>

            </div>

            <div>

              <span>
                Omzet periode ini
              </span>

              <strong>
                {rupiah(
                  report.summary.total_revenue
                )}
              </strong>

            </div>

            <div>

              <span>
                Rata-rata / pesanan
              </span>

              <strong>
                {rupiah(
                  report.summary.total_orders
                    ? report.summary.total_revenue /
                      report.summary.total_orders
                    : 0
                )}
              </strong>

            </div>

          </div>

          {/* PENJUALAN HARIAN */}

          <div
            className="admin-table-wrap"
            style={{
              marginBottom: 20
            }}
          >

            <div className="table-title">

              <h2>
                Penjualan harian
              </h2>

              <span>
                {report.range.from}
                {' – '}
                {report.range.to}
              </span>

            </div>

            {report.daily.length ? (

              <table className="simple-table">

                <thead>

                  <tr>
                    <th>Tanggal</th>
                    <th>Pesanan</th>
                    <th>Omzet</th>
                  </tr>

                </thead>

                <tbody>

                  {report.daily.map(
                    (d) => (

                    <tr
                      key={d.date}
                    >

                      <td>
                        {d.date}
                      </td>

                      <td>
                        {d.orders}
                      </td>

                      <td>
                        {rupiah(
                          d.revenue
                        )}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            ) : (

              <Status>
                Belum ada transaksi pada
                periode ini.
              </Status>

            )}

          </div>

          {/* PRODUK TERLARIS */}

          <div
            className="admin-table-wrap"
            style={{
              marginBottom: 20
            }}
          >

            <div className="table-title">

              <h2>
                Produk terlaris
              </h2>

              <span>
                Top 10 berdasarkan
                jumlah terjual
              </span>

            </div>

            {report.top_products.length ? (

              <table className="simple-table">

                <thead>

                  <tr>
                    <th>Produk</th>
                    <th>Terjual</th>
                    <th>Omzet</th>
                  </tr>

                </thead>

                <tbody>

                  {report.top_products.map(
                    (p) => (

                    <tr
                      key={p.product_id}
                    >

                      <td>
                        {p.name}
                      </td>

                      <td>
                        {p.qty_sold}
                      </td>

                      <td>
                        {rupiah(
                          p.revenue
                        )}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            ) : (

              <Status>
                Belum ada produk terjual
                pada periode ini.
              </Status>

            )}

          </div>

          {/* STATUS PESANAN */}

          <div className="admin-table-wrap">

            <div className="table-title">

              <h2>
                Status pesanan
              </h2>

              <span>
                Termasuk yang dibatalkan
              </span>

            </div>

            <table className="simple-table">

              <thead>

                <tr>
                  <th>Status</th>
                  <th>Jumlah</th>
                </tr>

              </thead>

              <tbody>

                {report.status_breakdown.length ? (

                  report.status_breakdown.map(
                    (s) => (

                    <tr
                      key={s.status}
                    >

                      <td>
                        {
                          statusLabels[
                            s.status
                          ] ||
                          s.status
                        }
                      </td>

                      <td>
                        {s.total}
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td colSpan={2}>
                      Tidak ada data.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </>

      )}

    </div>

  );
}