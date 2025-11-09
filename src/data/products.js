const products = [
  {
    name: 'iPhone',
    slug: 'iphone',
    category: 'Consumer Electronics',
    headline: 'A flagship smartphone composed of rare earths, precision glass, and intricate assembly lines.',
    palette: {
      primary: '#ff8a8a',
      secondary: '#ffd36b',
      accent: '#8ae6ff'
    },
    stats: {
      waste: {
        value: '69 kg CO₂e',
        description: 'Total carbon footprint across mining, manufacturing, and logistics.'
      },
      labor: {
        value: '~1,300 people',
        description: 'Touchpoints across miners, component specialists, assemblers, and logistics teams.'
      },
      time: {
        value: '90 days',
        description: 'From raw ore extraction to packaging and retail distribution.'
      }
    },
    supplyChain: [
      'Rare earth mining in China and the Democratic Republic of Congo',
      'Wafer fabrication in Taiwan and South Korea',
      'Assembly in Zhengzhou, China',
      'Global distribution to over 100 countries'
    ],
    highlights: [
      'Precision robotics align sub-millimeter tolerances for circuitry.',
      'Over 40% of energy usage happens during chip fabrication.',
      'Recycling programs recover gold, cobalt, and aluminum frames.'
    ]
  },
  {
    name: 'T‑Shirt',
    slug: 'tshirt',
    category: 'Apparel',
    headline: 'A seemingly simple garment with a supply chain that touches cotton fields, dye houses, and sewing floors.',
    palette: {
      primary: '#ffd36b',
      secondary: '#ff8a8a',
      accent: '#8ae6ff'
    },
    stats: {
      waste: {
        value: '2,700 L water',
        description: 'Primarily consumed during cotton cultivation and dyeing.'
      },
      labor: {
        value: '~120 people',
        description: 'From farmers and ginners to dyers, cutters, and quality control teams.'
      },
      time: {
        value: '21 days',
        description: 'Covers fiber harvesting, milling, dyeing, sewing, and global shipping.'
      }
    },
    supplyChain: [
      'Cotton harvesting in India, the US, or Uzbekistan',
      'Spinning and weaving in Bangladesh or Vietnam',
      'Dyeing and finishing in chemical-intensive facilities',
      'Sewing in garment factories before global export'
    ],
    highlights: [
      'Organic cotton can cut water use by up to 90%.',
      'Dye houses often operate 24/7 to meet fast fashion demand.',
      'Automated cutting reduces fabric waste by 15-20%.'
    ]
  },
  {
    name: 'Electric Car',
    slug: 'car',
    category: 'Transportation',
    headline: 'An electric vehicle that merges battery chemistry, robotics, and massive supplier ecosystems.',
    palette: {
      primary: '#8ae6ff',
      secondary: '#a08aff',
      accent: '#ffd36b'
    },
    stats: {
      waste: {
        value: '8 t CO₂e',
        description: 'Manufacturing footprint with battery pack production dominating.'
      },
      labor: {
        value: '~30,000 people',
        description: 'Tiered suppliers provide over 30,000 unique parts spanning metals to software.'
      },
      time: {
        value: '6–12 months',
        description: 'From ore extraction and stamping to software validation and delivery.'
      }
    },
    supplyChain: [
      'Lithium and nickel mining in Australia and South America',
      'Battery cell fabrication in gigafactories',
      'Body stamping and paint in high-automation plants',
      'Final assembly with advanced driver assistance calibration'
    ],
    highlights: [
      'Battery packs account for nearly 50% of embedded emissions.',
      'Robots install components with ±0.2 mm accuracy.',
      'Second-life batteries power grid storage after vehicle retirement.'
    ]
  },
  {
    name: 'Gourmet Hamburger',
    slug: 'hamburger',
    category: 'Food',
    headline: 'A culinary classic built on agricultural cycles, cold-chain logistics, and meticulous prep.',
    palette: {
      primary: '#ff9bf5',
      secondary: '#ffd36b',
      accent: '#ff8a8a'
    },
    stats: {
      waste: {
        value: '3.1 kg CO₂e',
        description: 'Methane emissions from cattle and transport dominate its footprint.'
      },
      labor: {
        value: '~60 people',
        description: 'From ranchers and butchers to bakers, produce farmers, and chefs.'
      },
      time: {
        value: '30 days',
        description: 'Accounts for cattle feed finishing, ingredient prep, and kitchen execution.'
      }
    },
    supplyChain: [
      'Cattle raised across ranches in the Americas',
      'Processing in USDA-certified facilities',
      'Artisanal bun baking and local produce sourcing',
      'Restaurant cold-chain, grilling, and plating'
    ],
    highlights: [
      'Regenerative grazing can cut emissions by sequestering soil carbon.',
      'Flash-freezing patties preserves texture with minimal ice crystals.',
      'High-end kitchens stage ingredients to under 10-minute assembly.'
    ]
  },
  {
    name: '4K Television',
    slug: 'television',
    category: 'Home Entertainment',
    headline: 'An ultra-high-definition display that blends glassmaking, semiconductor logic, and meticulous calibration.',
    palette: {
      primary: '#a08aff',
      secondary: '#8ae6ff',
      accent: '#ffd36b'
    },
    stats: {
      waste: {
        value: '350 kg CO₂e',
        description: 'Panel fabrication and backlight manufacturing are the emission hotspots.'
      },
      labor: {
        value: '~4,500 people',
        description: 'Includes glassmakers, PCB assemblers, optical engineers, and logistics staff.'
      },
      time: {
        value: '75 days',
        description: 'Panel deposition, electronics assembly, and containerized shipping.'
      }
    },
    supplyChain: [
      'Glass substrate production in South Korea or Japan',
      'Thin-film transistor deposition in cleanrooms',
      'Optical layer stacking and calibration',
      'Global shipping with protective packaging and QA'
    ],
    highlights: [
      'Nanometer-thick transistors are deposited onto massive sheets before cutting.',
      'Quantum dot layers precisely control color accuracy.',
      'Calibration labs simulate living-room lighting before shipment.'
    ]
  },
  {
    name: 'Smart Fridge',
    slug: 'fridge',
    category: 'Appliances',
    headline: 'An intelligent refrigerator combining thermal engineering, IoT sensors, and refrigerant handling.',
    palette: {
      primary: '#8ae6ff',
      secondary: '#ff9bf5',
      accent: '#ffd36b'
    },
    stats: {
      waste: {
        value: '680 kg CO₂e',
        description: 'Steel forming, foam insulation, and compressors drive the footprint.'
      },
      labor: {
        value: '~2,800 people',
        description: 'Spanning sheet-metal workers, electronics teams, software developers, and installers.'
      },
      time: {
        value: '110 days',
        description: 'Covers material sourcing, assembly, testing, and freight.'
      }
    },
    supplyChain: [
      'Cold-rolled steel and aluminum fabrication',
      'Compressor and coolant circuit assembly',
      'Smart display integration and firmware flashing',
      'Global logistics requiring controlled upright transport'
    ],
    highlights: [
      'Vacuum-insulated panels increase efficiency by 25% compared to legacy foam.',
      'Predictive algorithms monitor door openings and auto-adjust cooling.',
      'End-of-life refrigerant recovery prevents potent greenhouse gas leaks.'
    ]
  }
];

export default products;

