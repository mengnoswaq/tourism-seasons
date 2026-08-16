import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding local database...");

  // 0. Create Default Site Settings
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "Tourism Seasons",
      siteSubtitle: "Travel & Seasonal Guides",
      logoUrl: "/logo.png",
      logoKhmerUrl: "/logo-khmer.png",
      description: "Discover top travel destinations, seasonal vacation recommendations, local culture, and tourism insights across the world.",
    },
  });

  // 1. Create Default Categories
  const categories = [
    { name: "Technology", slug: "technology", description: "Latest tech news, AI, gadget updates, and software engineering." },
    { name: "World", slug: "world", description: "Global breaking news, diplomacy, and international events." },
    { name: "Business", slug: "business", description: "Stock markets, global economy, startups, and finance." },
    { name: "Culture", slug: "culture", description: "Arts, literature, entertainment, lifestyle, and society." },
    { name: "Science", slug: "science", description: "Space exploration, climate research, and biological breakthroughs." },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 2. Create Default Navigation Bar Items
  const navItems = [
    { label: "All News", url: "/", order: 1, status: "ACTIVE" },
    { label: "Technology", url: "/category/technology", order: 2, status: "ACTIVE" },
    { label: "World", url: "/category/world", order: 3, status: "ACTIVE" },
    { label: "Business", url: "/category/business", order: 4, status: "ACTIVE" },
    { label: "Culture", url: "/category/culture", order: 5, status: "ACTIVE" },
    { label: "Science", url: "/category/science", order: 6, status: "ACTIVE" },
  ];

  for (const item of navItems) {
    const existing = await prisma.navItem.findFirst({ where: { label: item.label } });
    if (!existing) {
      await prisma.navItem.create({ data: item });
    }
  }

  // 3. Create Users (Super Admin: sivmeng12, Admin: Meng1)
  const userPasswordHash = await bcrypt.hash("Me095808176", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "meng@gmail.com" },
    update: {
      role: "SUPERADMIN",
    },
    create: {
      name: "sivmeng12",
      email: "meng@gmail.com",
      passwordHash: userPasswordHash,
      role: "SUPERADMIN",
      bio: "Root Super Administrator",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "meng1@gmail.com" },
    update: {
      role: "ADMIN",
    },
    create: {
      name: "Meng1",
      email: "meng1@gmail.com",
      passwordHash: userPasswordHash,
      role: "ADMIN",
      bio: "System Administrator",
    },
  });



  // 5. Create Articles
  const techCategory = await prisma.category.findUnique({ where: { slug: "technology" } });
  const scienceCategory = await prisma.category.findUnique({ where: { slug: "science" } });

  if (techCategory && superAdmin) {
    await prisma.article.upsert({
      where: { slug: "nextgen-ai-models-reshape-software-engineering" },
      update: {},
      create: {
        title: "Next-Gen AI Models Reshape Software Engineering Landscape in 2026",
        slug: "nextgen-ai-models-reshape-software-engineering",
        summary: "Autonomous developer agents and multi-modal neural architectures achieve groundbreaking capabilities in enterprise software delivery.",
        content: `
# The Dawn of Autonomous Software Engineering

The rapid evolution of artificial intelligence in early 2026 has crossed a critical threshold. What began as simple code auto-completion engines has transformed into fully autonomous agentic networks capable of understanding complex systemic requirements, executing multi-file refactoring, and verifying zero-bug deployments.

## The Architecture of Autonomous Agents

Modern agentic systems leverage **hybrid reasoning engines** combined with real-time codebase graph indexes. Unlike earlier token-predictive models, current architectures maintain dynamic internal working memory and verify logic against isolated sandboxed environments before proposing commits.

> "We are witnessing a shift from writing lines of code to orchestrating intelligent agents that write, verify, and maintain system architecture," notes Dr. Sarah Lin, Lead AI Architect at Quantum Cognitive.

### Key Milestones Achieved:
1. **Automated End-to-End Testing**: Agents synthesize visual integration tests directly from UI wireframes.
2. **Predictive Performance Bottleneck Fixes**: Real-time telemetry monitoring automatically triggers agent-submitted pull requests to optimize slow database queries.
3. **Multi-Language Polyglot Translation**: Instantaneous migration of legacy enterprise codebases to modern TypeScript & Rust stacks.

## Looking Ahead

As development velocities increase tenfold, the role of human engineers is evolving towards high-level system design, strategic security audit, and ethical governance.
        `,
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        published: true,
        featured: true,
        views: 1420,
        authorId: superAdmin.id,
        categoryId: techCategory.id,
        seoTitle: "Next-Gen AI Models Reshape Software Engineering (2026)",
        seoDescription: "Explore how autonomous developer agents and neural architectures are transforming software delivery in 2026.",
        publishedAt: new Date(),
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
              caption: "Neural architecture visualization mapping automated software synthesis workflows.",
              order: 0,
            },
            {
              url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
              caption: "Cybersecurity and agentic logic verification cluster monitoring real-time commits.",
              order: 1,
            },
            {
              url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
              caption: "High-density microchip array powering distributed neural inference nodes.",
              order: 2,
            },
          ],
        },
      },
    });
  }

  if (scienceCategory && superAdmin) {
    await prisma.article.upsert({
      where: { slug: "webb-telescope-discovers-atmospheric-water-on-exoplanet" },
      update: {},
      create: {
        title: "Webb Telescope Detects Dynamic Atmospheric Water Vapor on Nearby Earth-sized Exoplanet",
        slug: "webb-telescope-discovers-atmospheric-water-on-exoplanet",
        summary: "Astronomers confirm atmospheric signatures indicating liquid surface temperature potential on LHS 1140 b.",
        content: `
# Breakthrough Discovery in Deep Space Spectroscopy

The James Webb Space Telescope (JWST) has delivered its most compelling data yet regarding habitable zone exoplanets. Spectroscopic data captured during a quadruple-transit event across host star LHS 1140 has confirmed heavy concentrations of water vapor alongside nitrogen-rich atmospheric bands.

## Analytical Breakdown

Using the Near-Infrared Spectrograph (NIRSpec), the international research group isolated clear absorption lines corresponding to water vapor at temperatures conducive to surface liquid oceans.

### Implications for Astrobiology
- **Atmospheric Pressure**: Estimated at 1.2 bar, remarkably similar to Earth's sea level baseline.
- **Magnetic Shielding**: Secondary observational data suggests planetary magnetosphere protection against stellar flares.

Further observation windows scheduled for late 2026 will attempt to search for secondary biosignatures including atmospheric methane and ozone isotopes.
        `,
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
        published: true,
        featured: true,
        views: 980,
        authorId: superAdmin.id,
        categoryId: scienceCategory.id,
        publishedAt: new Date(),
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
              caption: "Deep space NIRSpec infrared spectrum breakdown of LHS 1140 b atmosphere.",
              order: 0,
            },
            {
              url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
              caption: "Observatory baseline capturing multi-spectral planetary transits.",
              order: 1,
            },
          ],
        },
      },
    });
  }

  console.log("Local database seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
