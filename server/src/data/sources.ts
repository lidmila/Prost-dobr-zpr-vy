import type { RSSSource } from '../types';

export const RSS_SOURCES: RSSSource[] = [
  // ──────────────────────────────────────────────
  // Czech sources (cs, location: czech)
  // ──────────────────────────────────────────────
  {
    name: 'iROZHLAS.cz',
    url: 'https://www.irozhlas.cz/rss/irozhlas',
    domain: 'irozhlas.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'iDNES.cz',
    url: 'https://servis.idnes.cz/rss.aspx?c=zpravodaj',
    domain: 'idnes.cz',
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
    name: 'Lidovky.cz',
    url: 'https://servis.lidovky.cz/rss.aspx?r=ln_domov',
    domain: 'lidovky.cz',
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
    name: 'Deník.cz',
    url: 'https://www.denik.cz/rss/zpravy.html',
    domain: 'denik.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Echo24.cz',
    url: 'https://echo24.cz/rss',
    domain: 'echo24.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'Hospodářské noviny (HN)',
    url: 'https://hn.cz/rss',
    domain: 'hn.cz',
    language: 'cs',
    location: 'czech',
  },
  {
    name: 'E15.cz',
    url: 'https://www.e15.cz/rss',
    domain: 'e15.cz',
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
    name: 'Root.cz',
    url: 'https://www.root.cz/rss/clanky/',
    domain: 'root.cz',
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
    name: 'CzechCrunch.cz',
    url: 'https://www.czechcrunch.cz/feed/',
    domain: 'czechcrunch.cz',
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

  // ──────────────────────────────────────────────
  // Slovak sources (sk, location: slovak)
  // ──────────────────────────────────────────────
  {
    name: 'SME.sk',
    url: 'https://rss.sme.sk/rss/rss.asp?sek=hl',
    domain: 'sme.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Aktuality.sk',
    url: 'https://www.aktuality.sk/rss/',
    domain: 'aktuality.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Denník N',
    url: 'https://dennikn.sk/feed/',
    domain: 'dennikn.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Pravda.sk',
    url: 'https://spravy.pravda.sk/rss/xml/',
    domain: 'pravda.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'HNonline.sk',
    url: 'https://hnonline.sk/rss',
    domain: 'hnonline.sk',
    language: 'sk',
    location: 'slovak',
  },
  {
    name: 'Startitup.sk',
    url: 'https://www.startitup.sk/feed/',
    domain: 'startitup.sk',
    language: 'sk',
    location: 'slovak',
  },

  // ──────────────────────────────────────────────
  // International EN (en, location: world)
  // ──────────────────────────────────────────────
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
    name: 'HuffPost',
    url: 'https://www.huffpost.com/section/front-page/feed',
    domain: 'huffpost.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'Reuters',
    url: 'https://www.reutersagency.com/feed/',
    domain: 'reuters.com',
    language: 'en',
    location: 'world',
  },
  {
    name: 'AP News',
    url: 'https://rsshub.app/apnews/topics/apf-topnews',
    domain: 'apnews.com',
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

  // ──────────────────────────────────────────────
  // International DE (de, location: world)
  // ──────────────────────────────────────────────
  {
    name: 'DER SPIEGEL',
    url: 'https://www.spiegel.de/schlagzeilen/index.rss',
    domain: 'spiegel.de',
    language: 'de',
    location: 'world',
  },
  {
    name: 'ZEIT ONLINE',
    url: 'https://newsfeed.zeit.de/index',
    domain: 'zeit.de',
    language: 'de',
    location: 'world',
  },
  {
    name: 'Süddeutsche Zeitung',
    url: 'https://rss.sueddeutsche.de/rss/Topthemen',
    domain: 'sueddeutsche.de',
    language: 'de',
    location: 'world',
  },
];
