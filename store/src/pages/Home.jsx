import React,{useEffect,useState} from 'react'; 
import {Link} from 'react-router-dom'; 
import ProductCard from '../components/ProductCard'; 
import Icon from '../components/Icon'; 
import Status from '../components/Status'; 
import {api} from '../api';

export default function Home(){
  const [products,setProducts]=useState([]);
  const [cats,setCats]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(''); 

  useEffect(()=>{
    Promise.all([api('/products'),api('/categories')])
      .then(([p,c])=>{
        setProducts(Array.isArray(p) ? p : p.products || []);
        setCats(Array.isArray(c) ? c : c.categories || []);
      })
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false))
  },[]); 

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">HANDMADE · LOKAL · BERMAKNA</span>
            <h1>Benda sederhana,<br/><i>dibuat dengan cerita.</i></h1>
            <p>Kriya Kita mempertemukan karya pengrajin lokal dengan orang-orang yang menghargai proses, detail, dan keunikan buatan tangan.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/products">Jelajahi koleksi <Icon name="arrow" size={18}/></Link>
              <a className="btn btn-ghost" href={import.meta.env.VITE_PORTFOLIO_URL||'http://localhost:5174'}>Tentang pembuat</a>
            </div>
            <div className="hero-note"><span>✦</span> Setiap produk memiliki sentuhan yang berbeda.</div>
          </div>
          <div className="hero-art">
            <div className="hero-card">
              <img src="/images/batik.svg" alt="Koleksi batik handmade"/>
              <div><small>KOLEKSI UNGGULAN</small><strong>Batik Sekar</strong></div>
            </div>
            <div className="floating-stat"><b>100%</b><span>karya lokal</span></div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">PILIH BERDASARKAN KARYA</span>
            <h2>Temukan yang terasa personal.</h2>
          </div>
          <Link className="text-action" to="/products">Semua koleksi <Icon name="arrow" size={16}/></Link>
        </div>
        <div className="category-grid">
          {Array.isArray(cats) && cats.map(c=>(
            <Link key={c.id} to={`/products?category=${encodeURIComponent(c.name)}`} className="category-card">
              <span>{c.name==='Batik'?'◌':c.name==='Rajut'?'⌁':c.name==='Jahit'?'✂':'✦'}</span>
              <strong>{c.name}</strong>
              <small>{c.description}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">PILIHAN HARI INI</span>
              <h2>Karya yang paling dicari.</h2>
            </div>
            <Link className="text-action" to="/products">Lihat semua <Icon name="arrow" size={16}/></Link>
          </div>
          {loading && <Status>Memuat koleksi...</Status>}
          {error && <Status type="error">{error}</Status>}
          {!loading && !error && (
            <div className="products-grid">
              {Array.isArray(products) && products.slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}
            </div>
          )}
        </div>
      </section>

      <section className="story-banner">
        <div className="container story-grid">
          <div>
            <span className="eyebrow">CERITA DI BALIK KARYA</span>
            <h2>Bukan produksi massal.<br/>Ini dibuat oleh manusia.</h2>
            <p>Kami bekerja bersama pengrajin kecil untuk menjaga teknik tradisional tetap hidup sambil menghadirkan bentuk yang relevan untuk keseharian.</p>
            <Link className="btn btn-light" to="/products">Lihat karya <Icon name="arrow" size={18}/></Link>
          </div>
          <div className="story-quote">“Nilai sebuah benda bukan hanya pada hasil akhirnya, tetapi pada waktu dan tangan yang membuatnya.”</div>
        </div>
      </section>
    </div>
  );
}