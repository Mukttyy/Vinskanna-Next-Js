'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { allProducts } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<'*' | 'best' | 'feat' | 'new'>('*');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const regularProducts = allProducts.filter((p) => p.category !== 'special');
  const specialProducts = allProducts.filter((p) => p.category === 'special');

  const filteredCollection = activeFilter === '*'
    ? regularProducts
    : regularProducts.filter((p) => p.category === activeFilter);

  return (
    <>
      {/* header */}
      <header id="header" className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000" data-bs-pause="false">
        <div className="container h-100 carousel-inner">
          <div className={`text-center carousel-item ${currentSlide === 0 ? 'active' : ''}`}>
            <div className="hero-copy">
              <h2 className="text-capitalize text-black">best collection</h2>
              <h1 className="text-uppercase fw-bold text-black">new arrivals</h1>
              <a href="#collection" className="btn text-uppercase">shop now</a>
            </div>
          </div>
          <div className={`text-center carousel-item ${currentSlide === 1 ? 'active' : ''}`}>
            <div className="hero-copy">
              <h2 className="text-capitalize text-black">best price &amp; offer</h2>
              <h1 className="text-uppercase fw-bold text-black">new season</h1>
              <a href="#collection" className="btn text-uppercase">buy now</a>
            </div>
          </div>
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          aria-label="Slide sebelumnya"
          data-bs-target="#header"
          data-bs-slide="prev"
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? 1 : 0))}
        >
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          aria-label="Slide berikutnya"
          data-bs-target="#header"
          data-bs-slide="next"
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? 1 : 0))}
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </header>
      {/* end of header */}

      <main className="storefront-layout">
        {/* collection */}
        <section id="collection" className="section-spaced">
          <div className="container">
            <div className="title text-center">
              <h2 className="position-relative d-inline-block">New Collection</h2>
            </div>

            <div className="row g-0">
              <div className="d-flex flex-wrap justify-content-center mt-5 filter-button-group">
                <button
                  type="button"
                  className={`btn m-2 text-dark ${activeFilter === '*' ? 'active-filter-btn' : ''}`}
                  aria-pressed={activeFilter === '*'}
                  onClick={() => setActiveFilter('*')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`btn m-2 text-dark ${activeFilter === 'best' ? 'active-filter-btn' : ''}`}
                  aria-pressed={activeFilter === 'best'}
                  onClick={() => setActiveFilter('best')}
                >
                  Best Sellers
                </button>
                <button
                  type="button"
                  className={`btn m-2 text-dark ${activeFilter === 'feat' ? 'active-filter-btn' : ''}`}
                  aria-pressed={activeFilter === 'feat'}
                  onClick={() => setActiveFilter('feat')}
                >
                  Featured
                </button>
                <button
                  type="button"
                  className={`btn m-2 text-dark ${activeFilter === 'new' ? 'active-filter-btn' : ''}`}
                  aria-pressed={activeFilter === 'new'}
                  onClick={() => setActiveFilter('new')}
                >
                  New Arrival
                </button>
              </div>

              <div className="collection-list mt-4 row gx-0 gy-3">
                {filteredCollection.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* special */}
        <section id="special" className="section-spaced">
          <div className="container">
            <div className="title text-center py-5">
              <h2 className="position-relative d-inline-block">Special Selection</h2>
            </div>

            <div className="special-list mt-4 row gx-0 gy-3">
              {specialProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* offers */}
        <section id="offers" className="offers-band" aria-labelledby="offers-title">
          <div className="container">
            <div className="row d-flex align-items-center justify-content-center text-center justify-content-lg-start text-lg-start">
              <div className="offers-content">
                <span className="text-white">Discount Up To 40%</span>
                <h2 id="offers-title" className="mt-2 mb-4 text-white">Grand Sale Offer!</h2>
                <a href="#collection" className="btn">Buy Now</a>
              </div>
            </div>
          </div>
        </section>

        {/* blogs */}
        <section id="blogs" className="section-spaced">
          <div className="container">
            <div className="title text-center py-5">
              <h2 className="position-relative d-inline-block">Our Latest Blog</h2>
            </div>

            <div className="row g-3">
              <div className="card border-0 col-md-6 col-lg-4 bg-transparent">
                <img src="/images/asset/benner blog1.jpg" alt="Buket bunga Vinskanna" />
                <div className="card-body px-0">
                  <h4 className="card-title">Boquet Butterfly</h4>
                  <p className="card-text mt-3 text-muted">
                    Bagaikan sayap kupu-kupu yang menari di udara, buket ini membawa keindahan yang lembut dan memikat. Sentuhan warna-warni yang ceria memancarkan aura kegembiraan, menghadirkan nuansa manis dan penuh pesona.
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      <span className="fw-bold">Author: </span>Nurul
                    </small>
                  </p>
                  <span className="text-muted">Contoh artikel template</span>
                </div>
              </div>

              <div className="card border-0 col-md-6 col-lg-4 bg-transparent">
                <img src="/images/asset/benner blog2.jpg" alt="Buket bunga Vinskanna" />
                <div className="card-body px-0">
                  <h4 className="card-title">Boquet Choco</h4>
                  <p className="card-text mt-3 text-muted">
                    Kilauan cokelat berpadu indah, buket ini adalah simfoni rasa dan visual. Aromanya membuai, setiap gigitan adalah anugerah kenikmatan yang memanjakan. Sebuah kemewahan yang lezat, memikat hati dan indera.
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      <span className="fw-bold">Author: </span>Annaa
                    </small>
                  </p>
                  <span className="text-muted">Contoh artikel template</span>
                </div>
              </div>

              <div className="card border-0 col-md-6 col-lg-4 bg-transparent">
                <img src="/images/asset/benner blog3.png" alt="Buket bunga Vinskanna" />
                <div className="card-body px-0">
                  <h4 className="card-title">Boquet Uang</h4>
                  <p className="card-text mt-3 text-muted">
                    Kilauan lembaran uang tertata indah, buket ini adalah lambang kemewahan dan kreativitas. Setiap gulungan adalah wujud impian, harapan yang terangkai elegan. Sebuah hadiah istimewa, memikat mata dan hati.
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      <span className="fw-bold">Author: </span>Giska
                    </small>
                  </p>
                  <span className="text-muted">Contoh artikel template</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* about us */}
        <section id="about" className="section-spaced">
          <div className="container">
            <div className="row gy-4 align-items-center">
              <div className="col-lg-6 order-lg-1 text-center text-lg-start">
                <div className="title about-heading">
                  <h2 className="position-relative d-inline-block ms-4">About Us</h2>
                </div>
                <p className="lead text-muted">
                  Rangkaian bunga terbaik dengan kualitas unggulan dan desain yang elegan.
                  Setiap buket dirancang dengan penuh perhatian untuk memberikan keindahan dan makna bagi setiap momen spesial Anda.
                  Temukan koleksi bunga pilihan kami dan buat hari Anda lebih berwarna!
                </p>
                <p className="lead text-muted">💐 Dapatkan buket impian Anda hari ini</p>
              </div>
              <div className="col-lg-6 order-lg-0">
                <img src="/images/asset/benner2.jpg" alt="Buket bunga Vinskanna" className="img-fluid" />
              </div>
            </div>
          </div>
        </section>

        {/* Bouquet call to action */}
        <section id="newsletter" className="bouquet-banner" aria-labelledby="bouquet-banner-title">
          <div className="container">
            <div className="bouquet-banner-content">
              <h2 id="bouquet-banner-title">💐 Dapatkan buket impian Anda hari ini</h2>
              <a href="#collection" className="btn mt-4">Pesan Sekarang</a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
