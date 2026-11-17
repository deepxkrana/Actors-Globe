# ActorsGlobe — Unified Frontend Design Specification & Design System

> Source: Behance Case Study "Artfolio Website - Modern Web Design" (18 reference board images) & ActorsGlobe Production Architecture.
> Purpose: Single source of truth for pixel-faithful UI implementation, layout tokens, editorial typography, and interactive components.
> Fidelity: **[EXACT]** = confirmed from board (fonts, palette hexes, copy); **[EST]** = measured/calibrated from comps; **[INFERRED]** = interaction and motion behaviors.

---

## 0. Product & Architectural Architecture

ActorsGlobe is an **ultra-luxury, editorial, digital-gallery casting platform** connecting premier actors, directors, casters, and visual storytelling talent. It translates the high-fashion editorial aesthetic of modern digital art monographs into an auteur-grade casting ecosystem.

### Page Routes & Visual Mapping

| Route | Nav Item / Role | Key Page Architecture & Comps |
|---|---|---|
| `/` | **Home** | Container frame, Hero slider (5 slides), liquid glass lens "Get Started" button, (01) About Us with wireframe globe, (02) Our Experience carousel, (03) Editor's Picks expandable bento, (04) Facts with emerald stats squircle & accordion, App Download forest-sage card with 5-phone arc, (05) Why Choose Us bento with orbit diagram, "We Create Future" highlight pills, Contact CTA & Footer |
| `/about` | **About Us** | Manifesto headline, 3D golden wave centerpiece, editorial manifesto text, (02) Ecosystem & Partners row (Leica lens hover), (03) Core Pillars frosted cards on motion streak bg, (04) Company Ambassadors avatar cloud with "12+ Members" circle |
| `/talent` (or `/artists`) | **Featured Talent / Artists** | "We have the best artists in this world", 3-card Artist monograph carousel with green glow active card, 3-row infinite photo marquee, rotating circular typography badge, Contact CTA & Footer |
| `/reviews` | **Reviews & Press** | Jelly-cloud hero card, "Voices of the global community", 3 color-tinted glass testimonial cards (Lavender, Sage Green, Rose Mauve), 2-row staggered Press carousel (`ARTnews`, `sheknows`, `VARIETY`, `aperture`, `VULTURE`, `The Hollywood Reporter`) |
| `/blog` | **Our Blog / News** | "The epicenter of digital evolution", Center hero article slider with side peeking cards, "More articles" horizontal scroll grid |
| `/blog/:slug` | **Article / Monograph Detail** | Breadcrumbs, 2-column split hero, 2-column body with sticky share icons & "In this Article" glass TOC card, 68ch editorial prose |
| `/discovery` | **Casting Discovery** | Casting calls & role filter hub using the same glass cards and bento grids |
| `/roles/:id` | **Role & Project Detail** | Cinematic project overview, role breakdown, application drawer, and script sides |
| `/dashboard` | **Actor / Caster Workspace** | Management portal for submissions, applicants, portfolio media, subscriptions, and messaging |
| `/login` & `/signup` | **Auth Portals** | Modal / glass card auth gateways matching the capsule button design tokens |
| `/admin` | **Admin Portal** | Isolated moderation and platform management interface |

---

## 1. Design Tokens & Palette

### 1.1 Brand Palette [EXACT]

| Role | Name on Board | Hex | Usage |
|---|---|---|---|
| **main** | **Gilded Dune** | `#F7FFB8` | Primary italic serif accent words, key highlights, app store badges |
| **secondary** | **Graphite** | `#D7D7DB` | Secondary light neutral, subdued text/icons, hairline strokes |
| **additional** | **Obsidian Pink** | `#FF97CA` | Electric pink accent: active carousel "next" button with outer glow, pink gradient cards |
| **focus** | **Mauve** | `#DBAAF4` | Italic accent words in Editor's Picks heading, focus rings, interactive selection |

### 1.2 Neutral & Surface Palette [EST]

```css
:root {
  /* Surfaces */
  --bg-page:        #050505;   /* Outside canvas / root background */
  --bg-frame:       #070707;   /* The big rounded site container frame */
  --bg-card:        #0D0D0E;   /* Standard card background */
  --bg-card-raised: #141415;   /* Footer cards, inputs, raised modals */
  --bg-glass:       rgba(255, 255, 255, 0.08);
  --bg-glass-strong:rgba(255, 255, 255, 0.14);

  /* Text & Labels */
  --text:           #FFFFFF;
  --text-soft:      #B9B9BE;   /* Body paragraphs on dark */
  --text-muted:     #8A8A90;   /* Section index "(01)", dimmed headline words, meta */
  --text-faint:     #5A5A60;   /* Disabled / subtle list items */

  /* Hairline Borders (Always 1px) */
  --border-subtle:  rgba(255, 255, 255, 0.06);
  --border:         rgba(255, 255, 255, 0.10);
  --border-strong:  rgba(255, 255, 255, 0.20);

  /* Brand Accents */
  --gilded-dune:    #F7FFB8;
  --graphite:       #D7D7DB;
  --obsidian-pink:  #FF97CA;
  --mauve:          #DBAAF4;
}
```

### 1.3 Section Feature Gradients & Environmental Meshes [EST]

| Section | Color Coordinates | Purpose |
|---|---|---|
| **Facts Squircle Card** | `#046C45` -> `#12934F` -> `#3DBA5A` with stipple highlights `#B8E6C4` | Vibrant emerald green gradient mesh with subtle grain |
| **App Download Card** | Top `#151915` -> Mid `#3E4A36` -> Bottom `#A9C185` | Deep forest dark olive to sage fade |
| **Core Pillars Card** | Blurred diagonal motion streaks: Blue `#6FA6C8`, Green `#5E8A3A`, Yellow `#B7C95A` | Luminous kinetic natural backdrop behind glass cards |
| **"We Create Future" Highlight Pill** | `#FF6A13` (left) -> `#FF9C63` -> `#FFE4D6` (right) with soft swirl & white hand-drawn arrow | High-impact warm orange gradient pill |
| **Community Testimonial Cards** | Lavender (`#C8C2F0` -> `#6E7FE3`), Rose Pink (`#E88FC4` -> `#A85CA6`), Center Green (`#A7C77A` -> `#4F7440`) | Color-tinted frosted testimonial cards |
| **Ambassadors "12+ Members"** | Olive radial `#4A5A1E` -> `#2A3310` | Dark olive circle with white count |
| **Active Artist Card Glow** | Radial tint `rgba(110, 160, 70, 0.28)` at card bottom | Soft luminous green underglow |
| **Active Carousel Next Glow** | Background `rgba(255, 151, 202, 0.35)`, border `#FF97CA`, glow `0 0 24px rgba(255, 151, 202, 0.55)` | Distinctive pink glowing active "next" button |

---

## 2. Typography & Editorial Hierarchy

### Font Families
- **Primary Sans:** `Inter`, `Inter Display`, system-ui, -apple-system, sans-serif (`font-optical-sizing: auto`)
- **Editorial Accent:** `Playfair Display`, serif (`font-style: italic` only)

### The Signature Mixed-Font Pattern
Headline text uses **Inter** (weight 400, tight tracking `-0.02em` to `-0.03em`) with 1–4 key emotional emphasis words swapped to **Playfair Display Italic**.
Italic words are the **only** serif usage across the entire platform.

```css
.em-serif {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.01em;
  font-size: 1.04em;
}

.em-dune  { color: var(--gilded-dune); }  /* Hero statements, app section, About manifesto */
.em-mauve { color: var(--mauve); }        /* Editor's Picks */
.em-muted { color: var(--text-muted); }   /* Section headings: "about us", "moments", "platform", "Community" */
.em-white { color: #FFFFFF; }             /* Hero H1, "global", "digital", "Architecture" */
```

### Type Scale (Desktop 1440px / Mobile in Parentheses)

| Token | Size / Line-Height | Weight | Tracking | Usage & Reference Example |
|---|---|---|---|---|
| `display-1` (Hero H1) | `72px / 1.08` (`30px / 1.15`) | 400 | -0.03em | *"Exploring the world's untold stories through a creative lens"* |
| `display-2` (Page H1) | `64px / 1.1` (`32px`) | 400 | -0.03em | *"More than just a feed..."*, *"The epicenter of digital evolution"* |
| `h2` (Section H2) | `44px / 1.15` (`26px`) | 400 | -0.02em | *"When moments become stories..."*, *"Curated collections..."* |
| `statement` (Manifesto) | `40px / 1.2` (`24px`) | 400 | -0.02em | *"We connect photographers, filmmakers and visual artists worldwide..."* |
| `article-h1` | `54px / 1.3` | 400 | -0.02em | *"Constructed Identity: Where Fashion Becomes Architecture"* |
| `h3` (Card Title) | `28px / 1.15` (`24px`) | 400 | -0.01em | *"Modern aesthetics"*, *"Smart Networking"* |
| `h4` (Feature Title) | `22px / 1.25` | 400–500 | 0 | *"Members part of people"*, *"No loss of quality"* |
| `pill-big` | `56px` | 400 | -0.02em | *"We"*, *"Create"*, *"Future"* |
| `stat` | `88px` | 400–500 | -0.03em | *"50K+"* |
| `body-lg` | `18–20px / 1.6` | 400 | 0 | Section introductory paragraphs |
| `body` | `16px / 1.6` | 400 | 0 | Standard body paragraphs |
| `small` | `14px / 1.5` | 400 | 0 | Card descriptions, chip labels |
| `caption` | `12–13px / 1.4` | 400–500 | 0 | Handles, metadata tags, dates, footer copyright |
| `nav` | `14px` | 500 | 0 | Capsule navigation, action links |
| `eyebrow` | `16px` | 500 | 0 | `(01) About Us`, `(02) Our Experience` |

**Rules:** Sentence case everywhere (no ALL CAPS headlines). Weight 600 only in tiny labels. Body measure constrained to 32–44ch for narrative blocks and 68ch for articles.

---

## 3. Radii, Hairline Borders & Canvas Grid

```css
:root {
  --r-frame:   44px;   /* The master site container */
  --r-hero:    36px;   /* Full-bleed hero card */
  --r-card-xl: 36px;   /* Editor's picks, blog feature, large image cards */
  --r-card:    28px;   /* Feature cards, footer cards, press cards */
  --r-tile:    24px;   /* Image tiles in marquee, author card */
  --r-img:     20px;   /* Inner image radius inside cards */
  --r-pill:    999px;  /* Capsule buttons, tags, nav container */

  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  --space-9: 96px; --space-10: 140px;
}
```

- **Canvas & Frame:** Centered container with `max-width: 1380px`, `--r-frame: 44px`, 1px border `--border`, and `28px` inner padding (12–16px on mobile).
- **Hairlines:** Never use thick borders or heavy drop shadows. All structural depth is achieved with **1px hairline strokes** (`--border: rgba(255, 255, 255, 0.10)`) plus subtle background tone shifts.
- **Section Spacing:** 120–140px between major sections (64–80px on mobile).

---

## 4. Key Visual Effects & Interactive Components

### 4.1 Frosted Glass & Progressive Blurs
```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
```

### 4.2 Liquid Glass Lens Button ("Get Started")
A 200px circular button with realistic optical refraction and warm sand/tan inner swirl:
```css
.lens-button {
  width: 200px;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.45), transparent 45%),
    radial-gradient(circle at 60% 70%, rgba(210, 180, 140, 0.55), rgba(120, 100, 80, 0.25) 70%);
  backdrop-filter: blur(10px) saturate(160%) brightness(1.1);
  -webkit-backdrop-filter: blur(10px) saturate(160%) brightness(1.1);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.25), 0 20px 60px rgba(0, 0, 0, 0.35);
  color: #FFFFFF;
  font-size: 24px;
  font-weight: 500;
  display: grid;
  place-items: center;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
}
.lens-button:hover {
  transform: scale(1.05);
  box-shadow: inset 0 0 35px rgba(255, 255, 255, 0.35), 0 25px 70px rgba(0, 0, 0, 0.45);
}
```

### 4.3 Active Carousel Next Button (Obsidian Pink Glow)
```css
.carousel-btn-next-active {
  background: rgba(255, 151, 202, 0.35);
  border: 1px solid #FF97CA;
  box-shadow: 0 0 24px rgba(255, 151, 202, 0.55);
}
```

### 4.4 Wordmark & Monogram
- **Wordmark "artfolio" / "actorsglobe":** First syllable in *Playfair Display Italic* (semibold feel, white), second syllable in `Inter` (weight 500) with tight negative kerning (`letter-spacing: -0.02em`).
- **Monogram "af" / "ag":** Italic serif monogram used for favicon, footer watermark, rotating circular badge, and eyebrow sub-labels.

### 4.5 Rotating Circular Text Badge
- 140px diameter circle, 1px border.
- Text along circular path: `"FROM ALL SIDES • OPEN YOURSELF COMPLETELY •"` (10px uppercase, letter-spacing `0.2em`).
- Smooth continuous rotation: `animation: spin 20s linear infinite`.
- Center: Italic serif brand monogram.

### 4.6 Floating Pill Navbar (`<Navbar/>`)
- Inside frame top, height ~80px, padding `20px 28px`, 3-zone flex:
  - **Left:** Wordmark.
  - **Center:** Nav pill capsule (`border-radius: 999px; background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border)`).
    - Links: `Home`, `About Us`, `Featured Artists`, `Reviews`, `Our Blog`.
    - Active item = filled pill: `background: rgba(255, 255, 255, 0.10); border: 1px solid rgba(255, 255, 255, 0.14)`.
  - **Right:** `"Sign Up"` text link + `"Log In"` outlined glass pill.
  - **Mobile (<768px):** Wordmark + 40px circular glass hamburger button opening glass menu overlay.

---

## 5. Comprehensive Section-by-Section Specifications

### 5.1 Home (`/`)
1. **Hero Section:**
   - Inset `28px`, radius `36px`, min-height `760px` desktop (`70vh` tablet, `~380px x 520px` mobile).
   - 5-slide cross-fading full-bleed photo slideshow (Slide 1: Joan Grover, Slide 2: James Miller).
   - Tag: `"Visual Storytelling Reimagined"`.
   - Headline: *"Exploring the world's untold stories through a creative lens"* (*through a creative lens* in white serif italic).
   - Subtext: *"Every frame has a story — explore thousands of visual journeys from creators worldwide."*
   - CTA: 200px Liquid Glass Lens `"Get Started"` button.
   - Author Card: Top-right glass card (~188px) with thumbnail, name ("Joan Grover"), role ("Photo author"), and arrow badge.
   - Slide Indicators: 5 horizontal capsules at bottom-right with progress fill.

2. **(01) About Us:**
   - Left: Eyebrow `(01) About Us`, 600px line-stripe halftone globe at 10–14% opacity, and caption `"af | Artfolio support peoples from all over the world"`.
   - Right: Indented statement (120px first-line indent): *"We connect photographers, filmmakers and visual artists worldwide to share their vision, grow their craft, and collaborate on projects"*. Normal text white, italic phrase in `--gilded-dune`, tail in `--text-muted`.
   - Social row: 3 circular icons (X, Instagram, Facebook; 44px) + `"About Us →"` outline pill.

3. **(02) Our Experience:**
   - Card container: Radius 32px, bg `--bg-card`, 1px border, 32px padding.
   - Headline: *"When moments become stories, and stories shape reality"* (*moments* and *stories* in `--text-muted` italic).
   - Right: Filter tabs fading down with mask ("Landscape", "Wildlife", "Architecture").
   - Carousel: Main slide 610x490 (radius 28px), next slide peeking from right edge. Bottom-left caption `"Beneath the Endless Summer Clouds"` + author `"Kai Bergström"` + arrow buttons (next button with pink glow).

4. **(03) Editor's Picks:**
   - Eyebrow `(03) Editor's Picks`.
   - Headline: *"Curated collections from the Artfolio community"* (*collections* and *community* in `--mauve` italic).
   - Paragraph: *"A carefully selected collection of modern photography, visual narratives, and artistic expression — curated to inspire new perspectives through culture, and contemporary storytelling."*
   - 3 Expandable Cards (Heights 590px, radius 36px, widths 590px / 310px / 310px):
     - Card 1 (Expanded): Chip `"Adam Sander @adam_sander"`, Title `"Modern aesthetics"`, description narrative.
     - Card 2 (Collapsed): Chip `"Wally Foertsch @Wally_Foertsch"`, Title `"Echoes of the Wild"`, `"More Details"` glass bar.
     - Card 3 (Collapsed): Chip `"Haydon Weatherill @Haydon_Weatherill"`, Title `"Between Dust and Moonlight"`, `"More Details"` glass bar.
     - Hover expands collapsed card smoothly (flex 2.2 vs 1).

5. **(04) Facts:**
   - Left: Eyebrow `(04) Facts`, Headline *"Facts about us"*, narrative paragraph.
   - Accordion:
     1. `"Members part of people"` (Active: *"No more empty 'hey' messages. On Something, chats start with shared interests - music, food, books, or the little things that define you."*)
     2. `"A lot of awards"`
     3. `"5M+ Creative Works Published"`
     4. `"Featured by Industry Leaders"`
   - Right: Green squircle card with stipple highlights, center frosted circle with **`50K+`** `Members`, and 3 floating user chips (`@Jeny_renken`, `@Wally_Foertsch`, `@mary_sander`).

6. **App Download Card:**
   - Forest-to-sage gradient card (radius 40px).
   - Headline: *"Get the full range of features by downloading our mobile app."* (*full range of features* and *mobile app* in `--gilded-dune` italic).
   - Badges: App Store and Google Play glass pills with gilded dune glyphs.
   - 5-device sweeping iPhone arc showing app workflows.

7. **(05) Why Choose Us? (2x2 Bento):**
   - Headline: *"More than a platform a creative movement"* (*platform* and *movement* in `--text-muted` italic).
   - Card 1 (Wide): Stacked photos with iridescent border — *"No loss of quality"*.
   - Card 2 (Narrow): Magnified avatar cluster — *"Collaborations That Inspire"*.
   - Card 3 (Narrow): 3x4 bento tile grid with illuminated active tiles — *"Showcase That Sells"*.
   - Card 4 (Wide): 3-ring orbit radar diagram — *"Smart Networking"*.

8. **"We Create Future" Ticker Pills:**
   - Row of 4 large capsule pills (`[ We ]`, `[ Create ]`, `[ ➿ ➔ ]`, `[ Future ]`).
   - Third pill: Orange gradient swirl with hand-drawn white looping arrow.

9. **Contact Block & Footer:**
   - Left: Rotating circular text badge (`140px`) with center monogram.
   - Right: `"Let's start Join the Community"` with white circle `"Get in touch →"` CTA.
   - Footer Card 1: Wordmark, mission statement, huge 5% watermark monogram, capsule nav chips, copyright.
   - Footer Card 2: Social icons, `"Newsletter"` input pill with embedded arrow submit button, privacy policy disclaimer.

---

### 5.2 About Us (`/about`)
1. **Hero:** Tag `"About Us"`, Headline *"More than just a feed. A sanctuary for those who create."* (*just a feed.* and *who create.* in `--gilded-dune` italic).
2. **Image Banner:** Abstract golden 3D wave card (radius 36px) with centered liquid chrome brand wordmark.
3. **Manifesto Prose:** High-impact editorial paragraphs with `--gilded-dune` italic highlights (*"spark of talent"*, *"quality and self-expression"*, *"creativity knows no boundaries"*, *"your voice is heard"*, *"grow, inspire, and monetize your craft"*).
4. **(02) Ecosystem & Partners:** Row of 6 brand circles with 35% opacity logos (`VOGUE`, `HYPEBEAST`, `Leica` with active lens hover + tooltip, Unsplash mark, `TASCHEN`, `50+ PARTNERS WORLDWIDE`).
5. **(03) Values (Core Pillars):** Motion-blur nature backdrop with 3 frosted glass cards:
   - *"Freedom of Expression"*
   - *"Creative Equality"*
   - *"Connected by Vision"*
6. **(04) Company Ambassadors:** Staggered cluster of 6 portrait circles with pastel rims and name tooltips, terminating with the dark olive `"12+ Members"` circle.

---

### 5.3 Featured Artists / Talent (`/artists` & `/talent`)
1. **Hero:** Tag `"Featured Artists"`, Headline *"We have the best artists in this world"*, subtext, and subtle 4-point twinkle stars.
2. **Artist Monograph Carousel:** 3 coverflow cards with circular nav arrows:
   - Card 1: `Mira Kova @mirakova`
   - Center Card (Active): `Nikeran Tarone @Nikeran12` with green underglow, bio, and stat chips (`152 Posts | 362.k Followers | 123 Following`).
   - Card 3: `Elian Moreau @elian_moreau`
3. **Infinite 3-Row Photo Marquee:**
   - Full-bleed 3-row masonry wall of rounded square photos (`185px`).
   - Offset rows scrolling infinitely in alternating directions (Row 1 left, Row 2 right, Row 3 left) with edge fades.
4. **Shared Contact & Footer Block:** Identical to Home specifications.

---

### 5.4 Reviews & Press (`/reviews`)
1. **Hero Card:** Pastel gummy-character cloudscape with Tag `"Reviews"` and Headline *"Voices of the global community"* (*global* in white italic).
2. **Testimonial Slider (3 Color-Tinted Glass Cards):**
   - Left Card: Lavender gradient (`#C8C2F0` -> `#6E7FE3`), quote from `Mira Kova`.
   - Center Active Card: Sage green gradient (`#A7C77A` -> `#4F7440`) with circular portrait of `Nikeran Tarone` and full quote.
   - Right Card: Rose magenta gradient (`#E88FC4` -> `#A85CA6`), quote from `Elian Moreau`.
3. **(Reviews) Who Mentioned Us (2-Row Press Carousel):**
   - 2 staggered rows of editorial cards with prominent publication mastheads:
     - `ARTnews` — *"Symbols, Silence, and Frames"*
     - `sheknows` — *"Fashion as Architecture"*
     - `VARIETY` — *"The Body as Canvas"*
     - `aperture` — *"Beauty in Motion"*
     - `VULTURE` — *"Beyond the Silhouette"*
     - `The Hollywood Reporter` — *"The Beauty of..."*

---

### 5.5 Our Blog & Article Detail (`/blog` & `/blog/:slug`)
1. **Blog Hub (`/blog`):**
   - Hero: Tag `"Our Blog"`, Headline *"The epicenter of digital evolution"* (*digital* in white italic).
   - Featured Slider: Large center card (*"Constructed Identity: Where Fashion Becomes Architecture"*) flanked by side peek cards and circular arrow navigation.
   - `[Blog] More articles`: Horizontal card grid with category chips (`Fashion`, `Insights`, `Stories`), dates, and excerpt previews.
2. **Article Detail (`/blog/:slug`):**
   - Header: Breadcrumbs (`Blog > News > Fashion`), headline with serif italic (*Architecture*), author metadata (`Lewis Daller`, `June 1, 2026`), and rounded portrait visual.
   - Sticky 2-Column Body:
     - Left: Share buttons (X, Facebook, LinkedIn, Mail) + `"In this Article"` glass TOC card with scroll-spy active indicators.
     - Right: 68ch editorial prose with section subheadings and deep background ambient atmosphere.

---

## 6. Motion, Interaction & Accessibility

- **Animation Timing:** `cubic-bezier(0.22, 1, 0.36, 1)`, standard durations 300–600ms; hero cross-fade 800ms.
- **Magnetic Lens Button:** Follows pointer subtly (+/-12px).
- **Expandable Bento:** Card hover transitions flex ratio smoothly (flex 2.2 vs 1.0) over 500ms.
- **Marquee:** CSS translation loop with `animation-play-state: paused` on hover.
- **Rotating Badge:** Linear 20s infinite rotation.
- **Accessibility:** `prefers-reduced-motion` suppresses continuous marquee loops; all interactive buttons have `2px` focus rings in `--mauve` with `2px` offset.
