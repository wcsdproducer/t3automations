
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { EPOXY_REVIEWS, TREE_REVIEWS, PAVING_REVIEWS, APPLIANCE_REVIEWS } from './large-reviews-list';

// A map to associate services with specific image hints for hero sections
const serviceImageHints: Record<string, string[]> = {
  "HVAC Maintenance & Repair": ["hvac technician", "hvac maintenance", "smart thermostat"],
  "Plumbing": ["handyman plumbing", "plumbing work", "clean bathroom"],
  "Electrical Services": ["electrician working", "electrical panel", "smart home"],
  "Roofing Repair & Replacement": ["roofer installing", "roof repair"],
  "Appliance Repair": ["appliance repair", "technician fixing", "clean kitchen"],
  "Gutter Cleaning & Repair": ["gutter cleaning", "man on ladder"],
  "Siding & Exterior Repair": ["siding repair", "house exterior"],
  "Garage Door Services": ["garage door", "garage repair"],
  "Lawn Care & Mowing": ["lawn mowing", "manicured lawn"],
  "Landscaping & Garden Design": ["landscaping garden", "beautiful garden"],
  "Tree Services": ["tree trimming", "arborist working"],
  "Pressure Washing": ["pressure washing", "clean driveway"],
  "Pest Control": ["pest control", "exterminator working"],
  "Pool Maintenance & Cleaning": ["pool cleaning", "sparkling pool"],
  "Fence Installation & Repair": ["fence installation", "new fence"],
  "Snow Removal": ["snow removal", "snow plow"],
  "House Cleaning (Maid Services)": ["professional cleaning", "clean living", "clean kitchen"],
  "Carpet & Upholstery Cleaning": ["carpet cleaning", "steam cleaner", "clean living"],
  "Interior & Exterior Painting": ["handyman painting", "painting wall"],
  "Handyman Services": ["handyman tools", "man working", "handyman plumbing"],
  "Drywall Repair & Installation": ["drywall installation", "man plastering"],
  "Flooring Installation": ["flooring installation", "man laying wood floor"],
  "Window Washing": ["window washing", "professional cleaning"],
  "Furniture Assembly": ["furniture assembly", "man working"],
  "Smart Home Installation": ["smart home", "home security"],
  "Solar Panel Installation": ["solar panel", "hvac technician"],
  "Home Security Monitoring": ["home security", "smart home"],
  "Senior Home Modifications": ["senior safety", "handyman tools"],
  "Air Duct & Vent Cleaning": ["air duct", "hvac maintenance"],
  "Junk Removal & Moving": ["junk removal", "move-out cleaning"],
  "Epoxy Flooring": ["epoxy flooring", "epoxy application"],
  "Paving & Concrete": ["concrete construction", "paving driveway"],
  "Water Damage Restoration": ["water damage", "flood restoration"],
};

function findImageByHint(hint: string): ImagePlaceholder | undefined {
    return PlaceHolderImages.find(img => img.imageHint.includes(hint.split(' ')[0]));
}

function findImagesByHints(hints: string[]): ImagePlaceholder[] {
    const images: ImagePlaceholder[] = [];
    const usedIds = new Set<string>();

    for (const hint of hints) {
        const img = findImageByHint(hint);
        if (img && !usedIds.has(img.id)) {
            images.push(img);
            usedIds.add(img.id);
        }
    }

    // Ensure we have at least 5 unique images for the carousel
    if (images.length < 5) {
        for (let i = 0; i < PlaceHolderImages.length && images.length < 5; i++) {
            const fallbackImg = PlaceHolderImages[i];
            if (!usedIds.has(fallbackImg.id)) {
                images.push(fallbackImg);
                usedIds.add(fallbackImg.id);
            }
        }
    }
    return images.slice(0, 5);
}

function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}


export function getContentForService(service: string) {
    const defaultService = "Handyman Services";
    const serviceName = service || defaultService;

    if (serviceName === "HVAC Maintenance & Repair") {
        const allHvacHeroImages = PlaceHolderImages.filter(img => img.id.startsWith('hvac-hero'));
        const allHvacGalleryImages = PlaceHolderImages.filter(img => img.id.startsWith('hvac-gallery'));
        const aboutImage = PlaceHolderImages.find(img => img.id === 'hvac-about');

        const shuffledHero = shuffle(allHvacHeroImages);
        const shuffledGallery = shuffle(allHvacGalleryImages);

        const hvacImages = {
            hero: shuffledHero.slice(0, 5),
            about: aboutImage,
            gallery: shuffledGallery.slice(0, 4),
        }

        return {
            companyName: `HVAC Pros`,
            hero: {
                title: `Your Comfort is Our Priority.`,
                subtitle: `24/7 Emergency HVAC Maintenance & Repair.`,
                cta: "Get Your Free Quote Now",
            },
            services: {
                title: `Our HVAC Services`,
                subtitle: "Keeping your home comfortable all year round.",
                items: [
                    { title: `Emergency Repair`, description: "Fast, reliable repairs to get your system back up and running, anytime." },
                    { title: "System Maintenance", description: "Preventative tune-ups to ensure efficiency and extend your system's life." },
                    { title: "New System Installation", description: "High-efficiency solutions tailored to your home and budget." },
                ]
            },
            about: {
                title: `Your Trusted HVAC Experts`,
                body: `For over 20 years, HVAC Pros has been the leading provider of heating, ventilation, and air conditioning services. Our certified technicians are dedicated to ensuring your home's comfort and safety.`,
                points: [
                    "24/7 Emergency Service",
                    "Certified & Insured Technicians",
                    "Upfront, Honest Pricing",
                ]
            },
            reviews: {
                title: `What Our Customers Are Saying`,
                items: [
                    { quote: `Our AC went out on the hottest day of the year. HVAC Pros had a technician here within an hour and fixed it fast. Lifesavers!`, author: "- Mark T." },
                    { quote: `The team that installed our new furnace was professional, clean, and incredibly efficient. The new system works perfectly. Highly recommend!`, author: "- Jessica L." },
                    { quote: `I've used them for annual maintenance for years. Always reliable and they keep my system running smoothly. Great service.`, author: "- David P." },
                    { quote: `Honest pricing and excellent work. They explained everything clearly and didn't try to upsell me. I'll be a customer for life.`, author: "- Maria G." },
                    { quote: `Fast, friendly, and knowledgeable. Fixed my heater on a cold winter night. Can't thank them enough!`, author: "- Chris B." }
                ]
            },
            contact: {
                title: "Need HVAC Help?",
                subtitle: `Don't wait! Contact us now for a free, no-obligation estimate.`,
            },
            images: {
                hero: hvacImages.hero,
                about: hvacImages.about || findImageByHint('hvac van'),
                gallery: hvacImages.gallery,
            }
        };
    }
    
    if (serviceName === "Plumbing") {
        const allPlumbingHeroImages = PlaceHolderImages.filter(img => img.id.startsWith('plumbing-hero'));
        const allPlumbingGalleryImages = PlaceHolderImages.filter(img => img.id.startsWith('plumbing-gallery'));
        const aboutImage = PlaceHolderImages.find(img => img.id === 'plumbing-about');

        const shuffledHero = shuffle(allPlumbingHeroImages);
        const shuffledGallery = shuffle(allPlumbingGalleryImages);

        const plumbingImages = {
            hero: shuffledHero.slice(0, 5),
            about: aboutImage,
            gallery: shuffledGallery.slice(0, 4),
        }

        return {
            companyName: `Plumbing Pros`,
            hero: {
                title: `Leaky Pipes? We're On It.`,
                subtitle: `Your trusted experts for all plumbing needs, available 24/7.`,
                cta: "Get a Free Estimate",
            },
            services: {
                title: `Comprehensive Plumbing Solutions`,
                subtitle: "From minor drips to major emergencies, we handle it all.",
                items: [
                    { title: `Emergency Leak Repair`, description: "Fast response to stop water damage in its tracks." },
                    { title: "Drain Cleaning", description: "Clear any clog with our professional-grade equipment." },
                    { title: "Fixture Installation", description: "Upgrade your kitchen or bath with new faucets, sinks, and toilets." },
                ]
            },
            about: {
                title: `Your Neighborhood Plumbing Experts`,
                body: `For over 10 years, Plumbing Pros has provided reliable and affordable plumbing services. Our licensed and insured team is committed to quality workmanship and customer satisfaction.`,
                points: [
                    "24/7 Emergency Service",
                    "Licensed & Insured Plumbers",
                    "Upfront, Flat-Rate Pricing",
                ]
            },
            reviews: {
                title: `What Our Customers Are Saying`,
                items: [
                    { quote: `Had a burst pipe at 2 AM. The plumber from Plumbing Pros was here in 30 minutes and fixed it. Absolutely saved us!`, author: "- Emily R." },
                    { quote: `They installed a new water heater for us. The process was smooth, professional, and the price was fair. I'd recommend them to anyone.`, author: "- David C." },
                    { quote: `Cleared a tough clog that I couldn't fix myself. The plumber was friendly and got the job done quickly. Very impressed.`, author: "- Samantha K." },
                    { quote: `We had our whole house re-piped. It was a big job, but they handled it with professionalism and kept the disruption to a minimum.`, author: "- Brian W." },
                    { quote: `Finally, a plumber that shows up on time and does what they say they'll do. Will definitely use them again for any plumbing needs.`, author: "- Jennifer A." }
                ]
            },
            contact: {
                title: "Have a Plumbing Issue?",
                subtitle: `Don't let a small leak become a big problem. Contact us now for fast service!`,
            },
            images: {
                hero: plumbingImages.hero,
                about: plumbingImages.about || findImageByHint('plumbing work'),
                gallery: plumbingImages.gallery,
            }
        };
    }
    
    if (serviceName === "Junk Removal" || serviceName === "Junk Removal & Moving") {
        const junkImages = {
            hero: [
                {
                    id: "junk-hero-1",
                    description: "Professional junk removal crew and truck on driveway",
                    imageUrl: "/images/junk-removal-hero.png",
                    imageHint: "junk removal"
                }
            ],
            about: {
                id: "junk-about",
                description: "Professional junk removal crew clearing out space",
                imageUrl: "/images/junk-removal-hero.png",
                imageHint: "junk removal"
            },
            gallery: [
                {
                    id: "junk-gal-1",
                    description: "Professional hauling truck loading junk",
                    imageUrl: "/images/junk-removal-hero.png",
                    imageHint: "junk removal"
                }
            ]
        };

        return {
            companyName: `Junk Removal Pros`,
            hero: {
                title: `Clear the Clutter. Reclaim Your Space.`,
                subtitle: `Professional, eco-friendly junk removal and hauling services.`,
                cta: "Get Your Free Quote Now",
            },
            services: {
                title: `Our Junk Removal Services`,
                subtitle: "We do all the heavy lifting, loading, clean up, and disposal.",
                items: [
                    { title: `Residential Cleanouts`, description: "Full-service decluttering for homes, garages, attics, and basements." },
                    { title: "Commercial Junk Hauling", description: "Professional junk removal for offices, retail spaces, and properties." },
                    { title: "Eco-Friendly Disposal", description: "We sort, donate, and recycle up to 60% of all items hauled." },
                ]
            },
            about: {
                title: `Your Trusted Local Haulers`,
                body: `We are committed to helping you declutter responsibly. Our professional, friendly team handles everything from single item pickups to full estate cleanouts, ensuring a completely stress-free experience.`,
                points: [
                    "Same-Day / Next-Day Service",
                    "Eco-Friendly Disposal Practices",
                    "Licensed & Fully Insured Crew",
                ]
            },
            reviews: {
                title: `What Your Neighbors Are Saying`,
                items: [
                    { quote: `They were fantastic! Arrived on time, were extremely polite, and cleared out my entire garage in less than an hour.`, author: "- Greg T." },
                    { quote: `Straightforward and transparent pricing with no hidden fees. Highly recommend them for any hauling job!`, author: "- Linda M." },
                    { quote: `Friendly crew did all the heavy lifting, loading, and even swept up afterward. Fantastic service!`, author: "- James K." },
                    { quote: `I love that they donate and recycle items instead of just throwing everything in a landfill. Excellent company.`, author: "- Karen S." },
                    { quote: `Fast response time, quick service, and excellent communication throughout. Will definitely use again.`, author: "- Robert P." }
                ]
            },
            contact: {
                title: "Ready to Get Rid of Clutter?",
                subtitle: `Contact us now for a free, no-obligation hauling estimate.`,
            },
            images: {
                hero: junkImages.hero,
                about: junkImages.about,
                gallery: junkImages.gallery,
            }
        };
    }
    
    if (serviceName === "Epoxy Flooring") {
        const epoxyImages = {
            hero: [
                {
                    id: "epoxy-hero-1",
                    description: "Modern seamless epoxy garage flooring",
                    imageUrl: "/images/epoxy-hero.png",
                    imageHint: "epoxy flooring"
                }
            ],
            about: {
                id: "epoxy-about",
                description: "Worker applying a protective coating to a floor",
                imageUrl: "/images/epoxy-about.png",
                imageHint: "epoxy application"
            },
            gallery: [
                {
                    id: "epoxy-gallery-1",
                    description: "Finished high-gloss epoxy flooring showcase",
                    imageUrl: "/images/epoxy-gallery.png",
                    imageHint: "epoxy flooring"
                }
            ]
        };

        return {
            companyName: `Epoxy Flooring Pros`,
            hero: {
                title: `Stunning Epoxy Floors. Built to Last.`,
                subtitle: `Transform your garage, commercial space, or home with premium industrial-grade flooring.`,
                cta: "Get a Free Custom Quote",
            },
            services: {
                title: `Our Epoxy Coating Services`,
                subtitle: "Premium floor finishes tailored for aesthetics and extreme durability.",
                items: [
                    { title: `Garage Floor Coating`, description: "Ultra-durable, chemical-resistant finishes with beautiful decorative flake patterns." },
                    { title: "Commercial & Industrial Epoxy", description: "Heavy-duty flooring designed to withstand high traffic, impact, and wear." },
                    { title: "Metallic & Custom Flooring", description: "Stunning, high-gloss artistic floors tailored to your unique style." },
                ]
            },
            about: {
                title: `Tampa's Premier Epoxy Flooring Experts`,
                body: `We specialize in installing professional-grade epoxy and polyaspartic floor coatings. Our multi-step prep and application process ensures a flawless, non-slip finish that stands up to daily wear and tear for decades.`,
                points: [
                    "Industrial-Grade Durability",
                    "10-Year Warranty",
                    "Certified Local Installers",
                ]
            },
            reviews: {
                title: `What Your Neighbors Are Saying`,
                items: EPOXY_REVIEWS
            },
            contact: {
                title: "Ready for a Floor Transformation?",
                subtitle: `Contact us today for a free, no-obligation on-site estimate.`,
            },
            images: {
                hero: epoxyImages.hero,
                about: epoxyImages.about,
                gallery: epoxyImages.gallery,
            }
        };
    }

    if (serviceName === "Tree Services") {
        const treeImages = {
            hero: [
                {
                    id: "tree-hero-1",
                    description: "Professional arborist climbing a tall tree for pruning",
                    imageUrl: "/images/tree-hero.png",
                    imageHint: "tree trimming"
                }
            ],
            about: {
                id: "tree-about",
                description: "Close up of a lush green forest landscape",
                imageUrl: "/images/tree-about.png",
                imageHint: "arborist working"
            },
            gallery: [
                {
                    id: "tree-gallery-1",
                    description: "Professional tree pruning and safety operations",
                    imageUrl: "/images/tree-gallery.png",
                    imageHint: "tree trimming"
                }
            ]
        };

        return {
            companyName: `Tree Care Specialists`,
            hero: {
                title: `Professional Tree Services in Tampa Bay`,
                subtitle: `Safe, efficient tree removal, trimming, and arborist care from local experts.`,
                cta: "Request a Free Estimate",
            },
            services: {
                title: `Our Tree Care Services`,
                subtitle: "Keeping your trees healthy and your property safe.",
                items: [
                    { title: `Safe Tree Removal`, description: "Professional removal of hazardous, dead, or unwanted trees near structures." },
                    { title: "Pruning & Trimming", description: "Expert branch trimming to improve tree health, aesthetics, and storm safety." },
                    { title: "Emergency Storm Response", description: "24/7 emergency clearing and hazard removal after severe weather." },
                ]
            },
            about: {
                title: `Your Trusted Local Tree Care Specialists`,
                body: `We are a fully licensed and insured tree service company dedicated to preserving the beauty and safety of your property. Our skilled crew utilizes modern equipment to perform every job safely and efficiently, leaving your yard pristine.`,
                points: [
                    "Licensed & Fully Insured",
                    "24/7 Emergency Storm Service",
                    "ISA Certified Arborists",
                ]
            },
            reviews: {
                title: `What Your Neighbors Are Saying`,
                items: TREE_REVIEWS
            },
            contact: {
                title: "Need Tree Services?",
                subtitle: `Contact us now for a free, no-obligation estimate from an expert arborist.`,
            },
            images: {
                hero: treeImages.hero,
                about: treeImages.about,
                gallery: treeImages.gallery,
            }
        };
    }

    if (serviceName === "Paving & Concrete") {
        const pavingImages = {
            hero: [
                {
                    id: "concrete-hero-1",
                    description: "Construction worker smoothing poured concrete on a driveway",
                    imageUrl: "/images/paving-hero.png",
                    imageHint: "concrete construction"
                }
            ],
            about: {
                id: "concrete-about",
                description: "Modern brick paver patio and driveway entrance",
                imageUrl: "/images/paving-about.png",
                imageHint: "paving driveway"
            },
            gallery: [
                {
                    id: "concrete-gallery-1",
                    description: "Completed brick paver installation",
                    imageUrl: "/images/paving-gallery.png",
                    imageHint: "concrete construction"
                }
            ]
        };

        return {
            companyName: `Concrete & Paving Pros`,
            hero: {
                title: `Premium Concrete & Paving Solutions`,
                subtitle: `Durability meets design. Expert driveways, patios, walkways, and masonry.`,
                cta: "Schedule a Free Consult",
            },
            services: {
                title: `Our Concrete & Paving Services`,
                subtitle: "Professional installation and repair of hardscape surfaces.",
                items: [
                    { title: `Concrete Driveways`, description: "Custom-poured concrete driveways built to withstand heavy loads and weather." },
                    { title: "Brick & Stone Pavers", description: "Stunning decorative paver driveways, patios, pool decks, and walkways." },
                    { title: "Concrete Repair & Refinishing", description: "Restoring cracked, uneven concrete to look brand new." },
                ]
            },
            about: {
                title: `Crafting Solid Foundations for Tampa Homes`,
                body: `We deliver top-tier concrete placement and paver installation. Our team blends solid craftsmanship with premium materials to construct beautiful, long-lasting outdoor surfaces that increase your property's value.`,
                points: [
                    "Licensed Concrete Contractors",
                    "Premium Materials & Finishing",
                    "Free Design Consultations",
                ]
            },
            reviews: {
                title: `What Your Neighbors Are Saying`,
                items: PAVING_REVIEWS
            },
            contact: {
                title: "Start Your Paving Project",
                subtitle: `Get in touch today for a free design consultation and project estimate.`,
            },
            images: {
                hero: pavingImages.hero,
                about: pavingImages.about,
                gallery: pavingImages.gallery,
            }
        };
    }

    if (serviceName === "Appliance Repair" || serviceName === "Appliance Services") {
        const applianceImages = {
            hero: [
                {
                    id: "appliance-hero-1",
                    description: "Professional appliance repair technician fixing refrigerator",
                    imageUrl: "/images/appliance-hero.png",
                    imageHint: "appliance repair"
                }
            ],
            about: {
                id: "appliance-about",
                description: "Technician checking front-load washing machine components",
                imageUrl: "/images/appliance-about.png",
                imageHint: "technician fixing"
            },
            gallery: [
                {
                    id: "appliance-gallery-1",
                    description: "High-end kitchen appliances in clean condition",
                    imageUrl: "/images/appliance-gallery.png",
                    imageHint: "clean kitchen"
                }
            ]
        };

        return {
            companyName: `Appliance Repair Pros`,
            hero: {
                title: `Same-Day Appliance Repair & Service`,
                subtitle: `Don't let a broken appliance disrupt your day. Expert, licensed repairs on all major brands with upfront pricing.`,
                cta: "Book Same-Day Repair",
            },
            services: {
                title: `Our Household Appliance Services`,
                subtitle: "Fast, certified diagnostic and repair solutions for all major household brands.",
                items: [
                    { title: `Refrigerator & Freezer Repair`, description: "Restoring temperature controls, compressors, ice makers, and seal leaks immediately." },
                    { title: "Washer & Dryer Repair", description: "Fixing spin cycles, drainage, heating coils, belts, and noise issues same-day." },
                    { title: "Oven, Range & Cooktop Repair", description: "Solving ignition failures, broken elements, temperature offsets, and gas line checks safely." },
                ]
            },
            about: {
                title: `Your Trusted Local Appliance Technicians`,
                body: `We provide fast, reliable appliance repair services. Our background-checked, certified technicians travel with fully stocked trucks to complete most repairs in a single visit. Backed by a 90-day parts and labor warranty.`,
                points: [
                    "Same-Day Service Availability",
                    "Licensed & Insured Technicians",
                    "90-Day Parts & Labor Warranty",
                ]
            },
            reviews: {
                title: `What Your Neighbors Are Saying`,
                items: APPLIANCE_REVIEWS
            },
            contact: {
                title: "Schedule Your Service Call",
                subtitle: `Contact us now to secure a same-day diagnosis appointment.`,
            },
            images: {
                hero: applianceImages.hero,
                about: applianceImages.about,
                gallery: applianceImages.gallery,
            }
        };
    }

    if (serviceName === "Water Damage Restoration") {
        const restorationImages = {
            hero: [
                {
                    id: "water-hero-1",
                    description: "Professional cleaning and drying of a water damaged floor",
                    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                    imageHint: "water damage"
                }
            ],
            about: {
                id: "water-about",
                description: "Modern industrial dehumidifiers working in a room",
                imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                imageHint: "flood restoration"
            },
            gallery: [
                {
                    id: "water-hero-1",
                    description: "Professional cleaning and drying of a water damaged floor",
                    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                    imageHint: "water damage"
                }
            ]
        };

        return {
            companyName: `Water Damage Restoration Pros`,
            hero: {
                title: `24/7 Emergency Water Damage Restoration`,
                subtitle: `Fast water extraction, structural drying, and complete mold remediation.`,
                cta: "Call Now - Immediate Dispatch",
            },
            services: {
                title: `Our Restoration Services`,
                subtitle: "Certified response for cleanups, mold mitigation, and full repairs.",
                items: [
                    { title: `Water Extraction & Drying`, description: "Rapid water removal and high-speed industrial drying to prevent rot." },
                    { title: "Mold Remediation", description: "Safe containment, removal, and air purification to eliminate mold spores." },
                    { title: "Full Property Restoration", description: "Reconstructing damaged walls, floors, and ceilings to pre-loss condition." },
                ]
            },
            about: {
                title: `Tampa's Trusted Emergency Restoration Crew`,
                body: `We respond to water disasters instantly, 24 hours a day. Our certified technicians use state-of-the-art moisture detection and drying equipment to protect your home and prevent long-term mold issues.`,
                points: [
                    "24/7 Immediate Response",
                    "IICRC Certified Technicians",
                    "Direct Insurance Billing",
                ]
            },
            reviews: {
                title: `What Your Neighbors Are Saying`,
                items: [
                    { quote: `We woke up to a flooded kitchen at 3 AM. They arrived within 45 minutes and immediately started drying. Absolute lifesavers!`, author: "- Jennifer F. in Tampa, FL" },
                    { quote: `They handled our mold remediation professionally. They explained the process, set up containment, and cleaned everything.`, author: "- Charles K. in St. Petersburg, FL" },
                    { quote: `Very grateful for their help. They handled the insurance paperwork directly, making a stressful situation much easier.`, author: "- Patricia A. in Clearwater, FL" },
                    { quote: `Expert water extraction and drying. They kept checking the moisture levels daily until everything was perfect.`, author: "- Richard G. in Brandon, FL" },
                    { quote: `Top-notch restoration service. They did a fantastic job rebuilding our drywall and flooring after a pipe burst.`, author: "- Susan M. in Lutz, FL" }
                ]
            },
            contact: {
                title: "Flooding or Mold Emergency?",
                subtitle: `Call us immediately for 24/7 emergency dispatch and assistance.`,
            },
            images: {
                hero: restorationImages.hero,
                about: restorationImages.about,
                gallery: restorationImages.gallery,
            }
        };
    }
    
    if (serviceName === "Pest Control") {
        const allPestHeroImages = PlaceHolderImages.filter(img => img.id.startsWith('pest-hero'));
        const allPestGalleryImages = PlaceHolderImages.filter(img => img.id.startsWith('pest-gallery'));
        const aboutImage = PlaceHolderImages.find(img => img.id === 'pest-about');

        const shuffledHero = shuffle(allPestHeroImages);
        const shuffledGallery = shuffle(allPestGalleryImages);

        const pestImages = {
            hero: shuffledHero.slice(0, 5),
            about: aboutImage,
            gallery: shuffledGallery.slice(0, 4),
        };

        return {
            companyName: `Pest Control Experts`,
            hero: {
                title: `Take Back Your Home from Pests.`,
                subtitle: `Safe, effective, and eco-friendly pest control & exterminator services.`,
                cta: "Request a Free Estimate",
            },
            services: {
                title: `Our Pest Control Services`,
                subtitle: "Protecting your home and family from unwanted intruders.",
                items: [
                    { title: `General Pest Control`, description: "Year-round protection against ants, spiders, roaches, and other common household pests." },
                    { title: "Termite Treatment & Inspection", description: "Comprehensive structural protection and targeted termite eradication treatments." },
                    { title: "Rodent & Wildlife Control", description: "Humane removal, exclusion, and sanitation to keep mice, rats, and squirrels out." },
                ]
            },
            about: {
                title: `Your Trusted Local Exterminators`,
                body: `For over 15 years, our pest control technicians have provided reliable, child-and-pet-safe pest management solutions. We target the root causes of infestations to prevent them from coming back.`,
                points: [
                    "Child & Pet Friendly Treatments",
                    "Licensed & Certified Technicians",
                    "100% Satisfaction Guarantee",
                ]
            },
            reviews: {
                title: `What Our Customers Are Saying`,
                items: [
                    { quote: `We had a major ant problem that we couldn't get rid of. The technician came out, did a thorough treatment, and we haven't seen an ant since. Outstanding service!`, author: "- Mark S." },
                    { quote: `They did a termite inspection and treatment for us. Professional, clean, and extremely knowledgeable. Highly recommend their services.`, author: "- Jessica H." },
                    { quote: `Reliable and always show up on time for our quarterly preventative treatment. Since using them, our home has been completely bug-free.`, author: "- David R." },
                    { quote: `Very friendly customer service. They explained exactly what they were going to do and ensured it was safe for our dogs. Five stars!`, author: "- Samantha M." },
                    { quote: `Fast response when we discovered a wasp nest near our front door. They removed it safely the same afternoon. Excellent work.`, author: "- Chris P." }
                ]
            },
            contact: {
                title: "Have a Pest Problem?",
                subtitle: `Don't wait until it gets worse. Contact us now for a free, no-obligation estimate!`,
            },
            images: {
                hero: pestImages.hero,
                about: pestImages.about || PlaceHolderImages.find(img => img.id === 'lp1-about'),
                gallery: pestImages.gallery,
            }
        };
    }

    const content = {
        companyName: `${serviceName.replace(/ & /g, ' and ')} Pros`,
        hero: {
            title: `Reliable ${serviceName}, Done Right.`,
            subtitle: `Your trusted experts for all ${serviceName} needs.`,
            cta: "Book Your Service Today",
        },
        services: {
            title: `Our ${serviceName} Services`,
            subtitle: "Quality you can trust, for every part of your home.",
            items: [
                { title: `Expert ${serviceName}`, description: "Professional advice and planning for your project." },
                { title: "Quality Installation & Repair", description: "Using the best materials and techniques for a lasting finish." },
                { title: "Ongoing Maintenance", description: "Keeping your home in top shape with regular service." },
            ]
        },
        about: {
            title: `About ${serviceName.replace(/ & /g, ' and ')} Pros`,
            body: `For over 15 years, our team has been the go-to partner for homeowners needing expert ${serviceName}. We started with a simple mission: to provide reliable, high-quality service with a commitment to customer satisfaction.`,
            points: [
                "Certified and Insured Professionals",
                "100% Satisfaction Guarantee",
                "Punctual and Respectful Service",
            ]
        },
        reviews: {
            title: `Trusted by Your Neighbors for ${serviceName}`,
            items: [
                { quote: `The team was fantastic. They were on time, professional, and did an amazing job with our ${serviceName.toLowerCase()}. We couldn't be happier!`, author: "- Sarah J." },
                { quote: `I had an issue that two other companies couldn't figure out. They diagnosed and fixed it in under an hour. True professionals.`, author: "- Mike D." },
                { quote: `Highly recommend! The quality of their work is top-notch, and their customer service is excellent. A pleasure to work with.`, author: "- Kevin S." },
                { quote: `From the first call to the finished job, everything was seamless. They exceeded my expectations.`, author: "- Amanda P." },
                { quote: `Fair pricing and incredible attention to detail. They really care about the work they do.`, author: "- Jason R." }
            ]
        },
        contact: {
            title: "Request a Free Estimate",
            subtitle: `Let's discuss your next ${serviceName} project. Fill out the form below or give us a call!`,
        },
        images: {
            hero: findImagesByHints(serviceImageHints[serviceName] || ['handyman tools']),
            about: findImageByHint(serviceImageHints[serviceName]?.[0] || 'team working') || PlaceHolderImages[0],
            gallery: findImagesByHints(serviceImageHints[serviceName] || ['handyman tools', 'man working']),
        }
    };
    
    return content;
}
