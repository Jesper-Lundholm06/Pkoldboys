# Ändringslogg — PK Oldboys Bowling

Full historik, flyttad ut ur CLAUDE.md (2026-07-10) så att CLAUDE.md hålls kort. Läses INTE in i varje Claude-session — ren referens.

- 2026-07-09 — Steg 1: Projektskelett skapat. Vite+React+TS scaffoldat,
  Tailwind v3 (postcss+autoprefixer) och react-router-dom installerade och
  konfigurerade. Mappstruktur enligt ovan skapad. Layout-skal byggt: Sidebar
  (logga + klubbnamn + nav-länkar, extern Scoring Online-länk i ny flik,
  responsiv hamburgermeny under `md`), Footer (klubbnamn, Bankgiro, Swish),
  Layout renderar `<Outlet />`. Sex platshållarsidor kopplade i AppRouter
  (endast `<h1>`, inget annat innehåll). Designtokens (primary/accent/bg/text,
  18px bas, 1.6 line-height, guldfärgad fokusring) satta i
  `tailwind.config.js` + `src/index.css`. `npm run dev` och `tsc -b` verifierat
  felfria. Klubbloggan är ännu en placeholder — se "Kända TODO" ovan.
- 2026-07-09 — Steg 2: Supabase-grund kopplad in. `@supabase/supabase-js`
  installerat. `src/lib/supabase.ts` skapar klienten från Vite env-vars.
  `.env` + `.env.example` skapade (URL/anon key tomma), `.env` tillagd i
  `.gitignore`. `supabase/schema.sql` skrivet: tabellerna `news`, `documents`,
  `member_posts` med RLS aktiverat — publik läsning för news/documents,
  autentiserad läsning för member_posts, skrivning bara för
  admin@pkoldboys.se (via auth.jwt() email-check). Temporär `TestAuth.tsx`
  (inloggning/utloggning + "Hämta nyheter"-testknapp) på routen `/test-auth`,
  ej länkad i sidomenyn, kommenterad som TEMPORÄR (tas bort Steg 5). `tsc -b`
  och `npm run dev` verifierat felfria, `/` och `/test-auth` svarar 200.
  Klubbloggan är fortfarande placeholder (kunde inte spara inklistrad
  chattbild till disk) — se "Kända TODO".
- 2026-07-09 — Steg 3: Publika statiska sidor byggda. `Home.tsx` visar loggan,
  introtext (med länk till Fix Bowlingcenter) samt en kommenterad platshållare
  för nyhetslistan (Steg 4). `Tavlingar.tsx` har en kantad "Affisch
  kommer"-platshållare, en blå "Anmälningslista"-knapp som pekar på `#`
  (kommenterad: kopplas till Supabase Storage senare) och en extern
  "Resultat"-länk till bowlit.nu. `VaraAktiviteter.tsx` har en
  "Riksserien"-sektion med två externa divisionslänkar samt en
  "Utbytesmatcher"-sektion. Ny `src/data/matches.ts` exporterar `Match`-typen
  och en TOM array (kommentar: data kommer från Supabase i Steg 4 — inte
  hårdkodat). Ny återanvändbar `src/components/ui/MatchTable.tsx` renderar en
  tillgänglig `<table>` (Datum/Tid/Hemma/Borta/Plats/Resultat) med ett
  vänligt tomt-state ("Inga matcher inlagda än") när arrayen är tom — redo
  att ta emot riktig data i Steg 4 utan ändringar. Alla externa länkar öppnas
  i ny flik med `rel="noopener noreferrer"`. `tsc -b` och `npm run dev`
  verifierat felfria, alla sju routes (inkl. `/test-auth`) svarar 200.
  `TestAuth.tsx` och Supabase-klienten rördes inte. Klubbloggan är
  fortfarande placeholder — se "Kända TODO".
- 2026-07-09 — Steg 4: Publika sidor kopplade till Supabase. Ny liten helper
  `src/lib/fetchTable.ts` (typad `select` + `order`, returnerar
  `{ data, error }`, loggar fel). `Home.tsx` hämtar `news` (nyast först) och
  visar tre uttryckliga tillstånd (laddar/fel/tomt) plus listan vid träff,
  med datum formaterat via `toLocaleDateString('sv-SE')`. `VaraAktiviteter.tsx`
  hämtar `matches` (sorterat på id) och matar in i den oförändrade
  `MatchTable`-komponenten, med samma laddar/fel-mönster; `data/matches.ts`
  exporterar nu bara `Match`-typen (den statiska tomma arrayen togs bort,
  ersatt av DB-anrop). Lade även till den saknade `matches`-tabellen +
  RLS-policyer (publik läsning, admin-skrivning) i `supabase/schema.sql`,
  tydligt märkt "Added in Step 4" — den SAKNADES i Steg 2:s schema.
  Verifierat direkt mot Supabase REST-API: `news` fungerar (`[]`), `matches`
  finns ÄNNU INTE i databasen (måste köras manuellt, se "Kända TODO").
  `tsc -b` och `npm run dev` felfria, `/` och `/vara-aktiviteter` svarar 200.
  `TestAuth.tsx` orörd.
- 2026-07-09 — Steg 5: Riktig inloggning + skyddade routes. Ny
  `src/context/AuthContext.tsx` (`AuthProvider` + `useAuth()`): läser initial
  session via `supabase.auth.getSession()`, prenumererar på
  `onAuthStateChange` (avprenumererar vid unmount), exponerar
  `user/session/loading/isAdmin/signIn/signOut`. `main.tsx` wrappar `<App/>`
  i `<AuthProvider>`. Ny `src/pages/LoggaIn.tsx` (`/logga-in`): stora
  fält+knapp, "Loggar in…" under inskickning, svenskt felmeddelande vid fel
  inloggning, redirectar inloggade admins/medlemmar bort från sidan, och
  routar till `/admin` respektive `/medlem` efter lyckad inloggning. Ny
  `src/components/auth/ProtectedRoute.tsx`: visar "Laddar…" under
  `loading` (ingen redirect-flicker), `<Navigate>` till `/logga-in` om
  utloggad, "Du har inte behörighet till denna sida." om `requireAdmin` och
  ej admin. Nya platshållarsidor `Medlem.tsx` (`/medlem`, skyddad, alla
  inloggade) och `Admin.tsx` (`/admin`, skyddad, `requireAdmin`) — bara
  rubrik + kommentar, inget innehåll (Steg 6/7). `Sidebar.tsx` visar nu
  villkorliga länkar: utloggad → "Logga in"; medlem → "Medlemssida" +
  "Logga ut"; admin → "Admin" + "Medlemssida" + "Logga ut" ("Logga ut"
  anropar `signOut()` och navigerar till `/`). Borttaget: `TestAuth.tsx` +
  `/test-auth`-routen (markerad TEMPORÄR sedan Steg 2). `tsc -b` felfri, alla
  routes (inkl. de nya) svarar 200 i dev-servern. OBS: själva
  inloggningsflödet är INTE testat i en riktig webbläsare av Claude — se
  "Kända TODO", testa gärna manuellt.
- 2026-07-09 — Logga + admin-dashboard (Steg 6). Användaren la in den riktiga
  loggan direkt i projektroten (`PkOldBoys.jpg`); den flyttades till
  `src/assets/logo.jpg` (ersätter placeholdern). Eftersom loggan är en bred
  banner (1023×432, inte kvadratisk) byttes bildvisningen i `Sidebar.tsx` och
  `Home.tsx` från en tvingad `rounded-full`-cirkel (som klippt bort texten)
  till en bred `w-full rounded-lg`-banner. Primary/accent-färgerna i
  `tailwind.config.js` uppdaterades till pixelsamplade värden ur loggan
  (via PowerShell/System.Drawing på flera punkter i bild- och guldtexten) —
  se "Designtokens". — Steg 6: `/admin` är nu en fungerande dashboard. Ny
  `src/pages/Admin.tsx` med två sektioner "Nyheter" och "Matcher" (fortsatt
  skyddad av `ProtectedRoute requireAdmin`, ingen ändring av skyddslogiken).
  Ny `src/components/admin/NewsAdmin.tsx`: formulär (Rubrik + Text) som
  `insert`:ar i `news`, "Sparar…"-läge, svenskt success/error-meddelande,
  lista under formuläret (nyast först) med "Ta bort" per rad
  (`window.confirm` → `delete` → uppdaterar listan). Ny
  `src/components/admin/MatchesAdmin.tsx`: samma mönster för `matches`
  (Datum/Tid/Hemma/Borta/Plats/Resultat) — endast Hemma/Borta är `required`
  i formuläret; övriga fält skickas som tom sträng `''` om de lämnas tomma,
  vilket redan uppfyller kolumnernas `not null`-villkor i `schema.sql` utan
  att databasen behövde ändras. Ny `src/data/news.ts` (News-typen, flyttad
  ut ur `Home.tsx` för återanvändning i `NewsAdmin.tsx`); `Match`-typen från
  `data/matches.ts` återanvänds oförändrad i `MatchesAdmin.tsx`. Båda
  admin-komponenterna har egen lokal `useState` för lista/laddning/fel (ingen
  ny global state), och återanvänder `fetchTable` för listning. `tsc -b`
  felfri, `npm run dev` felfri, `/`, `/admin`, `/medlem` svarar 200. OBS:
  precis som Steg 5 är det faktiska CRUD-flödet (spara/ta bort som inloggad
  admin, verifiera att det dyker upp på de publika sidorna) INTE testat i en
  riktig webbläsare av Claude — testa gärna manuellt enligt Done-kriterierna.
- 2026-07-09 — Steg 6b: Redigering tillagd i admin. Både
  `NewsAdmin.tsx` och `MatchesAdmin.tsx` har nu en `editingId`-state
  (`string | null` resp. `number | null`) som styr samma formulär i två
  lägen — INGEN separat andra formulär. "Ändra"-knapp per rad (bredvid "Ta
  bort") fyller i formuläret och sätter `editingId`; knappen byter text till
  "Uppdatera nyhet"/"Uppdatera match" och en "Avbryt"-knapp dyker upp som
  återställer formuläret till create-läge utan att spara något. Spara i
  edit-läge anropar `.update({...}).eq('id', editingId)` istället för
  `.insert()`; vid fel stannar formuläret kvar i edit-läge med ett svenskt
  felmeddelande (inget tappas), vid lyckad uppdatering visas
  "Nyheten/Matchen uppdaterades", formuläret återställs och listan
  uppdateras. Om man raderar raden man just höll på att redigera återställs
  formuläret automatiskt. Create och delete fungerar oförändrat. `tsc -b`
  och `npm run dev` felfria, `/admin` svarar 200. OBS: som tidigare steg är
  det faktiska edit-flödet i webbläsaren INTE testat av Claude (inget
  browser-verktyg) — testa gärna manuellt enligt Done-kriterierna.
- 2026-07-09 — Steg 7: Medlemssida + admin-hantering av medlemsinlägg.
  Verifierade först direkt mot Supabase REST-API att `member_posts` faktiskt
  finns (`[]`, ingen `PGRST205`) innan kodning — den fanns redan, ingen
  SQL-ändring behövdes. Ny `src/data/memberPosts.ts` (`MemberPost`-typen).
  `Medlem.tsx` hämtar `member_posts` (nyast först) och visar samma
  fyra-tillstånds-mönster som `Home.tsx`/nyheter (laddar/fel/tomt/lista),
  helt read-only — inga admin-kontroller. Ny
  `src/components/admin/MemberPostsAdmin.tsx`, en nästan identisk kopia av
  `NewsAdmin.tsx`s mönster (delat formulär create+edit via `editingId`,
  "Spara/Uppdatera inlägg", "Avbryt", "Ta bort inlägget?"-bekräftelse) men
  mot tabellen `member_posts`. `Admin.tsx` fick en tredje sektion
  "Medlemsinlägg" under Nyheter/Matcher. Endast `Medlem.tsx`, `Admin.tsx` och
  den nya filen ändrades — publika sidor, auth och `ProtectedRoute` rördes
  inte. `tsc -b` och `npm run dev` felfria, `/`, `/medlem`, `/admin` svarar
  200. OBS: som tidigare steg är det faktiska flödet (skapa som admin, se
  det dyka upp på `/medlem` som inloggad medlem utan redigeringsknappar)
  INTE testat i en riktig webbläsare av Claude — testa gärna manuellt enligt
  Done-kriterierna.
- 2026-07-09 — Steg 8: Publika Bilder + Dokument via Supabase Storage.
  Verifierade först direkt mot REST-API:t (som i Steg 4/7) att tabellerna
  `documents` och `gallery_images` finns (`[]`, ingen `PGRST205`), och
  probade `storage/v1/object/public/<bucket>/__test__...` för att bekräfta
  att bucketarna `documents` och `gallery` existerar (svar "Object not
  found", inte "Bucket not found") — allt redan på plats, ingen SQL/
  Storage-konfiguration behövdes. Nya typer `src/data/documents.ts`
  (`Document`) och `src/data/galleryImages.ts` (`GalleryImage`). Publik
  `Dokument.tsx` hämtar `documents`, bygger publika URL:er via
  `supabase.storage.from('documents').getPublicUrl(...)`, grupperar länkar
  per `category` (fallback "Övrigt"), öppnar i ny flik. Publik `Bilder.tsx`
  hämtar `gallery_images`, bygger URL:er via `.from('gallery')`, grupperar
  i ett responsivt rutnät per `album` (fallback "Övrigt"), varje bild har
  alt-text (titel/album/"Bild") och länkar till fullstorleksbilden i ny
  flik. Båda har laddar/fel/tomt-tillstånd. Nya admin-komponenter
  `DocumentsAdmin.tsx` och `GalleryAdmin.tsx` (samma UI-mönster som övriga
  admin-delar): filuppladdning (`accept="application/pdf"` resp.
  `"image/*"`), klientvalidering avvisar filer > 10 MB med svenskt
  felmeddelande innan uppladdning, `Date.now()_filnamn` som storage-path,
  "Laddar upp…"-läge, success/error-meddelanden, lista med "Ta bort" som
  tar bort BÅDE storage-objektet (`.storage.from(bucket).remove([path])`)
  OCH DB-raden innan listan uppdateras. `Admin.tsx` fick två nya sektioner
  "Dokument" och "Bilder" längst ned. Endast de fem nämnda filerna + de två
  nya admin-komponenterna ändrades — auth, `ProtectedRoute`,
  nyheter/matcher/medlemsinlägg rördes inte. "Anmälningslista" på Tävlingar
  lämnad orörd (pekar fortfarande på `#`, enligt uppgift en senare tweak).
  `tsc -b` och `npm run dev` felfria, `/`, `/bilder`, `/dokument`, `/admin`
  svarar 200. OBS: som tidigare steg är det faktiska upload/delete-flödet i
  en riktig webbläsare INTE testat av Claude — testa gärna manuellt enligt
  Done-kriterierna.
- 2026-07-09 — Steg 9: Tillgänglighets- och visuell polish, RENT
  presentation — ingen datalogik/Supabase-anrop/auth/routing ändrades.
  Kollade först efter en befintlig design-fil/SKILL.md i repot (fanns
  ingen) — CLAUDE.md:s "Designtokens"-avsnitt är projektets designsystem
  och byggdes ut rejält (se ovan), inklusive en Node-baserad
  WCAG-kontrastberäkning som styrde färgvalen (t.ex. att guld ALDRIG
  används som ren textfärg — den klarar inte AA på vitt). Nya delade
  primitiver: `src/components/ui/buttonStyles.ts`
  (`buttonClass('primary'|'secondary'|'danger')`) och
  `src/components/ui/StateMessage.tsx` (info/success/error), plus
  `.card`/`.input`/`.label` CSS-klasser i `index.css`. Alla knappar,
  formulärfält och laddar/fel/tomt/success-meddelanden i HELA appen
  (publika sidor, `LoggaIn`, `Medlem`, alla fem admin-komponenter, och
  `ProtectedRoute`s meddelanden) migrerade till dessa delade primitiver
  istället för ad-hoc Tailwind-strängar. `Sidebar.tsx` + mobilhuvudet i
  `Layout.tsx` + `Footer.tsx` är nu djupblå (`primary-dark`) med vit text;
  nav har tydligt aktivt-state (guld vänsterkant + ljusare blå bakgrund),
  hover-state, och en guldfärgad "Logga in"-CTA-knapp när utloggad; alla
  klickytor ≥44px (`min-h-11`). `tailwind.config.js` fick `accent-light`,
  `danger`/`danger-light`, och sidcanvasen blev off-white (`#f7f6f3`) med
  vita `.card`-ytor för kontrast/djup. `MatchTable.tsx` växlade från
  ren tabell till tabell (≥md) / staplade kort (<md) med `<dl>`-etiketter,
  plus sebrarandning på tabellraderna — bedömd som mest läsbar lösning för
  äldre användare på mobil. `Dokument.tsx` fick en inline SVG-dokumentikon
  per länk, `Bilder.tsx` fick tydligare kortram runt miniatyrer. `h2` fick
  global guld-understrykningsaccent. `prefers-reduced-motion: reduce`
  tillagd globalt. `tsc -b` och `npm run dev` felfria; verifierade den
  kompilerade CSS-outputen direkt via dev-servern (grep efter
  RGB-decimalvärdena för alla fyra nya färger + `.card`-klassen) eftersom
  Claude saknar webbläsare för visuell inspektion — ingen visuell
  granskning i en riktig browser har skett, så en snabb genomtitt av
  användaren rekommenderas.
- 2026-07-09 — Steg 9b: Designrevision (uppföljning på Steg 9), fortsatt
  RENT presentation/layout — ingen datalogik/Supabase/auth/routing rörd.
  Se "Layout-mönster (Steg 9b-revision)" under Designtokens för fullständig
  motivering. Kort sammanfattning: `Footer.tsx` bytte till `bg-primary` +
  guld topplinje (skiljer sig nu tydligt från sidebarens `primary-dark`).
  `Sidebar.tsx` nav omgjord till pill-kort (`bg-white/10` vilande,
  `bg-white/20` hover, helfylld guld vid aktiv sida) — verifierade att
  Tailwinds opacity-modifiers (`/10` osv.) faktiskt kompilerar genom att
  grep:a kompilerad CSS efter `rgb(255 255 255 / 0.1)` INNAN resten av
  arbetet byggdes vidare på det antagandet. Auth-länkarna
  (Medlemssida/Admin/Logga ut) flyttade till en avdelad sektion längst ned
  med en `border-white/20`-linje och versal etikett "INLOGGAD SOM
  MEDLEM"/"INLOGGAD SOM ADMIN". `Layout.tsx` fick en global
  `mx-auto max-w-3xl text-left`-wrapper runt `<Outlet/>` — sidinnehåll är
  nu centrerat som block med vänsterjusterad brödtext inuti (medvetet
  gäller alla sidor inkl. Bilder-rutnätet, som blir något smalare på breda
  skärmar). `LoggaIn.tsx` förenklad (tog bort den nu redundanta egna
  `flex justify-center`-wrappern, `mx-auto` på kortet istället) och h1
  avcentrerad för konsekvens med resten av sajtens vänsterjusterade
  rubriker. `Medlem.tsx` fick en välkomstrad: "Välkommen! Här är intern
  information för medlemmar." `Admin.tsx` omskriven från fem staplade
  sektioner till ett tillgängligt flikgränssnitt
  (`role="tablist"/"tab"/"tabpanel"`, `aria-selected`, `useState` för
  aktiv flik, standard = första fliken "Nyheter") — de fem
  admin-sektionskomponenterna importeras och renderas helt oförändrade,
  bara en åt gången. `tsc -b` och `npm run dev` felfria, alla nio routes
  svarar 200, kompilerad CSS verifierad innehålla opacity-varianterna
  0.1/0.2/0.7 samt `border-t-4`. Som tidigare: ingen visuell granskning i
  en riktig browser — användaren bör titta igenom sidorna, särskilt
  sidebar-pillarna och admin-flikarna.
- 2026-07-09 — Steg 9c: Designpolish runda 2, fortsatt RENT
  presentation/layout — `AuthContext.tsx`, Supabase-anrop, `ProtectedRoute`
  och routing helt orörda. Se "Layout-mönster (Steg 9c-revision)" under
  Designtokens för fullständig motivering av varje val. Kort sammanfattning:
  primärblått bytt från den pixelsamplade dämpade tealen (`#1f7b97`) till en
  ljusare/klarare azurblå (`#1a6fd4`) för att matcha klubbens ursprungliga
  hemsida — dubbelkollade WCAG AA innan låsning (testade prompt-förslaget
  `#1E7BE0` som visade sig ge 4.23:1, UNDER AA-gränsen, och valde `#1a6fd4`
  som klarar 4.92:1 istället — samma hex som Steg 1:s allra första
  placeholder-gissning, en rolig cirkel). Sidebar bytte till den nu ljusa
  `primary`-bakgrunden; footer och sidebarens nav-piller använder istället
  `primary-dark` som en tydligt mörkare, kontrasterande panel (nav-pillerna
  gick från halvtransparenta `bg-white/10` till solida `bg-primary-dark` +
  `hover:brightness-125`). "INLOGGAD SOM …"-etiketten fick tunna guldlinjer
  ovanför/under via `<hr border-accent>` och centrerad helvit text.
  Innehållskolumnen vidgad från `max-w-3xl` (768px) till `max-w-4xl`
  (896px); nyhets- och medlemsinläggskortens egna `max-w-2xl`-spärrar togs
  bort så korten nu fyller hela kolumnen, medan brödtextstyckena medvetet
  behöll sin smalare bredd för läsbarhet. Home-loggan vidgad till att fylla
  hela kolumnen (tog bort `max-w-xl`), fortsatt helt responsiv utan
  distorsion. Alla knappar fick `shadow-sm` för synlighet mot
  bakgrundsfärgen. Ny `src/context/ToastContext.tsx` — en enkel lokal toast
  (ingen extern lib) som `LoggaIn.tsx` och `Sidebar.tsx` anropar EXPLICIT
  efter lyckad `signIn`/`signOut`, medvetet INTE inbyggd i `AuthContext`
  självt, så den aldrig visas vid sessionsåterställning/sidladdning.
  `tsc -b` och `npm run dev` felfria, alla nio routes svarar 200; verifierade
  kompilerad CSS för de tre nya blånyanserna (RGB-decimal), `max-width: 56rem`
  och `brightness-125:hover{--tw-brightness:brightness(1.25)}`. Som alltid:
  ingen visuell granskning i en riktig browser har skett — särskilt värt att
  kolla toast-notisen och den nya ljusare sidebaren.
- 2026-07-09 — Steg 9d+e: Mörkare sammanhållen blåpalett + sidebar-header,
  luft mellan nav-länkar och toast flyttad till toppen. Fortsatt RENT
  presentation/tokens/layout — `AuthContext.tsx`, Supabase-anrop,
  `ProtectedRoute` och routing helt orörda. Se "Layout-mönster (Steg
  9d+e-revision)" under Designtokens för fullständig motivering — den
  sektionen är nu DEN AKTUELLA sanningen om sidebar/footer/toast-utseendet
  (9b/9c-sektionerna har fått ⚠️-flaggor vid de delar som blivit inaktuella,
  snarare än att skrivas över, så historiken bevaras). Kort sammanfattning:
  hela blåfamiljen mörkades ned till exakt de hexvärden prompten gav
  (`primary` #0b4f8a, `primary-dark` #093f6f) plus en NY `nav`/`nav-hover`-
  token (#1e5aa8/#2d6fb8) specifikt för nav-knapparnas bakgrund — samtliga
  dubbelkollade mot WCAG AA (alla mellan 5.15:1 och 10.76:1, klart bättre
  marginaler än både 9b:s teal och 9c:s ljusare azurblå). Sidebaren fick ett
  distinkt HEADER-block (mörkare bakgrund, centrerad logga+namn, tunn
  guld-`<hr>` som avdelare) separat från panelen därunder. Nav-länkar bytte
  från halvtransparenta pills till solida `bg-nav`-knappar med tydlig
  `hover:bg-nav-hover`, och avståndet mellan dem ökades (`gap-2` → `gap-4`).
  "INLOGGAD SOM …"-etiketten förenklad till EN divider (inte två) ovanför,
  med dämpad `text-white/70`-text och auth-knapparna stylade identiskt med
  övriga nav-knappar. Toast flyttad från nedre högra hörnet till
  horisontellt centrerad överkant (`top-4`), fortsatt `fixed`
  (ingen layoutförskjutning), fortsatt triggad EXPLICIT från
  `LoggaIn.tsx`/`Sidebar.tsx` — aldrig från `AuthContext` själv. Footer
  behövde ingen kodändring alls (refererade redan `primary-dark` som
  automatiskt fick sitt nya värde). `tsc -b` och `npm run dev` felfria,
  alla nio routes svarar 200; verifierade kompilerad CSS för alla fyra nya
  RGB-decimalvärden och `top: 1rem` för toast-positionen. Som alltid: ingen
  visuell granskning i en riktig browser — särskilt värt att kolla
  sidebar-headern, knapp-kontrasten och toast-positionen i praktiken.
- 2026-07-09 — Steg 9f: Stor visuell redesign mot ett lugnare, mognare,
  mindre "barnsligt" uttryck — trigger var användarens skärmdump + feedback
  (guldknapparna kändes för stora/mättade, "INLOGGAD SOM ADMIN"-etiketten
  och toast-texten var för små/svåra att se, och för många olika blånyanser
  samtidigt). Fortsatt RENT presentation/tokens — `AuthContext.tsx`,
  Supabase-anrop, `ProtectedRoute` och routing helt orörda. STOR
  palett-konsolidering: `tailwind.config.js` gick från fyra blånyanser
  (`primary`/`primary-dark`/`nav`/`nav-hover`) till EN enda (`primary`
  `#1b3a5b`), och `primary-light`/`accent-light` togs bort helt — deras
  användningsställen (kort-kanter, input-kanter, subtila bakgrunder, datum-
  text) migrerade till Tailwinds inbyggda `gray`-skala istället. Guld
  (`accent`) används nu ENDAST som tunn accent (aktiv-nav-vänsterkant,
  `h2`-underkant sänkt från `border-b-4` till `border-b-2`, knapp-underkant,
  fokusring) — ALDRIG längre som stor fylld knappbakgrund; `buttonClass`
  skrevs om till marinblå bakgrund + vit text + tunn guldunderkant.
  Sidebar-navet är nu FLATA rader (inget `bg-nav`-piller) med `border-l-4`
  som enda state-signal + subtil `hover:bg-white/10`; header-blocket i
  sidebaren fick ingen egen mörkare nyans längre, bara en tunn
  `border-white/15`-linje som avdelare. Explicit efterfrågade fixar: (1)
  "Inloggad som …" är nu en tydlig rundad guldkantad badge (`text-base`,
  helvit) istället för liten dämpad versaltext, (2) toast-texten är nu
  `text-xl` fetstil på marinblå bakgrund (var liten text på vit bakgrund) —
  båda gjorda betydligt mer synliga. `.card` bytte från kant+`shadow-sm`
  till kantlös `shadow-md` (mjuk diffus skugga, "modernt" enligt
  uppdraget), `rounded-xl` → `rounded-lg`. Innehållskolumnen vidgad
  `max-w-4xl` → `max-w-5xl` (1024px). `h1`/`h2`-hierarkin gjordes tydligare
  (marinblå, tydlig storleksskillnad 30px/24px/18px). Alla fem
  admin-komponenter, `MatchTable`, `StateMessage`, `Bilder`/`Dokument`/
  `Home`/`Medlem`/`Tavlingar` uppdaterade för att sluta referera de
  borttagna tokens — verifierat med en global grep efter `primary-light`/
  `primary-dark`/`bg-nav`/`nav-hover`/`accent-light` som gav noll träffar
  innan build-verifiering. "Designtokens"-avsnittet i detta dokument
  skrevs om från grunden (de tre gamla "Layout-mönster (Steg 9b/9c/9d+e)"-
  underavsnitten togs bort härifrån, historiken finns kvar i
  Ändringsloggen) eftersom det blivit för långt och delvis motsägelsefullt
  att hålla ajour som en löpande produktreferens. `tsc -b` och `npm run dev`
  felfria, alla nio routes svarar 200, kompilerad CSS verifierad för den
  nya enskilda marinblå tonen (`27 58 91`), `max-width: 64rem` och
  gray-utilities. Som alltid: ingen visuell granskning i en riktig
  browser har skett — användaren bör titta igenom hela sajten, särskilt
  sidebar-navet, badge:n och toast:en som var direkt föranledda av
  skärmdumpsfeedback.
- 2026-07-10 — Steg 9g: Sista finslipningsomgång, trigger var
  skärmdumpar av `/tavlingar` och `/vara-aktiviteter` + konkret feedback.
  Fortsatt RENT presentation — inga nya sidor/routes/detaljvyer, ingen
  datalogik/Supabase/auth rörd. Bredd: `max-w-5xl` (1024px) → godtycklig
  `max-w-[1080px]` (toppen av det begärda 1000–1080px-spannet). Home-hero:
  `rounded-lg` → `rounded-xl` + `shadow-md`. Nyhets-/medlemskort: `.card`
  fick `p-8` (upp från `p-6`) och mer marginal mellan titel/datum/text
  (`mt-2`/`mt-4` istället för `mt-1`/`mt-3`), `leading-relaxed` på
  brödtexten — INGEN "Läs mer"-knapp tillagd (uttryckligen förbjudet,
  klubbnyheter är korta). Sidebar-nav tätades (`px-4 py-3` → `px-3 py-2.5`,
  `border-l-4` → `border-l-2`) och "Inloggad som …"-badgen (pillen från
  Steg 9f) plattades ut till enkel dämpad text igen — se "Designtokens"
  för fullständig motivering av båda. `h1` fick `text-4xl` + `mb-6`,
  footer-texten gick från `text-lg`/`text-base` till `text-xl`/`text-lg`.
  Explicit numrerad extra-feedback: (8) tävlingsaffischen — bekräftade att
  `src/assets/affisch.png` INTE finns på disk trots att användaren trodde
  den lagts till (samma chattbild-till-disk-begränsning som loggan i ett
  tidigare steg); byggde `Tavlingar.tsx` med `import.meta.glob` istället
  för en vanlig `import` så bygget inte kraschar och den streckade
  platshållarrutan visas som fallback tills filen faktiskt läggs till —
  se "Kända TODO". (9) Filuppladdningsknappen (`<input type="file">`)
  stylades med Tailwinds `file:`-variant i `DocumentsAdmin.tsx`/
  `GalleryAdmin.tsx` så webbläsarens gråa standardknapp matchar appens
  knappspråk; nyhets-/medlemsinlägg visar nu datum OCH klockslag (ny delad
  `src/lib/formatDateTime.ts`, `sv-SE` `dateStyle:'short'`/
  `timeStyle:'short'` → t.ex. "2026-07-10 16:32") på både publika sidor
  och i admin-listorna. (10) Zebra-randningen i utbytesmatch-tabellen
  visade sig vara en BUGG sedan Steg 9 — `even:bg-background` var exakt
  samma off-white som sidans egen bakgrund så randningen aldrig syntes;
  fixat till `even:bg-gray-200` (verkligt synlig kontrast, upptäckt genom
  att jämföra hex-värdena direkt, inte bara anta att koden fungerade).
  `tsc -b` och `npm run dev` felfria, alla nio routes svarar 200 (inkl.
  `/tavlingar` med den nya glob-fallback-logiken), kompilerad CSS
  verifierad för `max-width: 1080px`, `2.25rem` (h1), `file-selector-button`
  och gray-200s RGB-decimalvärde. Som alltid: ingen visuell granskning i
  en riktig browser — särskilt värt att kolla den nya kolumnbredden på en
  bred skärm, zebra-randningen i tabellen, och att ladda upp en fil för
  att se den nya knappstylingen.
- 2026-07-10 — Steg 9h: Tre små finjusteringar, fortsatt RENT
  presentation, inga nya sidor/sektioner, ingen datalogik/Supabase/auth
  rörd. (1) Sidebar-nav hover fick en dämpad guld vänsterkant
  (`hover:border-accent/50`) utöver den ljusare bakgrunden, så hover läses
  tydligt som "förhandsvisning" medan aktiv sida (full opacitet + fetstil)
  förblir starkare — se "Designtokens". (2) "Inloggad som …"-etiketten fick
  tillbaka en guldaccent: bara linjen OVANFÖR bytte från `border-white/15`
  till `border-accent`, själva texten fortsatt helt flat (ingen box/pill,
  det var poängen med Steg 9g:s ändring). (3) Home-introstycket
  ("Föreningen bildad 1982 …") hade en `max-w-2xl`-begränsning (672px) kvar
  sedan tidiga steg som gjorde att det radbröt mycket tidigare än den
  breda hero-bilden ovanför — togs bort helt (`leading-relaxed` behållet)
  så stycket nu använder hela den 1080px breda innehållskolumnen. Kollade
  övriga sidor (Bilder/Dokument/LoggaIn/VaraAktiviteter/Tavlingar/Medlem)
  för samma problem — inga andra brödtextstycken hade en motsvarande
  onödig breddbegränsning (LoggaIn:s `max-w-md` på inloggningskortet är
  avsiktligt smalt, rört inte). `tsc -b` och `npm run dev` felfria, alla
  nio routes svarar 200, kompilerad CSS verifierad för
  `hover:border-accent` och guldfärgens RGB-decimalvärde. Som alltid:
  ingen visuell granskning i en riktig browser — värt att kolla
  hover-effekten i sidebaren och att Home-stycket nu är bredare.