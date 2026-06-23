export function getRelevantBlogImage(niche: string, keywords: string[] = [], title: string = '', slug: string = ''): string {
  const normNiche = niche.toLowerCase().trim();
  const searchStr = `${title} ${keywords.join(' ')}`.toLowerCase();

  if (slug) {
    const cleanSlug = slug.toLowerCase().trim();
    if (cleanSlug.startsWith('boise-') || cleanSlug.endsWith('-boise') || cleanSlug.includes('boise')) {
      return `/images/blog/blog-${cleanSlug}.png`;
    }
    if (cleanSlug.includes('tampa') || cleanSlug.includes('epoxy') || cleanSlug.includes('concrete') || cleanSlug.includes('paving') || cleanSlug.includes('tree')) {
      return `/images/blog/blog-${cleanSlug}.png`;
    }
  }

  if (normNiche.includes('appliance')) {
    if (searchStr.includes('fridge') || searchStr.includes('refrigerator') || searchStr.includes('cool') || searchStr.includes('freez') || searchStr.includes('cold') || searchStr.includes('food')) {
      return '/images/blog/blog-appliance-fridge.png';
    }
    if (searchStr.includes('washer') || searchStr.includes('washing') || searchStr.includes('laundry') || searchStr.includes('flood') || searchStr.includes('water')) {
      return '/images/blog/blog-appliance-washer.png';
    }
    if (searchStr.includes('dryer') || searchStr.includes('heat') || searchStr.includes('hot') || searchStr.includes('lint') || searchStr.includes('spin')) {
      return '/images/blog/blog-appliance-dryer.png';
    }
    if (searchStr.includes('dishwasher') || searchStr.includes('dish') || searchStr.includes('clean') || searchStr.includes('wash') || searchStr.includes('drain')) {
      return '/images/blog/blog-appliance-dishwasher.png';
    }
    if (searchStr.includes('oven') || searchStr.includes('stove') || searchStr.includes('range') || searchStr.includes('cook') || searchStr.includes('bake') || searchStr.includes('burn')) {
      return '/images/blog/blog-appliance-oven.png';
    }
    if (searchStr.includes('tool') || searchStr.includes('breakthrough') || searchStr.includes('fix') || searchStr.includes('tech') || searchStr.includes('diagnos') || searchStr.includes('check')) {
      return '/images/blog/blog-appliance-tools.png';
    }
    if (searchStr.includes('efficiency') || searchStr.includes('bill') || searchStr.includes('save') || searchStr.includes('saving') || searchStr.includes('power')) {
      return '/images/appliance-gallery.png';
    }
    if (searchStr.includes('noise') || searchStr.includes('sound') || searchStr.includes('leak') || searchStr.includes('strange') || searchStr.includes('smell')) {
      return '/images/appliance-about.png';
    }
    return '/images/appliance-hero.png';
  }

  if (normNiche.includes('epoxy') || normNiche.includes('flooring')) {
    if (searchStr.includes('finish') || searchStr.includes('seal') || searchStr.includes('design') || searchStr.includes('benefit') || searchStr.includes('care') || searchStr.includes('cost')) {
      return '/images/blog/blog-epoxy-finished.png';
    }
    if (searchStr.includes('prep') || searchStr.includes('install') || searchStr.includes('clean') || searchStr.includes('diy')) {
      return '/images/blog/blog-epoxy-prep.png';
    }
    if (searchStr.includes('repair') || searchStr.includes('crack') || searchStr.includes('fix') || searchStr.includes('problem') || searchStr.includes('trouble')) {
      return '/images/blog/blog-epoxy-repair.png';
    }
    return '/images/epoxy-hero.png';
  }

  if (normNiche.includes('paving') || normNiche.includes('concrete')) {
    if (searchStr.includes('pour') || searchStr.includes('install') || searchStr.includes('laying') || searchStr.includes('mix')) {
      return '/images/blog/blog-concrete-pouring.png';
    }
    if (searchStr.includes('seal') || searchStr.includes('protect') || searchStr.includes('maintenance') || searchStr.includes('care')) {
      return '/images/blog/blog-concrete-sealing.png';
    }
    if (searchStr.includes('paver') || searchStr.includes('stone') || searchStr.includes('brick') || searchStr.includes('patio')) {
      return '/images/blog/blog-paving-pavers.png';
    }
    return '/images/paving-hero.png';
  }

  if (normNiche.includes('tree')) {
    if (searchStr.includes('plant') || searchStr.includes('grow') || searchStr.includes('fertilize') || searchStr.includes('soil')) {
      return '/images/blog/blog-tree-planting.png';
    }
    if (searchStr.includes('prun') || searchStr.includes('trim') || searchStr.includes('cut') || searchStr.includes('lop') || searchStr.includes('branch')) {
      return '/images/blog/blog-tree-pruning.png';
    }
    if (searchStr.includes('storm') || searchStr.includes('emergency') || searchStr.includes('fall') || searchStr.includes('wind') || searchStr.includes('dead') || searchStr.includes('danger')) {
      return '/images/blog/blog-tree-storm.png';
    }
    return '/images/tree-hero.png';
  }

  if (normNiche.includes('junk')) {
    return '/images/junk-removal-hero.png';
  }

  // Fallback default
  return '/images/appliance-gallery.png';
}
