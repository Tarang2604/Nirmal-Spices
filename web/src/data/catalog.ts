// ============================================================
// NIRMAL'S SPICES — Complete Product Catalog
// Images sourced directly from nirmalspices.in CDN
// ============================================================

const CDN = 'https://nirmalspices.in/admin/images/media_gallery/thumb';

export type Product = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  brand: string;
  price: number;
  salePrice: number | null;
  packSize: string;
  images: string[];
  shortDescription: string;
  description: string;
  ingredients: string;
  usageSuggestions: string;
  shelfLife: string;
  storageInstructions: string;
  nutritionalNotes: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  badge: 'best-seller' | 'new' | 'sale' | null;
  tags: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  weights: Array<{
    weight: string;
    price: number;
    mrp: number;
    stock: number;
  }>;
};

export const CATEGORIES = [
  { label: 'All Spices', slug: '', count: 26 },
  { label: 'Blended Masalas', slug: 'blended-masalas', count: 18 },
  { label: 'Ground Spices', slug: 'ground-spices', count: 4 },
  { label: 'Whole Spices', slug: 'whole-spices', count: 2 },
  { label: 'Salts', slug: 'salts', count: 2 },
  { label: 'Instant Mix', slug: 'instant-mix', count: 2 },
];

const RAW_PRODUCTS = [
  // ─── BLENDED MASALAS ────────────────────────────────────────
  {
    _id: 'p001',
    name: 'Jaljeera Masala',
    slug: 'jaljeera-masala',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 45,
    salePrice: 40,
    packSize: '100g',
    images: [
      `${CDN}/c499140273ee2135287000c3ec0e5fc2.png`,
      `${CDN}/4b635cca3058b810858630eb1f6baba7.png`,
    ],
    shortDescription: 'Tangy, minty Jaljeera masala — perfect for refreshing summer drinks and chaat.',
    description: "Nirmal's Jaljeera Masala is a perfectly balanced blend of dry mango, cumin, mint, and black salt. Ideal for making refreshing jaljeera drinks, chaat, and fruit salads. Sourced from local farms in Harda, MP and processed hygienically without artificial colors or preservatives.",
    ingredients: 'Dry Mango Powder (Amchur), Cumin, Dry Mint Leaves, Black Salt, Black Pepper, Ginger Powder, Dry Coriander, Carom Seeds',
    usageSuggestions: 'Mix 1 tsp in chilled water with lemon juice for jaljeera drink. Sprinkle on fruits, chaats, and curd dishes.',
    shelfLife: '18 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place away from sunlight. Keep container tightly closed.',
    nutritionalNotes: 'Rich in antioxidants. Contains natural digestive aids like cumin and mint.',
    inStock: true,
    rating: 4.7,
    reviewCount: 312,
    badge: 'best-seller',
    tags: ['jaljeera', 'chaat masala', 'summer drink', 'digestive'],
    seo: {
      title: "Jaljeera Masala 100g | Pure & Tangy | Nirmal's Spices",
      description: "Buy Nirmal's Jaljeera Masala online. Authentic tangy-minty spice blend for refreshing drinks and chaats. Made in Harda, MP. No artificial additives.",
      keywords: ['jaljeera masala', 'jaljeera powder', 'chaat masala', 'buy jaljeera online', "Nirmal's spices jaljeera"],
    },
  },
  {
    _id: 'p002',
    name: 'Garam Masala Powder Pouch',
    slug: 'garam-masala-powder-pouch',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 55,
    salePrice: 50,
    packSize: '100g',
    images: [
      `${CDN}/b0d1bfd52a15e987f3d1c4197197cb32.png`,
    ],
    shortDescription: 'Aromatic whole-spice blend garam masala for rich curries and biryanis.',
    description: "Nirmal's Garam Masala Powder is crafted from a traditional family recipe using premium whole spices — slow-roasted and ground fresh. This aromatic blend adds warmth, depth, and complexity to any dish. A kitchen essential for Indian cooking.",
    ingredients: 'Coriander, Cumin, Black Pepper, Cardamom, Cinnamon, Cloves, Bay Leaves, Mace, Nutmeg, Star Anise',
    usageSuggestions: 'Add ½ tsp at the end of cooking curries, dals, and biryanis. Sprinkle on tikkas and kebabs before serving.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place. Keep away from moisture and direct sunlight.',
    nutritionalNotes: 'Contains anti-inflammatory spices. No artificial flavors or preservatives.',
    inStock: true,
    rating: 4.8,
    reviewCount: 527,
    badge: 'best-seller',
    tags: ['garam masala', 'curry spice', 'biryani masala', 'aromatic'],
    seo: {
      title: "Garam Masala Powder 100g Pouch | Nirmal's Spices — Traditional Blend",
      description: "Nirmal's premium Garam Masala made from slow-roasted whole spices. No artificial additives. Perfect for curries, dals, and biryanis.",
      keywords: ['garam masala powder', 'buy garam masala', 'authentic garam masala', 'best garam masala India'],
    },
  },
  {
    _id: 'p003',
    name: 'Dal Tadka Masala',
    slug: 'dal-tadka-masala-100-gram',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 50,
    salePrice: null,
    packSize: '100g',
    images: [
      `${CDN}/b936ce8b9d0beb80811bb9fa83dbd1a0.png`,
    ],
    shortDescription: 'Restaurant-style dal tadka spice blend for irresistible home-cooked dals.',
    description: "Nirmal's Dal Tadka Masala brings authentic dhaba-style flavor to your home kitchen. This specially crafted blend of cumin, dried red chilli, turmeric, and coriander creates a perfectly balanced tadka every time.",
    ingredients: 'Coriander, Cumin, Turmeric, Red Chilli, Dried Mango Powder, Salt, Dry Ginger, Bay Leaf, Asafoetida',
    usageSuggestions: 'Heat ghee, add this masala, and pour over cooked dal. Use 1–2 tsp per cup of dal.',
    shelfLife: '18 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place in an airtight container.',
    nutritionalNotes: 'High in antioxidants. Contains natural digestive spices.',
    inStock: true,
    rating: 4.6,
    reviewCount: 198,
    badge: null,
    tags: ['dal masala', 'tadka masala', 'dal spice', 'dhaba style'],
    seo: {
      title: "Dal Tadka Masala 100g | Dhaba Style | Nirmal's Spices",
      description: "Make restaurant-style dal tadka at home with Nirmal's Dal Tadka Masala. Authentic blend from Harda MP. Order online.",
      keywords: ['dal tadka masala', 'tadka masala', 'dal spice blend', 'dhaba masala'],
    },
  },
  {
    _id: 'p004',
    name: 'Chicken Masala',
    slug: 'chicken-masala',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 65,
    salePrice: 58,
    packSize: '100g',
    images: [
      `${CDN}/b486b7b4c7f8d6026543aff732e0114f.png`,
    ],
    shortDescription: 'Bold, fiery chicken masala blend for restaurant-quality curries and grills.',
    description: "Nirmal's Chicken Masala is a powerful blend of over 15 spices crafted specifically for chicken preparations. It delivers deep, smoky heat with layers of aroma — ideal for curries, tandoori, and dry preparations.",
    ingredients: 'Coriander, Cumin, Red Chilli, Turmeric, Black Pepper, Cardamom, Cloves, Cinnamon, Bay Leaf, Fennel, Dry Ginger, Nutmeg, Mace, Kashmiri Chilli, Salt',
    usageSuggestions: 'Marinate 500g chicken with 2 tbsp masala, yogurt, and oil. Cook in oil or grill. Add 1 tbsp to sauté for curry base.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place. Keep sealed after opening.',
    nutritionalNotes: 'Contains antimicrobial spices. No MSG or artificial enhancers.',
    inStock: true,
    rating: 4.9,
    reviewCount: 743,
    badge: 'best-seller',
    tags: ['chicken masala', 'poultry spice', 'tandoori', 'curry masala'],
    seo: {
      title: "Chicken Masala 100g | Bold & Aromatic | Nirmal's Spices",
      description: "Make authentic chicken curry with Nirmal's Chicken Masala. 15+ spice blend, no artificial additives. Pure from Harda MP.",
      keywords: ['chicken masala', 'chicken curry masala', 'best chicken masala', 'buy chicken masala online'],
    },
  },
  {
    _id: 'p005',
    name: 'Chicken Masala Pouch',
    slug: 'chicken-masal-pouch',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 35,
    salePrice: null,
    packSize: '50g',
    images: [
      `${CDN}/f9dcc4887786df70b2a71f668923d86a.png`,
    ],
    shortDescription: 'Convenient pouch pack of Chicken Masala — same bold taste, travel-friendly size.',
    description: "The same premium Nirmal's Chicken Masala in a convenient 50g eco-friendly pouch. Perfect for single-use cooking or travel. Freshness-sealed for maximum aroma and flavor.",
    ingredients: 'Coriander, Cumin, Red Chilli, Turmeric, Black Pepper, Cardamom, Cloves, Cinnamon, Fennel, Dry Ginger, Salt',
    usageSuggestions: 'Use one full pouch for 500g chicken preparation. Ideal for marinade or curry base.',
    shelfLife: '18 months from date of manufacture',
    storageInstructions: 'Use entire pouch once opened. Store remaining in airtight container.',
    nutritionalNotes: 'All-natural ingredients. No preservatives.',
    inStock: true,
    rating: 4.7,
    reviewCount: 289,
    badge: 'new',
    tags: ['chicken masala pouch', 'single use', 'travel pack', 'convenient'],
    seo: {
      title: "Chicken Masala Pouch 50g | Nirmal's Spices | Freshness Sealed",
      description: "Nirmal's Chicken Masala in convenient 50g pouch. Perfect for travel or single-use cooking. Same bold authentic taste.",
      keywords: ['chicken masala pouch', 'small pack masala', 'travel spice', 'chicken curry spice'],
    },
  },
  {
    _id: 'p006',
    name: 'Chana Masala',
    slug: 'chana-masala',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 55,
    salePrice: 48,
    packSize: '100g',
    images: [
      `${CDN}/4b635cca3058b810858630eb1f6baba7.png`,
    ],
    shortDescription: 'Authentic tangy-spicy chana masala for dhaba-style chole at home.',
    description: "Nirmal's Chana Masala is the secret behind authentic chole bhature and chana curry. A complex blend of dry mango, pomegranate seed, black cardamom, and warming spices that creates the perfect balance of tangy, smoky, and spicy.",
    ingredients: 'Coriander, Cumin, Dry Mango, Pomegranate Seed, Black Cardamom, Red Chilli, Black Pepper, Cloves, Cinnamon, Bay Leaf, Nutmeg, Turmeric, Ginger, Salt',
    usageSuggestions: 'Sauté onions with this masala, add boiled chickpeas and tomatoes. Cook for 15–20 mins. Serve with bhature or rice.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Keep in a cool, dry, dark place. Close tightly after use.',
    nutritionalNotes: 'High in dietary fiber when used with chickpeas. Rich in antioxidants.',
    inStock: true,
    rating: 4.8,
    reviewCount: 612,
    badge: 'best-seller',
    tags: ['chana masala', 'chole masala', 'chickpea spice', 'punjabi'],
    seo: {
      title: "Chana Masala 100g | Authentic Dhaba Style | Nirmal's Spices",
      description: "Make authentic chole bhature with Nirmal's Chana Masala. Tangy, spicy, aromatic. From Harda MP. Order online.",
      keywords: ['chana masala', 'chole masala powder', 'chickpea curry spice', 'best chana masala'],
    },
  },
  {
    _id: 'p007',
    name: 'Biryani Masala',
    slug: 'biryani-masala',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 70,
    salePrice: 62,
    packSize: '100g',
    images: [
      `${CDN}/ec0a81b0c9742fa370c0161ed8506208.png`,
    ],
    shortDescription: 'Restaurant-quality biryani masala with 20+ whole spices for fragrant rice dishes.',
    description: "Nirmal's Biryani Masala is a royal blend of 20+ exotic spices including saffron-colored turmeric, rose petals, star anise, and stone flower. Delivers authentic Hyderabadi and Lucknowi biryani aromas. Each pack is carefully balanced for perfect dum cooking.",
    ingredients: 'Cardamom, Cloves, Cinnamon, Star Anise, Mace, Nutmeg, Black Pepper, Rose Petals, Stone Flower, Bay Leaf, Cumin, Fennel, Coriander, Turmeric, Kashmiri Chilli, Dry Ginger',
    usageSuggestions: 'Use 2 tbsp masala per kg rice. Layer with marinated meat/veg and dum cook. Add whole spices while frying onions for extra aroma.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place. Keep away from heat and moisture.',
    nutritionalNotes: 'Rich in essential oils and aromatic compounds. No artificial color.',
    inStock: true,
    rating: 4.9,
    reviewCount: 891,
    badge: 'best-seller',
    tags: ['biryani masala', 'rice masala', 'dum biryani', 'hyderabadi'],
    seo: {
      title: "Biryani Masala 100g | 20+ Spices | Restaurant Quality | Nirmal's Spices",
      description: "Make restaurant-quality biryani at home with Nirmal's Biryani Masala. Premium 20+ spice blend from Harda MP. Order now.",
      keywords: ['biryani masala', 'biryani spice mix', 'best biryani masala', 'buy biryani masala online'],
    },
  },
  {
    _id: 'p008',
    name: 'Achar Masala Pouch',
    slug: 'achar-masala-pouch',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 40,
    salePrice: null,
    packSize: '100g',
    images: [
      `${CDN}/be41fcbabc898f51afde67b5232918b0.png`,
    ],
    shortDescription: 'Traditional pickle masala blend for authentic homemade achars.',
    description: "Nirmal's Achar Masala is a traditional blend of mustard, fenugreek, fennel, and aromatic spices — the foundation of authentic Indian pickles. Whether making mango achar, mixed vegetable pickle, or lime pickle, this masala delivers the authentic taste of homemade goodness.",
    ingredients: 'Mustard Seeds, Fenugreek Seeds, Fennel Seeds, Red Chilli, Turmeric, Nigella Seeds, Asafoetida, Black Pepper, Salt',
    usageSuggestions: 'Mix 3–4 tbsp masala per kg vegetables/fruit. Add mustard oil and mix well. Sun-dry for 2–3 days before sealing.',
    shelfLife: '18 months from date of manufacture',
    storageInstructions: 'Store in a cool place. Ensure pickle jar is airtight after making achar.',
    nutritionalNotes: 'Contains probiotic-supporting spices. Natural preservative properties.',
    inStock: true,
    rating: 4.6,
    reviewCount: 156,
    badge: null,
    tags: ['achar masala', 'pickle masala', 'mango pickle', 'homemade pickle'],
    seo: {
      title: "Achar Masala Pouch 100g | Homemade Pickle Spice | Nirmal's Spices",
      description: "Make authentic homemade pickles with Nirmal's Achar Masala. Traditional blend from Harda MP. Order online.",
      keywords: ['achar masala', 'pickle masala', 'achaar spice', 'mango pickle masala'],
    },
  },
  {
    _id: 'p009',
    name: 'Sabji Masala',
    slug: 'sabji-masala-100-gram',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 50,
    salePrice: 45,
    packSize: '100g',
    images: [
      `${CDN}/7f57407352c51cd90ed359a85aaf5cb5.png`,
    ],
    shortDescription: 'Everyday vegetable masala that makes every sabji burst with authentic flavor.',
    description: "Nirmal's Sabji Masala is your everyday companion for vegetable cooking. This versatile blend transforms simple sabji into a flavorful dish with the right balance of heat, aroma, and tang. Works beautifully with all vegetables.",
    ingredients: 'Coriander, Cumin, Turmeric, Red Chilli, Dry Mango, Fennel, Asafoetida, Dry Ginger, Black Salt, Salt',
    usageSuggestions: 'Add 1 tsp while cooking any vegetable dish. Works well in aloo, gobi, bhindi, and mixed vegetables.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place in an airtight container.',
    nutritionalNotes: 'All-natural blend. Good source of antioxidant spices.',
    inStock: true,
    rating: 4.5,
    reviewCount: 423,
    badge: null,
    tags: ['sabji masala', 'vegetable masala', 'everyday masala', 'indian cooking'],
    seo: {
      title: "Sabji Masala 100g | Everyday Vegetable Spice | Nirmal's Spices",
      description: "Elevate every vegetable dish with Nirmal's Sabji Masala. All-natural everyday spice blend from Harda MP.",
      keywords: ['sabji masala', 'vegetable masala', 'sabzi masala', 'everyday cooking spice'],
    },
  },
  {
    _id: 'p010',
    name: 'Pav Bhaji Masala',
    slug: 'pav-bhaji-masala-100-gram',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 55,
    salePrice: null,
    packSize: '100g',
    images: [
      `${CDN}/552b0d95eff3943560d8e117c3b8aaff.png`,
    ],
    shortDescription: 'Mumbai-street-style pav bhaji masala for that iconic tangy-buttery taste.',
    description: "Nirmal's Pav Bhaji Masala captures the essence of Mumbai's beloved street food. This aromatic blend of coriander, cumin, fennel, and black cardamom delivers that signature tangy-buttery pav bhaji taste you love.",
    ingredients: 'Coriander, Cumin, Fennel, Black Cardamom, Red Chilli, Dry Mango, Cloves, Cinnamon, Black Pepper, Turmeric, Ginger, Salt',
    usageSuggestions: 'Mix 1.5 tbsp into bhaji while cooking. Add to butter while toasting pav. Adjust quantity for desired spice level.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place. Keep sealed after use.',
    nutritionalNotes: 'Rich in digestive spices. Contains anti-inflammatory compounds.',
    inStock: true,
    rating: 4.7,
    reviewCount: 334,
    badge: null,
    tags: ['pav bhaji masala', 'street food', 'mumbai style', 'bhaji spice'],
    seo: {
      title: "Pav Bhaji Masala 100g | Mumbai Style | Nirmal's Spices",
      description: "Make authentic Mumbai pav bhaji at home with Nirmal's Pav Bhaji Masala. Tangy, spicy, aromatic. Order online.",
      keywords: ['pav bhaji masala', 'pav bhaji spice', 'mumbai street food masala', 'buy pav bhaji masala'],
    },
  },
  {
    _id: 'p011',
    name: 'Pani Puri Masala',
    slug: 'pani-puri-masala',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 40,
    salePrice: 35,
    packSize: '50g',
    images: [
      `${CDN}/c3ec17b76c386f7b271eb26229ca5416.png`,
    ],
    shortDescription: 'Authentic tangy-spicy pani puri masala for that addictive gol gappa water.',
    description: "Nirmal's Pani Puri Masala is the heart of perfect gol gappa water. A precise blend of black salt, dry mango, mint, and cooling spices that creates the tangy-spicy-refreshing pani puri water you crave.",
    ingredients: 'Dry Mango Powder, Black Salt, Cumin, Mint Powder, Black Pepper, Coriander, Dry Ginger, Asafoetida, Red Chilli, Fennel',
    usageSuggestions: 'Dissolve 2 tsp in 500ml chilled water with lemon juice and fresh mint. Strain and serve ice-cold in puris.',
    shelfLife: '18 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place. Keep tightly sealed.',
    nutritionalNotes: 'Contains cooling mint and digestive black salt. Refreshing and stomach-soothing.',
    inStock: true,
    rating: 4.8,
    reviewCount: 567,
    badge: 'best-seller',
    tags: ['pani puri masala', 'gol gappa', 'street food', 'chaat'],
    seo: {
      title: "Pani Puri Masala 50g | Authentic Tangy | Nirmal's Spices",
      description: "Make perfect pani puri water with Nirmal's Pani Puri Masala. Tangy, spicy, refreshing. Order online.",
      keywords: ['pani puri masala', 'gol gappa masala', 'pani puri spice', 'chaat masala'],
    },
  },
  {
    _id: 'p012',
    name: 'Tea Masala',
    slug: 'tea-masala-50-gram',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 45,
    salePrice: null,
    packSize: '50g',
    images: [
      `${CDN}/5f33e4337aff4bbad8e7d170ff215dff.png`,
    ],
    shortDescription: 'Aromatic masala chai blend with ginger, cardamom, and warming spices.',
    description: "Nirmal's Tea Masala elevates your daily chai to a wellness ritual. This warming blend of green cardamom, ginger, black pepper, and cloves creates a perfectly spiced, aromatic masala chai that soothes and energizes.",
    ingredients: 'Green Cardamom, Dry Ginger, Black Pepper, Cloves, Cinnamon, Fennel, Nutmeg',
    usageSuggestions: 'Add a pinch (1/4 tsp) to your tea while brewing. Boil milk, tea leaves, and this masala together for 3–5 mins.',
    shelfLife: '18 months from date of manufacture',
    storageInstructions: 'Store in a cool, dark place in an airtight container.',
    nutritionalNotes: 'Packed with antioxidants. Ginger aids digestion; cardamom freshens breath.',
    inStock: true,
    rating: 4.9,
    reviewCount: 789,
    badge: 'best-seller',
    tags: ['tea masala', 'chai masala', 'masala chai', 'cardamom ginger'],
    seo: {
      title: "Tea Masala 50g | Aromatic Masala Chai Blend | Nirmal's Spices",
      description: "Elevate your daily chai with Nirmal's Tea Masala. Cardamom, ginger, black pepper blend. Order online from Harda MP.",
      keywords: ['tea masala', 'chai masala', 'masala chai spice', 'cardamom tea blend'],
    },
  },
  {
    _id: 'p013',
    name: 'Meat Masala',
    slug: 'meat-masala',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 70,
    salePrice: 62,
    packSize: '100g',
    images: [
      `${CDN}/b486b7b4c7f8d6026543aff732e0114f.png`,
      `${CDN}/f9dcc4887786df70b2a71f668923d86a.png`,
    ],
    shortDescription: 'Robust, smoky meat masala for mutton, lamb, and beef preparations.',
    description: "Nirmal's Meat Masala is a bold, robust blend crafted specifically for slow-cooked meat dishes. The deep, smoky notes from charcoal-roasted spices pair perfectly with mutton, lamb, and beef, creating rich, flavor-packed gravies.",
    ingredients: 'Coriander, Cumin, Red Chilli, Kashmiri Chilli, Black Pepper, Cardamom, Cloves, Cinnamon, Bay Leaf, Mace, Nutmeg, Stone Flower, Dry Ginger, Turmeric, Salt',
    usageSuggestions: 'Use 2 tbsp per 500g meat. Marinate for 30 minutes before cooking. Add extra 1 tbsp to gravy base for more depth.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place. Keep sealed after use.',
    nutritionalNotes: 'Rich in warming spices. Contains natural preservative compounds.',
    inStock: true,
    rating: 4.8,
    reviewCount: 456,
    badge: null,
    tags: ['meat masala', 'mutton masala', 'lamb masala', 'non veg masala'],
    seo: {
      title: "Meat Masala 100g | Bold & Smoky | Nirmal's Spices",
      description: "Rich meat masala for authentic mutton and lamb curries. Nirmal's smoky spice blend from Harda MP. Order online.",
      keywords: ['meat masala', 'mutton masala', 'lamb curry masala', 'non veg spice blend'],
    },
  },
  {
    _id: 'p014',
    name: 'Kasoori Methi Pouch',
    slug: 'kasoori-methi-pouch',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 35,
    salePrice: null,
    packSize: '50g',
    images: [
      `${CDN}/be41fcbabc898f51afde67b5232918b0.png`,
    ],
    shortDescription: 'Fragrant dried fenugreek leaves — a finishing touch for restaurant-quality curries.',
    description: "Nirmal's Kasoori Methi contains premium sun-dried fenugreek leaves from the best farms. A pinch of this aromatic herb transforms any curry, dal, or paneer dish into a restaurant-quality experience. An essential in North Indian cooking.",
    ingredients: '100% Dried Fenugreek Leaves (Trigonella foenum-graecum)',
    usageSuggestions: 'Crush and sprinkle 1 tsp over curries, butter chicken, dal makhni, and paneer dishes just before serving.',
    shelfLife: '12 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry, airtight container away from sunlight.',
    nutritionalNotes: 'Rich in iron, fiber, and protein. Known to aid digestion and blood sugar regulation.',
    inStock: true,
    rating: 4.7,
    reviewCount: 298,
    badge: 'new',
    tags: ['kasoori methi', 'fenugreek leaves', 'dried methi', 'restaurant style'],
    seo: {
      title: "Kasoori Methi 50g | Dried Fenugreek Leaves | Nirmal's Spices",
      description: "Premium kasoori methi for authentic Indian curries. Sun-dried fenugreek leaves from Harda MP. Order online.",
      keywords: ['kasoori methi', 'kasuri methi', 'dried fenugreek leaves', 'methi masala'],
    },
  },
  {
    _id: 'p015',
    name: 'Jeeravan Poha Masala',
    slug: 'jeeravan-poha-masala',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 45,
    salePrice: 40,
    packSize: '100g',
    images: [
      `${CDN}/c499140273ee2135287000c3ec0e5fc2.png`,
    ],
    shortDescription: 'Traditional MP jeeravan masala — the signature spice for authentic poha.',
    description: "Nirmal's Jeeravan is the iconic Madhya Pradesh spice blend that makes Indore-style poha famous. This unique combination of cumin, fennel, coriander, and black salt is also delicious on fruits, chaats, and snacks. A true regional specialty.",
    ingredients: 'Cumin, Coriander, Fennel, Black Salt, Dry Mango, Red Chilli, Black Pepper, Dry Ginger, Asafoetida, Carom Seeds',
    usageSuggestions: 'Sprinkle generously on poha, upma, fruits, and chaat. Add to buttermilk for a refreshing drink. Use as finishing spice on snacks.',
    shelfLife: '18 months from date of manufacture',
    storageInstructions: 'Store in an airtight container in a cool, dry place.',
    nutritionalNotes: 'Contains digestive spices. Black salt provides essential minerals.',
    inStock: true,
    rating: 4.9,
    reviewCount: 634,
    badge: 'best-seller',
    tags: ['jeeravan', 'poha masala', 'indore style', 'madhya pradesh', 'regional'],
    seo: {
      title: "Jeeravan Poha Masala 100g | Authentic MP Flavour | Nirmal's Spices",
      description: "Authentic Jeeravan masala for Indore-style poha. Traditional Madhya Pradesh spice blend by Nirmal's. Order online.",
      keywords: ['jeeravan masala', 'poha masala', 'indore poha masala', 'madhya pradesh jeeravan'],
    },
  },
  {
    _id: 'p016',
    name: 'Shahi Paneer Masala',
    slug: 'shahi-paneer-masala',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 60,
    salePrice: 55,
    packSize: '100g',
    images: [
      `${CDN}/b0d1bfd52a15e987f3d1c4197197cb32.png`,
    ],
    shortDescription: 'Royal Mughal-inspired masala for rich, creamy shahi paneer and kofta.',
    description: "Nirmal's Shahi Paneer Masala is inspired by Mughal royal cuisine. This luxurious blend of cashew-friendly spices, saffron-like turmeric, and cream-compatible aromatics creates the perfect base for shahi paneer, malai kofta, and Mughlai gravies.",
    ingredients: 'Cardamom, Cinnamon, Cloves, Black Pepper, Mace, Nutmeg, Turmeric, Kashmiri Chilli, Coriander, Cumin, Fennel, Dry Ginger, Bay Leaf, Rose Water Extract',
    usageSuggestions: 'Sauté onion paste with 1.5 tbsp masala. Add cream, paneer, and simmer. Finish with kashmiri chilli for color.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place. Avoid moisture.',
    nutritionalNotes: 'Warm, aromatic spices with anti-inflammatory properties. No artificial color.',
    inStock: true,
    rating: 4.7,
    reviewCount: 378,
    badge: null,
    tags: ['shahi paneer', 'paneer masala', 'mughlai', 'royal cuisine', 'vegetarian'],
    seo: {
      title: "Shahi Paneer Masala 100g | Royal Mughlai Blend | Nirmal's Spices",
      description: "Make restaurant-quality shahi paneer with Nirmal's Shahi Paneer Masala. Mughal-inspired spice blend. Order online.",
      keywords: ['shahi paneer masala', 'paneer masala', 'mughlai masala', 'creamy curry spice'],
    },
  },
  {
    _id: 'p017',
    name: 'Sambhar Masala',
    slug: 'sambhar-masala',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 55,
    salePrice: null,
    packSize: '100g',
    images: [
      `${CDN}/7f57407352c51cd90ed359a85aaf5cb5.png`,
    ],
    shortDescription: 'South Indian sambar masala with tamarind-friendly spice balance for authentic flavor.',
    description: "Nirmal's Sambhar Masala brings the authentic taste of South Indian homes to your kitchen. This carefully balanced blend of roasted lentils, dried chilies, and aromatic spices creates the perfect sambhar every time — tangy, slightly spicy, and deeply aromatic.",
    ingredients: 'Chana Dal, Urad Dal, Coriander, Cumin, Red Chilli, Black Pepper, Curry Leaves, Mustard Seeds, Fenugreek, Turmeric, Asafoetida',
    usageSuggestions: 'Add 2 tbsp per cup of cooked toor dal with vegetables. Add tamarind water and cook for 10 mins. Temper with mustard seeds.',
    shelfLife: '18 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry, airtight container.',
    nutritionalNotes: 'Contains lentil-based spices high in protein and fiber.',
    inStock: true,
    rating: 4.6,
    reviewCount: 223,
    badge: null,
    tags: ['sambhar masala', 'south indian', 'sambar powder', 'dal masala'],
    seo: {
      title: "Sambhar Masala 100g | Authentic South Indian | Nirmal's Spices",
      description: "Make authentic sambhar with Nirmal's Sambhar Masala. South Indian spice blend from Harda MP. Order online.",
      keywords: ['sambhar masala', 'sambar masala powder', 'south indian masala', 'buy sambhar masala'],
    },
  },
  {
    _id: 'p018',
    name: 'Kitchen King Masala',
    slug: 'kitchen-king-masala',
    category: 'Blended Masalas',
    categorySlug: 'blended-masalas',
    brand: "Nirmal's Spices",
    price: 60,
    salePrice: 52,
    packSize: '100g',
    images: [
      `${CDN}/4b635cca3058b810858630eb1f6baba7.png`,
    ],
    shortDescription: 'All-purpose master spice blend that works beautifully with any Indian dish.',
    description: "Nirmal's Kitchen King Masala is the ultimate all-purpose Indian spice blend. With 25+ spices perfectly balanced, it works with vegetables, paneer, lentils, and rice. If you could only have one masala in your kitchen, this would be it.",
    ingredients: 'Coriander, Cumin, Turmeric, Red Chilli, Black Pepper, Cardamom, Cloves, Cinnamon, Mace, Dry Mango, Fennel, Bay Leaf, Kashmiri Chilli, Dry Ginger, Nutmeg, Asafoetida, Salt',
    usageSuggestions: 'Add 1–2 tsp to any curry, sabji, or dal during cooking. Use as marinade base. Sprinkle on paneer tikka.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry, dark place in an airtight container.',
    nutritionalNotes: 'A powerhouse of antioxidant spices. No MSG or artificial additives.',
    inStock: true,
    rating: 4.8,
    reviewCount: 712,
    badge: 'best-seller',
    tags: ['kitchen king', 'all purpose masala', 'multi purpose spice', 'everyday masala'],
    seo: {
      title: "Kitchen King Masala 100g | All-Purpose Spice Blend | Nirmal's Spices",
      description: "The ultimate all-purpose masala for Indian cooking. Nirmal's Kitchen King — 25+ spices, no artificial additives. Order online.",
      keywords: ['kitchen king masala', 'all purpose masala', 'multi purpose spice', 'best kitchen masala'],
    },
  },

  // ─── GROUND SPICES ──────────────────────────────────────────
  {
    _id: 'p019',
    name: 'Red Chilli Powder',
    slug: 'red-chilli-powder',
    category: 'Ground Spices',
    categorySlug: 'ground-spices',
    brand: "Nirmal's Spices",
    price: 120,
    salePrice: 105,
    packSize: '200g',
    images: [
      `${CDN}/d60051351c445a60b8039507de247546.png`,
    ],
    shortDescription: 'Vibrant, fiery red chilli powder from hand-picked Byadagi and Kashmiri chilies.',
    description: "Nirmal's Red Chilli Powder is made from a premium blend of Byadagi and Kashmiri dried red chilies, giving it a brilliant red color and balanced heat. Sun-dried, stone-ground, and free from any artificial colors or additives.",
    ingredients: '100% Pure Ground Red Chilli (Byadagi & Kashmiri varieties)',
    usageSuggestions: 'Use in curries, marinades, and tadka. Start with ½ tsp and adjust to taste. Ideal for tandoori marinades.',
    shelfLife: '18 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place away from sunlight. Keep sealed.',
    nutritionalNotes: 'Rich in Vitamin C and capsaicin. Boosts metabolism naturally.',
    inStock: true,
    rating: 4.8,
    reviewCount: 934,
    badge: 'best-seller',
    tags: ['red chilli powder', 'lal mirch', 'chilli powder', 'ground spice', 'kashmiri chilli'],
    seo: {
      title: "Red Chilli Powder 200g | Byadagi & Kashmiri | Nirmal's Spices",
      description: "Premium red chilli powder from Byadagi and Kashmiri chilies. Vibrant color, balanced heat. Pure from Harda MP. Order online.",
      keywords: ['red chilli powder', 'lal mirch powder', 'kashmiri chilli powder', 'buy red chilli online'],
    },
  },
  {
    _id: 'p020',
    name: 'White Pepper Powder',
    slug: 'white-pepper-powder-ground-spices',
    category: 'Ground Spices',
    categorySlug: 'ground-spices',
    brand: "Nirmal's Spices",
    price: 95,
    salePrice: null,
    packSize: '100g',
    images: [
      `${CDN}/d60051351c445a60b8039507de247546.png`,
    ],
    shortDescription: 'Pure white pepper powder — milder, earthy heat for soups, Continental and Chinese cooking.',
    description: "Nirmal's White Pepper Powder is stone-ground from premium white peppercorns — the ripe inner berries with the outer husk removed. Milder and more complex than black pepper, it's ideal for light-colored sauces, soups, and Continental cuisine.",
    ingredients: '100% Pure Ground White Peppercorns',
    usageSuggestions: 'Add to white sauces, soups, pasta, and Continental dishes. Use in Chinese and Thai recipes. Light seasoning for delicate preparations.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Store in a cool, dark place in an airtight container.',
    nutritionalNotes: 'Contains piperine — aids nutrient absorption. Anti-inflammatory properties.',
    inStock: true,
    rating: 4.5,
    reviewCount: 167,
    badge: null,
    tags: ['white pepper powder', 'safed mirch', 'pepper powder', 'ground spice'],
    seo: {
      title: "White Pepper Powder 100g | Pure Ground | Nirmal's Spices",
      description: "Premium white pepper powder for soups, Continental and Chinese cooking. Pure stone-ground from Harda MP.",
      keywords: ['white pepper powder', 'safed mirch powder', 'ground white pepper', 'white pepper India'],
    },
  },

  // ─── WHOLE SPICES ───────────────────────────────────────────
  {
    _id: 'p021',
    name: 'Souf (Fennel Seeds)',
    slug: 'souf-whole-spices',
    category: 'Whole Spices',
    categorySlug: 'whole-spices',
    brand: "Nirmal's Spices",
    price: 80,
    salePrice: 70,
    packSize: '200g',
    images: [
      `${CDN}/182a1856076599dde3a082a026d9943f.png`,
    ],
    shortDescription: 'Sweet, aromatic fennel seeds for cooking, mouth freshening, and herbal teas.',
    description: "Nirmal's Souf (Fennel Seeds) are carefully selected premium green fennel seeds from local farms. Known for their sweet, anise-like flavor, they're used in cooking, as a mouth freshener, and in Ayurvedic remedies for digestion.",
    ingredients: '100% Pure Fennel Seeds (Foeniculum vulgare)',
    usageSuggestions: 'Use in tadka for fish and vegetable curries. Add to biryani. Chew after meals as a mouth freshener and digestive aid. Brew in herbal teas.',
    shelfLife: '18 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place in an airtight container.',
    nutritionalNotes: 'Excellent for digestion. Contains fiber, potassium, and antioxidants. Known to relieve bloating.',
    inStock: true,
    rating: 4.6,
    reviewCount: 245,
    badge: null,
    tags: ['souf', 'fennel seeds', 'saunf', 'whole spice', 'digestive', 'mouth freshener'],
    seo: {
      title: "Souf (Fennel Seeds) 200g | Premium Quality | Nirmal's Spices",
      description: "Premium fennel seeds for cooking and digestion. Pure from Harda MP. Order Nirmal's Souf online.",
      keywords: ['souf', 'saunf', 'fennel seeds', 'fennel whole spice', 'buy fennel seeds online'],
    },
  },
  {
    _id: 'p022',
    name: 'Khada Garam Masala',
    slug: 'khada-garam-masala-whole-spices',
    category: 'Whole Spices',
    categorySlug: 'whole-spices',
    brand: "Nirmal's Spices",
    price: 110,
    salePrice: 95,
    packSize: '100g',
    images: [
      `${CDN}/fad2fddfef35acb7520944ed3a1ebc90.png`,
    ],
    shortDescription: 'Premium whole spice mix — the foundation of every great biryani and korma.',
    description: "Nirmal's Khada Garam Masala is a premium selection of whole spices including green cardamom, black cardamom, cloves, cinnamon, star anise, and bay leaves. The foundation of authentic Indian curries, biryanis, and slow-cooked preparations.",
    ingredients: 'Green Cardamom, Black Cardamom, Cloves, Cinnamon Sticks, Star Anise, Bay Leaves, Black Pepper, Mace, Nutmeg',
    usageSuggestions: 'Fry in hot ghee/oil at the start of cooking to bloom the spices. Use in biryani, korma, and slow-cooked gravies. Remove before serving or leave for extra flavor.',
    shelfLife: '24 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry, airtight container away from sunlight.',
    nutritionalNotes: 'Whole spices retain maximum essential oils and bioactive compounds.',
    inStock: true,
    rating: 4.7,
    reviewCount: 389,
    badge: null,
    tags: ['khada garam masala', 'whole spice mix', 'whole garam masala', 'biryani spice'],
    seo: {
      title: "Khada Garam Masala 100g | Premium Whole Spices | Nirmal's Spices",
      description: "Premium khada garam masala for authentic Indian cooking. Whole spice blend from Harda MP. Order online.",
      keywords: ['khada garam masala', 'whole garam masala', 'whole spice mix', 'biryani whole spices'],
    },
  },

  // ─── SALTS ──────────────────────────────────────────────────
  {
    _id: 'p023',
    name: 'Sendha Namak (Rock Salt)',
    slug: 'sendha-namak-salt-1-kg',
    category: 'Salts',
    categorySlug: 'salts',
    brand: "Nirmal's Spices",
    price: 65,
    salePrice: 58,
    packSize: '1kg',
    images: [
      `${CDN}/5f1d2d6c73f62eec2565036041fef956.png`,
    ],
    shortDescription: 'Pure Himalayan rock salt — essential for fasting foods and healthy everyday cooking.',
    description: "Nirmal's Sendha Namak is pure, unrefined Himalayan rock salt — naturally rich in 80+ trace minerals. It's the preferred salt for Navratri fasting foods, ayurvedic cooking, and those seeking a healthier alternative to processed table salt.",
    ingredients: '100% Natural Himalayan Rock Salt (Sendha Namak)',
    usageSuggestions: 'Use in all cooking as a healthier salt alternative. Essential for vrat/fasting foods. Add to jaljeera, chaats, and buttermilk for digestive benefits.',
    shelfLife: 'Shelf-stable (no expiry)',
    storageInstructions: 'Store in a cool, dry place. Keep away from moisture.',
    nutritionalNotes: 'Contains 80+ natural trace minerals. Lower in sodium than table salt. No anti-caking agents.',
    inStock: true,
    rating: 4.8,
    reviewCount: 521,
    badge: null,
    tags: ['sendha namak', 'rock salt', 'himalayan salt', 'vrat salt', 'fasting salt', 'pure salt'],
    seo: {
      title: "Sendha Namak 1kg | Pure Himalayan Rock Salt | Nirmal's Spices",
      description: "Pure sendha namak for fasting and everyday cooking. Natural Himalayan rock salt. 80+ minerals. Order online.",
      keywords: ['sendha namak', 'rock salt', 'himalayan rock salt', 'vrat namak', 'fasting salt India'],
    },
  },
  {
    _id: 'p024',
    name: 'Kala Namak (Black Salt)',
    slug: 'kala-namak-salt-1-kg',
    category: 'Salts',
    categorySlug: 'salts',
    brand: "Nirmal's Spices",
    price: 60,
    salePrice: null,
    packSize: '1kg',
    images: [
      `${CDN}/a50c95d012347c668898dcfdd1f87ab4.png`,
    ],
    shortDescription: 'Volcanic black salt with distinctive sulfuric aroma — the soul of chaat and Indian snacks.',
    description: "Nirmal's Kala Namak is pure Indian black salt with its signature sulfuric aroma from volcanic origins. It's the secret ingredient in chaats, raitas, jaljeera, and Ayurvedic preparations. A digestive aid used for centuries in Indian cuisine.",
    ingredients: '100% Natural Black Salt (Kala Namak / Himalayan Black Salt)',
    usageSuggestions: 'Sprinkle on fruits, chaats, raita, and buttermilk. Essential in jaljeera and pani puri water. Add to masala drinks for authentic flavor.',
    shelfLife: 'Shelf-stable (no expiry)',
    storageInstructions: 'Store in a cool, dry, airtight container.',
    nutritionalNotes: 'Lower in sodium than white salt. Known digestive properties. Contains natural iron compounds.',
    inStock: true,
    rating: 4.7,
    reviewCount: 334,
    badge: null,
    tags: ['kala namak', 'black salt', 'chaat namak', 'indian black salt', 'digestive salt'],
    seo: {
      title: "Kala Namak 1kg | Pure Indian Black Salt | Nirmal's Spices",
      description: "Authentic kala namak for chaats, raita, and jaljeera. Pure volcanic black salt from Nirmal's. Order online.",
      keywords: ['kala namak', 'black salt', 'indian black salt', 'chaat salt', 'himalayan black salt'],
    },
  },

  // ─── INSTANT MIX ────────────────────────────────────────────
  {
    _id: 'p025',
    name: 'Idli Mix',
    slug: 'idli-mix',
    category: 'Instant Mix',
    categorySlug: 'instant-mix',
    brand: "Nirmal's Spices",
    price: 85,
    salePrice: 75,
    packSize: '500g',
    images: [
      `${CDN}/73f009dd1f0decf8e8069e2f28dbbdce.png`,
    ],
    shortDescription: 'Ready-to-use idli mix for soft, fluffy idlis without overnight soaking or grinding.',
    description: "Nirmal's Idli Mix makes authentic South Indian idlis in minutes — no soaking, no grinding, no overnight fermentation needed. Made from premium rice flour and urad dal flour with natural fermentation agents for that perfect soft, spongy texture.",
    ingredients: 'Rice Flour, Urad Dal Flour, Salt, Natural Fermentation Agents',
    usageSuggestions: 'Mix 1 cup Idli Mix with ¾ cup water. Let rest 15 minutes. Pour into greased idli moulds and steam for 12–15 minutes. Serve with sambar and chutney.',
    shelfLife: '6 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place. Refrigerate after opening and use within 30 days.',
    nutritionalNotes: 'Good source of carbohydrates and protein. Low fat. Naturally fermented.',
    inStock: true,
    rating: 4.6,
    reviewCount: 287,
    badge: 'new',
    tags: ['idli mix', 'instant idli', 'south indian', 'breakfast mix', 'ready mix'],
    seo: {
      title: "Idli Mix 500g | Instant Ready Mix | Soft Fluffy Idlis | Nirmal's Spices",
      description: "Make soft fluffy idlis instantly with Nirmal's Idli Mix. No overnight soaking needed. 500g. Order online.",
      keywords: ['idli mix', 'instant idli mix', 'ready idli mix', 'south indian breakfast mix'],
    },
  },
  {
    _id: 'p026',
    name: 'Gulab Jamun Instant Mix',
    slug: 'gulab-jamun-instant-mix',
    category: 'Instant Mix',
    categorySlug: 'instant-mix',
    brand: "Nirmal's Spices",
    price: 75,
    salePrice: 65,
    packSize: '200g',
    images: [
      `${CDN}/571f0ca02fc89608fe2021266429dd15.png`,
    ],
    shortDescription: 'Perfect gulab jamuns at home — soft, melt-in-mouth, and restaurant quality.',
    description: "Nirmal's Gulab Jamun Instant Mix lets you make perfect restaurant-quality gulab jamuns at home with ease. The mix of khoya powder, refined flour, and rising agents ensures soft, spongy balls that soak up sugar syrup beautifully.",
    ingredients: 'Khoya Powder (Dried Milk Solids), Refined Wheat Flour, Milk Powder, Rising Agent (Sodium Bicarbonate)',
    usageSuggestions: 'Mix with milk to form dough. Make small balls. Deep fry on medium heat until golden. Soak in warm sugar syrup (2 cups sugar + 1 cup water) for 30 minutes.',
    shelfLife: '6 months from date of manufacture',
    storageInstructions: 'Store in a cool, dry place. Refrigerate after opening and use within 15 days.',
    nutritionalNotes: 'High energy dessert. Contains calcium from milk solids.',
    inStock: true,
    rating: 4.8,
    reviewCount: 445,
    badge: 'new',
    tags: ['gulab jamun mix', 'instant dessert', 'sweet mix', 'mithai', 'festival sweets'],
    seo: {
      title: "Gulab Jamun Instant Mix 200g | Perfect Every Time | Nirmal's Spices",
      description: "Make perfect gulab jamuns at home with Nirmal's Instant Mix. Restaurant quality every time. Order online.",
      keywords: ['gulab jamun mix', 'instant gulab jamun', 'gulab jamun recipe mix', 'sweet mix'],
    },
  },
];

export const PRODUCTS: Product[] = RAW_PRODUCTS.map(p => ({
  ...p,
  weights: [
    {
      weight: p.packSize,
      price: p.salePrice ?? p.price,
      mrp: p.price,
      stock: p.inStock ? 100 : 0
    }
  ]
})) as unknown as Product[];

// ─── HELPER FUNCTIONS ────────────────────────────────────────

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  if (!categorySlug) return PRODUCTS;
  return PRODUCTS.filter(p => p.categorySlug === categorySlug);
}

export function getProductsByBadge(badge: string): Product[] {
  return PRODUCTS.filter(p => p.badge === badge);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.tags.some(t => t.includes(q)) ||
    p.category.toLowerCase().includes(q)
  );
}

export function filterAndSortProducts(params: {
  category?: string;
  badge?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}): { products: Product[]; total: number; totalPages: number } {
  let result = [...PRODUCTS];

  if (params.category) {
    result = result.filter(p => p.categorySlug === params.category);
  }
  if (params.badge) {
    result = result.filter(p => p.badge === params.badge);
  }
  if (params.minPrice !== undefined) {
    result = result.filter(p => (p.salePrice ?? p.price) >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    result = result.filter(p => (p.salePrice ?? p.price) <= params.maxPrice!);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q))
    );
  }

  // Sort
  switch (params.sort) {
    case 'price-asc':
      result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      break;
    case 'price-desc':
      result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      result.sort((a, b) => b._id.localeCompare(a._id));
      break;
    default:
      // Default: best sellers first
      result.sort((a, b) => {
        const order = { 'best-seller': 0, 'new': 1, 'sale': 2, null: 3 };
        return (order[a.badge as keyof typeof order] ?? 3) - (order[b.badge as keyof typeof order] ?? 3);
      });
  }

  const total = result.length;
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const totalPages = Math.ceil(total / limit);
  const paginated = result.slice((page - 1) * limit, page * limit);

  return { products: paginated, total, totalPages };
}
