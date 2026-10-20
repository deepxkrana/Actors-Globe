export interface HeroSlide {
  id: string;
  imageUrl: string;
  tag: string;
  headline: string;
  subtitle: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    imageUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2000&auto=format&fit=crop",
    tag: "Visual Storytelling Reimagined",
    headline: "Where every audition becomes *an indelible performance*.",
    subtitle: "Built for actors, casting directors, and creators who value depth, craft, and the power of the right story."
  },
  {
    id: "slide-2",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop",
    tag: "Auteur Casting Network",
    headline: "Every great story begins with *the right face*.",
    subtitle: "Connecting exceptional talent with the roles and creators that bring stories to life."
  },
  {
    id: "slide-3",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop",
    tag: "Digital Art Sanctuary",
    headline: "The art of being seen. *The power of being chosen*.",
    subtitle: "A space where talent gets discovered, opportunities take shape, and careers move forward."
  },
  {
    id: "slide-4",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2000&auto=format&fit=crop",
    tag: "Global Stage",
    headline: "Some roles are written. *Others are waiting to be discovered*.",
    subtitle: "Discover opportunities, meet the right people, and take your next step in the world of performance."
  },
  {
    id: "slide-5",
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000&auto=format&fit=crop",
    tag: "Creative Collective",
    headline: "Every face has a story. *Every story deserves its cast*.",
    subtitle: "Bringing actors, casting directors, and creators together to turn creative visions into reality."
  }
];

export const EDITORS_PICKS = [
  {
    id: "pick-1",
    title: "Modern aesthetics",
    user: "Adam Sander",
    handle: "@adam_sander",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    description:
      "Here, form, light, and movement become the main language, emphasizing character, mood, and individuality. Each image is a balance of audacity and sophistication, where fashion meets experiment."
  },
  {
    id: "pick-2",
    title: "Echoes of the Wild",
    user: "Wally Foertsch",
    handle: "@Wally_Foertsch",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop",
    description:
      "Raw natural landscapes capturing intense emotional solitude and kinetic visual energy across pristine horizons."
  },
  {
    id: "pick-3",
    title: "Between Dust and Moonlight",
    user: "Haydon Weatherill",
    handle: "@Haydon_Weatherill",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
    description:
      "A conceptual desert exploration blending architectural shadows with the quiet glow of nocturnal light."
  }
];

export const FEATURED_ARTISTS = [
  {
    id: "artist-1",
    name: "Mira Kova",
    handle: "@mirakova",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    bio: "Photographer focused on texture, light, and everyday moments that feel strangely cinematic.",
    posts: "248.k",
    followers: "325",
    following: "140",
    glowColor: "rgba(219, 170, 244, 0.2)"
  },
  {
    id: "artist-2",
    name: "Nikeran Tarone",
    handle: "@Nikeran12",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
    bio: "Hello! Long time no seen. I'm fine, just chilling at home right now.",
    posts: "152",
    followers: "362.k",
    following: "123",
    glowColor: "rgba(16, 185, 129, 0.35)",
    isActive: true
  },
  {
    id: "artist-3",
    name: "Elian Moreau",
    handle: "@elian_moreau",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    bio: "Visual artist exploring identity, silence, and emotional tension through minimal forms.",
    posts: "40",
    followers: "122.k",
    following: "84",
    glowColor: "rgba(255, 151, 202, 0.2)"
  }
];

export const MARQUEE_TILES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop"
];

export const TESTIMONIALS = [
  {
    id: "test-1",
    quote:
      "Not every voice is meant to be loud. Some are meant to be recognized, remembered, and placed where they truly belong.",
    author: "Mira Kova",
    role: "Photographer & Director",
    tint: "lavender",
    gradient: "from-[#C8C2F0]/25 to-[#6E7FE3]/20",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: "test-2",
    quote:
      "In a world of endless scrolling, true talent demands more than attention. At Artfolio, we curate vision, depth, and creative integrity.",
    author: "Nikeran Tarone",
    role: "Visual Creator & Actor",
    tint: "green",
    gradient: "from-[#A7C77A]/35 to-[#4F7440]/30",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
    isActive: true
  },
  {
    id: "test-3",
    quote:
      "Between noise and silence, true creativity finds its place. Artfolio exists to give those moments the space they deserve.",
    author: "Elian Moreau",
    role: "Sculptural Performer",
    tint: "pink",
    gradient: "from-[#E88FC4]/25 to-[#A85CA6]/20",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
  }
];

export const PRESS_MENTIONS = [
  {
    id: "press-1",
    outlet: "ARTnews",
    title: "Symbols, Silence, and Frames",
    excerpt:
      "Some of the most powerful images speak quietly. By analyzing symbolism, stillness, and composition in art and film, this piece examines how meaning is...",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "press-2",
    outlet: "sheknows",
    title: "Fashion as Architecture",
    excerpt:
      "Rather than reacting to seasonal trends, fashion begins to behave like architecture — structured, intentional, and deeply connected to the body....",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "press-3",
    outlet: "VARIETY",
    title: "The Body as Canvas",
    excerpt:
      "Contemporary artists increasingly treat the human body not as a subject, but as a surface — one marked by emotion, memory, and resistance...",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "press-4",
    outlet: "aperture",
    title: "Beauty in Motion",
    excerpt:
      "In contemporary photography, imperfection often feels more honest than precision. Blurred motion, raw shadows, and unfiltered emotion reshape th...",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "press-5",
    outlet: "VULTURE",
    title: "Beyond the Silhouette",
    excerpt:
      "Fashion today exists between sculpture and storytelling. Shapes, silhouettes, and gestures transform garments into visual narratives that cha...",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "press-6",
    outlet: "The Hollywood Reporter",
    title: "The Beauty of Discomfort",
    excerpt:
      "Modern art often chooses discomfort over ease. The tension between camera and subject illuminates unvarnished truth...",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop"
  }
];

export const BLOG_ARTICLES = [
  {
    id: "constructed-identity",
    slug: "constructed-identity",
    title: "Constructed Identity: Where Fashion Becomes Architecture",
    category: "Fashion",
    date: "01.06.2026",
    author: "Lewis Daller",
    authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
    excerpt:
      "In a world where identity is fluid and self-expression evolves by the second, fashion no longer follows the body — it reshapes it.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    isFeatured: true
  },
  {
    id: "beyond-fabric",
    slug: "beyond-fabric",
    title: "Beyond Fabric: When Fashion Becomes Narrative",
    category: "Fashion",
    date: "02.06.2026",
    author: "Elena Vance",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
    excerpt:
      "Moving past fabric and function, contemporary styling builds cinematic layers into every scene and silhouette.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "silent-statements",
    slug: "silent-statements",
    title: "Silent Statements: The New Language of Modern Style",
    category: "Insights",
    date: "24.05.2026",
    author: "Marcus Chen",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    excerpt:
      "Modern style speaks through restraint and precision, replacing loud symbols with subtle visual weight.",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "sculpting-perspective",
    slug: "sculpting-perspective",
    title: "Sculpting Perspective: Texture and Form",
    category: "Stories",
    date: "18.05.2026",
    author: "Sarah Lindqvist",
    authorAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
    excerpt:
      "By combining raw silhouettes and tactile textures, lighting becomes a sculpted physical entity in frame.",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop"
  }
];

export const PARTNERS = [
  { name: "VOGUE", style: "font-serif tracking-widest text-lg font-bold" },
  { name: "HYPEBEAST", style: "font-sans tracking-tight text-lg font-black" },
  { name: "Leica", style: "font-serif italic text-2xl font-semibold", isActive: true },
  { name: "UNSPLASH", style: "font-sans tracking-widest text-sm font-semibold" },
  { name: "TASCHEN", style: "font-sans tracking-wider text-base font-bold" },
  { name: "50+ PARTNERS WORLDWIDE", style: "font-sans text-[10px] tracking-widest uppercase font-medium text-center" }
];

export const AMBASSADORS = [
  { name: "Zara König", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop", bg: "bg-amber-100/10" },
  { name: "Jesse Crane", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop", bg: "bg-emerald-100/10" },
  { name: "Maya Lin", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop", bg: "bg-rose-100/10" },
  { name: "Liam Vance", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop", bg: "bg-sky-100/10" },
  { name: "Chloe Bennett", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop", bg: "bg-purple-100/10" },
  { name: "Tariq Owens", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop", bg: "bg-yellow-100/10" }
];
