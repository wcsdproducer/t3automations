import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

const WEBSITE_CONFIGS: Record<string, any> = {
  tampa_epoxy_flooring: {
    serviceCategory: 'Epoxy Flooring',
    companyName: 'Tampa Epoxy Flooring Pros',
    fontPair: 'modern-corporate',
    colorPalette: 'deep-midnight',
    heroEffect: 'slideshow',
    hero: {
      title: 'Premium Epoxy Flooring in Tampa, FL',
      subtitle: 'Transform your garage, commercial space, or patio with beautiful, industrial-grade epoxy finishes. Durable, slip-resistant, and built to last.',
      ctaText: 'GET MY FREE ESTIMATE',
      secondaryCtaText: 'CALL NOW'
    },
    trustBadges: [
      'Licensed, Bonded & Insured',
      '10-Year Product Warranty',
      'Certified Local Installers',
      'Free On-Site Estimates'
    ],
    services: {
      title: 'Our Professional Epoxy Solutions',
      subtitle: 'High-quality flooring finishes designed for durability and style.',
      items: [
        { title: 'Garage Floor Epoxy', description: 'Ultra-durable, chemical-resistant flake coatings that withstand heavy vehicles.', iconName: 'Wrench' },
        { title: 'Commercial & Industrial Flooring', description: 'Heavy-duty, slip-resistant coatings designed for warehouses, shops, and retail.', iconName: 'Shield' },
        { title: 'Metallic & Custom Epoxy', description: 'Stunning, seamless high-gloss artistic floors tailored to your color choice.', iconName: 'Palette' }
      ]
    },
    process: {
      title: 'Our 3-Step Seamless Process',
      subtitle: 'We make getting a beautiful, durable floor completely hassle-free.',
      steps: [
        { number: '1', title: 'Free Estimate', description: 'Call us or submit our form to schedule a fast, transparent on-site measurement.' },
        { number: '2', title: 'Concrete Prep', description: 'We diamond-grind the concrete and patch cracks to ensure maximum epoxy adhesion.' },
        { number: '3', title: 'Coating Application', description: 'Our certified crew applies base coat, decorative flakes, and a protective polyaspartic topcoat.' }
      ]
    },
    about: {
      title: 'About Tampa Epoxy Flooring Pros',
      body: "We are Tampa's leading specialists in residential and commercial epoxy flooring. Our crew is dedicated to delivering flawless finishes using premium industrial-grade materials that won't peel, yellow, or crack under hot tires.",
      points: [
        '100% Customer Satisfaction Guarantee',
        'Advanced Concrete Preparation',
        'Eco-Friendly, Low-VOC Products',
        'Highly Rated Local Team'
      ]
    },
    faqs: [
      { question: 'How long does the installation take?', answer: 'Most residential garage floor projects are completed in just 1 to 2 days, with full cure for vehicle traffic in 72 hours.' },
      { question: 'Is epoxy flooring slip-resistant?', answer: 'Yes, we integrate slip-resistant decorative flakes and texture additives to ensure excellent traction, even when wet.' },
      { question: 'Does your work come with a warranty?', answer: 'Absolutely. We offer a comprehensive 10-year warranty against peeling and delamination for our epoxy coatings.' },
      { question: 'Can you apply epoxy over cracked concrete?', answer: 'Yes. Our thorough prep process includes concrete grinding and filling all cracks/divots with industrial menders before applying the base coat.' }
    ],
    reviews: {
      title: 'What Your Neighbors Are Saying',
      items: [
        { quote: 'They transformed my stained garage floor into a gorgeous, clean space. The flake finish looks amazing and cleans up so easily!', author: 'Steven M.', location: 'Tampa, FL' },
        { quote: 'Fast, professional, and very neat. They completed our commercial warehouse floor over the weekend so we had zero downtime.', author: 'Amanda K.', location: 'St. Petersburg, FL' },
        { quote: 'Excellent work. The pricing was fair, and the team was extremely detailed with the concrete prep. Highly recommend!', author: 'Jason D.', location: 'Brandon, FL' }
      ]
    },
    contact: {
      title: 'Get Your Free On-Site Quote',
      subtitle: 'Fill out the form below or call us directly to schedule your free estimate.'
    }
  },
  tampa_tree_services: {
    serviceCategory: 'Tree Services',
    companyName: 'Tampa Tree Care Specialists',
    fontPair: 'friendly-local',
    colorPalette: 'earthy-green',
    heroEffect: 'slideshow',
    hero: {
      title: 'Professional Tree Services in Tampa Bay',
      subtitle: 'Safe, efficient tree removal, tree trimming, and arborist care. Protect your home and keep your landscape beautiful.',
      ctaText: 'REQUEST A FREE ESTIMATE',
      secondaryCtaText: 'CALL NOW'
    },
    trustBadges: [
      'Licensed & Fully Insured',
      '24/7 Emergency Storm Service',
      'ISA Certified Arborists',
      '100% Satisfaction Guarantee'
    ],
    services: {
      title: 'Our Professional Tree Care Services',
      subtitle: 'Experienced arborist care to keep your property safe and healthy.',
      items: [
        { title: 'Tree Removal', description: 'Safe, precise removal of dead, hazardous, or unwanted trees near structures.', iconName: 'Scissors' },
        { title: 'Trimming & Pruning', description: 'Expert branch trimming to improve tree health, air circulation, and storm safety.', iconName: 'Leaf' },
        { title: 'Stump Grinding', description: 'Complete stump removal to clear your yard and prevent pests/regrowth.', iconName: 'Trash' }
      ]
    },
    process: {
      title: 'Our Safe & Easy Process',
      subtitle: 'How we ensure your property remains safe and pristine.',
      steps: [
        { number: '1', title: 'Free Inspection', description: 'Our tree care specialists assess your trees and provide a clear, upfront quote.' },
        { number: '2', title: 'Safe Execution', description: 'We use state-of-the-art rigging and safety equipment to perform the work without damaging your yard.' },
        { number: '3', title: 'Thorough Cleanup', description: 'We haul away all wood and debris, rake the area, and leave your property immaculate.' }
      ]
    },
    about: {
      title: 'About Tampa Tree Care Specialists',
      body: 'We are a locally owned and operated tree service company serving the entire Tampa Bay area. Our crew has years of experience handling large tree removals, storm damage cleanup, and preventative palm/oak trimming to keep your yard beautiful and storm-ready.',
      points: [
        'Fully Equipped for Any Size Job',
        'Certified Tree Care Professionals',
        'Affordable, Upfront Pricing',
        'Emergency Services Available'
      ]
    },
    faqs: [
      { question: 'Are you fully insured?', answer: 'Yes, we carry comprehensive general liability and workers\' compensation insurance to protect you and your property.' },
      { question: 'How much does tree removal cost?', answer: 'Cost varies based on tree size, location, accessibility, and complexity. We provide free, on-site written estimates before any work starts.' },
      { question: 'Do you offer emergency storm response?', answer: 'Yes, we operate 24/7 for storm emergencies, clearing fallen trees from roofs, driveways, and structures immediately.' },
      { question: 'Do I need a permit to remove a tree in Tampa?', answer: 'Some grand oaks and local species require permits. Our certified arborists handle the permit assessment and application process for you.' }
    ],
    reviews: {
      title: 'What Your Neighbors Are Saying',
      items: [
        { quote: 'They removed a massive oak tree close to my house. The team was incredibly precise, fast, and cleaned up every single leaf!', author: 'Thomas B.', location: 'Tampa, FL' },
        { quote: 'Excellent tree pruning service. Our palms look healthy and beautiful now. Very reasonable price.', author: 'Linda G.', location: 'Clearwater, FL' },
        { quote: 'Quick response for emergency tree limb removal after a storm. They saved our roof from serious damage!', author: 'David R.', location: 'St. Petersburg, FL' }
      ]
    },
    contact: {
      title: 'Get Your Free Tree Service Estimate',
      subtitle: 'Submit your request below or call us today to speak with a tree specialist.'
    }
  },
  tampa_paving_concrete: {
    serviceCategory: 'Paving & Concrete',
    companyName: 'Tampa Concrete & Paving',
    fontPair: 'modern-corporate',
    colorPalette: 'professional-blue',
    heroEffect: 'slideshow',
    hero: {
      title: 'Premium Concrete & Paving Solutions in Tampa, FL',
      subtitle: 'Expert driveways, patios, walkways, and decorative pavers. Blending high-durability concrete with beautiful craftsmanship.',
      ctaText: 'SCHEDULE A FREE CONSULTATION',
      secondaryCtaText: 'CALL NOW'
    },
    trustBadges: [
      'Licensed Concrete Contractors',
      'Premium Materials & Finishes',
      'Free Design Consultations',
      'Highly Rated Local Craftsmanship'
    ],
    services: {
      title: 'Our Concrete & Paving Services',
      subtitle: 'Solid engineering and high-end aesthetics for your outdoor surfaces.',
      items: [
        { title: 'Concrete Driveways', description: 'Custom-poured, fiber-reinforced driveways built to withstand heavy traffic and Florida weather.', iconName: 'Hammer' },
        { title: 'Brick & Stone Pavers', description: 'Gorgeous paver installations for patios, driveways, pool decks, and garden paths.', iconName: 'Grid' },
        { title: 'Patios & Walkways', description: 'Custom-designed outdoor living spaces, firepit surrounds, and seamless walkways.', iconName: 'Columns' }
      ]
    },
    process: {
      title: 'Our Professional Execution',
      subtitle: 'Crafting a solid, long-lasting foundation in 3 steps.',
      steps: [
        { number: '1', title: 'Design Consultation', description: 'We meet on-site to review layouts, material choices, and provide a detailed quote.' },
        { number: '2', title: 'Excavation & Sub-Base', description: 'We grade the ground, install a solid compacted base, and set formwork correctly.' },
        { number: '3', title: 'Pouring & Finish', description: 'We pour premium concrete, apply reinforcements, and execute a perfect broom or stamped finish.' }
      ]
    },
    about: {
      title: 'About Tampa Concrete & Paving',
      body: 'We specialize in residential and commercial concrete installation and brick paving throughout Tampa. Our team combines top-quality materials, precise structural reinforcement, and outstanding craftsmanship to deliver beautiful, crack-resistant outdoor spaces.',
      points: [
        'Reinforced Concrete Specifications',
        'Free Custom Layout Designs',
        'Prompt, Professional Timelines',
        'Owner-Supervised Projects'
      ]
    },
    faqs: [
      { question: 'How long does concrete take to cure?', answer: 'You can walk on new concrete after 24 hours, but we recommend waiting a full 7 days before parking vehicles on it.' },
      { question: 'Why is sub-base preparation important?', answer: 'A solid compacted base prevents soil shifting, settling, and water erosion, which are the leading causes of cracked concrete.' },
      { question: 'Do you offer stamped or decorative concrete?', answer: 'Yes, we offer custom stamped concrete patterns, colors, and borders to replicate the look of natural stone or slate.' },
      { question: 'Do you handle the permit process?', answer: 'Yes, we handle all local HOA requirements and city permitting for new driveway placements and extensions.' }
    ],
    reviews: {
      title: 'What Your Neighbors Are Saying',
      items: [
        { quote: 'The new paver patio and driveway look stunning! It has completely changed the curb appeal of our home.', author: 'Mark S.', location: 'Tampa, FL' },
        { quote: 'Excellent concrete driveway installation. They reinforced it properly and finished it perfectly. Solid work.', author: 'Jeffrey W.', location: 'Brandon, FL' },
        { quote: 'Great crew. They worked fast, poured a beautiful new slab for our workshop, and left the yard clean.', author: 'Brian O.', location: 'Lutz, FL' }
      ]
    },
    contact: {
      title: 'Start Your Paving Project Today',
      subtitle: 'Fill out our form or call us to book your on-site design consultation.'
    }
  }
};

async function redesign() {
  console.log('🎨 Redesigning Tampa rank-and-rent websites with high-converting configurations...');

  for (const [profileId, config] of Object.entries(WEBSITE_CONFIGS)) {
    try {
      console.log(`\nUpdating businessProfiles/${profileId} with custom websiteConfig...`);
      await db.collection('businessProfiles').doc(profileId).update({
        websiteConfig: config,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`  ✅ Successfully updated websiteConfig for ${profileId}!`);
    } catch (e: any) {
      console.error(`  ❌ Error updating ${profileId}:`, e.message);
    }
  }

  console.log('\n🎉 Finished redesigning Tampa websites!');
}

redesign().catch(console.error);
