import React,{useEffect,useState} from 'react'; 
import {Link} from 'react-router-dom'; 
import {api,rupiah} from '../api'; 
import Status from '../components/Status';

const labels={
  pending:'Menunggu',
  processing:'Diproses',
  shipped:'Dikirim',
  completed:'Selesai',
  cancelled:'Dibatalkan'
};

function printReceipt(order){
  const orderNumber = String(order.id).padStart(4,'0');
  const date = new Date(order.created_at).toLocaleString('id-ID');

  const payment =
    order.payment_method === 'cod'
      ? 'COD'
      : order.payment_method === 'ewallet'
        ? 'E-wallet'
        : 'Transfer bank';

  const items = Array.isArray(order.items) ? order.items : [];

  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.product_name}</td>
      <td class="center">${item.quantity}</td>
      <td class="right">${rupiah(Number(item.price) * Number(item.quantity))}</td>
    </tr>
  `).join('');

  const receipt = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Struk Order #${orderNumber}</title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 30px;
          font-family: Arial, sans-serif;
          color: #222;
          background: #fff;
        }

        .receipt {
          width: 80mm;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          border-bottom: 1px dashed #999;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }

        .header h1 {
          margin: 0 0 5px;
          font-size: 22px;
        }

        .header p {
          margin: 3px 0;
          font-size: 12px;
          color: #666;
        }

        .info {
          font-size: 12px;
          margin-bottom: 15px;
        }

        .info div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        th {
          text-align: left;
          border-bottom: 1px solid #222;
          padding: 6px 2px;
        }

        td {
          padding: 7px 2px;
          border-bottom: 1px dotted #ccc;
          vertical-align: top;
        }

        .center {
          text-align: center;
        }

        .right {
          text-align: right;
        }

        .total {
          border-top: 1px solid #222;
          margin-top: 10px;
          padding-top: 10px;
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: bold;
        }

        .footer {
          text-align: center;
          border-top: 1px dashed #999;
          margin-top: 20px;
          padding-top: 15px;
          font-size: 11px;
          color: #666;
        }

        @media print {
          body {
            padding: 0;
          }

          .receipt {
            width: 80mm;
          }
        }
      </style>
    </head>

    <body>
      <div class="receipt">

        <div class="header">
          <h1>KriyaKita</h1>
          <p>Kerajinan lokal, dibuat dengan tangan.</p>
          <p>Struk Pembelian</p>
        </div>

        <div class="info">
          <div>
            <span>No. Order</span>
            <strong>#${orderNumber}</strong>
          </div>

          <div>
            <span>Tanggal</span>
            <span>${date}</span>
          </div>

          <div>
            <span>Status</span>
            <span>${labels[order.status] || order.status}</span>
          </div>

          <div>
            <span>Pembayaran</span>
            <span>${payment}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Produk</th>
              <th class="center">Qty</th>
              <th class="right">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total">
          <span>TOTAL</span>
          <span>${rupiah(order.total)}</span>
        </div>

        <div class="footer">
          <p>Terima kasih telah berbelanja di KriyaKita.</p>
          <p>Semoga karya lokal ini membawa cerita baik.</p>
        </div>

      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=500,height=700');

  if (!printWindow) {
    alert('Popup diblokir browser. Izinkan popup untuk mencetak struk.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(receipt);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

export default function Orders(){
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(''); 

  useEffect(()=>{
    if(!localStorage.getItem('token')){
      setLoading(false);
      return;
    }

    api('/orders')
      .then(res => setOrders(Array.isArray(res) ? res : res.orders || []))
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false))
  },[]); 

  if(!localStorage.getItem('token')) return (
    <div className="container page-shell narrow">
      <div className="empty-card">
        <h1>Belum masuk.</h1>
        <p>Masuk untuk melihat riwayat pesanan.</p>
        <Link className="btn btn-primary" to="/login">Masuk</Link>
      </div>
    </div>
  ); 

  return (
    <div className="container page-shell">

      <div className="page-intro">
        <div>
          <span className="eyebrow">RIWAYAT PESANAN</span>
          <h1>Pesanan saya.</h1>
          <p>Pantau status karya yang sudah kamu pesan.</p>
        </div>
      </div>
      
      {loading ? (
        <Status>Memuat pesanan...</Status>
      ) : error ? (
        <Status type="error">{error}</Status>
      ) : !Array.isArray(orders) || !orders.length ? (
        <div className="empty-card">
          <h2>Belum ada pesanan.</h2>
          <Link className="btn btn-primary" to="/products">
            Lihat koleksi
          </Link>
        </div>
      ) : (
        <div className="orders-list">

          {orders.map(o=>(
            <article className="order-card" key={o.id}>

              <div className="order-head">
                <div>
                  <span>
                    ORDER #{String(o.id).padStart(4,'0')}
                  </span>

                  <small>
                    {new Date(o.created_at).toLocaleString('id-ID')}
                  </small>
                </div>

                <b className={`badge badge-${o.status}`}>
                  {labels[o.status]}
                </b>
              </div>

              <div className="order-items">
                {Array.isArray(o.items) && o.items.map(i=>(
                  <div key={i.id}>
                    <span>
                      {i.product_name} × {i.quantity}
                    </span>

                    <b>
                      {rupiah(Number(i.price)*Number(i.quantity))}
                    </b>
                  </div>
                ))}
              </div>

              <div className="order-foot">
                <span>
                  {
                    o.payment_method==='cod'
                      ? 'COD'
                      : o.payment_method==='ewallet'
                        ? 'E-wallet'
                        : 'Transfer bank'
                  }
                </span>

                <strong>
                  {rupiah(o.total)}
                </strong>
              </div>

              <div style={{
                marginTop:'16px',
                display:'flex',
                justifyContent:'flex-end'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => printReceipt(o)}
                >
                  🧾 Cetak Struk
                </button>
              </div>

            </article>
          ))}

        </div>
      )}
    </div>
  );
}