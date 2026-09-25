import React from 'react';
import Nav from './components/Nav';
import Icon from './components/Icon';

const storeUrl = import.meta.env.VITE_STORE_URL || 'https://serkom-junior-web-developer-production-bf3f.up.railway.app/';
const baseUrl = import.meta.env.BASE_URL || '/';

const skills = [
  ['01', 'Frontend', 'HTML · CSS · JavaScript · React'],
  ['02', 'Backend', 'Node.js · Express · REST API'],
  ['03', 'Database', 'MySQL · SQL · Relasi Database'],
  ['04', 'AI & Tools', 'AI tools · Git · GitHub · VS Code'],
];

const projects = [
  {
    title: 'Kriya Kita — Toko Online',
    description:
      'Website dinamis usaha kerajinan tangan dengan katalog, kategori, pencarian, detail produk, authentication, keranjang, checkout, riwayat pesanan, dan panel admin.',
    tags: ['React', 'Express', 'MySQL', 'JWT'],
    link: storeUrl,
  },
  {
    title: 'Website Profil Pribadi',
    description:
      'Website statis untuk menampilkan biodata, pendidikan, keahlian, pengalaman, portofolio, kegiatan, artikel, dan informasi kontak.',
    tags: ['React', 'Vite', 'CSS'],
    link: '#top',
  },
];

export default function App() {
  return (
    <div id="top">
      <Nav />

      <main>
        {/* 01 HEADER / HERO */}
        <section className="p-hero">
          <div className="p-container p-hero-grid">
            <div>
              <span className="p-kicker">01 · PROFIL PRIBADI</span>

              <h1>
                Moh. Adris <em>A.W.F.</em>
              </h1>

              <p>
                Pelajar RPL yang sedang mengembangkan kemampuan di bidang web
                development, backend, database, dan pembuatan aplikasi sederhana.
              </p>

              <p>
                Saya menyukai proses belajar melalui proyek nyata dan terus
                meningkatkan kemampuan coding secara bertahap.
              </p>

              <div className="p-actions">
                <a className="p-btn p-dark" href="#projects">
                  Lihat proyek <Icon name="arrow" size={17} />
                </a>

                <a className="p-btn p-outline" href="#contact">
                  Hubungi saya
                </a>
              </div>
            </div>

            {/* FOTO PROFIL */}
            <div className="portrait-card">
              <div className="portrait" aria-label="Foto profil">
                <img
                  src={`${baseUrl}images/poto_profil.jpeg`}
                  alt="Foto Profil Moh. Adris A.W.F."
                  className="profile-photo"
                />
                <div className="grid-lines" />
              </div>

              <div className="portrait-caption">
                <b>Moh. Adris A.W.F</b>
                <small>Web Developer · Student</small>
              </div>
            </div>
          </div>
        </section>

        {/* 02 TENTANG SAYA */}
        <section id="about" className="p-section p-muted">
          <div className="p-container two-col">
            <div>
              <span className="p-kicker">02 · TENTANG SAYA</span>

              <h2>
                Belajar teknologi,
                <br />
                <i>membangun karya.</i>
              </h2>
            </div>

            <div>
              <p className="lead">
                Saya adalah pelajar yang memiliki ketertarikan pada dunia
                teknologi, khususnya pengembangan website dan aplikasi.
              </p>

              <p>
                Saya sedang mempelajari frontend, backend, database, API,
                serta cara membuat aplikasi yang rapi, responsif, dan mudah
                digunakan.
              </p>

              <div className="biodata-list">
                <div>
                  <span>Nama : </span>
                  <strong>Moh. Adris A.W.F</strong>
                </div>

                <div>
                  <span>Status : </span>
                  <strong>Pelajar / Siswa RPL</strong>
                </div>

                <div>
                  <span>Bidang : </span>
                  <strong>Web Development</strong>
                </div>

                <div>
                  <span>Prinsip : </span>
                  <strong>Belajar · Berproses · Berkarya</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 03 PROFIL PROFESIONAL */}
        <section id="profile" className="p-section">
          <div className="p-container two-col">
            <div>
              <span className="p-kicker">03 · PROFIL PROFESIONAL</span>

              <h2>
                Junior Web
                <br />
                <i>Developer.</i>
              </h2>
            </div>

            <div>
              <p className="lead">
                Fokus saya saat ini adalah membangun fondasi sebagai Junior Web
                Developer melalui latihan, tugas sekolah, dan proyek mandiri.
              </p>

              <div className="biodata-list">
                <div>
                  <span>Jabatan : </span>
                  <strong>Pelajar / Junior Web Developer</strong>
                </div>

                <div>
                  <span>Instansi : </span>
                  <strong>SMKN 1 Jenpo</strong>
                </div>

                <div>
                  <span>Bidang : </span>
                  <strong>Frontend · Backend · Database</strong>
                </div>

                <div>
                  <span>Target : </span>
                  <strong>Mengembangkan kemampuan profesional</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 04 PENDIDIKAN */}
        <section id="education" className="p-section p-muted">
          <div className="p-container">
            <span className="p-kicker">04 · PENDIDIKAN</span>

            <h2>
              Perjalanan <i>pendidikan saya.</i>
            </h2>

            <div
              className="education-list"
              style={{
                marginTop: 55,
                display: 'grid',
                gap: 20,
              }}
            >
              <div className="education-card">
                <span>
                  2021
                  <br />— 2024
                </span>

                <div>
                  <span className="p-kicker">
                    SEKOLAH MENENGAH PERTAMA
                  </span>

                  <h3>SMPN 4</h3>

                  <p>
                    Menyelesaikan pendidikan tingkat SMP pada tahun 2021
                    hingga 2024.
                  </p>
                </div>
              </div>

              <div className="education-card">
                <span>
                  2024
                  <br />— Sekarang
                </span>

                <div>
                  <span className="p-kicker">
                    SEKOLAH MENENGAH KEJURUAN
                  </span>

                  <h3>SMKN 1 JENPO</h3>

                  <p>
                    Sedang menempuh pendidikan SMK dan mempelajari Rekayasa
                    Perangkat Lunak.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05 PENGALAMAN */}
        <section id="experience" className="p-section">
          <div className="p-container">
            <span className="p-kicker">05 · PENGALAMAN</span>

            <h2>
              Pengalaman <i>belajar & proyek.</i>
            </h2>

            <div
              className="skill-grid"
              style={{ marginTop: 45 }}
            >
              <div className="skill-card">
                <span>01</span>
                <h3>Belajar Coding</h3>
                <p>
                  Mengerjakan latihan HTML, CSS, JavaScript, React, Node.js,
                  dan SQL.
                </p>
              </div>

              <div className="skill-card">
                <span>02</span>
                <h3>Proyek Website</h3>
                <p>
                  Membangun website profil pribadi dan mini e-commerce
                  sebagai latihan.
                </p>
              </div>

              <div className="skill-card">
                <span>03</span>
                <h3>Database</h3>
                <p>
                  Membuat tabel, relasi, query, dan koneksi aplikasi ke MySQL.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 06 KEAHLIAN */}
        <section id="skills" className="p-section p-muted">
          <div className="p-container">
            <span className="p-kicker">06 · KEAHLIAN</span>

            <h2>
              Keahlian yang <i>sedang dikembangkan.</i>
            </h2>

            <div className="skill-grid">
              {skills.map(([no, title, desc]) => (
                <div className="skill-card" key={no}>
                  <span>{no}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 07 KARYA / PORTOFOLIO */}
        <section id="projects" className="p-section">
          <div className="p-container">
            <div className="project-head">
              <div>
                <span className="p-kicker">
                  07 · KARYA / PORTOFOLIO
                </span>

                <h2>Project yang bisa dicoba.</h2>
              </div>

              <span className="project-count">
                02 / PROJECT
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gap: 24,
              }}
            >
              {projects.map((project, index) => (
                <article
                  className="project-card"
                  key={project.title}
                >
                  <div className="project-visual">
                    <div className="browser-bar">
                      <i />
                      <i />
                      <i />
                      <span>
                        project-{index + 1}.local
                      </span>
                    </div>

                    <div className="mock-store">
                      <small>PORTFOLIO · PROJECT</small>

                      <b>{project.title}</b>

                      <div className="mock-products">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>

                  <div className="project-copy">
                    <span className="p-kicker">
                      PROJECT {String(index + 1).padStart(2, '0')}
                    </span>

                    <h3>{project.title}</h3>

                    <p>{project.description}</p>

                    <div className="tag-row">
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>

                    <a
                      className="project-link"
                      href={project.link}
                      target={
                        project.link.startsWith('http')
                          ? '_blank'
                          : undefined
                      }
                      rel={
                        project.link.startsWith('http')
                          ? 'noreferrer'
                          : undefined
                      }
                    >
                      Buka project
                      <Icon name="external" size={16} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 08 SERTIFIKAT / PRESTASI */}
        <section id="certificates" className="p-section p-muted">
          <div className="p-container">
            <span className="p-kicker">
              08 · SERTIFIKAT / PRESTASI
            </span>

            <h2>
              Sertifikat, pelatihan <i>& kompetensi.</i>
            </h2>

            <div
              className="skill-grid"
              style={{ marginTop: 45 }}
            >
              <div className="skill-card">
                <span>01</span>
                <h3>MASIH BELUM TERBIT</h3>
                <p>
                  Sertifikat dan kompetensi akan ditambahkan setelah
                  diterbitkan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 09 KEGIATAN */}
        <section id="activities" className="p-section">
          <div className="p-container two-col">
            <div>
              <span className="p-kicker">
                09 · KEGIATAN
              </span>

              <h2>
                Kegiatan belajar, <i>workshop & proyek.</i>
              </h2>
            </div>

            <div>
              <p className="lead">
                Dokumentasi kegiatan belajar, workshop, dan proyek yang telah
                saya lakukan.
              </p>

              {/* FOTO KEGIATAN */}
              <div className="kegiatan-photo">
                <img
                  src={`${baseUrl}images/kegiatan.jpeg`}
                  alt="Foto kegiatan"
                />
              </div>

              <div className="biodata-list">
                <div>
                  <span></span>
                  <strong></strong>
                </div>

                <div>
                  <span></span>
                  <strong></strong>
                </div>

                <div>
                  <span></span>
                  <strong></strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10 ARTIKEL / BLOG */}
        <section id="blog" className="p-section p-muted">
          <div className="p-container">
            <span className="p-kicker">
              10 · ARTIKEL / BLOG
            </span>

            <h2>
              Catatan <i>perjalanan belajar.</i>
            </h2>

            <div
              className="skill-grid"
              style={{ marginTop: 45 }}
            >
              <article className="skill-card">
                <span>01</span>
                <h3>Belajar React</h3>
                <p>
                  Catatan tentang component, props, state, dan struktur
                  project React.
                </p>
              </article>

              <article className="skill-card">
                <span>02</span>
                <h3>Belajar Backend</h3>
                <p>
                  Catatan membuat REST API menggunakan Node.js dan Express.
                </p>
              </article>

              <article className="skill-card">
                <span>03</span>
                <h3>Belajar MySQL</h3>
                <p>
                  Catatan membuat database, tabel, relasi, dan query untuk
                  aplikasi web.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* 11 KONTAK */}
        <section id="contact" className="contact-section">
          <div className="p-container contact-grid">
            <div>
              <span className="p-kicker">11 · KONTAK</span>

              <h2>
                Mari <em>terhubung.</em>
              </h2>
            </div>

            <div>
              <p>
                Silakan hubungi saya untuk berdiskusi tentang project,
                pembelajaran, atau kolaborasi.
              </p>

              <a
                className="contact-mail"
                href="mailto:hello@example.com"
              >
                <Icon name="mail" /> mohammad.adris33@smk.belajar.id
              </a>

              <div className="contact-social">
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="github" /> GitHub
                </a>

                <a
                  className="p-btn p-outline"
                  href="https://wa.me/6289632070806"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 12 FOOTER */}
      <footer className="p-footer">
        <span>
          Moh. Adris A.W.F · Portfolio
        </span>

        <span>
          © 2026 · Semua hak dilindungi
        </span>
      </footer>
    </div>
  );
}