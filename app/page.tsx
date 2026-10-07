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
      {/* header / hero carousel */}
      <header id="header" className="carousel slide relative" data-bs-ride="carousel" data-bs-interval="5000" data-bs-pause="false">
        <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px] h-full carousel-inner">
          <div className={`text-center carousel-item ${currentSlide === 0 ? 'active' : ''}`}>
            <div className="hero-copy">
              <h2 className="capitalize text-black">best collection</h2>
              <h1 className="uppercase font-bold text-black">new arrivals</h1>
              <a href="#collection" className="btn !bg-pink hover:!bg-[#ad1e40] !text-white !border-pink uppercase px-6 py-2.5 rounded-pill font-medium transition-colors">
                shop now
              </a>
            </div>
          </div>
          <div className={`text-center carousel-item ${currentSlide === 1 ? 'active' : ''}`}>
            <div className="hero-copy">
              <h2 className="capitalize text-black">best price &amp; offer</h2>
              <h1 className="uppercase font-bold text-black">new season</h1>
              <a href="#collection" className="btn !bg-pink hover:!bg-[#ad1e40] !text-white !border-pink uppercase px-6 py-2.5 rounded-pill font-medium transition-colors">
                buy now
              </a>
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
          <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
            <div className="title text-center">
              <h2 className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
                New Collection
              </h2>
            </div>

            <div className="flex flex-wrap justify-center mt-5 filter-button-group gap-2 sm:gap-3">
              <button
                type="button"
                className={`btn m-1 sm:m-2 text-sm font-medium px-4 py-2 rounded-pill transition-all ${
                  activeFilter === '*'
                    ? 'active-filter-btn !bg-pink !text-white !border-pink shadow-xs'
                    : 'bg-white text-[#212529] border border-[#dee2e6] hover:!bg-pink hover:!text-white hover:!border-pink'
                }`}
                aria-pressed={activeFilter === '*'}
                onClick={() => setActiveFilter('*')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn m-1 sm:m-2 text-sm font-medium px-4 py-2 rounded-pill transition-all ${
                  activeFilter === 'best'
                    ? 'active-filter-btn !bg-pink !text-white !border-pink shadow-xs'
                    : 'bg-white text-[#212529] border border-[#dee2e6] hover:!bg-pink hover:!text-white hover:!border-pink'
                }`}
                aria-pressed={activeFilter === 'best'}
                onClick={() => setActiveFilter('best')}
              >
                Best Sellers
              </button>
              <button
                type="button"
                className={`btn m-1 sm:m-2 text-sm font-medium px-4 py-2 rounded-pill transition-all ${
                  activeFilter === 'feat'
                    ? 'active-filter-btn !bg-pink !text-white !border-pink shadow-xs'
                    : 'bg-white text-[#212529] border border-[#dee2e6] hover:!bg-pink hover:!text-white hover:!border-pink'
                }`}
                aria-pressed={activeFilter === 'feat'}
                onClick={() => setActiveFilter('feat')}
              >
                Featured
              </button>
              <button
                type="button"
                className={`btn m-1 sm:m-2 text-sm font-medium px-4 py-2 rounded-pill transition-all ${
                  activeFilter === 'new'
                    ? 'active-filter-btn !bg-pink !text-white !border-pink shadow-xs'
                    : 'bg-white text-[#212529] border border-[#dee2e6] hover:!bg-pink hover:!text-white hover:!border-pink'
                }`}
                aria-pressed={activeFilter === 'new'}
                onClick={() => setActiveFilter('new')}
              >
                New Arrival
              </button>
            </div>

            <div className="collection-list mt-6 flex flex-wrap -mx-2">
              {filteredCollection.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* special */}
        <section id="special" className="section-spaced">
          <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
            <div className="title text-center py-5">
              <h2 className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
                Special Selection
              </h2>
            </div>

            <div className="special-list mt-4 flex flex-wrap -mx-2">
              {specialProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* offers */}
        <section id="offers" className="offers-band" aria-labelledby="offers-title">
          <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
            <div className="flex items-center justify-end text-right min-h-[clamp(520px,62vh,580px)]">
              <div className="w-full md:w-7/12 lg:w-1/2 offers-content text-right">
                <span className="text-white block text-2xl sm:text-3xl font-medium">Discount Up To 40%</span>
                <h2 id="offers-title" className="mt-2 mb-4 text-white text-3xl sm:text-5xl font-bold font-display">
                  Grand Sale Offer!
                </h2>
                <a
                  href="#collection"
                  className="btn !bg-white hover:!bg-[#f8f9fa] !text-[#212529] px-6 py-2.5 rounded-pill font-medium inline-block transition-colors shadow-xs"
                >
                  Buy Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* blogs */}
        <section id="blogs" className="section-spaced">
          <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
            <div className="title text-center py-5">
              <h2 className="relative inline-block text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
                Our Latest Blog
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-transparent flex flex-col">
                <img src="/images/asset/benner blog1.jpg" alt="Buket bunga Vinskanna" className="w-full object-cover rounded-lg" />
                <div className="pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-[#212529] mb-1">Boquet Butterfly</h4>
                    <p className="mt-2 text-[#6c757d] text-sm leading-relaxed mb-3">
                      Bagaikan sayap kupu-kupu yang menari di udara, buket ini membawa keindahan yang lembut dan memikat. Sentuhan warna-warni yang ceria memancarkan aura kegembiraan, menghadirkan nuansa manis dan penuh pesona.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6c757d] mb-1">
                      <span className="font-semibold text-[#212529]">Author: </span>Nurul
                    </p>
                    <span className="text-xs text-[#adb5bd]">Contoh artikel template</span>
                  </div>
                </div>
              </div>

              <div className="bg-transparent flex flex-col">
                <img src="/images/asset/benner blog2.jpg" alt="Buket bunga Vinskanna" className="w-full object-cover rounded-lg" />
                <div className="pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-[#212529] mb-1">Boquet Choco</h4>
                    <p className="mt-2 text-[#6c757d] text-sm leading-relaxed mb-3">
                      Kilauan cokelat berpadu indah, buket ini adalah simfoni rasa dan visual. Aromanya membuai, setiap gigitan adalah anugerah kenikmatan yang memanjakan. Sebuah kemewahan yang lezat, memikat hati dan indera.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6c757d] mb-1">
                      <span className="font-semibold text-[#212529]">Author: </span>Annaa
                    </p>
                    <span className="text-xs text-[#adb5bd]">Contoh artikel template</span>
                  </div>
                </div>
              </div>

              <div className="bg-transparent flex flex-col">
                <img src="/images/asset/benner blog3.png" alt="Buket bunga Vinskanna" className="w-full object-cover rounded-lg" />
                <div className="pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-[#212529] mb-1">Boquet Uang</h4>
                    <p className="mt-2 text-[#6c757d] text-sm leading-relaxed mb-3">
                      Kilauan lembaran uang tertata indah, buket ini adalah lambang kemewahan dan kreativitas. Setiap gulungan adalah wujud impian, harapan yang terangkai elegan. Sebuah hadiah istimewa, memikat mata dan hati.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6c757d] mb-1">
                      <span className="font-semibold text-[#212529]">Author: </span>Giska
                    </p>
                    <span className="text-xs text-[#adb5bd]">Contoh artikel template</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* about us */}
        <section id="about" className="section-spaced bg-[#b3b3b3]/[0.05] py-8 sm:py-12">
          <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="lg:order-2 text-center lg:text-left">
                <div className="title about-heading mb-6">
                  <h2 className="relative inline-block ml-4 text-[1.5rem] sm:text-[2rem] font-medium leading-[1.25] text-[#212529] before:content-[''] before:absolute before:w-1 before:h-[50px] before:bg-pink before:-left-5 before:top-1/2 before:-translate-y-1/2">
                    About Us
                  </h2>
                </div>
                <p className="text-base sm:text-lg text-[#6c757d] leading-relaxed mb-4">
                  Rangkaian bunga terbaik dengan kualitas unggulan dan desain yang elegan.
                  Setiap buket dirancang dengan penuh perhatian untuk memberikan keindahan dan makna bagi setiap momen spesial Anda.
                  Temukan koleksi bunga pilihan kami dan buat hari Anda lebih berwarna!
                </p>
                <p className="text-base sm:text-lg font-medium text-[#212529] leading-relaxed mb-0">
                  💐 Dapatkan buket impian Anda hari ini
                </p>
              </div>
              <div className="lg:order-1">
                <img src="/images/asset/benner2.jpg" alt="Buket bunga Vinskanna" className="w-full h-auto object-cover rounded-lg shadow-2xs" />
              </div>
            </div>
          </div>
        </section>

        {/* Bouquet call to action */}
        <section id="newsletter" className="bouquet-banner" aria-labelledby="bouquet-banner-title">
          <div className="w-full mx-auto px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px] min-h-[460px] flex items-center justify-start py-12 md:py-20">
            <div className="bouquet-banner-content max-w-lg text-left">
              <h2 id="bouquet-banner-title" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#582c3a] leading-tight">
                💐 Dapatkan buket impian Anda hari ini
              </h2>
              <a
                href="#collection"
                className="btn !bg-pink hover:!bg-[#c9254c] !text-white !border-pink min-h-[44px] px-6 py-3 mt-6 inline-flex items-center justify-center rounded-pill font-medium transition-colors shadow-xs"
              >
                Pesan Sekarang
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
