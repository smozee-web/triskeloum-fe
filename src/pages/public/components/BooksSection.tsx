import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useGetLandingPageContentQuery, useGetBooksQuery, useGetBookCategoriesQuery } from '../../../services/api';
import { getImageUrl } from '../../../utils/imageUtils';

const BooksSection = () => {
  const { lang, t } = useLanguage();
  const [showUsd, setShowUsd] = useState(false);
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'title'>('newest');
  const [readingBook, setReadingBook] = useState<any>(null);

  const { data: contentData } = useGetLandingPageContentQuery();
  const { data: categoriesData } = useGetBookCategoriesQuery();
  const { data: booksData, isLoading } = useGetBooksQuery({
    category: category || undefined,
    q: search || undefined,
    sort,
  });

  const contactSection = contentData?.payload?.find((section: any) => section.section === 'contact');
  const whatsapp = contactSection?.metadata?.whatsapp || '22890000000';

  const booksSection = contentData?.payload?.find((section: any) => section.section === 'books');
  const sectionTitle = booksSection ? (lang === 'fr' ? booksSection.titleFr : booksSection.titleEn) : t('Nos Livres', 'Our Books');
  const sectionSubtitle = booksSection ? (lang === 'fr' ? booksSection.subtitleFr : booksSection.subtitleEn) : t('BIBLIOTHÈQUE', 'LIBRARY');
  const sectionDescription = booksSection
    ? (lang === 'fr' ? booksSection.descriptionFr : booksSection.descriptionEn)
    : t(
      "Des livres pour approfondir les sciences des Asraar et des Azkaar, la Tazkiyah et la médecine prophétique.",
      "Books to deepen the sciences of Asraar and Azkaar, Tazkiyah, and prophetic medicine."
    );

  const categories = categoriesData?.payload || [];
  const books = booksData?.payload || [];

  const formatPrice = (ghs: any, usd: any) => (showUsd ? `$${usd?.toLocaleString()}` : `${ghs?.toLocaleString()} GHS`);
  // priceGhs/priceUsd come back as strings (e.g. "0.00") since they're
  // Postgres decimal columns — a plain truthy check would treat a free
  // book as paid, so parse them first.
  const isFree = (book: any) => (parseFloat(book.priceGhs) || 0) === 0 && (parseFloat(book.priceUsd) || 0) === 0;

  const buyText = (title: string) =>
    encodeURIComponent(t(`Bonjour, je suis intéressé(e) par le livre "${title}".`, `Hi, I'm interested in the book "${title}".`));

  return (
    <section id="books" className="relative py-24 bg-gradient-to-b from-black via-stone-950 to-black overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 mb-4 text-xs tracking-[0.3em] text-amber-500 border border-amber-600/30 rounded-full">
            {sectionSubtitle}
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-white mb-6">
            {sectionTitle}
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400">
            {sectionDescription}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${!category
                ? 'bg-amber-500 text-black border-amber-500'
                : 'border-amber-700/30 text-amber-400 hover:bg-amber-900/20'
                }`}
            >
              {t('Tous', 'All')}
            </button>
            {categories.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${category === c.slug
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'border-amber-700/30 text-amber-400 hover:bg-amber-900/20'
                  }`}
              >
                {c.icon} {lang === 'fr' ? c.nameFr : c.nameEn}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Rechercher un livre ou un auteur...', 'Search a book or author...')}
              className="w-full max-w-xs px-4 py-2 bg-black/50 border border-amber-900/30 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-600/50"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-4 py-2 bg-black/50 border border-amber-900/30 rounded-full text-sm text-amber-400 focus:outline-none focus:border-amber-600/50"
            >
              <option value="newest">{t('Plus récent', 'Newest')}</option>
              <option value="price_asc">{t('Prix croissant', 'Price: low to high')}</option>
              <option value="price_desc">{t('Prix décroissant', 'Price: high to low')}</option>
              <option value="title">{t('Titre', 'Title')}</option>
            </select>
            <button
              onClick={() => setShowUsd(!showUsd)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/20 border border-amber-600/30 rounded-full text-sm text-amber-400 hover:bg-amber-900/30 transition-colors"
            >
              <span className={!showUsd ? 'font-bold' : 'opacity-60'}>GHS</span>
              <div className="w-8 h-4 bg-black/50 rounded-full relative">
                <div className={`absolute top-0.5 w-3 h-3 bg-amber-500 rounded-full transition-all ${showUsd ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className={showUsd ? 'font-bold' : 'opacity-60'}>USD</span>
            </button>
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <p className="text-center text-gray-500">{t('Chargement...', 'Loading...')}</p>
        ) : books.length === 0 ? (
          <p className="text-center text-gray-500">{t('Aucun livre disponible pour le moment.', 'No books available yet.')}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book: any) => {
              const title = lang === 'fr' ? book.titleFr : book.titleEn;
              const description = lang === 'fr' ? book.descriptionFr : book.descriptionEn;
              const free = isFree(book);

              return (
                <div key={book.id} className="group relative rounded-2xl overflow-hidden bg-black/50 border border-amber-900/30 hover:border-amber-600/50 transition-all duration-300">
                  <div className="aspect-[3/4] bg-gradient-to-b from-amber-900/20 to-black flex items-center justify-center overflow-hidden">
                    {book.coverImageUrl ? (
                      <img src={getImageUrl(book.coverImageUrl)} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">📖</span>
                    )}
                  </div>

                  <div className="p-4">
                    {book.category && (
                      <span className="text-xs text-amber-500/80 tracking-wide">
                        {book.category.icon} {lang === 'fr' ? book.category.nameFr : book.category.nameEn}
                      </span>
                    )}
                    <h3 className="text-lg font-medium text-white mt-1 mb-1">{title}</h3>
                    {book.authorName && (
                      <p className="text-xs text-gray-500 mb-2">{t('par', 'by')} {book.authorName}</p>
                    )}
                    {description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{description}</p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-light text-amber-400">
                        {free ? t('Gratuit', 'Free') : formatPrice(book.priceGhs, book.priceUsd)}
                      </span>
                    </div>

                    {free ? (
                      book.deliveryMode === 'DOWNLOADABLE' ? (
                        <a
                          href={getImageUrl(book.fileUrl)}
                          download
                          className="flex items-center justify-center w-full py-2.5 rounded-full text-sm font-medium bg-amber-900/30 text-amber-400 border border-amber-700/30 hover:bg-amber-800/50 transition-colors"
                        >
                          {t('Télécharger', 'Download')}
                        </a>
                      ) : (
                        <button
                          onClick={() => setReadingBook(book)}
                          className="w-full py-2.5 rounded-full text-sm font-medium bg-amber-900/30 text-amber-400 border border-amber-700/30 hover:bg-amber-800/50 transition-colors"
                        >
                          {t('Lire en ligne', 'Read Online')}
                        </button>
                      )
                    ) : (
                      <a
                        href={`https://wa.me/${whatsapp}?text=${buyText(title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-700 text-black hover:from-amber-400 hover:to-amber-600 transition-all"
                      >
                        {t('Acheter via WhatsApp', 'Buy via WhatsApp')}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Read Online Modal */}
      {readingBook && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setReadingBook(null)}>
          <div className="w-full max-w-4xl h-[85vh] bg-black rounded-xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setReadingBook(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
            >
              ✕
            </button>
            <iframe
              src={getImageUrl(readingBook.fileUrl)}
              title={lang === 'fr' ? readingBook.titleFr : readingBook.titleEn}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default BooksSection;
