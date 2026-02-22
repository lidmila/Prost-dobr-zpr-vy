import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

const NELEZ_URL = 'https://www.nelez.cz/';
const CONTACT_EMAIL = 'hello@codewhiskers.app';
const logo = require('../../assets/logo.png');

const FAQ_ITEMS = [
  {
    question: 'Co je Prostě dobrý zprávy?',
    answer:
      'Aplikace, která vám přináší pozitivní zprávy z ověřených českých, slovenských i světových zdrojů.',
  },
  {
    question: 'Jak vybíráte články?',
    answer:
      'Články procházejí AI filtrem, který hodnotí pozitivitu obsahu. Zařazujeme pouze zprávy s pozitivním vyzněním.',
  },
  {
    question: 'Proč nevidím články z iDNES, Deníku nebo Pravdy?',
    answer:
      'Vyřazujeme média s problematickým vlastnictvím:\n\n' +
      '\u2022 MAFRA (iDNES, Lidovky) \u2014 Agrofert trust Andreje Babiše\n' +
      '\u2022 Empresa Media (Týden.cz) \u2014 Jaromír Soukup, zdokumentovaný propagandista ANO\n' +
      '\u2022 Vltava Labe Media (Deník.cz) \u2014 Penta Investments\n' +
      '\u2022 Pravda.sk \u2014 Ivo Valenta (vlastník blacklistovaných Parlamentních listů)\n' +
      '\u2022 STVR, Teraz.sk \u2014 politicky zachycené Ficovou vládou\n' +
      '\u2022 TA3 \u2014 Ivan Kmotrík, blízko Smer\n' +
      '\u2022 Nový Čas (cas.sk), Plus 1 deň (pluska.sk) \u2014 bulvár, nekritický k Ficovi',
  },
  {
    question: 'Je aplikace zdarma?',
    answer:
      'Ano, aplikace je zcela zdarma. Pokud nás chcete podpořit, můžete tak učinit v Nastavení.',
  },
  {
    question: 'Mohu nahlásit nevhodný článek?',
    answer:
      'Ano, v detailu každého článku najdete tlačítko "Myslím, že tento článek sem nepatří".',
  },
  {
    question: 'V jakých jazycích jsou články?',
    answer:
      'Nabízíme články v češtině, slovenštině a angličtině. Jazyk si můžete filtrovat v Nastavení.',
  },
  {
    question: 'Jak funguje offline ukládání?',
    answer:
      'Klepněte na "Uložit offline" v detailu článku. Uložené články najdete v záložce Uložené.',
  },
  {
    question: 'Z jakých zdrojů čerpáte?',
    answer:
      'Čerpáme z cca 55 pečlivě vybraných zdrojů.\n\n' +
      '🇨🇿 České zdroje: iROZHLAS.cz, Aktuálně.cz, ČeskéNoviny.cz, Novinky.cz, ČT24, Forbes.cz, Respekt, Refresher.cz, Seznam Zprávy, Vesmír, Kosmonautix.cz, Ekolist.cz, ScienceWorld.cz, Dobrý anděl, Pozitivní zprávy, CNN Prima NEWS, FN Motol, HZS ČR, AV ČR, Nadace Via, Nadace Terezy Maxové, Pomozte dětem, Diakonie ČCE\n\n' +
      '🇸🇰 Slovenské zdroje: SME.sk, Aktuality.sk, Refresher.sk, SITA.sk, SportNet SME, Dobré noviny, Slovenský olympijský výbor, Športky, Nadácia Pontis, Človek v ohrození, Slovenský Červený kríž, Nadácia pre deti Slovenska, Centrum pre filantropiu\n\n' +
      '🇬🇧 Anglické zdroje: Good News Network, Positive.News, Reasons to be Cheerful, BBC, The Guardian, Reuters, AP News, NPR, Nature News, Bright Side, TIME, UNEP',
  },
  {
    question: 'Proč jen dobrý zprávy? Není to jen únik před realitou?',
    answer:
      'Rozhodně ne. Věříme, že je důležité mít přehled o dění ve světě — dobrém i špatném. Naše aplikace není náhradou klasického zpravodajství, ale jeho doplňkem. Výzkumy ukazují, že neustálý proud negativních zpráv vede k úzkosti, vyčerpání a pocitu bezmoci. Když se ale pravidelně setkáváme i s pozitivními informacemi, získáváme energii a nadhled, abychom lépe zpracovali ty těžší. Dobré zprávy nám připomínají, že svět se posouvá kupředu — a to je motivace, která nám pomáhá aktivně se podílet na změnách k lepšímu.',
  },
  {
    question: 'Jak vás mohu kontaktovat?',
    answer:
      'Máte dotaz, nápad nebo problém? Napište nám na hello@codewhiskers.app — rádi vám odpovíme.',
  },
];

function FAQItem({
  item,
  colors,
}: {
  item: (typeof FAQ_ITEMS)[0];
  colors: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      style={[styles.faqItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: colors.text }]}>
          {item.question}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </View>
      {expanded && (
        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
          {item.answer}
        </Text>
      )}
    </Pressable>
  );
}

export default function FAQScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={[styles.logoTitle, { color: colors.text }]}>
          Prostě dobrý zprávy
        </Text>
      </View>

      <View style={[styles.banner, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
        <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
        <Text style={[styles.bannerTitle, { color: colors.primary }]}>
          Tato aplikace je Babiš Free
        </Text>
        <Text style={[styles.bannerText, { color: colors.text }]}>
          Média s problematickým vlastnictvím (MAFRA, Empresa Media, Penta,
          Valenta) v naší aplikaci nenajdete.
        </Text>
      </View>

      <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="heart-outline" size={28} color={colors.primary} />
        <Text style={[styles.bannerSubtitle, { color: colors.text }]}>
          Podporujeme nelez.cz
        </Text>
        <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
          Dle doporučení iniciativy nelez.cz jsme se rozhodli vyřadit
          dezinformační weby. Jejich seznam najdete na stránkách iniciativy.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.bannerLink,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => Linking.openURL(NELEZ_URL)}
        >
          <Ionicons name="open-outline" size={16} color="#fff" />
          <Text style={styles.bannerLinkText}>www.nelez.cz</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Často kladené otázky
      </Text>

      {FAQ_ITEMS.map((item, index) => (
        <FAQItem key={index} item={item} colors={colors} />
      ))}

      <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: Spacing.lg }]}>
        <Ionicons name="megaphone-outline" size={28} color={colors.primary} />
        <Text style={[styles.bannerSubtitle, { color: colors.text }]}>
          Chcete tady být vidět?
        </Text>
        <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
          Vyskytují se u vás dobré zprávy, ale nejste u nás vidět? Napište nám,
          ať vás přidáme!
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.bannerLink,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Chci být vidět v aplikaci`)}
        >
          <Ionicons name="mail-outline" size={16} color="#fff" />
          <Text style={styles.bannerLinkText}>Kontaktovat</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.sm,
  },
  logoTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  banner: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  bannerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  bannerSubtitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  bannerText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  bannerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
  },
  bannerLinkText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  faqItem: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: FontSize.md,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  faqAnswer: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginTop: Spacing.sm,
  },
});
