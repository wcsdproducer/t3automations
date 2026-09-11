export interface BrandData {
  slug: string;
  name: string;
  category: string;
  description: string;
  popularAppliances: string[];
  commonIssues: string[];
}

export const APPLIANCE_BRANDS: BrandData[] = [
  {
    slug: 'samsung-appliance-repair',
    name: 'Samsung',
    category: 'Appliance Repair',
    description: 'Specialized Samsung appliance diagnostic and repair services. From French-door refrigerators to high-efficiency Smart Inverter washers.',
    popularAppliances: ['French Door Refrigerators', 'Front Load Washers', 'Electric & Gas Dryers', 'Smart Dial Ovens', 'Linear Wash Dishwashers'],
    commonIssues: ['Ice maker freezing over', 'Drain pump error codes (5E/ND)', 'No heat on dryer (HE error)', 'Oven temperature inaccurate']
  },
  {
    slug: 'lg-appliance-repair',
    name: 'LG',
    category: 'Appliance Repair',
    description: 'Expert LG Linear Compressor refrigerator, TurboWash washer, and TrueConvection oven repairs by certified technicians.',
    popularAppliances: ['InstaView Refrigerators', 'ThinQ Smart Washers', 'Direct Drive Dryers', 'QuadWash Dishwashers', 'ProBake Convection Ranges'],
    commonIssues: ['Linear compressor cooling failure', 'OE drain error', 'dE door lock sensor failure', 'LE motor sensor error']
  },
  {
    slug: 'whirlpool-appliance-repair',
    name: 'Whirlpool',
    category: 'Appliance Repair',
    description: 'Factory-grade Whirlpool appliance troubleshooting with genuine OEM replacement parts for refrigerators, stoves, and laundry machines.',
    popularAppliances: ['Top Mount & Side-by-Side Refrigerators', 'Cabrio Top Load Washers', 'Duet Dryers', 'Gold Series Dishwashers', 'Gas Ranges'],
    commonIssues: ['Washing machine lid lock failure', 'Dryer thermal fuse burnout', 'Dishwasher not filling with water', 'Defrost thermostat failure']
  },
  {
    slug: 'sub-zero-appliance-repair',
    name: 'Sub-Zero & Wolf',
    category: 'Appliance Repair',
    description: 'Premium luxury refrigeration and cooking equipment repairs. Preserving precision temperatures for Sub-Zero built-ins and Wolf dual-fuel ranges.',
    popularAppliances: ['Built-In Classic Refrigerators', 'PRO Series Freezers', 'Wine Storage Units', 'Wolf Dual-Fuel Ranges', 'Wolf Convection Ovens'],
    commonIssues: ['Vacuum condenser alert', 'Dual compressor temperature drift', 'Gasket air leaks', 'Igniter clicking continuously']
  },
  {
    slug: 'bosch-appliance-repair',
    name: 'Bosch',
    category: 'Appliance Repair',
    description: 'Certified precision repairs for German-engineered Bosch dishwashers, silent laundry sets, and built-in induction cooktops.',
    popularAppliances: ['800 Series Dishwashers', 'Compact Front-Load Washers', 'Condensation Dryers', 'Benchmark Wall Ovens', 'Induction Cooktops'],
    commonIssues: ['E15 water leak protection alarm', 'E24 drain pump blocked', 'No heat on dry cycle (Zeolith error)', 'Touch control panel unresponsive']
  },
  {
    slug: 'ge-appliance-repair',
    name: 'GE Appliances',
    category: 'Appliance Repair',
    description: 'Comprehensive GE, GE Profile, and Cafe series diagnostic repairs. Restoring reliable everyday operation with OEM components.',
    popularAppliances: ['GE Profile Refrigerators', 'UltraFresh Front Load Washers', 'Advantium Speedcook Ovens', 'Cafe Series Ranges', 'Profile Dryers'],
    commonIssues: ['Evaporator fan motor noise', 'Washer drum balancing error', 'Surface burner not sparking', 'Dryer belt snapped']
  },
  {
    slug: 'maytag-appliance-repair',
    name: 'Maytag',
    category: 'Appliance Repair',
    description: 'Heavy-duty commercial-grade Maytag appliance repairs. Dependable parts and rapid turnaround for washers, dryers, and dishwashers.',
    popularAppliances: ['Commercial Grade Top Load Washers', 'Bravos XL Dryers', 'Dual Power Filtration Dishwashers', 'Double Oven Gas Ranges'],
    commonIssues: ['Agitator stripped', 'Drive belt failure', 'Control board cycle stoppage', 'Heating element burned out']
  },
  {
    slug: 'kitchenaid-appliance-repair',
    name: 'KitchenAid',
    category: 'Appliance Repair',
    description: 'Professional-tier KitchenAid appliance troubleshooting for built-in refrigerators, whisper-quiet dishwashers, and culinary ranges.',
    popularAppliances: ['PrintShield Built-In Refrigerators', 'FreeFlex Third Rack Dishwashers', 'Commercial-Style Dual Fuel Ranges', 'Built-In Microwave Drawers'],
    commonIssues: ['Freezer evaporator icing', 'Upper spray arm detachment', 'Oven cooling fan continuous run', 'Gas igniter electrode weak']
  },
  {
    slug: 'frigidaire-appliance-repair',
    name: 'Frigidaire',
    category: 'Appliance Repair',
    description: 'Affordable, same-day Frigidaire and Frigidaire Gallery appliance repairs for refrigerators, laundry, and stoves.',
    popularAppliances: ['Gallery French Door Fridges', 'Front Load Laundry Sets', 'Induction Ranges', 'Built-In Dishwashers', 'Chest Freezers'],
    commonIssues: ['SY CF communication error code', 'Defrost heater coil open', 'Washer door boot seal mold/tear', 'Oven bake element burned']
  }
];

export function getBrandsForNiche(niche: string): BrandData[] {
  const norm = (niche || '').toLowerCase();
  if (norm.includes('appliance')) {
    return APPLIANCE_BRANDS;
  }
  return [];
}
