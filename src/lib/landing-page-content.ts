
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

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
        const needed = 5 - images.length;
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
                    { quote: `The team that installed our new furnace was professional, clean, and incredibly efficient. The new system works perfectly. Highly recommend!`, author: "- Jessica L." }
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
                { quote: `I had an issue that two other companies couldn't figure out. They diagnosed and fixed it in under an hour. True professionals.`, author: "- Mike D." }
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
