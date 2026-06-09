import type { Product, ProductCard } from "@/lib/supabase"

const now = "2026-06-09T00:00:00.000Z"

type ArchiveSeed = {
  slug: string
  title: string
  category: string
  price: number
  image: string
  description: string
  dimensions: Record<string, string>
  materials: string[]
}

const seeds: ArchiveSeed[] = [
  {
    slug: "atlas-field-briefcase",
    title: "Atlas Field Briefcase",
    category: "Briefcase",
    price: 42000,
    image: "/tanneurs/products/atlas-field-briefcase.webp",
    description:
      "A structured field case cut for documents, a laptop, and daily travel. Hand-stitched in full-grain leather with an archival flap and brass hardware.",
    dimensions: { width: "40 cm", height: "30 cm", depth: "11 cm" },
    materials: ["Full-grain cognac leather", "Solid brass buckle and studs", "Waxed linen saddle stitch"],
  },
  {
    slug: "atlas-weekender-cognac",
    title: "Atlas Weekender Cognac",
    category: "Weekender",
    price: 54000,
    image: "/tanneurs/products/atlas-weekender-cognac.webp",
    description:
      "A quiet travel object with a broad opening, softened carry handles, and enough structure to keep its shape from bench to road.",
    dimensions: { width: "48 cm", height: "28 cm", depth: "24 cm" },
    materials: ["Full-grain cognac leather", "Aged brass hardware", "Cotton canvas lining"],
  },
  {
    slug: "medina-crossbody-tooled-walnut",
    title: "Medina Crossbody Tooled Walnut",
    category: "Crossbody",
    price: 26000,
    image: "/tanneurs/products/medina-crossbody-tooled-walnut.webp",
    description:
      "A compact crossbody with hand-tooled surface work, built as a small daily register for travel, market days, and evening use.",
    dimensions: { width: "24 cm", height: "18 cm", depth: "7 cm" },
    materials: ["Tooled walnut leather", "Brass clasp", "Adjustable leather strap"],
  },
  {
    slug: "marrakech-tote-cognac",
    title: "Marrakech Tote Cognac",
    category: "Tote",
    price: 32000,
    image: "/tanneurs/products/marrakech-tote-cognac.webp",
    description:
      "An open city tote with clean panels, reinforced handles, and a softened edge finish made to take a daily patina.",
    dimensions: { width: "38 cm", height: "32 cm", depth: "14 cm" },
    materials: ["Full-grain cognac leather", "Hand-burnished edges", "Reinforced carry handles"],
  },
  {
    slug: "expedition-rolltop-cognac",
    title: "Expedition Rolltop Cognac",
    category: "Rucksack",
    price: 46000,
    image: "/tanneurs/products/expedition-rolltop-cognac.webp",
    description:
      "A rolltop field bag with high-volume carry, close hardware, and a silhouette that remains deliberate even when packed.",
    dimensions: { width: "31 cm", height: "47 cm", depth: "16 cm" },
    materials: ["Full-grain cognac leather", "Solid brass hardware", "Padded leather shoulder straps"],
  },
  {
    slug: "oasis-weekender-oxblood",
    title: "Oasis Weekender Oxblood",
    category: "Weekender",
    price: 56000,
    image: "/tanneurs/products/oasis-weekender-oxblood.webp",
    description:
      "A deep oxblood weekender with a low-sheen finish, hand-set hardware, and enough capacity for a two-night departure.",
    dimensions: { width: "50 cm", height: "29 cm", depth: "25 cm" },
    materials: ["Oxblood full-grain leather", "Aged brass hardware", "Waxed linen thread"],
  },
  {
    slug: "vintage-buckle-backpack",
    title: "Vintage Buckle Backpack",
    category: "Rucksack",
    price: 39000,
    image: "/tanneurs/products/vintage-buckle-backpack.webp",
    description:
      "A compact backpack with a vertical archive shape, brass buckle closure, and a structured body made for daily carry.",
    dimensions: { width: "29 cm", height: "38 cm", depth: "13 cm" },
    materials: ["Full-grain leather", "Brass buckle", "Leather shoulder straps"],
  },
  {
    slug: "classic-cognac-satchel",
    title: "Classic Cognac Satchel",
    category: "Satchel",
    price: 28000,
    image: "/tanneurs/products/classic-cognac-satchel.webp",
    description:
      "A small formal satchel with a clean rectangular body, hand-finished edges, and a clasp profile drawn from older travel cases.",
    dimensions: { width: "28 cm", height: "21 cm", depth: "9 cm" },
    materials: ["Full-grain cognac leather", "Brass clasp", "Hand-burnished edge finish"],
  },
]

export const archiveProducts: Product[] = seeds.map((seed, index) => ({
  id: `archive-${String(index + 1).padStart(2, "0")}`,
  title: seed.title,
  slug: seed.slug,
  description: seed.description,
  price: seed.price,
  images: [seed.image],
  category: seed.category,
  dimensions: seed.dimensions,
  materials: seed.materials,
  available_quantity: 1,
  status: "available",
  featured: index < 4,
  created_at: now,
  updated_at: now,
}))

export const archiveProductCards: ProductCard[] = archiveProducts.map((product) => ({
  id: product.id,
  title: product.title,
  slug: product.slug,
  category: product.category,
  price: product.price,
  featured: product.featured,
  status: product.status,
  image: product.images[0],
}))

export function archiveProductBySlug(slug: string): Product | null {
  return archiveProducts.find((product) => product.slug === slug) || null
}

