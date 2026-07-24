# PK Oldboys Bowling — webbplats

VIKTIGT: Läs detta dokument innan du börjar koda i detta repo. Beskriver
projektets NULÄGE. För historik, se `CHANGELOG.md` (läses ej per session).

Arbetssätt: bygg endast det som uttryckligen är scoped för aktuellt steg —
lägg aldrig till features i förväg, fråga hellre. Skriv en git-commit per
utfört steg i stället för att föra logg i detta dokument.

## Om projektet
Webbplats för seniorbowlingklubben "PK Oldboys Bowling" (grundad 1982).
Målgrupp: äldre medlemmar → tillgänglighet är högsta prioritet (stor läsbar
text, hög kontrast, stora klickytor, enkel navigering). Allt UI-innehåll är
på svenska. Medvetet enkel design — inget flashigt.

## Tech stack
- React + Vite + TypeScript
- Tailwind CSS v3 (postcss + autoprefixer, klassisk `tailwind.config.js`)
- React Router v6+ (react-router-dom)
- Supabase (auth, DB, storage). SENARE: Netlify-hosting, domän pkoldboys.se

## Färdplan (11 steg + tillägg)
Steg 1–9 klara (skelett, Supabase, publika sidor, nyheter, login/skyddade
routes, admin-dashboard, medlemssida, bilder+dokument, tillgänglighetspolish).
Steg 11 påbörjat: Netlify SPA-routing (`_redirects` + `netlify.toml`) klar,
se Mappstruktur + Kända TODO. Kvar: 10) keep-alive mot Supabase 7-dagars
paus, resten av 11) faktisk Netlify-deploy + domän pkoldboys.se.
Steg 12 (tillägg utöver ursprungsplanen): "Kommande händelser" — enkel
kalender/händelselista på Home + admin-hantering. Klart, se Mappstruktur +
Kända TODO (SQL-tabellen är inte körd i databasen än).

## Mappstruktur
```
src/
  assets/       logo.jpg (bred banner 1023×432), affish.png (tävlingsaffisch,
                OBS stavning utan "c" — filnamnet gavs så av användaren)
  components/
    layout/     Layout.tsx, Sidebar.tsx (klickbar logga → "/", villkorlig
                auth-nav), Footer.tsx (kontakt-mailto + copyright)
    ui/          MatchTable.tsx (utbytesmatcher, tabellen i ett `.card`),
                Lightbox.tsx (modal för bildvisning, fokusfälla + Escape),
                ExternalLink.tsx (delad av Riksserien-länkarna och
                Tävlingars "Resultat"-länk — navy understruken text + pil-
                ut-ikon, `target="_blank"`), buttonStyles.ts, StateMessage.tsx
    auth/        ProtectedRoute.tsx (loading/redirect/requireAdmin)
    admin/       NewsAdmin, EventsAdmin, MatchesAdmin, MemberPostsAdmin,
                 DocumentsAdmin, GalleryAdmin — samma CRUD-mönster (delat
                 create+edit-formulär, lista med Ändra/Ta bort). Gallery/
                 Documents laddar upp till Storage + insert/delete rad (tar
                 bort både objekt och DB-rad). EventsAdmin visar ALLA
                 händelser (även passerade, dämpade med `opacity-60` +
                 "(passerad)"-text) sorterat stigande på `event_date`, så
                 admin kan redigera/ta bort gamla poster.
  context/      AuthContext.tsx (useAuth: session/user/loading/isAdmin/signIn/
                signOut — rörs ALDRIG i designsteg),
                ToastContext.tsx (useToast — se Designtokens)
  pages/        Home (Kommande händelser + nyheter, båda från DB), Tavlingar
                (affisch + Anmälningslista/Resultat), VaraAktiviteter
                (Riksserien + matcher, båda i `.card`), Bilder (bucket
                "gallery", per album, klick öppnar Lightbox — INGEN separat
                route/ny flik längre), Dokument (bucket "documents", per
                kategori), Ovrigt (platshållare), LoggaIn (/logga-in),
                Medlem (/medlem, skyddad, read-only),
                Admin (/admin, requireAdmin, flikat dashboard)
  data/         news/events/matches/memberPosts/documents/galleryImages.ts —
                ENDAST typer (ingen hårdkodad data, allt mot DB + Storage)
  lib/          supabase.ts (klient), fetchTable.ts (typad select-helper,
                stödjer BARA enkel select+order — `events`-sidan på Home
                anropar `supabase` direkt för `.gte('event_date', idag)`),
                formatDateTime.ts (`formatDateTime` = sv-SE datum+tid för
                nyheter/medlemsinlägg, `formatEventDate` = sv-SE "15
                augusti"-format — används av EventsAdmin.tsx, RÖR EJ,
                `getEventDayMonth` = separat {day, month}-par för Homes
                datumblock, se Designtokens)
  router/       AppRouter.tsx
  App.tsx, main.tsx (<App/> i <AuthProvider>), index.css
public/         _redirects (Netlify SPA-fallback: "/* /index.html 200",
                kopieras automatiskt av Vite till dist/ vid build)
supabase/       schema.sql — DB-schema + RLS, körs manuellt i SQL Editor
.env / .env.example   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
netlify.toml    build-kommando "npm run build", publish "dist", samma
                SPA-redirect som public/_redirects (bälte+hängslen)
```

## Designtokens (tailwind.config.js + index.css)
Detta avsnitt ÄR projektets designsystem — uppdatera det när tokens ändras.
Palett: navy + white + gray, med guld enbart som tunn accent.

- `primary` — EN marinblå ton `#1b3a5b`. Används för: sidebar-bakgrund,
  footer, toast-bakgrund, länkar och rubriker på vita sidor, sekundärknappars
  kant/text. Ingen egen mörkare header-nyans — en tunn `border-white/15`-linje
  avdelar logga-headern från nav-listan.
- `accent` guld `#d9ac4e` (+ `accent-dark` `#b3872f`) — huvudsakligen tunn
  accent: aktiv-nav-vänsterkant (`border-l-2`), `h2`-understrykning
  (`border-b-2`), knappars nedre kant, fokusring. ALDRIG som fylld
  knappbakgrund. ALDRIG som textfärg på VIT botten (klarar inte WCAG AA,
  bara 2–3:1) — men FUNGERAR som textfärg på den mörka `primary`-bakgrunden
  (5.53:1, AA-godkänt): används så för footerns kontakt-länk och
  "INLOGGAD SOM ADMIN"-etiketten i sidebaren.
- `danger` `#b3261e` (+ `danger-light` `#fbeceb`) — destruktiva "Ta bort".
- Grå: Tailwinds inbyggda `gray`-skala (`gray-50`…`gray-700`) för brödtext/
  datum/kanter/subtila hover-bakgrunder.
- `background` (sidcanvas) `#f7f6f3` off-white. Kort: `bg-white` + `.card`
  (`shadow-md`, `rounded-lg`, ingen kant).
- `text` `#1a1a1a`.
- Typografi: `h1` = `text-4xl` (36px) fetstil marinblå + `mb-6`, `h2` =
  `text-2xl` (24px) med tunn guldunderstrykning, brödtext 18px.

Kontrast: alla kombinationer verifierade mot WCAG AA (vit på primary 11.65:1,
primary på vitt 11.65:1, gray-500 på vitt 4.83:1, gray-700 10.31:1, danger
6.54:1). Guld klarar inte AA som textfärg → används aldrig så.

**Delade UI-primitiver:**
- `buttonStyles.ts` → `buttonClass('primary'|'secondary'|'danger', extra?)`.
  primary = marinblå bg + vit text + tunn guld underkant (`border-b-2`).
  secondary = vit + marinblå kant, hover `bg-gray-50`. danger = vit + tegelröd
  kant. Alla `rounded-md`, `min-h-11` (44px tapptarget), `shadow-sm`.
- `StateMessage.tsx` → `variant="info"|"success"|"error"`. info/success
  gråbaserade (`bg-gray-50`), error rött. Ersätter rå `<p>` för laddar/fel/tomt.
- `.card`/`.input`/`.label` i `index.css`. `.input` `border-gray-300`, fokus
  ger marinblå kant.
- Sidebar-nav: FLATA rader (ingen fylld pill). Panel + rad har samma bg
  (`primary`); state signaleras av kant/hover/fetstil. Aktiv sida = guld
  `border-l-2` + `bg-white/5` + fetstil. Hover = `bg-white/10` +
  dämpad guld `border-accent/50`. Padding `px-3 py-2.5`, inget mellanrum
  mellan items. Alla nav-element (länkar, "Logga ut"-knapp, logga-länken)
  har `focus:outline-none` + en egen `focus-visible:outline-2
  focus-visible:outline-accent` — förhindrar att webbläsarens generella
  fokusruta (från den globala `:focus-visible`-regeln i `index.css`) ser ut
  som en permanent låst ruta runt aktiv sida efter musklick i en SPA.
  Sidebar-loggan är nu en `<Link to="/">` (klickbar hem-länk, samma mål som
  "PK Oldboys"-länken), `max-w-[240px]` (var 160px, sedan 190px).
- "Inloggad som …": liten text (`text-sm`), med en guld `<hr border-accent>`
  ovanför som avdelare — gäller BÅDA "admin" och "medlem" (samma
  villkorslösa `<hr>`). Textfärgen SKILJER dock: "admin" är `text-accent`
  (guld — signalerar "höjd behörighet", kontrast 5.53:1 på `primary`),
  "medlem" förblir dämpad `text-gray-300`.
- Toast (`ToastContext.tsx`): SLIM banner, `fixed inset-x-0 top-0` (fullbredd,
  flush mot toppkanten). EGEN, medvetet fristående palett (inte
  design-tokens `primary`/`accent` — givna som exakta hex i uppdraget):
  bakgrund `#eef5fb` (ljusblå), text `#1d3557` (mörk marinblå, kontrast
  11.23:1), tunn underkant `#d4af37` (guld, 2px) — bytt FRÅN den tidigare
  helmarinblå/vita versionen som smälte ihop med sidebaren. `py-3`
  (tidigare `py-6`) + `text-2xl` (tidigare `text-3xl`) för en slimmad,
  mindre klumpig bar. Glider ned med en `@keyframes toast-slide-down` (i
  `index.css`, refereras via Tailwinds `animate-[toast-slide-down_0.4s_
  ease-out]`) — den globala `prefers-reduced-motion`-regeln nollar
  animationstiden automatiskt så den bara dyker upp direkt utan glidning
  för de som begärt det. `aria-live="polite"`, 3 s auto-dismiss, ingen
  layoutförskjutning (`fixed`, overlay). VIKTIGT: triggas INTE inifrån `AuthContext`
  (som är helt orörd) — `LoggaIn.tsx`/`Sidebar.tsx` anropar `showToast(...)`
  EXPLICIT efter lyckad `signIn`/`signOut`, så den aldrig visas vid
  sessionsåterställning/sidladdning.
- "Kommande händelser" på Home återanvänder AVSIKTLIGT samma fristående
  ljusblå/guld/marinblå-palett som toasten ovan (`#eef5fb`/`#d4af37`/
  `#1d3557`) men som ett kompakt "anslagstavle"-kort: `border-l-4
  border-[#d4af37]`, `bg-[#eef5fb]`, tät padding (`px-4 py-3`, `gap-2`
  mellan kort) — medvetet mycket plattare/tätare än de vita `.card`-baserade
  nyhetskorten direkt under, så sektionerna inte flyter ihop visuellt.
  Kortlayout (Steg 12c, uppdaterad 12d/12e): tvådelad rad, `flex
  items-start gap-4`. VÄNSTER = fast `w-20`-datumblock (Steg 12e: breddad
  från `w-16` för att bekvämt rymma "17:00" + 3-bokstavsmånad), separerat
  med en tunn `border-r border-[#1d3557]/20`: stor fetstil dagssiffra
  (`text-2xl`), liten versal 3-BOKSTAVS månad (`text-xs` — Steg 12e-bugg:
  fulla månadsnamn som "SEPTEMBER" bröt ramjustering/divider-positionen
  mellan kort; `getEventDayMonth()` hämtar nu `{month:'short'}`, strippar
  eventuell avslutande punkt, versaliserar och `.slice(0,3)` → garanterat
  JAN/FEB/MAR/APR/MAJ/JUN/JUL/AUG/SEP/OKT/NOV/DEC oavsett locale-variant),
  och (Steg 12d) TIDEN direkt under månaden (`text-base font-bold`, helt
  opak — mörkare/större än den gamla dämpade metaraden, men mindre än
  dagssiffran) — bara när `event_time` finns, annars ingen platshållarrad
  (håller blocken lika höga i alla fall). HÖGER = rubrik (`text-base
  font-bold`), plats på en egen rad utan "·"-separator (behövs inte längre
  när tiden flyttat ut), och valfri beskrivning i `text-sm`. Den äldre
  `formatEventDate()` (kombinerat "25 juli"-format) RÖRDES INTE eftersom
  `EventsAdmin.tsx` fortfarande använder den och admin-komponenter är
  explicit utanför scope för Home-designändringar.
  Datum/plats/beskrivning använder `text-[#1d3557]/80` eller `/70` (opacitet,
  kontrast 6.29:1 vid 80% — beräknat, inte bara `text-gray-500` eftersom
  uppdraget ville ha en "dämpad grå-MARINBLÅ" i samma familj som
  rubriktexten). Sortering: DB-frågan ordnar bara på `event_date`; eftersom
  `event_time` är fritext ("16:00"/"16.00"/"9.00") sorteras händelser inom samma dag
  EFTERÅT i JS via en liten normaliserare (`parseTimeToMinutes` i
  `Home.tsx`) som konverterar till minuter-sedan-midnatt och sätter
  saknad/oparsbar tid till `Infinity` (sorteras sist den dagen).
- Sidinnehållets maxbredd: `max-w-[1080px]`, `mx-auto text-left` i `Layout.tsx`
  (blocket centreras, brödtext vänsterjusterad). Brödtextstycken har ingen egen
  extra breddspärr (utom `LoggaIn`:s avsiktligt smala `max-w-md`-kort).
- `/admin` flikat (`role="tablist"/"tab"/"tabpanel"`, `useState`), aktiv flik
  = tunn guldunderkant + marinblå text. Flikraden är `overflow-x-auto` +
  `flex` UTAN `flex-wrap` (varje flik-knapp `shrink-0`) — håller sig på EN
  rad och blir horisontellt scrollbar på smala skärmar istället för att
  radbryta oregelbundet. Scrollbaren är visuellt dold via `.scrollbar-hide`
  (ny klass i `index.css`, `scrollbar-width:none` + dold
  `::-webkit-scrollbar`) men förblir funktionell — samma mönster kan
  återanvändas för andra ev. framtida horisontellt scrollbara rader.
- Filuppladdning (`<input type="file">`): Tailwinds `file:`-variant så
  systemknappen matchar appens knappspråk.
- `MatchTable`: `<table>` (bredare skärmar) ligger nu i ett eget `.card`
  (`overflow-x-auto` för säkerhets skull), mobilvyns staplade `<li className
  ="card">`-kort är oförändrade och INTE dubbel-inramade. Radavgränsning är
  tunna horisontella `border-b border-gray-200`-linjer (INTE grå
  zebra-randning längre — `even:bg-gray-200` togs bort, kändes för
  "kalkylark-randigt"; en ren linjeindelad tabell upplevdes tydligare).
- Nyhets-/medlemsinläggskort: bas-`.card` (`p-6`) används rakt av UTAN
  extra padding-override (var `p-8` ett tag — kändes för buffligt/högt,
  ströks). Rubrik `mt-1`, brödtext `mt-2` — kompakt men luftigt.
- `Tavlingar.tsx` importerar `src/assets/affish.png` (OBS: den stavningen,
  inte "affisch") direkt som en vanlig statisk `import` — filen finns nu på
  disk, ingen `import.meta.glob`-fallback behövs längre. Affisch (`max-w-sm`)
  + "Anmälningslista"-knappen + "Resultat"-länken ligger i vanligt vänster-
  justerat blockflöde, SAMMA mönster som `<h1>` och alla andra sidor —
  en tidigare variant centrerade dem (`flex flex-col items-center`) men det
  gjorde att innehållet hamnade förskjutet ÅT HÖGER relativt övriga sidors
  vänsterkant, vilket uppfattades som fel; ströks igen.
- `Bilder.tsx`: klick på en miniatyr öppnar `Lightbox.tsx` (modal overlay,
  mörk halvtransparent bakgrund, stänger vid bakgrundsklick/X/Escape,
  fokusfälla + återställer fokus vid stängning, `role="dialog"
  aria-modal="true"`) — INTE längre `target="_blank"` till en ny flik.
- Externa länkar (Riksserien Division 3/6 på `VaraAktiviteter.tsx`, samt
  "Resultat" på `Tavlingar.tsx`) använder alla samma delade
  `ExternalLink.tsx`: marinblå (`text-primary`) understruken text + en
  liten inline SVG pil-ut-ikon (`aria-hidden`) efter texten,
  `hover:opacity-75`, en `sr-only`-text "(öppnas i ny flik)" för
  skärmläsare, `target="_blank"` + `rel="noopener noreferrer"` inbyggt i
  komponenten.
- Footer: kontakt-mailto (`kontakt@pkoldboys.se`, PLACEHOLDER — byt till
  klubbens riktiga adress) i guld (`text-accent` — OK kontrast 5.53:1 på
  `primary`-mörkblå, till skillnad från guld-text-på-vitt som INTE klarar
  AA), plus en `© 2026 PK Oldboys Bowling`-rad i `text-gray-300`.
- `@media (prefers-reduced-motion: reduce)` stänger av transitions globalt.

## Kända TODO / öppna punkter
- Netlify SPA-routing (`public/_redirects` + `netlify.toml`) är på plats så
  direktbesök/refresh på undersidor (t.ex. `/logga-in`, `/admin`) inte ger
  404 i produktion. Verifierat: `npm run build` → `dist/_redirects`
  innehåller raden korrekt. KVARSTÅR: koppla repot till ett Netlify-projekt
  och sätta miljövariablerna `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` i
  Netlifys UI (byggmiljön läser INTE `.env`-filen — den är gitignorad),
  samt peka domänen pkoldboys.se dit när klubben är redo.
- ⚠️ Footerns kontakt-e-post (`kontakt@pkoldboys.se`) är en PLACEHOLDER —
  byt till klubbens riktiga e-postadress i `src/components/layout/Footer.tsx`
  när den finns.
- ⚠️ Tabellen `matches` (i `supabase/schema.sql`) är INTE körd i databasen än
  (`PGRST205: Could not find table 'public.matches'`). Kör "Added in Step 4"-
  sektionen i SQL Editor, annars visar "Våra aktiviteter" felmeddelande i
  stället för tomt tillstånd. `news`-tabellen finns och funkar.
- ⚠️ Samma sak med tabellen `events` (Steg 12) — verifierat direkt mot
  REST-API:t att den ÄNNU INTE finns (`PGRST205`), trots att uppdraget sa
  att den redan fanns. Kör "Added in Step 12"-sektionen i `schema.sql` i
  SQL Editor, annars visar "Kommande händelser" på Home och Händelser-fliken
  i admin felmeddelandet "Kunde inte hämta händelser just nu." istället för
  tomt/riktigt innehåll.
- Storage-buckets `gallery` och `documents` (båda publika) — skapa manuellt i
  Supabase-dashboarden om ej gjort.
- `.env` ifylld ✅, auth-användarna `admin@pkoldboys.se` /
  `medlem@pkoldboys.se` finns ✅.
- Inloggningsflödet ej testat i webbläsare av Claude (endast `tsc -b`).
  Testa: medlem → `/medlem`, admin → `/admin` (+ kan öppna `/medlem`),
  "Logga ut" → utloggat läge.
- Klubbloggan `src/assets/logo.jpg` visas som bred banner (ingen cirkel-
  beskärning — skulle klippa texten "PK Old Boys").