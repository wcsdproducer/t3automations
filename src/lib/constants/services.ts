export interface ServiceSiloData {
  slug: string;
  name: string;
  shortName: string;
  nicheKey: 'epoxy' | 'concrete' | 'tree' | 'pest' | 'junk' | 'appliance';
  headline: string;
  description: string;
  priceRange: string;
  turnaround: string;
  deliverables: string[];
  commonProblems: string[];
  faqs: Array<{ q: string; a: string }>;
}

export const SERVICE_SILOS: ServiceSiloData[] = [
  // ==================== EPOXY FLOORING ====================
  {
    slug: 'garage-floor-epoxy',
    name: 'Garage Floor Epoxy Coating',
    shortName: 'Garage Floor Epoxy',
    nicheKey: 'epoxy',
    headline: 'Heavy-Duty Garage Floor Epoxy Coatings',
    description: 'Transform oil-stained, dusty concrete into a showroom-grade, chemical-resistant garage floor built to stop hot-tire pickup and Florida humidity.',
    priceRange: '$5 – $9 / sq ft',
    turnaround: '1–2 Days',
    deliverables: [
      'Industrial diamond-grinding surface profiling (CSP-3)',
      'Crack chasing, spall repair & expansion joint filling',
      '100% solids moisture-vapor barrier epoxy base coat',
      'Full-broadcast vinyl decorative flake system',
      'UV-stable polyaspartic clear topcoat (no yellowing)',
    ],
    commonProblems: [
      'Hot-tire pickup and peeling DIY paint',
      'Concrete dusting, pitting, and hairline cracking',
      'Oil, transmission fluid, and chemical stains',
      'Hydrostatic moisture vapor bubbling through concrete',
    ],
    faqs: [
      { q: 'How soon can I park my car on a new garage epoxy floor?', a: 'Foot traffic is safe in 12–18 hours, and full vehicle traffic is ready in 24–48 hours depending on humidity and topcoat system.' },
      { q: 'Why do DIY garage floor kits peel?', a: 'DIY kits rely on acid etching instead of mechanical diamond grinding and use thin water-based coatings that fail under hot tires and slab moisture.' },
      { q: 'Is the finish slippery when wet?', a: 'No. Full-broadcast vinyl flake adds natural orange-peel texture, and we can add aluminum-oxide anti-slip grip to the topcoat.' },
    ],
  },
  {
    slug: 'metallic-epoxy-flooring',
    name: 'Metallic Epoxy Flooring',
    shortName: 'Metallic Epoxy',
    nicheKey: 'epoxy',
    headline: 'Custom 3D Metallic Epoxy Flooring',
    description: 'Seamless, glass-like designer metallic epoxy floors engineered for residential living spaces, showrooms, man caves, and luxury garages.',
    priceRange: '$8 – $14 / sq ft',
    turnaround: '2–3 Days',
    deliverables: [
      'Mechanical diamond grind & moisture-mitigating primer',
      'Deep-pigment metallic mica dispersion layer',
      'Hand-manipulated custom marble or wave veining',
      'High-wear urethane or polyaspartic clear shield',
    ],
    commonProblems: [
      'Dull, dated tile with dirty grout lines',
      'Uneven concrete substrates requiring self-leveling prep',
      'Scratches and UV ambering from low-grade resins',
    ],
    faqs: [
      { q: 'Can metallic epoxy be installed inside a home?', a: 'Yes. Once cured, our 100% solids zero-VOC metallic systems are completely odorless, seamless, and easy to mop.' },
      { q: 'How customizable are the colors?', a: 'Every metallic floor is one-of-a-kind. Choose from charcoal/silver, pearl white, ocean blue, copper bronze, or custom multi-tone blends.' },
    ],
  },
  {
    slug: 'polyaspartic-floor-coatings',
    name: 'Polyaspartic Floor Coatings',
    shortName: 'Polyaspartic Coatings',
    nicheKey: 'epoxy',
    headline: '1-Day UV-Stable Polyaspartic Floor Coatings',
    description: 'Rapid-cure polyaspartic concrete coatings that are 4x more abrasion-resistant than standard epoxy and 100% UV-stable for outdoor patios and garages.',
    priceRange: '$6 – $10 / sq ft',
    turnaround: '1 Day',
    deliverables: [
      'Full mechanical concrete grinding & crack repair',
      'Deep-penetrating polyurea/polyaspartic base coat',
      'Full broadcast decorative chip or quartz aggregate',
      '100% UV-resistant polyaspartic clear topcoat',
    ],
    commonProblems: [
      'Yellowing or chalking on sun-exposed garage aprons and patios',
      'Tight timelines requiring 1-day return to service',
      'Heavy tool drops and abrasion wear',
    ],
    faqs: [
      { q: 'What is the difference between epoxy and polyaspartic?', a: 'Polyaspartic cures much faster (often in 1 day), will never yellow in direct sunlight, and offers higher flexibility and scratch resistance.' },
      { q: 'Can polyaspartic be used on outdoor pool decks and lanais?', a: 'Yes. Because it is 100% UV-stable and slip-textured, it excels on patios, lanais, walkways, and pool decks.' },
    ],
  },
  {
    slug: 'commercial-epoxy-flooring',
    name: 'Commercial & Warehouse Epoxy Flooring',
    shortName: 'Commercial Epoxy',
    nicheKey: 'epoxy',
    headline: 'Industrial & Commercial Epoxy Floor Systems',
    description: 'OSHA-compliant, high-build epoxy and urethane mortar floors engineered for warehouses, auto bays, commercial kitchens, and retail spaces.',
    priceRange: '$4 – $11 / sq ft',
    turnaround: 'Weekend / Off-Hours Available',
    deliverables: [
      'Shot blasting or planetary diamond grinding',
      'High-build 100% solids industrial epoxy or urethane mortar',
      'Safety striping, aisle markings & forklift-rated topcoats',
      'Cove base installation for food-service sanitation',
    ],
    commonProblems: [
      'Forklift tire wear and heavy pallet impact damage',
      'Slip hazards in wet commercial kitchens or wash bays',
      'Chemical spills, hydraulic fluids, and thermal shock',
    ],
    faqs: [
      { q: 'Can you install over a weekend to avoid business downtime?', a: 'Yes. We offer night and weekend scheduling with fast-cure polyaspartic systems so your team is back on the floor Monday morning.' },
    ],
  },
  {
    slug: 'concrete-floor-polishing',
    name: 'Concrete Grinding & Polishing',
    shortName: 'Concrete Polishing',
    nicheKey: 'epoxy',
    headline: 'Mechanically Polished & Sealed Concrete Floors',
    description: 'Low-maintenance, high-gloss polished concrete floors using progressive diamond tooling and lithium densifiers for homes, offices, and retail stores.',
    priceRange: '$4 – $8 / sq ft',
    turnaround: '1–3 Days',
    deliverables: [
      'Progressive grit diamond grinding (40 to 3000 grit)',
      'Lithium silicate chemical densifier hardening',
      'Micro-grouting of pinholes and surface voids',
      'Stain-guard burnished penetrating sealer',
    ],
    commonProblems: [
      'Old adhesive, carpet glue, or failed paint residue',
      'High maintenance waxing costs on VCT tile',
      'Dusting bare warehouse slabs',
    ],
    faqs: [
      { q: 'Does polished concrete peel?', a: 'Never. Polishing mechanically refines and hardens the concrete itself rather than applying a topical film.' },
    ],
  },

  // ==================== PAVING & CONCRETE ====================
  {
    slug: 'concrete-driveway-installation',
    name: 'Concrete Driveway Installation & Replacement',
    shortName: 'Concrete Driveways',
    nicheKey: 'concrete',
    headline: 'Reinforced Concrete Driveway Installation & Replacement',
    description: 'Tear-out, compacted sub-base grading, fiber/rebar-reinforced 4,000 PSI concrete driveways built to handle heavy vehicles without cracking or settling.',
    priceRange: '$8 – $15 / sq ft',
    turnaround: '2–4 Days',
    deliverables: [
      'Full demolition & haul-away of cracked concrete or asphalt',
      'Laser-graded compacted crushed-stone sub-base',
      '#4 rebar grid or welded wire mesh reinforcement',
      '4,000 PSI air-entrained concrete pour with broom or exposed finish',
      'Precision saw-cut control joints & penetrating sealer',
    ],
    commonProblems: [
      'Heaving, tree-root uplift, and sunken driveway panels',
      'Standing water puddles from improper drainage slope',
      'Crumbling edges and spiderweb surface spalling',
    ],
    faqs: [
      { q: 'How thick should a residential concrete driveway be?', a: 'We pour a minimum of 4 inches for standard passenger vehicles and 5–6 inches with rebar reinforcement for heavy trucks, RVs, or boats.' },
      { q: 'How long before we can drive on a new concrete driveway?', a: 'Foot traffic is safe after 24–48 hours; passenger vehicles can park on the driveway after 7 days of curing.' },
    ],
  },
  {
    slug: 'stamped-concrete-patios',
    name: 'Stamped & Decorative Concrete Patios',
    shortName: 'Stamped Patios',
    nicheKey: 'concrete',
    headline: 'Custom Stamped & Decorative Concrete Patios',
    description: 'Architectural stamped concrete patios replicating natural flagstone, ashlar slate, travertine, or wood plank without shifting pavers or weed growth.',
    priceRange: '$12 – $22 / sq ft',
    turnaround: '2–3 Days',
    deliverables: [
      'Custom layout forming with curved or geometric borders',
      'Integral color hardener and secondary antiquing release',
      'High-definition architectural pattern stamping',
      'UV-resistant acrylic high-gloss or matte sealer with slip grit',
    ],
    commonProblems: [
      'Sinking brick pavers and constant weed growth in joints',
      'Plain gray slabs lacking backyard curb appeal',
      'Hot barefoot surfaces around pools and lanais',
    ],
    faqs: [
      { q: 'How often does stamped concrete need resealing?', a: 'Every 2–3 years with a breathable acrylic sealer to keep the color vibrant and protect against sun and rain.' },
    ],
  },
  {
    slug: 'asphalt-paving-repair',
    name: 'Asphalt Paving & Resurfacing',
    shortName: 'Asphalt Paving',
    nicheKey: 'concrete',
    headline: 'Commercial & Residential Asphalt Paving & Resurfacing',
    description: 'Hot-mix asphalt driveways, parking lot paving, mill-and-overlay resurfacing, pothole patching, and commercial sealcoating.',
    priceRange: '$4 – $9 / sq ft',
    turnaround: '1–2 Days',
    deliverables: [
      'Full-depth base grading and vibratory roller compaction',
      'Hot-mix asphalt installation (binder + wearing course)',
      'Infrared pothole repair and alligator-crack patching',
      'Commercial parking lot sealcoating and ADA striping',
    ],
    commonProblems: [
      'Alligator cracking and soft sub-base failures',
      'Potholes and pooling stormwater in parking lots',
      'Faded, oxidized asphalt turning brittle in UV heat',
    ],
    faqs: [
      { q: 'When is resurfacing better than full replacement?', a: 'If the underlying stone base is still solid and less than 25% of the surface has deep cracking, a 2-inch hot-mix overlay saves 40%+ over full tear-out.' },
    ],
  },
  {
    slug: 'concrete-slab-foundation',
    name: 'Concrete Slabs & Foundations',
    shortName: 'Slabs & Foundations',
    nicheKey: 'concrete',
    headline: 'Engineered Concrete Slabs, Pads & Foundations',
    description: 'Turnkey monolithic slabs, detached garage foundations, RV pads, workshop floors, and commercial equipment pads poured to local building code.',
    priceRange: '$7 – $14 / sq ft',
    turnaround: '2–4 Days',
    deliverables: [
      'Excavation, vapor barrier & compacted fill prep',
      'Thickened-edge monolithic footer forming & rebar cages',
      'Anchor bolt / J-bolt placement per structural plans',
      'Power-trowel smooth finish for workshops and garages',
    ],
    commonProblems: [
      'Unlevel shed or workshop floors causing door binding',
      'Moisture wicking through slabs without a vapor barrier',
      'Cracking under heavy lifts, RVs, or metal buildings',
    ],
    faqs: [
      { q: 'Do you handle thickened-edge slabs for metal buildings?', a: 'Yes. We pour engineered monolithic slabs with reinforced perimeter footers tailored to your building manufacturer specs.' },
    ],
  },
  {
    slug: 'sidewalk-curb-concrete',
    name: 'Concrete Sidewalks, Walkways & Curbs',
    shortName: 'Sidewalks & Curbs',
    nicheKey: 'concrete',
    headline: 'Safe, ADA-Compliant Sidewalks, Walkways & Curbing',
    description: 'Front entry walkways, HOA sidewalk panel replacement, trip-hazard remediation, and commercial concrete curbing.',
    priceRange: '$8 – $14 / sq ft',
    turnaround: '1–2 Days',
    deliverables: [
      'Root-damaged sidewalk removal & root barrier prep',
      'ADA-compliant slope grading and tactile warning mats',
      'Broom-finish non-slip surface and clean expansion joints',
    ],
    commonProblems: [
      'City or HOA violation notices for lifted sidewalk panels',
      'Dangerous trip hazards for pedestrians and visitors',
      'Broken commercial parking curbs and aprons',
    ],
    faqs: [
      { q: 'Can you replace just the lifted sections of a sidewalk?', a: 'Yes. We saw-cut cleanly at the nearest control joints and replace only the damaged panels to match existing grade.' },
    ],
  },

  // ==================== TREE SERVICES ====================
  {
    slug: 'emergency-tree-removal',
    name: '24/7 Emergency & Hazardous Tree Removal',
    shortName: 'Emergency Tree Removal',
    nicheKey: 'tree',
    headline: '24/7 Emergency & Hazardous Tree Removal',
    description: 'Rapid-response crane and rigging crews for storm-damaged, leaning, or dead trees threatening roofs, driveways, and power lines.',
    priceRange: '$650 – $3,500+ (by height/access)',
    turnaround: 'Same-Day / 24/7 Emergency',
    deliverables: [
      'Low-impact crane-assisted or sectional technical rigging',
      'Roof tarp & safe extraction off structures or fences',
      'Full trunk, brush chipping, and yard rake-clean haul-away',
      'Insurance documentation & itemized storm-damage invoicing',
    ],
    commonProblems: [
      'Hurricane and thunderstorm fallen limbs or uprooted oaks',
      'Hollow, lightning-struck, or leaning dead trees near homes',
      'Blocked driveways and crushed fences',
    ],
    faqs: [
      { q: 'Are you insured for trees over houses and structures?', a: 'Yes. Every crew carries full general liability and workers compensation coverage specifically for high-risk tree removal.' },
      { q: 'Does homeowners insurance cover emergency tree removal?', a: 'If a tree falls on a covered structure (house, garage, fence) or blocks a driveway, most policies cover removal. We provide itemized documentation for your claim.' },
    ],
  },
  {
    slug: 'tree-trimming-pruning',
    name: 'Tree Trimming & Crown Pruning',
    shortName: 'Tree Trimming',
    nicheKey: 'tree',
    headline: 'ISA-Standard Tree Trimming & Storm-Prep Pruning',
    description: 'Precision canopy thinning, deadwood removal, roof clearance, and structural pruning that keeps trees healthy and wind-resistant.',
    priceRange: '$350 – $1,400',
    turnaround: '1 Day',
    deliverables: [
      'Roof, gutter, and driveway canopy clearance (8–14 ft)',
      'Deadwood and crossing-limb removal',
      'Hurricane wind-sail canopy thinning (never lion-tailing)',
      'Complete limb chipping and yard cleanup',
    ],
    commonProblems: [
      'Heavy oak branches scraping roof shingles and siding',
      'Dense shaded canopies killing grass underneath',
      'HOA notices for overhanging street or sidewalk limbs',
    ],
    faqs: [
      { q: 'When is the best time to trim oak trees?', a: 'Routine structural pruning and deadwood removal can be performed safely year-round, especially ahead of storm season to reduce wind resistance.' },
    ],
  },
  {
    slug: 'stump-grinding-removal',
    name: 'Stump Grinding & Root Removal',
    shortName: 'Stump Grinding',
    nicheKey: 'tree',
    headline: 'Fast Stump Grinding & Surface Root Removal',
    description: 'Commercial-grade stump grinders that pulverize unsightly tree stumps 6–12 inches below grade so you can replant sod or pave cleanly.',
    priceRange: '$150 – $450 / stump',
    turnaround: 'Same-Day / Under 2 Hours',
    deliverables: [
      'Deep stump grinding 6–12 inches below soil line',
      'Surface flare root chasing for lawn-mower clearance',
      'Wood chip mulch backfill or optional full haul-away',
      'Compact gate-access grinders for tight backyards',
    ],
    commonProblems: [
      'Termites, carpenter ants, and fungi nesting in rotting stumps',
      'Lawn mower blade damage from hidden surface roots',
      'Unsightly stumps blocking new fence or patio builds',
    ],
    faqs: [
      { q: 'Can your stump grinder fit through a standard backyard gate?', a: 'Yes. We run compact 35-inch tracked grinders that pass easily through standard residential backyard gates without tearing up turf.' },
    ],
  },
  {
    slug: 'palm-tree-trimming',
    name: 'Palm Tree Trimming & Skinning',
    shortName: 'Palm Tree Trimming',
    nicheKey: 'tree',
    headline: 'Professional Palm Tree Trimming & Boot Removal',
    description: 'Safe dead-frond trimming, seed-pod removal, and trunk skinning for Queen, Washingtonia, Canary Island Date, and Sabal palms.',
    priceRange: '$75 – $250 / palm',
    turnaround: 'Same-Day',
    deliverables: [
      '9-to-3 clock-position frond trimming (no over-pruning)',
      'Messy berry and seed-stalk removal before drop',
      'Clean boot removal / diamond-cut trunk skinning',
      'Sanitized blades to prevent lethal palm disease spread',
    ],
    commonProblems: [
      'Falling heavy palm fronds damaging cars, lanais, and pools',
      'Rodents and roof rats nesting in dead palm skirts',
      'Staining berries dropping onto driveways and walkways',
    ],
    faqs: [
      { q: 'Why do you sanitize tools between palm trees?', a: 'Dirty saws spread fatal fungal diseases like Fusarium wilt between palms. We sterilize cutting blades before every palm.' },
    ],
  },
  {
    slug: 'land-lot-clearing',
    name: 'Land & Lot Clearing',
    shortName: 'Land Clearing',
    nicheKey: 'tree',
    headline: 'Residential & Commercial Land & Brush Clearing',
    description: 'Forestry mulching, selective lot clearing, overgrown brush removal, and site preparation for home builds, pools, and fences.',
    priceRange: 'Custom Quote (by acreage)',
    turnaround: '1–3 Days',
    deliverables: [
      'Selective tree preservation & invasive brush clearing',
      'Forestry mulching with zero burn piles needed',
      'Stump and root grubbing for construction readiness',
      'Debris hauling and rough grade leveling',
    ],
    commonProblems: [
      'Overgrown wooded lots blocking builders and surveyors',
      'Invasive Brazilian pepper, bamboo, and vine takeover',
      'Code enforcement lot-clearing citations',
    ],
    faqs: [
      { q: 'Can you clear brush while saving mature shade trees?', a: 'Yes. Selective clearing removes scrub brush and dead trees while protecting the root zones of your prized mature trees.' },
    ],
  },

  // ==================== PEST CONTROL ====================
  {
    slug: 'termite-treatment-inspection',
    name: 'Termite Inspection & Treatment',
    shortName: 'Termite Control',
    nicheKey: 'pest',
    headline: 'Complete Termite Inspection, Liquid Barriers & Baiting',
    description: 'Licensed subterranean and drywood termite elimination using non-repellent liquid soil barriers and monitored bait stations backed by a protection warranty.',
    priceRange: '$650 – $1,800',
    turnaround: 'Same-Day Inspection',
    deliverables: [
      'Full foundation, crawlspace, and attic termite inspection',
      'Termidor / non-repellent liquid perimeter trenching',
      'Monitored termite bait station installation',
      'Annual renewal inspection & retreatment warranty',
    ],
    commonProblems: [
      'Mud tubes climbing foundation walls or crawlspace piers',
      'Discarded swarmer wings near windowsills in spring',
      'Hollow-sounding baseboards, flooring, or door frames',
    ],
    faqs: [
      { q: 'Are termite treatments safe for pets and kids?', a: 'Yes. Liquid barriers are injected directly into soil trenches around the foundation and covered, and bait stations are locked flush in the ground.' },
    ],
  },
  {
    slug: 'rodent-mice-removal',
    name: 'Rodent, Mice & Rat Control & Exclusion',
    shortName: 'Rodent Control',
    nicheKey: 'pest',
    headline: 'Permanent Mice & Rat Trapping and Home Exclusion',
    description: 'We do not just set traps—we seal every roofline, crawlspace vent, and utility gap to keep rodents out permanently.',
    priceRange: '$250 – $750',
    turnaround: 'Same-Day Dispatch',
    deliverables: [
      'Full attic, garage, and crawlspace entry-point audit',
      'Targeted snap-trapping & tamper-resistant exterior stations',
      'Galvanized steel mesh & sealant exclusion of entry gaps',
      'Odor neutralization and droppings sanitization advice',
    ],
    commonProblems: [
      'Scratching noises in ceilings or walls at night',
      'Chewed HVAC ducts, wiring, and attic insulation',
      'Droppings in kitchen pantries and garages',
    ],
    faqs: [
      { q: 'Why do mice keep coming back after DIY traps?', a: 'Traps only remove the rodents already inside. Without sealing 1/4-inch exterior entry gaps around pipes and vents, new rodents follow the pheromone trail right back in.' },
    ],
  },
  {
    slug: 'bed-bug-extermination',
    name: 'Bed Bug Extermination',
    shortName: 'Bed Bug Treatment',
    nicheKey: 'pest',
    headline: 'Discreet, Guaranteed Bed Bug Elimination',
    description: 'Targeted thermal and residual bed bug treatments that eliminate adults, nymphs, and eggs in bedrooms, furniture, and baseboards.',
    priceRange: '$450 – $1,500',
    turnaround: '24-Hour Discreet Service',
    deliverables: [
      'Thorough mattress, box spring, headboard & outlet inspection',
      'Targeted heat + EPA-registered residual crack-and-crevice treatment',
      'Follow-up clearance inspection 14 days post-treatment',
      'Unmarked vehicle option for complete privacy',
    ],
    commonProblems: [
      'Clusters of itchy bites appearing overnight',
      'Rust-colored spotting on sheets and mattress seams',
      'Infestations brought home from travel or secondhand furniture',
    ],
    faqs: [
      { q: 'Do I have to throw away my mattress and furniture?', a: 'In almost all cases, no. Professional treatment combined with certified bed-bug encasements saves your mattress and furniture.' },
    ],
  },
  {
    slug: 'mosquito-tick-control',
    name: 'Yard Mosquito & Tick Control',
    shortName: 'Mosquito & Tick Control',
    nicheKey: 'pest',
    headline: 'Backyard Mosquito & Tick Barrier Spraying',
    description: 'Reclaim your patio and yard with monthly botanical or micro-encapsulated foliage barrier treatments targeting mosquito resting zones.',
    priceRange: '$69 – $119 / treatment',
    turnaround: 'Same-Week Service',
    deliverables: [
      'Standing-water breeding site inspection & larvicide treatment',
      'Precision misting of shrubs, tree lines, decks, and shaded eaves',
      'Dry-in-30-minutes family & pet-friendly application',
      'One-time special event sprays (weddings, BBQs, graduations)',
    ],
    commonProblems: [
      'Unable to sit outside at dusk due to aggressive mosquitoes',
      'Ticks latching onto dogs and children near wooded edges',
      'Standing water in gutters, French drains, and low spots',
    ],
    faqs: [
      { q: 'How long does each mosquito treatment last?', a: 'Every barrier application protects your yard for 21–30 days, even after normal rain showers once dried.' },
    ],
  },
  {
    slug: 'ant-roach-extermination',
    name: 'Ant, Roach & Spider Extermination',
    shortName: 'Ant & Roach Control',
    nicheKey: 'pest',
    headline: 'Fast General Pest Control for Ants, Roaches & Spiders',
    description: 'Interior gel baiting and exterior perimeter shields that eliminate entire ant colonies and German cockroach infestations at the source.',
    priceRange: '$129 – $249',
    turnaround: 'Same-Day Available',
    deliverables: [
      'Non-repellent colony-transfer ant & roach gel baits',
      'Exterior foundation perimeter liquid & granular barrier',
      'De-webbing of eaves, porches, and garage frames',
      'Free re-treatments between quarterly visits if pests return',
    ],
    commonProblems: [
      'Persistent kitchen sugar ants and carpenter ants',
      'German cockroaches hiding behind appliances and cabinets',
      'Brown recluse and black widow spiders in basements/garages',
    ],
    faqs: [
      { q: 'Do we need to leave the house during treatment?', a: 'No. Targeted gel baits and exterior perimeter barriers require zero evacuation and dry quickly.' },
    ],
  },

  // ==================== JUNK REMOVAL ====================
  {
    slug: 'estate-cleanout-services',
    name: 'Estate & Full-Home Cleanout Services',
    shortName: 'Estate Cleanouts',
    nicheKey: 'junk',
    headline: 'Compassionate, Turnkey Estate & Full-Home Cleanouts',
    description: 'Respectful, broom-swept whole-house cleanouts for probate estates, downsizing families, and real estate listings—with donation drop-offs included.',
    priceRange: '$450 – $2,500+ (by truckloads)',
    turnaround: '1–2 Days',
    deliverables: [
      'Full sorting of keep, donate, recycle, and haul-away items',
      'Heavy lifting from attics, basements, garages, and sheds',
      'Charitable donation drop-off with tax receipts when requested',
      'Final broom-swept finish ready for staging or closing',
    ],
    commonProblems: [
      'Tight real estate closing deadlines with a full house',
      'Out-of-state heirs needing trusted local cleanout crews',
      'Decades of accumulated furniture, boxes, and garage items',
    ],
    faqs: [
      { q: 'Do I have to bag or move items to the curb first?', a: 'Not at all. We handle 100% of the lifting, bagging, disassembly, and loading right from where every item sits.' },
    ],
  },
  {
    slug: 'furniture-mattress-removal',
    name: 'Furniture & Mattress Haul-Away',
    shortName: 'Furniture Removal',
    nicheKey: 'junk',
    headline: 'Same-Day Furniture, Sofa & Mattress Removal',
    description: 'Fast, wall-safe removal of heavy sectionals, sleeper sofas, king mattresses, dressers, and dining sets without lifting a finger.',
    priceRange: '$99 – $350',
    turnaround: 'Same-Day / Next-Day',
    deliverables: [
      'Careful navigation of tight stairs, hallways, and elevators',
      'Single-item pickups or full-room furniture clearouts',
      'Eco-friendly donation or certified mattress recycling',
      'Upfront volume-based pricing before we lift anything',
    ],
    commonProblems: [
      'New furniture delivery arriving tomorrow with old couch still inside',
      'Municipal trash refusing mattresses and bulky upholstery',
      'Heavy sleeper sofas stuck in upstairs bedrooms or basements',
    ],
    faqs: [
      { q: 'Can you remove a single couch or mattress today?', a: 'Yes. We offer single-item minimum pickups with same-day and next-day arrival windows.' },
    ],
  },
  {
    slug: 'construction-debris-removal',
    name: 'Construction & Renovation Debris Removal',
    shortName: 'Construction Debris',
    nicheKey: 'junk',
    headline: 'Fast Construction, Remodel & Contractor Debris Haul-Away',
    description: 'Skip the ugly driveway dumpster. Our crew loads and hauls drywall, lumber, tile, cabinetry, roofing, and deck tear-out debris on demand.',
    priceRange: '$175 – $650 / load',
    turnaround: 'Same-Day Jobsite Pickup',
    deliverables: [
      'Drywall, lumber, flooring, tile, and cabinet haul-away',
      'Yard-safe loading with zero driveway dumpster scratches',
      'Magnet nail sweep of driveways and loading zones',
      'Recurring pickups for contractors and house flippers',
    ],
    commonProblems: [
      'HOA rules prohibiting roll-off dumpsters in driveways',
      'Remodel debris piling up and slowing down subcontractors',
      'Heavy tile, concrete chunks, and old bathroom vanities',
    ],
    faqs: [
      { q: 'Is junk removal cheaper than renting a dumpster?', a: 'For most bathroom/kitchen remodels and partial loads, yes—you only pay for the space your debris uses, and our crew does all the heavy loading.' },
    ],
  },
  {
    slug: 'appliance-scrap-removal',
    name: 'Old Appliance & Scrap Metal Removal',
    shortName: 'Appliance Removal',
    nicheKey: 'junk',
    headline: 'Safe Refrigerator, Washer, Dryer & Scrap Metal Haul-Away',
    description: 'EPA-compliant hauling and recycling of dead refrigerators, deep freezers, washers, dryers, water heaters, and heavy exercise equipment.',
    priceRange: '$99 – $250',
    turnaround: 'Same-Day Available',
    deliverables: [
      'Safe disconnection check and dolly removal off floors',
      'EPA-compliant refrigerant recovery & metal recycling',
      'Treadmill, hot tub, grill, and lawn equipment haul-away',
    ],
    commonProblems: [
      'Broken refrigerator leaking in the garage',
      'Heavy cast-iron appliances or treadmills stuck in basements',
      'Curbside trash refusing Freon-containing units',
    ],
    faqs: [
      { q: 'Do you recycle old metal appliances?', a: 'Yes. Metal appliances are routed to certified scrap and Freon-recovery recyclers rather than dumped in landfills.' },
    ],
  },
  {
    slug: 'garage-attic-cleanout',
    name: 'Garage, Basement & Attic Cleanouts',
    shortName: 'Garage & Attic Cleanouts',
    nicheKey: 'junk',
    headline: 'Reclaim Your Garage, Basement or Attic in One Afternoon',
    description: 'Full-service hauling of years of stored boxes, broken tools, old holiday decor, tires, and clutter—finished with a clean sweep.',
    priceRange: '$225 – $650',
    turnaround: 'Same-Day / 2–4 Hours',
    deliverables: [
      'Complete sorting alongside you (keep vs. haul)',
      'Safe attic ladder and basement stair hauling',
      'Broom sweep of cleared garage and storage bays',
    ],
    commonProblems: [
      'Unable to park cars inside a two-car garage',
      'Musty damp basement clutter attracting pests',
      'Preparing a home for moving day or spring cleaning',
    ],
    faqs: [
      { q: 'How is pricing calculated?', a: 'Pricing is based strictly on how much space your items take in our truck—labor, stairs, fuel, and disposal fees are all included.' },
    ],
  },

  // ==================== APPLIANCE REPAIR ====================
  {
    slug: 'refrigerator-freezer-repair',
    name: 'Refrigerator & Freezer Repair',
    shortName: 'Refrigerator Repair',
    nicheKey: 'appliance',
    headline: 'Same-Day Refrigerator & Freezer Repair',
    description: 'Priority emergency diagnostics for warm fridges, broken compressors, leaking water lines, and frozen ice makers across all major brands.',
    priceRange: '$150 – $480 (diag waived w/ repair)',
    turnaround: 'Priority Same-Day',
    deliverables: [
      'Sealed-system, compressor, and evaporator fan diagnostics',
      'Thermistor, defrost heater, and control board replacement',
      'Ice maker & water inlet valve repair',
      '90-day OEM parts & labor warranty',
    ],
    commonProblems: [
      'Fridge warm while freezer stays cold (evaporator icing)',
      'Loud buzzing or clicking from compressor relay',
      'Water pooling under crisper drawers or leaking onto floor',
    ],
    faqs: [
      { q: 'Do you prioritize warm refrigerators for same-day service?', a: 'Yes. We reserve priority same-day dispatch slots for warm refrigerators and freezers to prevent food spoilage.' },
    ],
  },
  {
    slug: 'washer-dryer-repair',
    name: 'Washer & Dryer Repair',
    shortName: 'Washer & Dryer Repair',
    nicheKey: 'appliance',
    headline: 'Fast Front-Load & Top-Load Washer and Dryer Repair',
    description: 'Expert repairs for leaking washers, drain pump errors, no-heat electric/gas dryers, broken belts, and loud drum bearings.',
    priceRange: '$140 – $380',
    turnaround: 'Same-Day / Next-Day',
    deliverables: [
      'Drain pump, lid switch, and door boot seal replacement',
      'Dryer heating element, thermal fuse, and gas igniter repair',
      'Drum roller, idler pulley, and drive belt rebuilds',
    ],
    commonProblems: [
      'Washer not draining or spinning (OE/5E/F21 error codes)',
      'Dryer tumbling with zero heat or taking 2+ cycles',
      'Loud squealing, thumping, or shaking during spin cycle',
    ],
    faqs: [
      { q: 'Is it worth repairing a 6-year-old washer or dryer?', a: 'Most heating elements, drain pumps, belts, and sensors cost a fraction of a new machine and extend appliance life by 5+ years.' },
    ],
  },
  {
    slug: 'oven-range-stove-repair',
    name: 'Oven, Range & Stove Repair',
    shortName: 'Oven & Stove Repair',
    nicheKey: 'appliance',
    headline: 'Gas & Electric Oven, Range & Cooktop Repair',
    description: 'Precision calibration and repair for gas igniters, electric bake elements, induction cooktops, and wall oven control boards.',
    priceRange: '$150 – $420',
    turnaround: 'Same-Day / Next-Day',
    deliverables: [
      'Gas oven glow-bar igniter & safety valve replacement',
      'Electric bake/broil element and infinite switch repair',
      'Temperature sensor testing and oven calibration',
    ],
    commonProblems: [
      'Gas oven clicking or smelling slightly of gas without lighting',
      'Oven heating unevenly or stuck at 100°F',
      'Glass cooktop burner failing to turn on or regulate heat',
    ],
    faqs: [
      { q: 'Do you repair both gas and dual-fuel luxury ranges?', a: 'Yes. Our technicians service standard gas/electric ranges as well as dual-fuel Wolf, Bosch, KitchenAid, and GE Cafe units.' },
    ],
  },
  {
    slug: 'dishwasher-repair',
    name: 'Dishwasher Repair',
    shortName: 'Dishwasher Repair',
    nicheKey: 'appliance',
    headline: 'Reliable Dishwasher Leak, Drain & Wash Pump Repair',
    description: 'Quick fixes for standing water, cloudy dishes, door leaks, broken soap dispensers, and unresponsive control panels.',
    priceRange: '$140 – $350',
    turnaround: 'Same-Day / Next-Day',
    deliverables: [
      'Circulation wash pump & drain pump replacement',
      'Door gasket, float switch, and inlet valve leak repair',
      'Heater element & control board troubleshooting',
    ],
    commonProblems: [
      'Standing dirty water left in the bottom tub',
      'Water leaking onto kitchen hardwood floors',
      'Dishes coming out dirty, gritty, or soaking wet',
    ],
    faqs: [
      { q: 'Can you fix Bosch E15 and E24 dishwasher errors?', a: 'Yes. We carry OEM drain pumps, base-pan leak sensors, and sump gaskets to clear E15/E24 faults on the first visit.' },
    ],
  },
];

export function getNicheKey(service: string): ServiceSiloData['nicheKey'] | null {
  const s = (service || '').toLowerCase();
  if (s.includes('epoxy') || s.includes('floor')) return 'epoxy';
  if (s.includes('concrete') || s.includes('paving')) return 'concrete';
  if (s.includes('tree')) return 'tree';
  if (s.includes('pest')) return 'pest';
  if (s.includes('junk') || s.includes('removal')) return 'junk';
  if (s.includes('appliance')) return 'appliance';
  return null;
}

export function getServicesForNiche(service: string): ServiceSiloData[] {
  const key = getNicheKey(service);
  if (!key) return [];
  return SERVICE_SILOS.filter((item) => item.nicheKey === key);
}
