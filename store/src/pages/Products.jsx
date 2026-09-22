import React,{useEffect,useMemo,useState} from 'react'; 
import {Link,useSearchParams} from 'react-router-dom'; 
import ProductCard from '../components/ProductCard'; 
import Status from '../components/Status'; 
import {api} from '../api';

export default function Products(){
  const [params,setParams]=useSearchParams(); 
  const [products,setProducts]=useState([]);
  const [cats,setCats]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(''); 
  
  const search=params.get('search')||'', category=params.get('category')||''; 

  useEffect(()=>{
    setLoading(true);
    Promise.all([api('/products'),api('/categories')])
      .then(([p,c])=>{
        setProducts(Array.isArray(p) ? p : p.products || []);
        setCats(Array.isArray(c) ? c : c.categories || []);
      })
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false))
  },[]); 

  const list=useMemo(()=> (Array.isArray(products) ? products : []).filter(p=>(!search||p.name.toLowerCase().includes(search.toLowerCase())||p.description?.toLowerCase().includes(search.toLowerCase()))&&(!category||p.category_name?.toLowerCase()===category.toLowerCase())),[products,search,category]); 

  const setSearch=v=>{
    const next=new URLSearchParams(params);
    v?next.set('search',v):next.delete('search');
    setParams(next)
  }; 

  return (
    <div className="page-shell container">
      <div className="page-intro">
        <div>
          <span className="eyebrow">KOLEKSI KRIYA KITA</span>
          <h1>Semua karya.</h1>
          <p>Produk handmade dari pengrajin lokal, siap menemani keseharianmu.</p>
        </div>
        <Link className="btn btn-secondary" to="/cart">Lihat keranjang</Link>
      </div>
      
      <div className="filter-bar">
        <div className="search-box">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari produk atau bahan..."/>
          <span>⌕</span>
        </div>
        <select value={category} onChange={e=>{const next=new URLSearchParams(params);e.target.value?next.set('category',e.target.value):next.delete('category');setParams(next)}}>
          <option value="">Semua kategori</option>
          {Array.isArray(cats) && cats.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {loading && <Status>Memuat koleksi...</Status>}
      {error && <Status type="error">{error}</Status>}
      
      {!loading && !error && (
        <>
          <div className="result-line">
            <span>{list.length} karya ditemukan</span>
            {(search||category)&&<button onClick={()=>setParams({})}>Reset filter</button>}
          </div>
          {list.length ? (
            <div className="products-grid">
              {list.map(p=><ProductCard key={p.id} product={p}/>)}
            </div>
          ) : (
            <Status type="info">Belum ada produk yang cocok dengan filter ini.</Status>
          )}
        </>
      )}
    </div>
  );
}