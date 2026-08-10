// ============================================================
// NIRMAL'S SPICES — Complete Product Catalog
// Total: 58 products across 6 categories
// Source: Local "PRODUCTS FOR WEBSITE AND APP" folder + nirmalspices.in reference
// ============================================================

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
  { label: 'All Spices', slug: '', count: 58, image: '/hero_spices.png' },
  { label: 'Blended Masalas', slug: 'blended-masalas', count: 26, image: '/blended_masala_collection.jpg' },
  { label: 'Ground Spices', slug: 'ground-spices', count: 11, image: '/spices_flatlay.png' },
  { label: 'Whole Spices', slug: 'whole-spices', count: 7, image: '/whole_spices_collection.jpg' },
  { label: 'Salts', slug: 'salts', count: 2, image: '/salt_category_banner.png' },
  { label: 'Instant Mix', slug: 'instant-mix', count: 8, image: '/instant_mix_category_banner.png' },
  { label: 'Flours', slug: 'flours', count: 4, image: '/flour_catalog.jpg' }
];

const RAW_PRODUCTS = [
  {
    "_id": "p001",
    "name": "Jaljeera Masala",
    "slug": "jaljeera-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 45,
    "salePrice": 40,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/jaljeera-masala.png"
    ],
    "shortDescription": "Tangy, minty Jaljeera masala — perfect for refreshing summer drinks and chaat.",
    "description": "Nirmal's Jaljeera Masala is a perfectly balanced blend of dry mango, cumin, mint, and black salt. Ideal for making refreshing jaljeera drinks, chaat, and fruit salads. Sourced from local farms in Harda, MP and processed hygienically without artificial colors or preservatives.",
    "ingredients": "Dry Mango Powder (Amchur), Cumin, Dry Mint Leaves, Black Salt, Black Pepper, Ginger Powder, Dry Coriander, Carom Seeds",
    "usageSuggestions": "Mix 1 tsp in chilled water with lemon juice for jaljeera drink. Sprinkle on fruits, chaats, and curd dishes.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place away from sunlight. Keep container tightly closed.",
    "nutritionalNotes": "Rich in antioxidants. Contains natural digestive aids like cumin and mint.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 312,
    "badge": "best-seller",
    "tags": [
      "jaljeera",
      "chaat masala",
      "summer drink",
      "digestive"
    ],
    "seo": {
      "title": "Jaljeera Masala 100g | Pure & Tangy | Nirmal's Spices",
      "description": "Buy Nirmal's Jaljeera Masala online. Authentic tangy-minty spice blend for refreshing drinks and chaats. Made in Harda, MP. No artificial additives.",
      "keywords": [
        "jaljeera masala",
        "jaljeera powder",
        "chaat masala",
        "buy jaljeera online",
        "Nirmal's spices jaljeera"
      ]
    }
  },
  {
    "_id": "p002",
    "name": "Garam Masala Powder Pouch",
    "slug": "garam-masala-powder-pouch",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 55,
    "salePrice": 50,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/garam-masala-box.png",
      "/products/blend-spices/garam-masala-powder.png"
    ],
    "shortDescription": "Aromatic whole-spice blend garam masala for rich curries and biryanis.",
    "description": "Nirmal's Garam Masala Powder is crafted from a traditional family recipe using premium whole spices — slow-roasted and ground fresh. This aromatic blend adds warmth, depth, and complexity to any dish. A kitchen essential for Indian cooking.",
    "ingredients": "Coriander, Cumin, Black Pepper, Cardamom, Cinnamon, Cloves, Bay Leaves, Mace, Nutmeg, Star Anise",
    "usageSuggestions": "Add ½ tsp at the end of cooking curries, dals, and biryanis. Sprinkle on tikkas and kebabs before serving.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place. Keep away from moisture and direct sunlight.",
    "nutritionalNotes": "Contains anti-inflammatory spices. No artificial flavors or preservatives.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 527,
    "badge": "best-seller",
    "tags": [
      "garam masala",
      "curry spice",
      "biryani masala",
      "aromatic"
    ],
    "seo": {
      "title": "Garam Masala Powder 100g Pouch | Nirmal's Spices — Traditional Blend",
      "description": "Nirmal's premium Garam Masala made from slow-roasted whole spices. No artificial additives. Perfect for curries, dals, and biryanis.",
      "keywords": [
        "garam masala powder",
        "buy garam masala",
        "authentic garam masala",
        "best garam masala India"
      ]
    }
  },
  {
    "_id": "p003",
    "name": "Dal Tadka Masala",
    "slug": "dal-tadka-masala-100-gram",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 50,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/dal-tadka-masala.png"
    ],
    "shortDescription": "Restaurant-style dal tadka spice blend for irresistible home-cooked dals.",
    "description": "Nirmal's Dal Tadka Masala brings authentic dhaba-style flavor to your home kitchen. This specially crafted blend of cumin, dried red chilli, turmeric, and coriander creates a perfectly balanced tadka every time.",
    "ingredients": "Coriander, Cumin, Turmeric, Red Chilli, Dried Mango Powder, Salt, Dry Ginger, Bay Leaf, Asafoetida",
    "usageSuggestions": "Heat ghee, add this masala, and pour over cooked dal. Use 1–2 tsp per cup of dal.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place in an airtight container.",
    "nutritionalNotes": "High in antioxidants. Contains natural digestive spices.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 198,
    "badge": null,
    "tags": [
      "dal masala",
      "tadka masala",
      "dal spice",
      "dhaba style"
    ],
    "seo": {
      "title": "Dal Tadka Masala 100g | Dhaba Style | Nirmal's Spices",
      "description": "Make restaurant-style dal tadka at home with Nirmal's Dal Tadka Masala. Authentic blend from Harda MP. Order online.",
      "keywords": [
        "dal tadka masala",
        "tadka masala",
        "dal spice blend",
        "dhaba masala"
      ]
    }
  },
  {
    "_id": "p004",
    "name": "Chicken Masala",
    "slug": "chicken-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 65,
    "salePrice": 58,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/chicken-masala.png"
    ],
    "shortDescription": "Bold, fiery chicken masala blend for restaurant-quality curries and grills.",
    "description": "Nirmal's Chicken Masala is a powerful blend of over 15 spices crafted specifically for chicken preparations. It delivers deep, smoky heat with layers of aroma — ideal for curries, tandoori, and dry preparations.",
    "ingredients": "Coriander, Cumin, Red Chilli, Turmeric, Black Pepper, Cardamom, Cloves, Cinnamon, Bay Leaf, Fennel, Dry Ginger, Nutmeg, Mace, Kashmiri Chilli, Salt",
    "usageSuggestions": "Marinate 500g chicken with 2 tbsp masala, yogurt, and oil. Cook in oil or grill. Add 1 tbsp to sauté for curry base.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place. Keep sealed after opening.",
    "nutritionalNotes": "Contains antimicrobial spices. No MSG or artificial enhancers.",
    "inStock": true,
    "rating": 4.9,
    "reviewCount": 743,
    "badge": "best-seller",
    "tags": [
      "chicken masala",
      "poultry spice",
      "tandoori",
      "curry masala"
    ],
    "seo": {
      "title": "Chicken Masala 100g | Bold & Aromatic | Nirmal's Spices",
      "description": "Make authentic chicken curry with Nirmal's Chicken Masala. 15+ spice blend, no artificial additives. Pure from Harda MP.",
      "keywords": [
        "chicken masala",
        "chicken curry masala",
        "best chicken masala",
        "buy chicken masala online"
      ]
    }
  },
  {
    "_id": "p005",
    "name": "Chicken Masala Pouch",
    "slug": "chicken-masal-pouch",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 35,
    "salePrice": null,
    "packSize": "50g",
    "images": [
      "/products/blend-spices/chicken-masala-pouch.png"
    ],
    "shortDescription": "Convenient pouch pack of Chicken Masala — same bold taste, travel-friendly size.",
    "description": "The same premium Nirmal's Chicken Masala in a convenient 50g eco-friendly pouch. Perfect for single-use cooking or travel. Freshness-sealed for maximum aroma and flavor.",
    "ingredients": "Coriander, Cumin, Red Chilli, Turmeric, Black Pepper, Cardamom, Cloves, Cinnamon, Fennel, Dry Ginger, Salt",
    "usageSuggestions": "Use one full pouch for 500g chicken preparation. Ideal for marinade or curry base.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Use entire pouch once opened. Store remaining in airtight container.",
    "nutritionalNotes": "All-natural ingredients. No preservatives.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 289,
    "badge": "new",
    "tags": [
      "chicken masala pouch",
      "single use",
      "travel pack",
      "convenient"
    ],
    "seo": {
      "title": "Chicken Masala Pouch 50g | Nirmal's Spices | Freshness Sealed",
      "description": "Nirmal's Chicken Masala in convenient 50g pouch. Perfect for travel or single-use cooking. Same bold authentic taste.",
      "keywords": [
        "chicken masala pouch",
        "small pack masala",
        "travel spice",
        "chicken curry spice"
      ]
    }
  },
  {
    "_id": "p006",
    "name": "Chana Masala",
    "slug": "chana-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 55,
    "salePrice": 48,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/chana-masala.png"
    ],
    "shortDescription": "Authentic tangy-spicy chana masala for dhaba-style chole at home.",
    "description": "Nirmal's Chana Masala is the secret behind authentic chole bhature and chana curry. A complex blend of dry mango, pomegranate seed, black cardamom, and warming spices that creates the perfect balance of tangy, smoky, and spicy.",
    "ingredients": "Coriander, Cumin, Dry Mango, Pomegranate Seed, Black Cardamom, Red Chilli, Black Pepper, Cloves, Cinnamon, Bay Leaf, Nutmeg, Turmeric, Ginger, Salt",
    "usageSuggestions": "Sauté onions with this masala, add boiled chickpeas and tomatoes. Cook for 15–20 mins. Serve with bhature or rice.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Keep in a cool, dry, dark place. Close tightly after use.",
    "nutritionalNotes": "High in dietary fiber when used with chickpeas. Rich in antioxidants.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 612,
    "badge": "best-seller",
    "tags": [
      "chana masala",
      "chole masala",
      "chickpea spice",
      "punjabi"
    ],
    "seo": {
      "title": "Chana Masala 100g | Authentic Dhaba Style | Nirmal's Spices",
      "description": "Make authentic chole bhature with Nirmal's Chana Masala. Tangy, spicy, aromatic. From Harda MP. Order online.",
      "keywords": [
        "chana masala",
        "chole masala powder",
        "chickpea curry spice",
        "best chana masala"
      ]
    }
  },
  {
    "_id": "p007",
    "name": "Biryani Masala",
    "slug": "biryani-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 70,
    "salePrice": 62,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/biryani-masala.png"
    ],
    "shortDescription": "Restaurant-quality biryani masala with 20+ whole spices for fragrant rice dishes.",
    "description": "Nirmal's Biryani Masala is a royal blend of 20+ exotic spices including saffron-colored turmeric, rose petals, star anise, and stone flower. Delivers authentic Hyderabadi and Lucknowi biryani aromas. Each pack is carefully balanced for perfect dum cooking.",
    "ingredients": "Cardamom, Cloves, Cinnamon, Star Anise, Mace, Nutmeg, Black Pepper, Rose Petals, Stone Flower, Bay Leaf, Cumin, Fennel, Coriander, Turmeric, Kashmiri Chilli, Dry Ginger",
    "usageSuggestions": "Use 2 tbsp masala per kg rice. Layer with marinated meat/veg and dum cook. Add whole spices while frying onions for extra aroma.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place. Keep away from heat and moisture.",
    "nutritionalNotes": "Rich in essential oils and aromatic compounds. No artificial color.",
    "inStock": true,
    "rating": 4.9,
    "reviewCount": 891,
    "badge": "best-seller",
    "tags": [
      "biryani masala",
      "rice masala",
      "dum biryani",
      "hyderabadi"
    ],
    "seo": {
      "title": "Biryani Masala 100g | 20+ Spices | Restaurant Quality | Nirmal's Spices",
      "description": "Make restaurant-quality biryani at home with Nirmal's Biryani Masala. Premium 20+ spice blend from Harda MP. Order now.",
      "keywords": [
        "biryani masala",
        "biryani spice mix",
        "best biryani masala",
        "buy biryani masala online"
      ]
    }
  },
  {
    "_id": "p008",
    "name": "Achar Masala Pouch",
    "slug": "achar-masala-pouch",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 40,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/achar-masala.png"
    ],
    "shortDescription": "Traditional pickle masala blend for authentic homemade achars.",
    "description": "Nirmal's Achar Masala is a traditional blend of mustard, fenugreek, fennel, and aromatic spices — the foundation of authentic Indian pickles. Whether making mango achar, mixed vegetable pickle, or lime pickle, this masala delivers the authentic taste of homemade goodness.",
    "ingredients": "Mustard Seeds, Fenugreek Seeds, Fennel Seeds, Red Chilli, Turmeric, Nigella Seeds, Asafoetida, Black Pepper, Salt",
    "usageSuggestions": "Mix 3–4 tbsp masala per kg vegetables/fruit. Add mustard oil and mix well. Sun-dry for 2–3 days before sealing.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in a cool place. Ensure pickle jar is airtight after making achar.",
    "nutritionalNotes": "Contains probiotic-supporting spices. Natural preservative properties.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 156,
    "badge": null,
    "tags": [
      "achar masala",
      "pickle masala",
      "mango pickle",
      "homemade pickle"
    ],
    "seo": {
      "title": "Achar Masala Pouch 100g | Homemade Pickle Spice | Nirmal's Spices",
      "description": "Make authentic homemade pickles with Nirmal's Achar Masala. Traditional blend from Harda MP. Order online.",
      "keywords": [
        "achar masala",
        "pickle masala",
        "achaar spice",
        "mango pickle masala"
      ]
    }
  },
  {
    "_id": "p009",
    "name": "Sabji Masala",
    "slug": "sabji-masala-100-gram",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 50,
    "salePrice": 45,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/sabji-masala.png"
    ],
    "shortDescription": "Everyday vegetable masala that makes every sabji burst with authentic flavor.",
    "description": "Nirmal's Sabji Masala is your everyday companion for vegetable cooking. This versatile blend transforms simple sabji into a flavorful dish with the right balance of heat, aroma, and tang. Works beautifully with all vegetables.",
    "ingredients": "Coriander, Cumin, Turmeric, Red Chilli, Dry Mango, Fennel, Asafoetida, Dry Ginger, Black Salt, Salt",
    "usageSuggestions": "Add 1 tsp while cooking any vegetable dish. Works well in aloo, gobi, bhindi, and mixed vegetables.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place in an airtight container.",
    "nutritionalNotes": "All-natural blend. Good source of antioxidant spices.",
    "inStock": true,
    "rating": 4.5,
    "reviewCount": 423,
    "badge": null,
    "tags": [
      "sabji masala",
      "vegetable masala",
      "everyday masala",
      "indian cooking"
    ],
    "seo": {
      "title": "Sabji Masala 100g | Everyday Vegetable Spice | Nirmal's Spices",
      "description": "Elevate every vegetable dish with Nirmal's Sabji Masala. All-natural everyday spice blend from Harda MP.",
      "keywords": [
        "sabji masala",
        "vegetable masala",
        "sabzi masala",
        "everyday cooking spice"
      ]
    }
  },
  {
    "_id": "p010",
    "name": "Pav Bhaji Masala",
    "slug": "pav-bhaji-masala-100-gram",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 55,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/pav-bhaji-masala.png"
    ],
    "shortDescription": "Mumbai-street-style pav bhaji masala for that iconic tangy-buttery taste.",
    "description": "Nirmal's Pav Bhaji Masala captures the essence of Mumbai's beloved street food. This aromatic blend of coriander, cumin, fennel, and black cardamom delivers that signature tangy-buttery pav bhaji taste you love.",
    "ingredients": "Coriander, Cumin, Fennel, Black Cardamom, Red Chilli, Dry Mango, Cloves, Cinnamon, Black Pepper, Turmeric, Ginger, Salt",
    "usageSuggestions": "Mix 1.5 tbsp into bhaji while cooking. Add to butter while toasting pav. Adjust quantity for desired spice level.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place. Keep sealed after use.",
    "nutritionalNotes": "Rich in digestive spices. Contains anti-inflammatory compounds.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 334,
    "badge": null,
    "tags": [
      "pav bhaji masala",
      "street food",
      "mumbai style",
      "bhaji spice"
    ],
    "seo": {
      "title": "Pav Bhaji Masala 100g | Mumbai Style | Nirmal's Spices",
      "description": "Make authentic Mumbai pav bhaji at home with Nirmal's Pav Bhaji Masala. Tangy, spicy, aromatic. Order online.",
      "keywords": [
        "pav bhaji masala",
        "pav bhaji spice",
        "mumbai street food masala",
        "buy pav bhaji masala"
      ]
    }
  },
  {
    "_id": "p011",
    "name": "Pani Puri Masala",
    "slug": "pani-puri-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 40,
    "salePrice": 35,
    "packSize": "50g",
    "images": [
      "/products/blend-spices/pani-puri-masala.png"
    ],
    "shortDescription": "Authentic tangy-spicy pani puri masala for that addictive gol gappa water.",
    "description": "Nirmal's Pani Puri Masala is the heart of perfect gol gappa water. A precise blend of black salt, dry mango, mint, and cooling spices that creates the tangy-spicy-refreshing pani puri water you crave.",
    "ingredients": "Dry Mango Powder, Black Salt, Cumin, Mint Powder, Black Pepper, Coriander, Dry Ginger, Asafoetida, Red Chilli, Fennel",
    "usageSuggestions": "Dissolve 2 tsp in 500ml chilled water with lemon juice and fresh mint. Strain and serve ice-cold in puris.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place. Keep tightly sealed.",
    "nutritionalNotes": "Contains cooling mint and digestive black salt. Refreshing and stomach-soothing.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 567,
    "badge": "best-seller",
    "tags": [
      "pani puri masala",
      "gol gappa",
      "street food",
      "chaat"
    ],
    "seo": {
      "title": "Pani Puri Masala 50g | Authentic Tangy | Nirmal's Spices",
      "description": "Make perfect pani puri water with Nirmal's Pani Puri Masala. Tangy, spicy, refreshing. Order online.",
      "keywords": [
        "pani puri masala",
        "gol gappa masala",
        "pani puri spice",
        "chaat masala"
      ]
    }
  },
  {
    "_id": "p012",
    "name": "Tea Masala",
    "slug": "tea-masala-50-gram",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 45,
    "salePrice": null,
    "packSize": "50g",
    "images": [
      "/products/blend-spices/tea-masala.png"
    ],
    "shortDescription": "Aromatic masala chai blend with ginger, cardamom, and warming spices.",
    "description": "Nirmal's Tea Masala elevates your daily chai to a wellness ritual. This warming blend of green cardamom, ginger, black pepper, and cloves creates a perfectly spiced, aromatic masala chai that soothes and energizes.",
    "ingredients": "Green Cardamom, Dry Ginger, Black Pepper, Cloves, Cinnamon, Fennel, Nutmeg",
    "usageSuggestions": "Add a pinch (1/4 tsp) to your tea while brewing. Boil milk, tea leaves, and this masala together for 3–5 mins.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in a cool, dark place in an airtight container.",
    "nutritionalNotes": "Packed with antioxidants. Ginger aids digestion; cardamom freshens breath.",
    "inStock": true,
    "rating": 4.9,
    "reviewCount": 789,
    "badge": "best-seller",
    "tags": [
      "tea masala",
      "chai masala",
      "masala chai",
      "cardamom ginger"
    ],
    "seo": {
      "title": "Tea Masala 50g | Aromatic Masala Chai Blend | Nirmal's Spices",
      "description": "Elevate your daily chai with Nirmal's Tea Masala. Cardamom, ginger, black pepper blend. Order online from Harda MP.",
      "keywords": [
        "tea masala",
        "chai masala",
        "masala chai spice",
        "cardamom tea blend"
      ]
    }
  },
  {
    "_id": "p013",
    "name": "Meat Masala",
    "slug": "meat-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 70,
    "salePrice": 62,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/meat-masala.png"
    ],
    "shortDescription": "Robust, smoky meat masala for mutton, lamb, and beef preparations.",
    "description": "Nirmal's Meat Masala is a bold, robust blend crafted specifically for slow-cooked meat dishes. The deep, smoky notes from charcoal-roasted spices pair perfectly with mutton, lamb, and beef, creating rich, flavor-packed gravies.",
    "ingredients": "Coriander, Cumin, Red Chilli, Kashmiri Chilli, Black Pepper, Cardamom, Cloves, Cinnamon, Bay Leaf, Mace, Nutmeg, Stone Flower, Dry Ginger, Turmeric, Salt",
    "usageSuggestions": "Use 2 tbsp per 500g meat. Marinate for 30 minutes before cooking. Add extra 1 tbsp to gravy base for more depth.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place. Keep sealed after use.",
    "nutritionalNotes": "Rich in warming spices. Contains natural preservative compounds.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 456,
    "badge": null,
    "tags": [
      "meat masala",
      "mutton masala",
      "lamb masala",
      "non veg masala"
    ],
    "seo": {
      "title": "Meat Masala 100g | Bold & Smoky | Nirmal's Spices",
      "description": "Rich meat masala for authentic mutton and lamb curries. Nirmal's smoky spice blend from Harda MP. Order online.",
      "keywords": [
        "meat masala",
        "mutton masala",
        "lamb curry masala",
        "non veg spice blend"
      ]
    }
  },
  {
    "_id": "p014",
    "name": "Kasoori Methi Pouch",
    "slug": "kasoori-methi-pouch",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 35,
    "salePrice": null,
    "packSize": "50g",
    "images": [
      "/products/whole-spices/kasoori-methi-pouch.png"
    ],
    "shortDescription": "Fragrant dried fenugreek leaves — a finishing touch for restaurant-quality curries.",
    "description": "Nirmal's Kasoori Methi contains premium sun-dried fenugreek leaves from the best farms. A pinch of this aromatic herb transforms any curry, dal, or paneer dish into a restaurant-quality experience. An essential in North Indian cooking.",
    "ingredients": "100% Dried Fenugreek Leaves (Trigonella foenum-graecum)",
    "usageSuggestions": "Crush and sprinkle 1 tsp over curries, butter chicken, dal makhni, and paneer dishes just before serving.",
    "shelfLife": "12 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry, airtight container away from sunlight.",
    "nutritionalNotes": "Rich in iron, fiber, and protein. Known to aid digestion and blood sugar regulation.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 298,
    "badge": "new",
    "tags": [
      "kasoori methi",
      "fenugreek leaves",
      "dried methi",
      "restaurant style"
    ],
    "seo": {
      "title": "Kasoori Methi 50g | Dried Fenugreek Leaves | Nirmal's Spices",
      "description": "Premium kasoori methi for authentic Indian curries. Sun-dried fenugreek leaves from Harda MP. Order online.",
      "keywords": [
        "kasoori methi",
        "kasuri methi",
        "dried fenugreek leaves",
        "methi masala"
      ]
    }
  },
  {
    "_id": "p015",
    "name": "Jeeravan Poha Masala",
    "slug": "jeeravan-poha-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 45,
    "salePrice": 40,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/jeeravan.png",
      "/products/blend-spices/jeeravan-poha-masala.jpg"
    ],
    "shortDescription": "Traditional MP jeeravan masala — the signature spice for authentic poha.",
    "description": "Nirmal's Jeeravan is the iconic Madhya Pradesh spice blend that makes Indore-style poha famous. This unique combination of cumin, fennel, coriander, and black salt is also delicious on fruits, chaats, and snacks. A true regional specialty.",
    "ingredients": "Cumin, Coriander, Fennel, Black Salt, Dry Mango, Red Chilli, Black Pepper, Dry Ginger, Asafoetida, Carom Seeds",
    "usageSuggestions": "Sprinkle generously on poha, upma, fruits, and chaat. Add to buttermilk for a refreshing drink. Use as finishing spice on snacks.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in an airtight container in a cool, dry place.",
    "nutritionalNotes": "Contains digestive spices. Black salt provides essential minerals.",
    "inStock": true,
    "rating": 4.9,
    "reviewCount": 634,
    "badge": "best-seller",
    "tags": [
      "jeeravan",
      "poha masala",
      "indore style",
      "madhya pradesh",
      "regional"
    ],
    "seo": {
      "title": "Jeeravan Poha Masala 100g | Authentic MP Flavour | Nirmal's Spices",
      "description": "Authentic Jeeravan masala for Indore-style poha. Traditional Madhya Pradesh spice blend by Nirmal's. Order online.",
      "keywords": [
        "jeeravan masala",
        "poha masala",
        "indore poha masala",
        "madhya pradesh jeeravan"
      ]
    }
  },
  {
    "_id": "p016",
    "name": "Shahi Paneer Masala",
    "slug": "shahi-paneer-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 60,
    "salePrice": 55,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/shahi-paneer-masala.png"
    ],
    "shortDescription": "Royal Mughal-inspired masala for rich, creamy shahi paneer and kofta.",
    "description": "Nirmal's Shahi Paneer Masala is inspired by Mughal royal cuisine. This luxurious blend of cashew-friendly spices, saffron-like turmeric, and cream-compatible aromatics creates the perfect base for shahi paneer, malai kofta, and Mughlai gravies.",
    "ingredients": "Cardamom, Cinnamon, Cloves, Black Pepper, Mace, Nutmeg, Turmeric, Kashmiri Chilli, Coriander, Cumin, Fennel, Dry Ginger, Bay Leaf, Rose Water Extract",
    "usageSuggestions": "Sauté onion paste with 1.5 tbsp masala. Add cream, paneer, and simmer. Finish with kashmiri chilli for color.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place. Avoid moisture.",
    "nutritionalNotes": "Warm, aromatic spices with anti-inflammatory properties. No artificial color.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 378,
    "badge": null,
    "tags": [
      "shahi paneer",
      "paneer masala",
      "mughlai",
      "royal cuisine",
      "vegetarian"
    ],
    "seo": {
      "title": "Shahi Paneer Masala 100g | Royal Mughlai Blend | Nirmal's Spices",
      "description": "Make restaurant-quality shahi paneer with Nirmal's Shahi Paneer Masala. Mughal-inspired spice blend. Order online.",
      "keywords": [
        "shahi paneer masala",
        "paneer masala",
        "mughlai masala",
        "creamy curry spice"
      ]
    }
  },
  {
    "_id": "p017",
    "name": "Sambhar Masala",
    "slug": "sambhar-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 55,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/sambhar-masala.png"
    ],
    "shortDescription": "South Indian sambar masala with tamarind-friendly spice balance for authentic flavor.",
    "description": "Nirmal's Sambhar Masala brings the authentic taste of South Indian homes to your kitchen. This carefully balanced blend of roasted lentils, dried chilies, and aromatic spices creates the perfect sambhar every time — tangy, slightly spicy, and deeply aromatic.",
    "ingredients": "Chana Dal, Urad Dal, Coriander, Cumin, Red Chilli, Black Pepper, Curry Leaves, Mustard Seeds, Fenugreek, Turmeric, Asafoetida",
    "usageSuggestions": "Add 2 tbsp per cup of cooked toor dal with vegetables. Add tamarind water and cook for 10 mins. Temper with mustard seeds.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry, airtight container.",
    "nutritionalNotes": "Contains lentil-based spices high in protein and fiber.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 223,
    "badge": null,
    "tags": [
      "sambhar masala",
      "south indian",
      "sambar powder",
      "dal masala"
    ],
    "seo": {
      "title": "Sambhar Masala 100g | Authentic South Indian | Nirmal's Spices",
      "description": "Make authentic sambhar with Nirmal's Sambhar Masala. South Indian spice blend from Harda MP. Order online.",
      "keywords": [
        "sambhar masala",
        "sambar masala powder",
        "south indian masala",
        "buy sambhar masala"
      ]
    }
  },
  {
    "_id": "p018",
    "name": "Kitchen King Masala",
    "slug": "kitchen-king-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 60,
    "salePrice": 52,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/kitchen-king-masala.png"
    ],
    "shortDescription": "All-purpose master spice blend that works beautifully with any Indian dish.",
    "description": "Nirmal's Kitchen King Masala is the ultimate all-purpose Indian spice blend. With 25+ spices perfectly balanced, it works with vegetables, paneer, lentils, and rice. If you could only have one masala in your kitchen, this would be it.",
    "ingredients": "Coriander, Cumin, Turmeric, Red Chilli, Black Pepper, Cardamom, Cloves, Cinnamon, Mace, Dry Mango, Fennel, Bay Leaf, Kashmiri Chilli, Dry Ginger, Nutmeg, Asafoetida, Salt",
    "usageSuggestions": "Add 1–2 tsp to any curry, sabji, or dal during cooking. Use as marinade base. Sprinkle on paneer tikka.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry, dark place in an airtight container.",
    "nutritionalNotes": "A powerhouse of antioxidant spices. No MSG or artificial additives.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 712,
    "badge": "best-seller",
    "tags": [
      "kitchen king",
      "all purpose masala",
      "multi purpose spice",
      "everyday masala"
    ],
    "seo": {
      "title": "Kitchen King Masala 100g | All-Purpose Spice Blend | Nirmal's Spices",
      "description": "The ultimate all-purpose masala for Indian cooking. Nirmal's Kitchen King — 25+ spices, no artificial additives. Order online.",
      "keywords": [
        "kitchen king masala",
        "all purpose masala",
        "multi purpose spice",
        "best kitchen masala"
      ]
    }
  },
  {
    "_id": "p019",
    "name": "Red Chilli Powder",
    "slug": "red-chilli-powder",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 120,
    "salePrice": 105,
    "packSize": "200g",
    "images": [
      "/products/ground-spices/red-chilli-powder.png"
    ],
    "shortDescription": "Vibrant, fiery red chilli powder from hand-picked Byadagi and Kashmiri chilies.",
    "description": "Nirmal's Red Chilli Powder is made from a premium blend of Byadagi and Kashmiri dried red chilies, giving it a brilliant red color and balanced heat. Sun-dried, stone-ground, and free from any artificial colors or additives.",
    "ingredients": "100% Pure Ground Red Chilli (Byadagi & Kashmiri varieties)",
    "usageSuggestions": "Use in curries, marinades, and tadka. Start with ½ tsp and adjust to taste. Ideal for tandoori marinades.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place away from sunlight. Keep sealed.",
    "nutritionalNotes": "Rich in Vitamin C and capsaicin. Boosts metabolism naturally.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 934,
    "badge": "best-seller",
    "tags": [
      "red chilli powder",
      "lal mirch",
      "chilli powder",
      "ground spice",
      "kashmiri chilli"
    ],
    "seo": {
      "title": "Red Chilli Powder 200g | Byadagi & Kashmiri | Nirmal's Spices",
      "description": "Premium red chilli powder from Byadagi and Kashmiri chilies. Vibrant color, balanced heat. Pure from Harda MP. Order online.",
      "keywords": [
        "red chilli powder",
        "lal mirch powder",
        "kashmiri chilli powder",
        "buy red chilli online"
      ]
    }
  },
  {
    "_id": "p020",
    "name": "White Pepper Powder",
    "slug": "white-pepper-powder-ground-spices",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 95,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/ground-spices/white-pepper-powder.png"
    ],
    "shortDescription": "Pure white pepper powder — milder, earthy heat for soups, Continental and Chinese cooking.",
    "description": "Nirmal's White Pepper Powder is stone-ground from premium white peppercorns — the ripe inner berries with the outer husk removed. Milder and more complex than black pepper, it's ideal for light-colored sauces, soups, and Continental cuisine.",
    "ingredients": "100% Pure Ground White Peppercorns",
    "usageSuggestions": "Add to white sauces, soups, pasta, and Continental dishes. Use in Chinese and Thai recipes. Light seasoning for delicate preparations.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a cool, dark place in an airtight container.",
    "nutritionalNotes": "Contains piperine — aids nutrient absorption. Anti-inflammatory properties.",
    "inStock": true,
    "rating": 4.5,
    "reviewCount": 167,
    "badge": null,
    "tags": [
      "white pepper powder",
      "safed mirch",
      "pepper powder",
      "ground spice"
    ],
    "seo": {
      "title": "White Pepper Powder 100g | Pure Ground | Nirmal's Spices",
      "description": "Premium white pepper powder for soups, Continental and Chinese cooking. Pure stone-ground from Harda MP.",
      "keywords": [
        "white pepper powder",
        "safed mirch powder",
        "ground white pepper",
        "white pepper India"
      ]
    }
  },
  {
    "_id": "p021",
    "name": "Souf (Fennel Seeds)",
    "slug": "souf-whole-spices",
    "category": "Whole Spices",
    "categorySlug": "whole-spices",
    "brand": "Nirmal's Spices",
    "price": 80,
    "salePrice": 70,
    "packSize": "200g",
    "images": [
      "/products/whole-spices/sauf-fennel.png"
    ],
    "shortDescription": "Sweet, aromatic fennel seeds for cooking, mouth freshening, and herbal teas.",
    "description": "Nirmal's Souf (Fennel Seeds) are carefully selected premium green fennel seeds from local farms. Known for their sweet, anise-like flavor, they're used in cooking, as a mouth freshener, and in Ayurvedic remedies for digestion.",
    "ingredients": "100% Pure Fennel Seeds (Foeniculum vulgare)",
    "usageSuggestions": "Use in tadka for fish and vegetable curries. Add to biryani. Chew after meals as a mouth freshener and digestive aid. Brew in herbal teas.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place in an airtight container.",
    "nutritionalNotes": "Excellent for digestion. Contains fiber, potassium, and antioxidants. Known to relieve bloating.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 245,
    "badge": null,
    "tags": [
      "souf",
      "fennel seeds",
      "saunf",
      "whole spice",
      "digestive",
      "mouth freshener"
    ],
    "seo": {
      "title": "Souf (Fennel Seeds) 200g | Premium Quality | Nirmal's Spices",
      "description": "Premium fennel seeds for cooking and digestion. Pure from Harda MP. Order Nirmal's Souf online.",
      "keywords": [
        "souf",
        "saunf",
        "fennel seeds",
        "fennel whole spice",
        "buy fennel seeds online"
      ]
    }
  },
  {
    "_id": "p022",
    "name": "Khada Garam Masala",
    "slug": "khada-garam-masala-whole-spices",
    "category": "Whole Spices",
    "categorySlug": "whole-spices",
    "brand": "Nirmal's Spices",
    "price": 110,
    "salePrice": 95,
    "packSize": "100g",
    "images": [
      "/products/whole-spices/khada-garam-masala.png"
    ],
    "shortDescription": "Premium whole spice mix — the foundation of every great biryani and korma.",
    "description": "Nirmal's Khada Garam Masala is a premium selection of whole spices including green cardamom, black cardamom, cloves, cinnamon, star anise, and bay leaves. The foundation of authentic Indian curries, biryanis, and slow-cooked preparations.",
    "ingredients": "Green Cardamom, Black Cardamom, Cloves, Cinnamon Sticks, Star Anise, Bay Leaves, Black Pepper, Mace, Nutmeg",
    "usageSuggestions": "Fry in hot ghee/oil at the start of cooking to bloom the spices. Use in biryani, korma, and slow-cooked gravies. Remove before serving or leave for extra flavor.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry, airtight container away from sunlight.",
    "nutritionalNotes": "Whole spices retain maximum essential oils and bioactive compounds.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 389,
    "badge": null,
    "tags": [
      "khada garam masala",
      "whole spice mix",
      "whole garam masala",
      "biryani spice"
    ],
    "seo": {
      "title": "Khada Garam Masala 100g | Premium Whole Spices | Nirmal's Spices",
      "description": "Premium khada garam masala for authentic Indian cooking. Whole spice blend from Harda MP. Order online.",
      "keywords": [
        "khada garam masala",
        "whole garam masala",
        "whole spice mix",
        "biryani whole spices"
      ]
    }
  },
  {
    "_id": "p023",
    "name": "Sendha Namak (Rock Salt)",
    "slug": "sendha-namak-salt-1-kg",
    "category": "Salts",
    "categorySlug": "salts",
    "brand": "Nirmal's Spices",
    "price": 65,
    "salePrice": 58,
    "packSize": "1kg",
    "images": [
      "/products/salts/sendha-namak.png"
    ],
    "shortDescription": "Pure Himalayan rock salt — essential for fasting foods and healthy everyday cooking.",
    "description": "Nirmal's Sendha Namak is pure, unrefined Himalayan rock salt — naturally rich in 80+ trace minerals. It's the preferred salt for Navratri fasting foods, ayurvedic cooking, and those seeking a healthier alternative to processed table salt.",
    "ingredients": "100% Natural Himalayan Rock Salt (Sendha Namak)",
    "usageSuggestions": "Use in all cooking as a healthier salt alternative. Essential for vrat/fasting foods. Add to jaljeera, chaats, and buttermilk for digestive benefits.",
    "shelfLife": "Shelf-stable (no expiry)",
    "storageInstructions": "Store in a cool, dry place. Keep away from moisture.",
    "nutritionalNotes": "Contains 80+ natural trace minerals. Lower in sodium than table salt. No anti-caking agents.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 521,
    "badge": null,
    "tags": [
      "sendha namak",
      "rock salt",
      "himalayan salt",
      "vrat salt",
      "fasting salt",
      "pure salt"
    ],
    "seo": {
      "title": "Sendha Namak 1kg | Pure Himalayan Rock Salt | Nirmal's Spices",
      "description": "Pure sendha namak for fasting and everyday cooking. Natural Himalayan rock salt. 80+ minerals. Order online.",
      "keywords": [
        "sendha namak",
        "rock salt",
        "himalayan rock salt",
        "vrat namak",
        "fasting salt India"
      ]
    }
  },
  {
    "_id": "p024",
    "name": "Kala Namak (Black Salt)",
    "slug": "kala-namak-salt-1-kg",
    "category": "Salts",
    "categorySlug": "salts",
    "brand": "Nirmal's Spices",
    "price": 60,
    "salePrice": null,
    "packSize": "1kg",
    "images": [
      "/products/salts/kala-namak.png"
    ],
    "shortDescription": "Volcanic black salt with distinctive sulfuric aroma — the soul of chaat and Indian snacks.",
    "description": "Nirmal's Kala Namak is pure Indian black salt with its signature sulfuric aroma from volcanic origins. It's the secret ingredient in chaats, raitas, jaljeera, and Ayurvedic preparations. A digestive aid used for centuries in Indian cuisine.",
    "ingredients": "100% Natural Black Salt (Kala Namak / Himalayan Black Salt)",
    "usageSuggestions": "Sprinkle on fruits, chaats, raita, and buttermilk. Essential in jaljeera and pani puri water. Add to masala drinks for authentic flavor.",
    "shelfLife": "Shelf-stable (no expiry)",
    "storageInstructions": "Store in a cool, dry, airtight container.",
    "nutritionalNotes": "Lower in sodium than white salt. Known digestive properties. Contains natural iron compounds.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 334,
    "badge": null,
    "tags": [
      "kala namak",
      "black salt",
      "chaat namak",
      "indian black salt",
      "digestive salt"
    ],
    "seo": {
      "title": "Kala Namak 1kg | Pure Indian Black Salt | Nirmal's Spices",
      "description": "Authentic kala namak for chaats, raita, and jaljeera. Pure volcanic black salt from Nirmal's. Order online.",
      "keywords": [
        "kala namak",
        "black salt",
        "indian black salt",
        "chaat salt",
        "himalayan black salt"
      ]
    }
  },
  {
    "_id": "p025",
    "name": "Idli Mix",
    "slug": "idli-mix",
    "category": "Instant Mix",
    "categorySlug": "instant-mix",
    "brand": "Nirmal's Spices",
    "price": 85,
    "salePrice": 75,
    "packSize": "500g",
    "images": [
      "/products/instant-mix/idli-mix.png"
    ],
    "shortDescription": "Ready-to-use idli mix for soft, fluffy idlis without overnight soaking or grinding.",
    "description": "Nirmal's Idli Mix makes authentic South Indian idlis in minutes — no soaking, no grinding, no overnight fermentation needed. Made from premium rice flour and urad dal flour with natural fermentation agents for that perfect soft, spongy texture.",
    "ingredients": "Rice Flour, Urad Dal Flour, Salt, Natural Fermentation Agents",
    "usageSuggestions": "Mix 1 cup Idli Mix with ¾ cup water. Let rest 15 minutes. Pour into greased idli moulds and steam for 12–15 minutes. Serve with sambar and chutney.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place. Refrigerate after opening and use within 30 days.",
    "nutritionalNotes": "Good source of carbohydrates and protein. Low fat. Naturally fermented.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 287,
    "badge": "new",
    "tags": [
      "idli mix",
      "instant idli",
      "south indian",
      "breakfast mix",
      "ready mix"
    ],
    "seo": {
      "title": "Idli Mix 500g | Instant Ready Mix | Soft Fluffy Idlis | Nirmal's Spices",
      "description": "Make soft fluffy idlis instantly with Nirmal's Idli Mix. No overnight soaking needed. 500g. Order online.",
      "keywords": [
        "idli mix",
        "instant idli mix",
        "ready idli mix",
        "south indian breakfast mix"
      ]
    }
  },
  {
    "_id": "p026",
    "name": "Gulab Jamun Instant Mix",
    "slug": "gulab-jamun-instant-mix",
    "category": "Instant Mix",
    "categorySlug": "instant-mix",
    "brand": "Nirmal's Spices",
    "price": 75,
    "salePrice": 65,
    "packSize": "200g",
    "images": [
      "/products/instant-mix/gulab-jamun-mix.png",
      "/products/instant-mix/gulab-jamun-mix-small.png"
    ],
    "shortDescription": "Perfect gulab jamuns at home — soft, melt-in-mouth, and restaurant quality.",
    "description": "Nirmal's Gulab Jamun Instant Mix lets you make perfect restaurant-quality gulab jamuns at home with ease. The mix of khoya powder, refined flour, and rising agents ensures soft, spongy balls that soak up sugar syrup beautifully.",
    "ingredients": "Khoya Powder (Dried Milk Solids), Refined Wheat Flour, Milk Powder, Rising Agent (Sodium Bicarbonate)",
    "usageSuggestions": "Mix with milk to form dough. Make small balls. Deep fry on medium heat until golden. Soak in warm sugar syrup (2 cups sugar + 1 cup water) for 30 minutes.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place. Refrigerate after opening and use within 15 days.",
    "nutritionalNotes": "High energy dessert. Contains calcium from milk solids.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 445,
    "badge": "new",
    "tags": [
      "gulab jamun mix",
      "instant dessert",
      "sweet mix",
      "mithai",
      "festival sweets"
    ],
    "seo": {
      "title": "Gulab Jamun Instant Mix 200g | Perfect Every Time | Nirmal's Spices",
      "description": "Make perfect gulab jamuns at home with Nirmal's Instant Mix. Restaurant quality every time. Order online.",
      "keywords": [
        "gulab jamun mix",
        "instant gulab jamun",
        "gulab jamun recipe mix",
        "sweet mix"
      ]
    }
  },
  {
    "_id": "p027",
    "name": "Chat Masala",
    "slug": "chat-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 60,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/chat-masala.png"
    ],
    "shortDescription": "Tangy, chatpata Chat Masala for fruits, chaats, and salads.",
    "description": "Nirmal's Chat Masala is a signature street-style spice blend that adds instant tanginess and zest. Sprinkle on sliced fruits, pakoras, dahi vada, papdi chaat, or salads for an authentic Indian chatpata taste.",
    "ingredients": "Black Salt, Dry Mango Powder, Cumin, Mint, Black Pepper, Coriander, Ginger, Asafoetida, Carom Seeds",
    "usageSuggestions": "Sprinkle 1-2 pinches directly on fruits, salads, raita, and hot snacks.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place. Keep container airtight to prevent clumping.",
    "nutritionalNotes": "Helps in digestion with natural cumin and mint oils. Low sodium.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 142,
    "badge": null,
    "tags": [
      "chat masala",
      "chaat masala",
      "tangy",
      "salad seasoning"
    ],
    "seo": {
      "title": "Chat Masala 100g | Tangy Salad Spice | Nirmal's Spices",
      "description": "Buy authentic Chat Masala from Nirmal's Spices. Zesty, tangy spice blend for fruits, raita, and street food. Made in Harda, MP.",
      "keywords": [
        "chat masala",
        "chaat powder",
        "buy chat masala",
        "tangy spice"
      ]
    }
  },
  {
    "_id": "p028",
    "name": "Jholiya Masala",
    "slug": "jholiya-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 50,
    "salePrice": 45,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/jholiya-masala.png"
    ],
    "shortDescription": "Special regional Malwa-style blend for traditional jholiya curry.",
    "description": "Nirmal's Jholiya Masala is a unique regional specialty from the Malwa region of Madhya Pradesh. Perfectly balanced to make traditional green chickpea (jholiya) curries and kadhi-based preparations.",
    "ingredients": "Coriander, Cumin, Turmeric, Dried Green Chilli, Garlic Powder, Ginger Powder, Salt, Bay Leaf, Fenugreek",
    "usageSuggestions": "Use 2 tsp while cooking green chickpea or local Malwa curry dishes.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place away from direct moisture.",
    "nutritionalNotes": "Contains natural herbs and spices from MP region.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 98,
    "badge": "new",
    "tags": [
      "jholiya masala",
      "malwa spice",
      "regional",
      "mp special"
    ],
    "seo": {
      "title": "Jholiya Masala 100g | Malwa Special | Nirmal's Spices",
      "description": "Authentic Jholiya Masala for traditional green chickpea curries. Sourced and processed in Harda, MP.",
      "keywords": [
        "jholiya masala",
        "malwa curry spice",
        "madhya pradesh spices",
        "local MP recipe"
      ]
    }
  },
  {
    "_id": "p029",
    "name": "Meat Masala Pouch (Rs 10)",
    "slug": "meat-masala-pouch-10",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 10,
    "salePrice": null,
    "packSize": "10g",
    "images": [
      "/products/blend-spices/meat-masala-pouch.png"
    ],
    "shortDescription": "Convenient single-use pouch of Meat Masala for everyday cooking.",
    "description": "Same premium Meat Masala in a convenient Rs 10 sachet. Ideal for single-use cooking or trial.",
    "ingredients": "Coriander, Cumin, Red Chilli, Cloves, Cinnamon, Cardamom, Black Pepper, Ginger, Salt",
    "usageSuggestions": "Use 1 full pouch for 250g meat curry preparation.",
    "shelfLife": "12 months from date of manufacture",
    "storageInstructions": "Store in a cool, dry place.",
    "nutritionalNotes": "Natural spices, no MSG.",
    "inStock": true,
    "rating": 4.5,
    "reviewCount": 65,
    "badge": null,
    "tags": [
      "meat masala",
      "sachet",
      "pouch",
      "rs 10 pack"
    ],
    "seo": {
      "title": "Meat Masala Pouch 10g | Nirmal's Spices",
      "description": "Buy Rs 10 trial sachet of meat masala. Premium whole spices ground fresh. Made in Harda, MP.",
      "keywords": [
        "meat masala sachet",
        "small pack meat masala",
        "rs 10 spice"
      ]
    }
  },
  {
    "_id": "p030",
    "name": "Jeeravan Pouch (Trial)",
    "slug": "jeeravan-pouch-trial",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 10,
    "salePrice": null,
    "packSize": "10g",
    "images": [
      "/products/blend-spices/jeeravan-pouch.png"
    ],
    "shortDescription": "Trial sachet of our signature Jeeravan Poha Masala.",
    "description": "Sample pack of our bestseller Jeeravan Poha Masala. Sprinkle on poha, fresh fruits, or morning tea snacks.",
    "ingredients": "Cumin, Fennel, Black Salt, Mango Powder, Red Chilli, Ginger, Carom Seeds",
    "usageSuggestions": "Sprinkle on 2-3 plates of poha or sliced cucumber.",
    "shelfLife": "12 months from date of manufacture",
    "storageInstructions": "Keep dry and away from humidity.",
    "nutritionalNotes": "Contains digestive minerals.",
    "inStock": true,
    "rating": 4.9,
    "reviewCount": 110,
    "badge": null,
    "tags": [
      "jeeravan sachet",
      "poha masala trial",
      "small pouch"
    ],
    "seo": {
      "title": "Jeeravan Poha Masala 10g Sachet | Nirmal's Spices",
      "description": "Try Nirmal's famous Jeeravan Poha Masala in Rs 10 sachet. Perfect for quick poha seasoning.",
      "keywords": [
        "jeeravan sachet",
        "indori poha masala sachet",
        "trial pack spice"
      ]
    }
  },
  {
    "_id": "p031",
    "name": "Achar Masala (Karnal Brand)",
    "slug": "achar-masala-karnal-brand",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Karnal",
    "price": 65,
    "salePrice": 60,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/achar-masala-karnal.png"
    ],
    "shortDescription": "Robust Karnal brand pickle spice mix for large-scale pickle making.",
    "description": "Karnal brand Achar Masala, distributed by Nirmal's, is a premium combination of mustard, fennel, and fenugreek seeds ideal for preparing traditional Punjabi and commercial pickles.",
    "ingredients": "Mustard Seeds, Fenugreek, Fennel, Nigella Seeds, Turmeric, Red Chilli, Salt, Asafoetida",
    "usageSuggestions": "Mix with mustard oil and raw mangoes or green chillies. Leave in sun for a week.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in dry place, ensure no water gets in.",
    "nutritionalNotes": "Natural preservative blend.",
    "inStock": true,
    "rating": 4.5,
    "reviewCount": 37,
    "badge": null,
    "tags": [
      "karnal brand",
      "achar masala",
      "pickle spice",
      "punjabi pickle"
    ],
    "seo": {
      "title": "Karnal Achar Masala 100g | Pickle Spice Blend | Nirmal's Spices",
      "description": "Buy Karnal brand Achar Masala online. Premium spice blend for commercial and home pickling.",
      "keywords": [
        "karnal pickle masala",
        "achar spice",
        "punjabi achar masala"
      ]
    }
  },
  {
    "_id": "p033",
    "name": "Kadai Masala",
    "slug": "kadai-masala",
    "category": "Blended Masalas",
    "categorySlug": "blended-masalas",
    "brand": "Nirmal's Spices",
    "price": 75,
    "salePrice": 68,
    "packSize": "100g",
    "images": [
      "/products/blend-spices/meat-masala.png"
    ],
    "shortDescription": "Coarsely ground spice blend for authentic kadai paneer and kadai chicken.",
    "description": "Nirmal's Kadai Masala is a coarsely ground mix of coriander seeds, black peppercorns, cumin, and dry red chillies. It gives the signature rustic, bold texture and spice kick to restaurant-style Kadai dishes.",
    "ingredients": "Coriander Seeds, Cumin, Black Pepper, Red Chilli Flakes, Cloves, Cardamom, Fennel",
    "usageSuggestions": "Add 1.5 tbsp while sautéing capsicum and onions for Kadai Paneer or Kadai Chicken.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in airtight container. Keep in a dry cupboard.",
    "nutritionalNotes": "Contains coarsely ground seeds rich in dietary fiber.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 43,
    "badge": null,
    "tags": [
      "kadai masala",
      "paneer spice",
      "restaurant style",
      "coarse spices"
    ],
    "seo": {
      "title": "Kadai Masala 100g | Coarse Spice Blend | Nirmal's Spices",
      "description": "Make restaurant-style Kadai Paneer with Nirmal's Kadai Masala. Pure coarsely ground spices from Harda, MP.",
      "keywords": [
        "kadai masala",
        "kadai paneer spice",
        "coarse ground masala",
        "kadai chicken spice"
      ]
    }
  },
  {
    "_id": "p035",
    "name": "Coriander Powder (Dhaniya)",
    "slug": "coriander-powder-ground",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 50,
    "salePrice": null,
    "packSize": "200g",
    "images": [
      "/products/ground-spices/coriander-powder.png"
    ],
    "shortDescription": "Pure, aromatic dhaniya powder ground from choice coriander seeds.",
    "description": "Nirmal's Coriander Powder (Dhaniya) is processed from double-cleaned coriander seeds, offering a rich sweet-woody aroma and thick texture to curry gravies. Made at our facility in Harda, MP.",
    "ingredients": "100% Pure Coriander Seeds",
    "usageSuggestions": "Add 1-2 tsp in curry base along with turmeric and chilli powder.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in airtight container. Keep away from moisture.",
    "nutritionalNotes": "Naturally cooling spice, rich in dietary fiber.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 120,
    "badge": "best-seller",
    "tags": [
      "coriander powder",
      "dhaniya powder",
      "ground spice",
      "cooking base"
    ],
    "seo": {
      "title": "Coriander Powder 200g | Pure Dhaniya | Nirmal's Spices",
      "description": "Buy stone-ground Coriander Powder from Nirmal's Spices. Pure, double-cleaned dhaniya powder from Harda, MP.",
      "keywords": [
        "coriander powder",
        "dhaniya powder online",
        "pure dhaniya",
        "ground coriander seeds"
      ]
    }
  },
  {
    "_id": "p036",
    "name": "Turmeric Powder (Haldi)",
    "slug": "turmeric-powder-ground",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 70,
    "salePrice": null,
    "packSize": "200g",
    "images": [
      "/products/ground-spices/turmeric-powder.png"
    ],
    "shortDescription": "Pure turmeric powder with high curcumin content for health and colour.",
    "description": "Nirmal's Turmeric Powder (Haldi) is ground from dried premium fingers. It is pure, rich in natural oils, curcumin, and adds a bright golden color and warm earthy taste.",
    "ingredients": "100% Pure Ground Turmeric Fingers",
    "usageSuggestions": "Use 1/2 tsp in daily cooking or add 1/4 tsp to warm milk for golden milk benefits.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in a dry cupboard away from direct sunlight.",
    "nutritionalNotes": "Curcumin-rich, acts as natural anti-inflammatory and antioxidant agent.",
    "inStock": true,
    "rating": 4.9,
    "reviewCount": 231,
    "badge": "best-seller",
    "tags": [
      "turmeric powder",
      "haldi",
      "curcumin",
      "anti inflammatory",
      "golden spice"
    ],
    "seo": {
      "title": "Turmeric Powder 200g | High Curcumin Haldi | Nirmal's Spices",
      "description": "Buy premium pure Turmeric Powder online. High curcumin content, stone-ground in Harda, MP.",
      "keywords": [
        "turmeric powder",
        "haldi powder buy",
        "high curcumin turmeric",
        "pure haldi India"
      ]
    }
  },
  {
    "_id": "p037",
    "name": "Bhuri Mirchi Powder",
    "slug": "bhuri-mirchi-powder",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 55,
    "salePrice": 50,
    "packSize": "200g",
    "images": [
      "/products/ground-spices/bhuri-mirchi-powder.png"
    ],
    "shortDescription": "Special MP-grown brown-colored dried red chilli powder with moderate heat.",
    "description": "Nirmal's Bhuri Mirchi Powder is made from a special regional variety of chillies grown in Madhya Pradesh. It offers a unique earthy brown shade and a distinctive smokier heat.",
    "ingredients": "100% Pure Ground Bhuri Chillies",
    "usageSuggestions": "Use in traditional dals, vegetables, and pickles for regional flavor.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Keep in dry airtight container.",
    "nutritionalNotes": "Natural spice, no added colors or stabilizers.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 39,
    "badge": null,
    "tags": [
      "bhuri mirchi",
      "chilli powder",
      "regional spice",
      "mp special"
    ],
    "seo": {
      "title": "Bhuri Mirchi Powder 200g | Regional Chilli | Nirmal's Spices",
      "description": "Try Bhuri Mirchi Powder made from local MP-grown chillies. Unique earthy flavor and heat. Order online.",
      "keywords": [
        "bhuri mirchi",
        "brown chilli powder",
        "madhya pradesh spices",
        "local chilli powder"
      ]
    }
  },
  {
    "_id": "p038",
    "name": "Amchoor Powder",
    "slug": "amchoor-powder",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 30,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/ground-spices/amchoor-powder.png"
    ],
    "shortDescription": "Tangy dry mango powder made from premium green raw mangoes.",
    "description": "Nirmal's Amchoor Powder is made from green raw mangoes that are peeled, sliced, sun-dried, and ground. It adds a natural tartness to curries, chat, and dry stuffings.",
    "ingredients": "100% Dried Raw Green Mangoes",
    "usageSuggestions": "Add 1/2 tsp to chana masala, dry okra, or chat preparations.",
    "shelfLife": "12 months from date of manufacture",
    "storageInstructions": "Store in dry place. Keep sealed tightly to avoid dampness.",
    "nutritionalNotes": "Natural souring agent rich in Vitamin C.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 88,
    "badge": null,
    "tags": [
      "amchoor powder",
      "dry mango powder",
      "sour spice",
      "ground mango"
    ],
    "seo": {
      "title": "Amchoor Powder 100g | Dry Mango Powder | Nirmal's Spices",
      "description": "Buy pure Amchoor Powder made from sun-dried raw mangoes in Harda, MP. Natural sour flavor.",
      "keywords": [
        "amchoor powder",
        "dry mango powder buy",
        "mango souring spice",
        "amchur powder online"
      ]
    }
  },
  {
    "_id": "p039",
    "name": "Kuti Mirch (Crushed Chilli)",
    "slug": "kuti-mirch",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 75,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/ground-spices/kuti-mirch.png"
    ],
    "shortDescription": "Coarsely crushed red chilli flakes for high heat and visual appeal.",
    "description": "Nirmal's Kuti Mirch is coarsely ground premium red chillies. It gives high heat, texture, and looks beautiful as toppings on pizzas, pickles, and hot tadkas.",
    "ingredients": "100% Coarsely Ground Red Chillies",
    "usageSuggestions": "Sprinkle on fried eggs, pizzas, or add in pickles and dal tadka.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Keep in cool dry airtight container.",
    "nutritionalNotes": "Contains seeds and skin rich in antioxidants.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 52,
    "badge": null,
    "tags": [
      "kuti mirch",
      "chilli flakes",
      "crushed chilli",
      "chilli sprinkler"
    ],
    "seo": {
      "title": "Kuti Mirch 100g | Crushed Red Chilli Flakes | Nirmal's Spices",
      "description": "Coarsely ground red chilli flakes for home and restaurant. Sun-dried and hygienically processed in Harda, MP.",
      "keywords": [
        "kuti mirch",
        "crushed red chilli",
        "chilli flakes buy",
        "pizza chilli flakes"
      ]
    }
  },
  {
    "_id": "p040",
    "name": "Kashmiri Mirch Powder",
    "slug": "kashmiri-mirch-powder",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 70,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/ground-spices/kashmiri-mirch-powder.png"
    ],
    "shortDescription": "Premium mild red chilli powder that gives bright red color to curries.",
    "description": "Nirmal's Kashmiri Mirch Powder is ground from select mild Kashmiri chillies. It is highly valued for its intense red color and low heat level, making it perfect for tandoori dishes and standard curries.",
    "ingredients": "100% Pure Kashmiri Red Chillies",
    "usageSuggestions": "Use 1-2 tsp in gravies or marinades to achieve beautiful red restaurant-style appearance.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Keep in dry airtight container away from sun.",
    "nutritionalNotes": "Rich in vitamin A, very low heat.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 167,
    "badge": "premium",
    "tags": [
      "kashmiri mirch",
      "red colour chilli",
      "mild chilli",
      "tandoori spice"
    ],
    "seo": {
      "title": "Kashmiri Mirch Powder 100g | Pure & Mild | Nirmal's Spices",
      "description": "Get intense red color in your curries with our Kashmiri Mirch Powder. Natural, pure, and mild heat.",
      "keywords": [
        "kashmiri mirch powder",
        "buy kashmiri mirch",
        "mild red chilli powder",
        "degi mirch"
      ]
    }
  },
  {
    "_id": "p041",
    "name": "Black Pepper Powder (Kali Mirch)",
    "slug": "black-pepper-powder",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 65,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/ground-spices/black-pepper-powder.png"
    ],
    "shortDescription": "Freshly ground pungent black pepper from premium peppercorns.",
    "description": "Nirmal's Black Pepper Powder is processed from high-grade Malabar black pepper. It delivers a strong pungent aroma and sharp spicy heat.",
    "ingredients": "100% Pure Ground Black Peppercorns",
    "usageSuggestions": "Sprinkle on salads, eggs, soups, pastas, or steaks. Use in marinades.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in airtight jar in cool place.",
    "nutritionalNotes": "Contains piperine which increases nutrient absorption. Helps clear congestion.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 144,
    "badge": "premium",
    "tags": [
      "black pepper powder",
      "kali mirch powder",
      "pepper powder",
      "ground spice"
    ],
    "seo": {
      "title": "Black Pepper Powder 100g | Pure Kali Mirch | Nirmal's Spices",
      "description": "Buy premium Black Pepper Powder ground from Malabar peppercorns. Pure and aromatic from Harda, MP.",
      "keywords": [
        "black pepper powder",
        "kali mirch powder buy",
        "pure ground pepper",
        "buy black pepper online"
      ]
    }
  },
  {
    "_id": "p042",
    "name": "Jeera Powder (Cumin)",
    "slug": "jeera-powder",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 70,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/ground-spices/jeera-powder.png"
    ],
    "shortDescription": "Roasted and ground cumin powder for warm earthy notes.",
    "description": "Nirmal's Jeera Powder is prepared by dry roasting cumin seeds and grinding them fresh. It adds a warm, smoky, and earthy flavor to raitas, snacks, and daily meals.",
    "ingredients": "100% Pure Dry-Roasted Cumin Seeds",
    "usageSuggestions": "Sprinkle over cucumber raita, lassi, or butter milk. Use in spice blends and dry vegetable sauté.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Keep in dry airtight container.",
    "nutritionalNotes": "Digestive aid, rich in iron.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 95,
    "badge": null,
    "tags": [
      "jeera powder",
      "cumin powder",
      "roasted cumin",
      "digestive seasoning"
    ],
    "seo": {
      "title": "Jeera Powder 100g | Roasted Cumin Powder | Nirmal's Spices",
      "description": "Get pure roasted Jeera Powder from Nirmal's Spices. Authentic aroma and flavor. Ground in Harda, MP.",
      "keywords": [
        "jeera powder",
        "cumin powder buy",
        "roasted cumin powder",
        "digestive spices"
      ]
    }
  },
  {
    "_id": "p043",
    "name": "Saunth Powder (Ginger)",
    "slug": "saunth-powder",
    "category": "Ground Spices",
    "categorySlug": "ground-spices",
    "brand": "Nirmal's Spices",
    "price": 35,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/ground-spices/saunth-powder.png"
    ],
    "shortDescription": "Pure dry ginger powder for cooking and home remedies.",
    "description": "Nirmal's Saunth Powder (Dry Ginger) is ground from clean dried ginger roots. It provides a warm, sweet, pungent ginger flavor suitable for winter sweets, chai, and curries.",
    "ingredients": "100% Dry Ginger Roots",
    "usageSuggestions": "Add 1/4 tsp to tea, use in baking cookies, or make Ayurvedic winter laddoos.",
    "shelfLife": "24 months from date of manufacture",
    "storageInstructions": "Store in dry place, ensure no moisture contact.",
    "nutritionalNotes": "Anti-nausea and digestive properties. Warming herb.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 39,
    "badge": null,
    "tags": [
      "saunth powder",
      "dry ginger powder",
      "adrak powder",
      "winter spice"
    ],
    "seo": {
      "title": "Saunth Powder 100g | Dry Ginger | Nirmal's Spices",
      "description": "Buy stone-ground Saunth (Ginger) Powder online. Clean, pure, and warming. processed in Harda, MP.",
      "keywords": [
        "saunth powder",
        "dry ginger powder",
        "ginger powder online",
        "adrak powder buy"
      ]
    }
  },
  {
    "_id": "p044",
    "name": "Kasoori Methi (100g)",
    "slug": "kasoori-methi-100g",
    "category": "Whole Spices",
    "categorySlug": "whole-spices",
    "brand": "Nirmal's Spices",
    "price": 50,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/whole-spices/kasoori-methi-100g.png"
    ],
    "shortDescription": "Premium sun-dried fenugreek leaves in larger 100g pack.",
    "description": "Premium aromatic dried fenugreek leaves in a larger family-size bag. Crush between palms and add to curries, parathas, and dals for sweet-herb fragrance.",
    "ingredients": "100% Sun-Dried Fenugreek Leaves",
    "usageSuggestions": "Crush 1 tbsp between palms and sprinkle on butter chicken or mix in paratha dough.",
    "shelfLife": "12 months from date of manufacture",
    "storageInstructions": "Keep in dark dry space in airtight container.",
    "nutritionalNotes": "High iron content. Good for digestion.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 110,
    "badge": null,
    "tags": [
      "kasoori methi",
      "fenugreek leaves",
      "dried methi",
      "100g pack"
    ],
    "seo": {
      "title": "Kasoori Methi 100g | Dried Fenugreek Leaves | Nirmal's Spices",
      "description": "Buy premium Kasoori Methi 100g. Freshly packed dried fenugreek leaves from Harda, MP.",
      "keywords": [
        "kasoori methi 100g",
        "dried fenugreek leaves",
        "kasuri methi online"
      ]
    }
  },
  {
    "_id": "p045",
    "name": "Jeera (Cumin Seeds)",
    "slug": "jeera-seeds-whole",
    "category": "Whole Spices",
    "categorySlug": "whole-spices",
    "brand": "Nirmal's Spices",
    "price": 80,
    "salePrice": 75,
    "packSize": "200g",
    "images": [
      "/products/whole-spices/jeera-whole.png"
    ],
    "shortDescription": "Premium whole cumin seeds for aromatic tempering (tadka).",
    "description": "Nirmal's Cumin Seeds (Jeera) are premium grade, double-cleaned seeds with a strong warm aroma. Essential for starter tempering in daily Indian curries and rice.",
    "ingredients": "100% Pure Cumin Seeds",
    "usageSuggestions": "Fry 1 tsp in hot oil/ghee with mustard seeds for initial tadka.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in airtight jar in dry place.",
    "nutritionalNotes": "Excellent source of iron and compounds that support healthy digestion.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 132,
    "badge": "best-seller",
    "tags": [
      "jeera seeds",
      "cumin seeds",
      "whole jeera",
      "tempering spice"
    ],
    "seo": {
      "title": "Jeera (Cumin Seeds) 200g | Pure Whole | Nirmal's Spices",
      "description": "Buy premium cleaned whole Cumin Seeds. Rich in natural oils, perfect for tempering. Sourced in Harda, MP.",
      "keywords": [
        "jeera seeds",
        "cumin seeds whole",
        "buy jeera seeds",
        "whole cumin online"
      ]
    }
  },
  {
    "_id": "p046",
    "name": "Rai (Mustard Seeds)",
    "slug": "rai-mustard-seeds",
    "category": "Whole Spices",
    "categorySlug": "whole-spices",
    "brand": "Nirmal's Spices",
    "price": 40,
    "salePrice": null,
    "packSize": "200g",
    "images": [
      "/products/whole-spices/rai-mustard.png"
    ],
    "shortDescription": "Premium black mustard seeds for tempering.",
    "description": "Nirmal's Rai (Black Mustard Seeds) are selected for their sharp, nutty flavor when popped in hot oil. The foundation of South Indian and Bengali dishes.",
    "ingredients": "100% Black Mustard Seeds",
    "usageSuggestions": "Heat oil, add 1 tsp rai until they splutter, then add curry leaves for tempering.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Keep in dry airtight jar.",
    "nutritionalNotes": "Contains selenium and magnesium, natural antibacterial qualities.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 78,
    "badge": null,
    "tags": [
      "rai seeds",
      "mustard seeds",
      "black mustard",
      "south indian tempering"
    ],
    "seo": {
      "title": "Rai (Mustard Seeds) 200g | Clean & Whole | Nirmal's Spices",
      "description": "Buy premium black mustard seeds (rai) from Nirmal's Spices. Essential for South Indian tempering.",
      "keywords": [
        "rai seeds",
        "mustard seeds black",
        "buy rai seeds online",
        "black mustard seeds"
      ]
    }
  },
  {
    "_id": "p047",
    "name": "Ajwain (Carom Seeds)",
    "slug": "ajwain-seeds",
    "category": "Whole Spices",
    "categorySlug": "whole-spices",
    "brand": "Nirmal's Spices",
    "price": 30,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/whole-spices/ajwain.png"
    ],
    "shortDescription": "Premium carom seeds with sharp aroma, excellent for digestion.",
    "description": "Nirmal's Ajwain (Carom Seeds) has a strong thyme-like scent and hot, bitter-sweet taste. Commonly used in fried foods, breads, and as a natural remedy for stomach aches.",
    "ingredients": "100% Pure Carom Seeds",
    "usageSuggestions": "Add 1/2 tsp to pakora batter, samosa dough, or boil in water for digestive tea.",
    "shelfLife": "18 months from date of manufacture",
    "storageInstructions": "Store in airtight jar in dry place.",
    "nutritionalNotes": "Contains thymol, known for relieving indigestion, bloating, and gas.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 94,
    "badge": null,
    "tags": [
      "ajwain seeds",
      "carom seeds",
      "digestive seeds",
      "pakora spice"
    ],
    "seo": {
      "title": "Ajwain (Carom Seeds) 100g | Pure Digestive | Nirmal's Spices",
      "description": "Buy cleaned Ajwain (Carom Seeds) online. Pure spice with high thymol content from Harda, MP.",
      "keywords": [
        "ajwain seeds",
        "carom seeds online",
        "digestive ajwain",
        "ajwain buy India"
      ]
    }
  },
  {
    "_id": "p048",
    "name": "Bhagar (Sama Rice)",
    "slug": "bhagar-sama-rice",
    "category": "Whole Spices",
    "categorySlug": "whole-spices",
    "brand": "Nirmal's Spices",
    "price": 45,
    "salePrice": null,
    "packSize": "500g",
    "images": [
      "/products/whole-spices/bhagar.png"
    ],
    "shortDescription": "Clean barnyard millet grain for Navratri fasting and healthy meals.",
    "description": "Nirmal's Bhagar (Sama Rice / Barnyard Millet) is a premium gluten-free fasting grain. Sourced from organic farms and cleaned carefully, it's used to make khichdi, kheer, and upma during vrat.",
    "ingredients": "100% Barnyard Millet (Sama / Moraiyo)",
    "usageSuggestions": "Wash and cook with water (1:2 ratio) to make fasting khichdi or simmer in milk for kheer.",
    "shelfLife": "12 months from date of manufacture",
    "storageInstructions": "Store in cool dry space. Best kept in airtight jar.",
    "nutritionalNotes": "Gluten-free, high fiber, low glycemic index fasting grain.",
    "inStock": true,
    "rating": 4.5,
    "reviewCount": 61,
    "badge": null,
    "tags": [
      "bhagar",
      "sama rice",
      "fasting grain",
      "vrat food",
      "barnyard millet"
    ],
    "seo": {
      "title": "Bhagar (Sama Rice) 500g | Fasting Millet | Nirmal's Spices",
      "description": "Buy premium cleaned Bhagar (Sama Rice) for fasting. Gluten-free barnyard millet from Harda, MP.",
      "keywords": [
        "bhagar",
        "sama rice buy",
        "fasting grain sama",
        "barnyard millet online"
      ]
    }
  },
  {
    "_id": "p049",
    "name": "Gulab Jamun Mix (400g Economy)",
    "slug": "gulab-jamun-mix-400g-economy",
    "category": "Instant Mix",
    "categorySlug": "instant-mix",
    "brand": "Nirmal's Spices",
    "price": 250,
    "salePrice": 220,
    "packSize": "400g",
    "images": [
      "/products/instant-mix/gulab-jamun-mix-400g.png"
    ],
    "shortDescription": "Economy family pack of Gulab Jamun Instant Mix.",
    "description": "Our larger 400g economy pack of Gulab Jamun mix. Perfect for making 80-100 soft sweet gulab jamuns for festivals, family functions, and parties.",
    "ingredients": "Khoya Powder, Refined Wheat Flour, Skimmed Milk Powder, Sodium Bicarbonate",
    "usageSuggestions": "Prepare soft dough using warm milk. Fry balls on low-medium flame. Dip in warm sugar syrup.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Refrigerate after opening, use within 20 days.",
    "nutritionalNotes": "Contains milk proteins and calcium.",
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 78,
    "badge": "new",
    "tags": [
      "gulab jamun mix",
      "economy pack",
      "festival sweets",
      "party size sweet"
    ],
    "seo": {
      "title": "Gulab Jamun Mix 400g | Economy Pack | Nirmal's Spices",
      "description": "Make delicious gulab jamuns in bulk with our 400g family mix pack. Perfect results every time.",
      "keywords": [
        "gulab jamun mix 400g",
        "economy pack sweets",
        "instant gulab jamun buy"
      ]
    }
  },
  {
    "_id": "p050",
    "name": "Khaman Mix (Dhokla)",
    "slug": "khaman-mix-dhokla",
    "category": "Instant Mix",
    "categorySlug": "instant-mix",
    "brand": "Nirmal's Spices",
    "price": 60,
    "salePrice": null,
    "packSize": "200g",
    "images": [
      "/products/instant-mix/khaman-mix.png"
    ],
    "shortDescription": "Instant mix for soft, spongy, Gujarati khaman dhoklas.",
    "description": "Nirmal's Khaman Mix allows you to prepare authentic sweet and tangy Gujarati khaman dhoklas in minutes. Fluffy, spongy, and delicious breakfast snack.",
    "ingredients": "Gram Flour (Besan), Sugar, Citric Acid, Sodium Bicarbonate, Salt, Turmeric",
    "usageSuggestions": "Mix with water and oil, rest 5 mins, steam in cooker for 15 mins. Garnish with mustard seeds, green chilli, and coriander.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Store in dry place away from heat.",
    "nutritionalNotes": "High protein from chickpea flour, low fat steam-cooked snack.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 89,
    "badge": null,
    "tags": [
      "khaman mix",
      "dhokla mix",
      "gujarati snack",
      "instant breakfast"
    ],
    "seo": {
      "title": "Khaman Mix 200g | Instant Dhokla | Nirmal's Spices",
      "description": "Prepare spongy Gujarati Khaman Dhoklas instantly with our mix. Authentically delicious breakfast.",
      "keywords": [
        "khaman mix",
        "dhokla instant mix",
        "gujarati khaman buy",
        "breakfast ready mix"
      ]
    }
  },
  {
    "_id": "p051",
    "name": "Kesari Milk Powder",
    "slug": "kesari-milk-powder",
    "category": "Instant Mix",
    "categorySlug": "instant-mix",
    "brand": "Nirmal's Spices",
    "price": 120,
    "salePrice": null,
    "packSize": "100g",
    "images": [
      "/products/instant-mix/kesari-milk-powder.png"
    ],
    "shortDescription": "Masala milk mix with real saffron, almonds, and cardamom.",
    "description": "Nirmal's Kesari Milk Powder is a rich blend of saffron (kesar), chopped almonds, pistachios, cardamom, and nutmeg. Add to hot milk for a nourishing, royal drink.",
    "ingredients": "Almond Flakes, Pistachios, Cardamom, Nutmeg, Saffron Threads, Sugar, Corn Starch",
    "usageSuggestions": "Stir 2-3 tsp into a cup of boiling hot milk. Boil for 2 minutes and serve hot or chilled.",
    "shelfLife": "12 months from date of manufacture",
    "storageInstructions": "Store in a cool dry place in airtight container.",
    "nutritionalNotes": "Rich in nutrients from dry fruits, warming digestive properties of saffron and cardamom.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 67,
    "badge": "premium",
    "tags": [
      "kesari milk",
      "masala milk powder",
      "kesar milk",
      "saffron almond mix"
    ],
    "seo": {
      "title": "Kesari Milk Powder 100g | Saffron Masala Milk | Nirmal's Spices",
      "description": "Buy Kesari Masala Milk Powder online. Packed with real saffron and nuts. Pure from Harda, MP.",
      "keywords": [
        "kesari milk powder",
        "masala milk mix buy",
        "saffron almond milk",
        "kesar badam milk"
      ]
    }
  },
  {
    "_id": "p052",
    "name": "Gulab Jamun Mix (Karnal Brand)",
    "slug": "gulab-jamun-mix-karnal-brand",
    "category": "Instant Mix",
    "categorySlug": "instant-mix",
    "brand": "Karnal",
    "price": 75,
    "salePrice": null,
    "packSize": "150g",
    "images": [
      "/products/instant-mix/gulab-jamun-mix-karnal.png"
    ],
    "shortDescription": "Karnal brand premium Gulab Jamun Instant Mix.",
    "description": "Karnal brand premium instant mix for sweet gulab jamuns, distributed by Nirmal's Spices. Known for soft texture and rich milk solid taste.",
    "ingredients": "Milk Solids (Khoya), Wheat Flour, Skimmed Milk Powder, Raising Agent",
    "usageSuggestions": "Mix to soft dough with water or milk. Roll into balls, fry on medium-low flame, soak in sugar syrup.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Store in dry place.",
    "nutritionalNotes": "Contains milk solids.",
    "inStock": true,
    "rating": 4.7,
    "reviewCount": 24,
    "badge": null,
    "tags": [
      "karnal brand",
      "gulab jamun mix",
      "instant sweet mix"
    ],
    "seo": {
      "title": "Karnal Gulab Jamun Mix 150g | Nirmal's Spices",
      "description": "Try Karnal brand premium Gulab Jamun Mix. Easy soft jamuns at home. Order online.",
      "keywords": [
        "karnal gulab jamun mix",
        "premium gulab jamun mix",
        "sweet mix online"
      ]
    }
  },
  {
    "_id": "p053",
    "name": "Fariyali Atta (Fasting Flour Mix)",
    "slug": "fariyali-atta",
    "category": "Instant Mix",
    "categorySlug": "instant-mix",
    "brand": "Nirmal's Spices",
    "price": 90,
    "salePrice": 85,
    "packSize": "500g",
    "images": [
      "/products/flour/fariyali-atta.png"
    ],
    "shortDescription": "Perfect pre-mixed fasting flour for Navratri vrat recipes.",
    "description": "Nirmal's Fariyali Atta is a premium, ready-to-use blend of fasting flours like Singhada (Water Chestnut), Rajgira (Amaranth), and Sama (Barnyard Millet). Ideal for making vrat ki puris, parathas, halwa, or pakoras.",
    "ingredients": "Water Chestnut Flour, Amaranth Flour, Sama Millet Flour",
    "usageSuggestions": "Knead with warm water and boiled mashed potatoes to make vrat ki puri or parathas.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Store in cool dry space, keep in airtight packet.",
    "nutritionalNotes": "Gluten-free, highly nutritious, rich in fiber and minerals.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 54,
    "badge": "new",
    "tags": [
      "fariyali atta",
      "fasting flour",
      "vrat flour",
      "gluten free flour",
      "navratri mix"
    ],
    "seo": {
      "title": "Fariyali Atta 500g | Fasting Flour Mix | Nirmal's Spices",
      "description": "Buy premium Fariyali Atta fasting flour mix for Navratri. Singhada-Rajgira blend. Pure from Harda, MP.",
      "keywords": [
        "fariyali atta",
        "fasting flour mix",
        "vrat ka aata buy",
        "navratri flour online"
      ]
    }
  },
  {
    "_id": "p054",
    "name": "Dosa Mix",
    "slug": "dosa-mix",
    "category": "Instant Mix",
    "categorySlug": "instant-mix",
    "brand": "Nirmal's Spices",
    "price": 55,
    "salePrice": null,
    "packSize": "200g",
    "images": [
      "/products/instant-mix/idli-mix.png"
    ],
    "shortDescription": "Instant mix for crispy, golden South Indian dosas.",
    "description": "Nirmal's Dosa Mix lets you prepare crispy, thin, restaurant-style dosas at home instantly without soaking or grinding rice and dal.",
    "ingredients": "Rice Flour, Black Gram (Urad) Flour, Salt, Raising Agent",
    "usageSuggestions": "Mix 1 cup mix with 1.25 cups water and 1 tbsp curd. Spread thin on hot tawa, cook with butter until golden brown.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Keep in dry cool place.",
    "nutritionalNotes": "Low fat, gluten-free friendly, high energy breakfast option.",
    "inStock": true,
    "rating": 4.5,
    "reviewCount": 39,
    "badge": null,
    "tags": [
      "dosa mix",
      "instant dosa",
      "south indian breakfast",
      "crispy dosa ready mix"
    ],
    "seo": {
      "title": "Dosa Mix 200g | Instant Crispy Dosa | Nirmal's Spices",
      "description": "Make crispy golden dosas instantly with our ready mix. No fermentation needed. Order online.",
      "keywords": [
        "dosa mix",
        "instant dosa powder",
        "ready dosa batter mix",
        "breakfast mix"
      ]
    }
  },
  {
    "_id": "p055",
    "name": "Rajgira Atta (Amaranth Flour)",
    "slug": "rajgira-atta",
    "category": "Flour",
    "categorySlug": "flour",
    "brand": "Nirmal's Spices",
    "price": 40,
    "salePrice": null,
    "packSize": "500g",
    "images": [
      "/products/flour/rajgira-atta.png"
    ],
    "shortDescription": "Gluten-free amaranth flour for fasting (vrat) and health.",
    "description": "Nirmal's Rajgira Atta is stone-ground from premium amaranth seeds. A gluten-free, high-protein flour widely used to make nutritious rotis, puris, and sweets during Hindu fasting days.",
    "ingredients": "100% Pure Amaranth Seeds (Rajgira)",
    "usageSuggestions": "Knead with boiled potatoes and warm water to roll out vrat ki puria or thalipeeth.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Store in airtight container in cool dry place.",
    "nutritionalNotes": "Gluten-free, high protein, rich in calcium, iron, and amino acids.",
    "inStock": true,
    "rating": 4.6,
    "reviewCount": 62,
    "badge": null,
    "tags": [
      "rajgira atta",
      "amaranth flour",
      "fasting flour",
      "vrat atta",
      "gluten free flour"
    ],
    "seo": {
      "title": "Rajgira Atta 500g | Amaranth Flour | Nirmal's Spices",
      "description": "Buy pure stone-ground Rajgira (Amaranth) Atta online. Best for Navratri fasting and gluten-free diets.",
      "keywords": [
        "rajgira atta",
        "amaranth flour buy",
        "fasting rajgira flour",
        "gluten free amaranth"
      ]
    }
  },
  {
    "_id": "p056",
    "name": "Singhada Atta (Water Chestnut)",
    "slug": "singhada-atta",
    "category": "Flour",
    "categorySlug": "flour",
    "brand": "Nirmal's Spices",
    "price": 50,
    "salePrice": null,
    "packSize": "500g",
    "images": [
      "/products/flour/singhada-atta.png"
    ],
    "shortDescription": "Pure water chestnut flour for fasting rotis and halwa.",
    "description": "Nirmal's Singhada Atta is milled from dried green water chestnuts. It is light, sweetish, gluten-free, and ideal for making fasting chapatis, tasty halwa, or batter for frying potato pakoras during fasts.",
    "ingredients": "100% Pure Dried Water Chestnuts (Singhada)",
    "usageSuggestions": "Use to make singhade ka halwa or knead into dough for sweet fasting puris.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Store in dry airtight container.",
    "nutritionalNotes": "Low glycemic index, rich in potassium, vitamin B, and antioxidants.",
    "inStock": true,
    "rating": 4.5,
    "reviewCount": 44,
    "badge": null,
    "tags": [
      "singhada atta",
      "water chestnut flour",
      "fasting flour",
      "vrat flour",
      "singhara flour"
    ],
    "seo": {
      "title": "Singhada Atta 500g | Water Chestnut Flour | Nirmal's Spices",
      "description": "Buy pure Singhada Atta online for fasting. Ground from selected dried water chestnuts in Harda, MP.",
      "keywords": [
        "singhada atta",
        "water chestnut flour buy",
        "singhara flour online",
        "fasting flour Singhada"
      ]
    }
  },
  {
    "_id": "p057",
    "name": "Singhada Atta (Karnal Brand)",
    "slug": "singhada-atta-karnal-brand",
    "category": "Flour",
    "categorySlug": "flour",
    "brand": "Karnal",
    "price": 55,
    "salePrice": null,
    "packSize": "500g",
    "images": [
      "/products/flour/singhada-atta-karnal.png"
    ],
    "shortDescription": "Karnal brand premium Water Chestnut Flour.",
    "description": "Karnal brand premium Singhada Atta, distributed by Nirmal's Spices. Milled from fine dried water chestnuts, providing high energy and nutrition for fasting.",
    "ingredients": "100% Water Chestnut Flour",
    "usageSuggestions": "Make tasty halwa, fasting pancakes (cheela), or pakoras.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Keep in dry airtight jar.",
    "nutritionalNotes": "Pure and energy-rich fasting flour.",
    "inStock": true,
    "rating": 4.5,
    "reviewCount": 19,
    "badge": null,
    "tags": [
      "karnal brand",
      "singhada atta",
      "water chestnut flour",
      "fasting mix"
    ],
    "seo": {
      "title": "Karnal Singhada Atta 500g | Nirmal's Spices",
      "description": "Order Karnal brand premium Singhada Atta. Pure water chestnut flour for vrat. Sourced in Harda, MP.",
      "keywords": [
        "karnal singhada atta",
        "water chestnut flour karnal",
        "buy fasting flour online"
      ]
    }
  },
  {
    "_id": "p058",
    "name": "Kuttu Atta (Buckwheat)",
    "slug": "kuttu-atta",
    "category": "Flour",
    "categorySlug": "flour",
    "brand": "Nirmal's Spices",
    "price": 45,
    "salePrice": null,
    "packSize": "500g",
    "images": [
      "/products/flour/rajgira-atta.png"
    ],
    "shortDescription": "Nutritious buckwheat flour for fasting chapatis and puris.",
    "description": "Nirmal's Kuttu Atta is milled from premium buckwheat seeds. Extremely rich in fiber and minerals, this dark, earthy gluten-free flour is perfect for Navratri vrat chapatis, puris, and pakoras.",
    "ingredients": "100% Pure Buckwheat (Kuttu) Seeds",
    "usageSuggestions": "Mix with warm water and mashed potatoes. Roll gently and shallow fry on hot griddle.",
    "shelfLife": "6 months from date of manufacture",
    "storageInstructions": "Keep in cool dry space, airtight storage recommended.",
    "nutritionalNotes": "Contains all nine essential amino acids. High in fiber, magnesium, and iron.",
    "inStock": true,
    "rating": 4.4,
    "reviewCount": 38,
    "badge": null,
    "tags": [
      "kuttu atta",
      "buckwheat flour",
      "fasting flour",
      "vrat ka aata",
      "gluten free kuttu"
    ],
    "seo": {
      "title": "Kuttu Atta 500g | Buckwheat Flour | Nirmal's Spices",
      "description": "Buy stone-ground Kuttu Atta buckwheat flour online. Nutritious gluten-free flour for fasting.",
      "keywords": [
        "kuttu atta",
        "buckwheat flour buy",
        "fasting buckwheat flour",
        "kuttu flour online"
      ]
    }
  }
];

export const PRODUCTS: Product[] = (RAW_PRODUCTS as any[]).map(p => ({
  ...p,
  weights: p.weights && p.weights.length > 0 ? p.weights : [
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
  if (categorySlug === 'flours' || categorySlug === 'flour') {
    return PRODUCTS.filter(p => p.categorySlug === 'flours' || p.categorySlug === 'flour');
  }
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
    const cat = params.category;
    if (cat === 'flours' || cat === 'flour') {
      result = result.filter(p => p.categorySlug === 'flours' || p.categorySlug === 'flour');
    } else {
      result = result.filter(p => p.categorySlug === cat);
    }
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
      p.category.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.ingredients.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
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
