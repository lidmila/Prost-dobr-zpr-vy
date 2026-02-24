import type { RSSSource } from '../types';

export const RSS_SOURCES: RSSSource[] = [
  // ──────────────────────────────────────────────
  // Czech sources (cs, location: czech)
  // ──────────────────────────────────────────────

  // --- Hlavní zpravodajství ---
  {
    name: 'iROZHLAS.cz',
    url: 'https://www.irozhlas.cz/rss/irozhlas',
    domain: 'irozhlas.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Aktuálně.cz',
    url: 'https://www.aktualne.cz/rss/',
    domain: 'aktualne.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'ČeskéNoviny.cz',
    url: 'https://www.ceskenoviny.cz/sluzby/rss/zpravy.php',
    domain: 'ceskenoviny.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Novinky.cz',
    url: 'https://www.novinky.cz/rss',
    domain: 'novinky.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'ČT24',
    url: 'https://ct24.ceskatelevize.cz/rss/hlavni-zpravy',
    domain: 'ct24.ceskatelevize.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Forbes.cz',
    url: 'https://forbes.cz/feed/',
    domain: 'forbes.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Seznam Zprávy',
    url: 'https://www.seznamzpravy.cz/rss',
    domain: 'seznamzpravy.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Respekt',
    url: 'https://www.respekt.cz/api/rss',
    domain: 'respekt.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Refresher.cz',
    url: 'https://refresher.cz/rss',
    domain: 'refresher.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'SeznamZprávy Věda',
    url: 'https://www.seznamzpravy.cz/rss/sekce/veda-technika',
    domain: 'seznamzpravy.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'CNN Prima NEWS',
    url: 'https://cnn.iprima.cz/rss',
    domain: 'cnn.iprima.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Deník N',
    url: 'https://denikn.cz/feed/',
    domain: 'denikn.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'A2larm',
    url: 'https://a2larm.cz/feed/',
    domain: 'a2larm.cz',
    language: 'cs',
    location: 'czech',
  },

  // --- Pozitivní zprávy ---
  {
    name: 'Pozitivní zprávy',
    url: 'https://pozitivni-zpravy.cz/feed',
    domain: 'pozitivni-zpravy.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Dobrý anděl',
    url: 'https://www.dobryandel.cz/andelsky-blog/feed/',
    domain: 'dobryandel.cz',
    language: 'cs',
    location: 'czech',
  },

  // --- Věda a technologie ---
  {
    name: 'Vesmír',
    url: 'https://vesmir.cz/feed/',
    domain: 'vesmir.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Kosmonautix.cz',
    url: 'https://kosmonautix.cz/feed',
    domain: 'kosmonautix.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Živě.cz',
    url: 'https://www.zive.cz/rss/sc-47/',
    domain: 'zive.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Root.cz',
    url: 'https://www.root.cz/rss/clanky/',
    domain: 'root.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Lupa.cz',
    url: 'https://www.lupa.cz/rss/clanky/',
    domain: 'lupa.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'CzechCrunch',
    url: 'https://czechcrunch.cz/feed/',
    domain: 'czechcrunch.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Vědavýzkum.cz',
    url: 'https://vedavyzkum.cz/rss',
    domain: 'vedavyzkum.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: '21. století',
    url: 'https://21stoleti.cz/feed/',
    domain: '21stoleti.cz',
    language: 'cs',
    location: 'czech',
  },

  // --- Ekologie ---
  {
    name: 'Ekolist.cz',
    url: 'https://ekolist.cz/rss2/',
    domain: 'ekolist.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'ČSOP',
    url: 'https://www.csop.cz/feed',
    domain: 'csop.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Flowee.cz',
    url: 'https://www.flowee.cz/feed',
    domain: 'flowee.cz',
    language: 'cs',
    location: 'czech',
  },

  // --- Univerzity ---
  {
    name: 'Mendelova univerzita',
    url: 'https://mendelu.cz/feed',
    domain: 'mendelu.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'UTB Zlín',
    url: 'https://www.utb.cz/feed',
    domain: 'utb.cz',
    language: 'cs',
    location: 'czech',
  },

  // --- Nemocnice ---
  {
    name: 'IKEM',
    url: 'https://www.ikem.cz/feed',
    domain: 'ikem.cz',
    language: 'cs',
    location: 'czech',
  },

  // --- NGO a charity ---
  {
    name: 'ADRA ČR',
    url: 'https://www.adra.cz/feed',
    domain: 'adra.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Nadace Via',
    url: 'https://www.nadacevia.cz/feed',
    domain: 'nadacevia.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Nadace Terezy Maxové',
    url: 'https://www.nadaceterezymaxove.cz/feed',
    domain: 'nadaceterezymaxove.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Pomozte dětem',
    url: 'https://www.pomoztedetem.cz/feed',
    domain: 'pomoztedetem.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Diakonie ČCE',
    url: 'https://diakonie.cz/feed',
    domain: 'diakonie.cz',
    language: 'cs',
    location: 'czech',
  },

  // --- Sport ---
  {
    name: 'Český olympijský výbor',
    url: 'https://www.olympic.cz/rss',
    domain: 'olympic.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Sport.cz',
    url: 'https://www.sport.cz/rss',
    domain: 'sport.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'ČT Sport',
    url: 'https://sport.ceskatelevize.cz/rss',
    domain: 'sport.ceskatelevize.cz',
    language: 'cs',
    location: 'czech',
  },

  // --- Města ---
  {
    name: 'Brno',
    url: 'https://www.brno.cz/rss',
    domain: 'brno.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Plzeň',
    url: 'https://www.plzen.eu/rss',
    domain: 'plzen.eu',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Olomouc',
    url: 'https://www.olomouc.eu/rss',
    domain: 'olomouc.eu',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Liberec',
    url: 'https://www.liberec.cz/rss',
    domain: 'liberec.cz',
    language: 'cs',
    location: 'czech',
  },

  // --- Zvířata / příroda ---
  {
    name: 'Zoo Brno',
    url: 'https://www.zoobrno.cz/feed',
    domain: 'zoobrno.cz',
    language: 'cs',
    location: 'czech',
  },

  // --- Další ---
  {
    name: 'Transparency International CZ',
    url: 'https://www.transparency.cz/feed',
    domain: 'transparency.cz',
    language: 'cs',
    location: 'czech',
  },

  // ──────────────────────────────────────────────
  // Slovak sources (sk, location: slovak)
  // ──────────────────────────────────────────────
  {
    name: 'Aktuality.sk',
    url: 'https://www.aktuality.sk/rss/',
    domain: 'aktuality.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Refresher.sk',
    url: 'https://www.refresher.sk/rss',
    domain: 'refresher.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'SITA.sk',
    url: 'https://sita.sk/feed/',
    domain: 'sita.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'SITA – Šport',
    url: 'https://sita.sk/kategoria/sport/feed/',
    domain: 'sita.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'SITA – Veda a technika',
    url: 'https://sita.sk/kategoria/veda-a-technika/feed/',
    domain: 'sita.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'SITA – Kultúra',
    url: 'https://sita.sk/kategoria/kultura/feed/',
    domain: 'sita.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Dobré noviny',
    url: 'https://www.dobrenoviny.sk/rss',
    domain: 'dobrenoviny.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Nadácia Pontis',
    url: 'https://www.nadaciapontis.sk/feed',
    domain: 'nadaciapontis.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Človek v ohrození',
    url: 'https://clovekvohrozeni.sk/feed',
    domain: 'clovekvohrozeni.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Slovenský Červený kríž',
    url: 'https://redcross.sk/feed',
    domain: 'redcross.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Nadácia pre deti Slovenska',
    url: 'https://www.nds.sk/feed',
    domain: 'nds.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Centrum pre filantropiu',
    url: 'https://www.cpf.sk/feed',
    domain: 'cpf.sk',
    language: 'sk',
    location: 'slovak',
  },

  // ──────────────────────────────────────────────
  // International EN (en, location: world)
  // ──────────────────────────────────────────────

  // --- Pozitivní zprávy ---
  {
    name: 'Good News Network',
    url: 'https://www.goodnewsnetwork.org/feed/',
    domain: 'goodnewsnetwork.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Positive.News',
    url: 'https://www.positive.news/feed/',
    domain: 'positive.news',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Reasons to be Cheerful',
    url: 'https://reasonstobecheerful.world/feed/',
    domain: 'reasonstobecheerful.world',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Bright Side',
    url: 'https://brightside.me/feed/',
    domain: 'brightside.me',
    language: 'en',
    location: 'world',
  },
  {
    name: 'The Happy Broadcast',
    url: 'https://www.thehappybroadcast.com/feed',
    domain: 'thehappybroadcast.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Daily Good',
    url: 'https://www.dailygood.org/rss.xml',
    domain: 'dailygood.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Upworthy',
    url: 'https://www.upworthy.com/feeds/feed.rss',
    domain: 'upworthy.com',
    language: 'en',
    location: 'world',
  },

  // --- Hlavní zpravodajství ---
  {
    name: 'BBC',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    domain: 'bbc.co.uk',
    language: 'en',
    location: 'world',
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    domain: 'theguardian.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'NPR',
    url: 'https://feeds.npr.org/1001/rss.xml',
    domain: 'npr.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'TIME',
    url: 'https://time.com/feed/',
    domain: 'time.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'The Atlantic',
    url: 'https://www.theatlantic.com/feed/all/',
    domain: 'theatlantic.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Vox',
    url: 'https://www.vox.com/rss/index.xml',
    domain: 'vox.com',
    language: 'en',
    location: 'world',
  },

  // --- Regionální EN zpravodajství ---
  {
    name: 'ABC News Australia',
    url: 'https://www.abc.net.au/news/feed/51120/rss.xml',
    domain: 'abc.net.au',
    language: 'en',
    location: 'world',
  },
  {
    name: 'CBC Canada',
    url: 'https://www.cbc.ca/webfeed/rss/rss-topstories',
    domain: 'cbc.ca',
    language: 'en',
    location: 'world',
  },
  {
    name: 'RTÉ Ireland',
    url: 'https://www.rte.ie/news/rss/news-headlines.xml',
    domain: 'rte.ie',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Al Jazeera EN',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    domain: 'aljazeera.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Deutsche Welle EN',
    url: 'https://rss.dw.com/rdf/rss-en-all',
    domain: 'dw.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'France 24 EN',
    url: 'https://www.france24.com/en/rss',
    domain: 'france24.com',
    language: 'en',
    location: 'world',
  },

  // --- Věda ---
  {
    name: 'Nature News',
    url: 'https://www.nature.com/nature.rss',
    domain: 'nature.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Science AAAS',
    url: 'https://www.science.org/rss/news_current.xml',
    domain: 'science.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'ScienceDaily',
    url: 'https://www.sciencedaily.com/rss/all.xml',
    domain: 'sciencedaily.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'New Scientist',
    url: 'https://www.newscientist.com/feed/home/',
    domain: 'newscientist.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Phys.org',
    url: 'https://phys.org/rss-feed/',
    domain: 'phys.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Live Science',
    url: 'https://www.livescience.com/feeds/all',
    domain: 'livescience.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'The Conversation',
    url: 'https://theconversation.com/articles.atom',
    domain: 'theconversation.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Smithsonian Magazine',
    url: 'https://www.smithsonianmag.com/rss/latest_articles/',
    domain: 'smithsonianmag.com',
    language: 'en',
    location: 'world',
  },

  // --- Ekologie ---
  {
    name: 'UNEP',
    url: 'https://www.unep.org/rss.xml',
    domain: 'unep.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Mongabay',
    url: 'https://news.mongabay.com/feed/',
    domain: 'mongabay.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Grist',
    url: 'https://grist.org/feed/',
    domain: 'grist.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Carbon Brief',
    url: 'https://www.carbonbrief.org/feed/',
    domain: 'carbonbrief.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Yale E360',
    url: 'https://e360.yale.edu/feed.xml',
    domain: 'e360.yale.edu',
    language: 'en',
    location: 'world',
  },
  {
    name: 'IUCN',
    url: 'https://www.iucn.org/rss.xml',
    domain: 'iucn.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Earth.org',
    url: 'https://earth.org/feed/',
    domain: 'earth.org',
    language: 'en',
    location: 'world',
  },

  // --- Zdraví ---
  {
    name: 'WHO',
    url: 'https://www.who.int/rss-feeds/news-english.xml',
    domain: 'who.int',
    language: 'en',
    location: 'world',
  },
  {
    name: 'The Lancet',
    url: 'https://www.thelancet.com/rssfeed/lancet_current.xml',
    domain: 'thelancet.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'BMJ',
    url: 'https://www.bmj.com/rss/recent.xml',
    domain: 'bmj.com',
    language: 'en',
    location: 'world',
  },

  // --- Technologie ---
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    domain: 'arstechnica.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    domain: 'wired.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    domain: 'technologyreview.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    domain: 'theverge.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    domain: 'techcrunch.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Engadget',
    url: 'https://www.engadget.com/rss.xml',
    domain: 'engadget.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'IEEE Spectrum',
    url: 'https://spectrum.ieee.org/feeds/feed.rss',
    domain: 'spectrum.ieee.org',
    language: 'en',
    location: 'world',
  },

  // --- NGO / mezinárodní organizace ---
  {
    name: 'Oxfam',
    url: 'https://www.oxfam.org/en/rss.xml',
    domain: 'oxfam.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'UN News',
    url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
    domain: 'news.un.org',
    language: 'en',
    location: 'world',
  },

  // --- Zvířata / wildlife ---
  {
    name: 'Jane Goodall Institute',
    url: 'https://janegoodall.org/feed/',
    domain: 'janegoodall.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Oceana',
    url: 'https://oceana.org/feed/',
    domain: 'oceana.org',
    language: 'en',
    location: 'world',
  },

  // --- Vesmír ---
  {
    name: 'NASA',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    domain: 'nasa.gov',
    language: 'en',
    location: 'world',
  },
  {
    name: 'ESA',
    url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science',
    domain: 'esa.int',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Space.com',
    url: 'https://www.space.com/feeds/all',
    domain: 'space.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'SpaceNews',
    url: 'https://spacenews.com/feed/',
    domain: 'spacenews.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Astronomy.com',
    url: 'https://www.astronomy.com/feed/',
    domain: 'astronomy.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Sky & Telescope',
    url: 'https://skyandtelescope.org/feed/',
    domain: 'skyandtelescope.org',
    language: 'en',
    location: 'world',
  },

  // --- Vzdělávání ---
  {
    name: 'Edutopia',
    url: 'https://www.edutopia.org/rss.xml',
    domain: 'edutopia.org',
    language: 'en',
    location: 'world',
  },
  {
    name: 'TED Blog',
    url: 'https://blog.ted.com/feed/',
    domain: 'blog.ted.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Open Culture',
    url: 'https://www.openculture.com/feed',
    domain: 'openculture.com',
    language: 'en',
    location: 'world',
  },

  // --- Kultura / umění ---
  {
    name: 'Artnet News',
    url: 'https://news.artnet.com/feed/',
    domain: 'news.artnet.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Hyperallergic',
    url: 'https://hyperallergic.com/feed/',
    domain: 'hyperallergic.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Colossal',
    url: 'https://www.thisiscolossal.com/feed/',
    domain: 'thisiscolossal.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Design Boom',
    url: 'https://www.designboom.com/feed/',
    domain: 'designboom.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Atlas Obscura',
    url: 'https://www.atlasobscura.com/feeds/latest',
    domain: 'atlasobscura.com',
    language: 'en',
    location: 'world',
  },
];
