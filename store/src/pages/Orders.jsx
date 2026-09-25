import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { api, rupiah } from '../api';
import Status from '../components/Status';

const labels = {
  pending: 'Menunggu',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

function getPaymentLabel(method) {
  if (method === 'cod') return 'COD';
  if (method === 'ewallet') return 'E-wallet';
  return 'Transfer bank';
}

function downloadReceiptPdf(order) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200]
  });

  const orderNumber = String(order.id).padStart(4, '0');

  const date = new Date(order.created_at).toLocaleString('id-ID');

  let y = 10;

  // HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('KriyaKita', 40, y, {
    align: 'center'
  });

  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  doc.text(
    'Kerajinan lokal, dibuat dengan tangan.',
    40,
    y,
    { align: 'center' }
  );

  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.text(
    'STRUK PEMBELIAN',
    40,
    y,
    { align: 'center' }
  );

  y += 5;

  doc.line(5, y, 75, y);

  y += 6;

  // INFORMASI PESANAN
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  doc.text('No. Order', 5, y);
  doc.text(`#${orderNumber}`, 75, y, {
    align: 'right'
  });

  y += 5;

  doc.text('Tanggal', 5, y);
  doc.text(date, 75, y, {
    align: 'right'
  });

  y += 5;

  doc.text('Status', 5, y);
  doc.text(
    labels[order.status] || order.status || '-',
    75,
    y,
    { align: 'right' }
  );

  y += 5;

  doc.text('Pembayaran', 5, y);
  doc.text(
    getPaymentLabel(order.payment_method),
    75,
    y,
    { align: 'right' }
  );

  y += 6;

  doc.line(5, y, 75, y);

  y += 6;

  // ITEM
  doc.setFont('helvetica', 'bold');
  doc.text('Produk', 5, y);
  doc.text('Qty', 43, y, {
    align: 'center'
  });
  doc.text('Subtotal', 75, y, {
    align: 'right'
  });

  y += 5;

  doc.line(5, y, 75, y);

  y += 6;

  doc.setFont('helvetica', 'normal');

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  items.forEach((item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const subtotal = quantity * price;

    let name = item.product_name || 'Produk';

    if (name.length > 25) {
      name = name.substring(0, 25) + '...';
    }

    doc.text(name, 5, y);

    doc.text(
      String(quantity),
      43,
      y,
      { align: 'center' }
    );

    doc.text(
      rupiah(subtotal),
      75,
      y,
      { align: 'right' }
    );

    y += 6;
  });

  // TOTAL
  y += 2;

  doc.line(5, y, 75, y);

  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  doc.text('TOTAL', 5, y);

  doc.text(
    rupiah(Number(order.total) || 0),
    75,
    y,
    { align: 'right' }
  );

  y += 8;

  // FOOTER
  doc.line(5, y, 75, y);

  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  doc.text(
    'Terima kasih telah berbelanja',
    40,
    y,
    { align: 'center' }
  );

  y += 4;

  doc.text(
    'di KriyaKita.',
    40,
    y,
    { align: 'center' }
  );

  // DOWNLOAD PDF
  doc.save(
    `struk-KriyaKita-${orderNumber}.pdf`
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }

    api('/orders')
      .then((res) => {
        setOrders(
          Array.isArray(res)
            ? res
            : res.orders || []
        );
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (!localStorage.getItem('token')) {
    return (
      <div className="container page-shell narrow">
        <div className="empty-card">

          <h1>Belum masuk.</h1>

          <p>
            Masuk untuk melihat riwayat pesanan.
          </p>

          <Link
            className="btn btn-primary"
            to="/login"
          >
            Masuk
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="container page-shell">

      <div className="page-intro">
        <div>

          <span className="eyebrow">
            RIWAYAT PESANAN
          </span>

          <h1>Pesanan saya.</h1>

          <p>
            Pantau status karya yang sudah kamu pesan.
          </p>

        </div>
      </div>

      {loading && (
        <Status>
          Memuat pesanan...
        </Status>
      )}

      {!loading && error && (
        <Status type="error">
          {error}
        </Status>
      )}

      {!loading &&
        !error &&
        !orders.length && (
          <div className="empty-card">

            <h2>
              Belum ada pesanan.
            </h2>

            <Link
              className="btn btn-primary"
              to="/products"
            >
              Lihat koleksi
            </Link>

          </div>
        )}

      {!loading &&
        !error &&
        orders.length > 0 && (

          <div className="orders-list">

            {orders.map((order) => (

              <article
                className="order-card"
                key={order.id}
              >

                <div className="order-head">

                  <div>

                    <span>
                      ORDER #
                      {String(order.id).padStart(4, '0')}
                    </span>

                    <small>
                      {new Date(
                        order.created_at
                      ).toLocaleString('id-ID')}
                    </small>

                  </div>

                  <b
                    className={`badge badge-${order.status}`}
                  >
                    {labels[order.status] ||
                      order.status}
                  </b>

                </div>

                <div className="order-items">

                  {Array.isArray(order.items) &&
                    order.items.map((item) => (

                      <div key={item.id}>

                        <span>
                          {item.product_name}
                          {' × '}
                          {item.quantity}
                        </span>

                        <b>
                          {rupiah(
                            Number(item.price) *
                            Number(item.quantity)
                          )}
                        </b>

                      </div>

                    ))
                  }

                </div>

                <div className="order-foot">

                  <span>
                    {getPaymentLabel(
                      order.payment_method
                    )}
                  </span>

                  <strong>
                    {rupiah(order.total)}
                  </strong>

                </div>

                <div
                  style={{
                    marginTop: '16px',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}
                >

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      downloadReceiptPdf(order)
                    }
                  >
                    🧾 Cetak Struk PDF
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

    </div>
  );
}
