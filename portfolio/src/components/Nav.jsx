import React, { useState } from 'react';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    ['Tentang', 'about'],
    ['Profil', 'profile'],
    ['Pendidikan', 'education'],
    ['Pengalaman', 'experience'],
    ['Keahlian', 'skills'],
    ['Karya', 'projects'],
    ['Sertifikat', 'certificates'],
    ['Kegiatan', 'activities'],
    ['Blog', 'blog'],
    ['Kontak', 'contact'],
  ];

  return (
    <header className="p-nav">
      <a href="#top" className="p-logo"><span>MA</span> Developer</a>
      <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
      <nav className={open ? 'open' : ''}>
        {links.map(([title, id]) => (
          <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{title}</a>
        ))}
      </nav>
    </header>
  );
}
