import React,{useEffect,useState} from 'react'; 
import {Link,useNavigate} from 'react-router-dom'; 
import {api,rupiah} from '../api'; 
import Status from '../components/Status';

export default function Checkout(){
  const nav=useNavigate(); 
  const [cart,setCart]=useState(null);
  const [form,setForm]=useState({recipient_name:'',phone:'',address:'',payment_method:'bank_transfer'});
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false); 

  useEffect(()=>{
    if(!localStorage.getItem('token')){nav('/login');return}
    api('/cart')
      .then(res => setCart(res))
      .catch(e=>setError(e.message))
  },[nav]); 

  const submit=async e=>{
    e.preventDefault();
    setSaving(true);
    setError('');
    try{
      const r=await api('/orders',{method:'POST',body:JSON.stringify(form)});
      nav(`/orders?success=${r.order_id}`)
    }catch(e){
      setError(e.message)
    }finally{
      setSaving(false)
    }
  }; 

  if(!cart) return (
    <div className="container page-shell">
      {error ? <Status type="error">{error}</Status> : <Status>Memuat checkout...</Status>}
    </div>
  ); 

  if(!Array.isArray(cart.items) || !cart.items.length) return (
    <div className="container page-shell">
      <Status type="info">Keranjang kosong. <Link to="/products">Kembali ke koleksi.</Link></Status>
    </div>
  ); 

  return (
    <div className="container page-shell">
      <Link className="back-link" to="/cart">← Kembali ke keranjang</Link>
      <div className="checkout-grid">
        <form className="form-card" onSubmit={submit}>
          <span className="eyebrow">CHECKOUT</span>
          <h1>Data pengiriman</h1>
          <p className="form-muted">Isi data dengan benar agar pesanan mudah diproses.</p>
          <label>Nama penerima<input required minLength="3" value={form.recipient_name} onChange={e=>setForm({...form,recipient_name:e.target.value})} placeholder="Nama lengkap"/></label>
          <label>Nomor WhatsApp<input required minLength="8" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="08xxxxxxxxxx"/></label>
          <label>Alamat lengkap<textarea required minLength="10" rows="4" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Jalan, nomor, kelurahan, kecamatan, kota..."/></label>
          <label>Metode pembayaran
            <select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}>
              <option value="bank_transfer">Transfer bank</option>
              <option value="ewallet">E-wallet</option>
              <option value="cod">COD</option>
            </select>
          </label>
          {error&&<Status type="error">{error}</Status>}
          <button disabled={saving} className="btn btn-primary btn-wide">{saving?'Memproses...':'Buat pesanan'}</button>
        </form>
        <aside className="summary-card">
          <span className="eyebrow">PESANAN</span>
          {cart.items.map(i=>(
            <div className="mini-line" key={i.id}>
              <span>{i.name} × {i.quantity}</span>
              <b>{rupiah(i.subtotal)}</b>
            </div>
          ))}
          <hr/>
          <div className="summary-total">
            <span>Total</span>
            <strong>{rupiah(cart.total)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}