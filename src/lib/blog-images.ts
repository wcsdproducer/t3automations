export function getRelevantBlogImage(niche: string, keywords: string[] = [], title: string = ''): string {
  const normNiche = niche.toLowerCase().trim();
  const searchStr = `${title} ${keywords.join(' ')}`.toLowerCase();

  if (normNiche.includes('appliance')) {
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
