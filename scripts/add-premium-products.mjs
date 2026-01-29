import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vhxqmtgrfjdaubtsbpqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeHFtdGdyZmpkYXVidHNicHF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU0NzkzMiwiZXhwIjoyMDg0MTIzOTMyfQ.EuWjsJbsutiWeCP73sKI6HGOBYYqayvXFIF1RgtX3Go'
);

const products = [
  {
    sku: 'LAPTOP-ROG-G16',
    name: 'ASUS ROG Strix G16 Gaming Laptop',
    description: 'Unleash your gaming potential with the ASUS ROG Strix G16. Featuring the latest Intel Core i9 processor and NVIDIA RTX 4070, this beast handles any game at ultra settings. The 165Hz display ensures buttery-smooth gameplay while the RGB keyboard adds style to your setup.',
    category_id: 'b504857f-426e-4a25-8a32-47142c322e37',
    cost_price: 385000,
    selling_price: 449999,
    stock_quantity: 5,
    reorder_level: 2,
    specifications: {
      'Brand': 'ASUS',
      'Model': 'ROG Strix G16 G614JV',
      'Processor': 'Intel Core i9-13980HX',
      'RAM': '32GB DDR5 4800MHz',
      'Storage': '1TB NVMe PCIe 4.0 SSD',
      'Graphics': 'NVIDIA GeForce RTX 4070 8GB',
      'Display': '16" QHD+ 165Hz IPS',
      'Battery': '90Wh, 4-Cell',
      'OS': 'Windows 11 Home',
      'Warranty': '2 Years'
    }
  },
  {
    sku: 'LAPTOP-MACBOOK-PRO-14',
    name: 'Apple MacBook Pro 14" M3 Pro',
    description: 'The most advanced MacBook Pro ever. With the M3 Pro chip, up to 18 hours of battery life, and a stunning Liquid Retina XDR display, this is the ultimate tool for professionals and creators.',
    category_id: 'b504857f-426e-4a25-8a32-47142c322e37',
    cost_price: 520000,
    selling_price: 599999,
    stock_quantity: 3,
    reorder_level: 2,
    specifications: {
      'Brand': 'Apple',
      'Model': 'MacBook Pro 14-inch',
      'Chip': 'Apple M3 Pro (11-core CPU, 14-core GPU)',
      'RAM': '18GB Unified Memory',
      'Storage': '512GB SSD',
      'Display': '14.2" Liquid Retina XDR',
      'Battery': 'Up to 18 hours',
      'Ports': '3x Thunderbolt 4, HDMI, SD, MagSafe 3',
      'Color': 'Space Black',
      'Warranty': '1 Year Apple Care'
    }
  },
  {
    sku: 'DESKTOP-CUSTOM-GAMING',
    name: 'Apex Gaming PC - RTX 4080 Beast',
    description: 'Custom-built gaming powerhouse designed for 4K gaming excellence. Features premium components, liquid cooling, and RGB lighting. Ready to dominate any game at maximum settings.',
    category_id: '12353d6e-9fb8-4763-a928-71979284fa67',
    cost_price: 480000,
    selling_price: 565000,
    stock_quantity: 2,
    reorder_level: 1,
    specifications: {
      'Processor': 'Intel Core i7-14700K',
      'Motherboard': 'ASUS ROG STRIX Z790-E',
      'RAM': '64GB DDR5 6000MHz RGB',
      'Graphics': 'NVIDIA RTX 4080 SUPER 16GB',
      'Storage': '2TB NVMe SSD + 4TB HDD',
      'Cooling': '360mm AIO Liquid Cooler',
      'PSU': '1000W 80+ Gold',
      'Case': 'Lian Li O11 Dynamic',
      'OS': 'Windows 11 Pro',
      'Warranty': '3 Years Parts & Labor'
    }
  },
  {
    sku: 'MONITOR-SAMSUNG-G7-32',
    name: 'Samsung Odyssey G7 32" Curved Gaming Monitor',
    description: 'Immerse yourself in curved gaming perfection. The 1000R curve matches the human eye for comfortable, immersive gaming. QLED technology delivers vivid colors while 240Hz ensures competitive advantage.',
    category_id: '46ea6c18-bb11-4b0b-bfd8-6155c77a90bf',
    cost_price: 115000,
    selling_price: 139900,
    stock_quantity: 8,
    reorder_level: 3,
    specifications: {
      'Brand': 'Samsung',
      'Model': 'Odyssey G7 LC32G75T',
      'Screen Size': '32 inches',
      'Resolution': '2560x1440 (QHD)',
      'Refresh Rate': '240Hz',
      'Response Time': '1ms GTG',
      'Panel Type': 'VA QLED Curved (1000R)',
      'HDR': 'HDR600',
      'Ports': '2x HDMI 2.0, 1x DisplayPort 1.4',
      'Features': 'G-Sync Compatible, FreeSync Premium Pro'
    }
  },
  {
    sku: 'MONITOR-LG-4K-27',
    name: 'LG UltraFine 27" 4K IPS Monitor',
    description: 'Professional-grade 4K monitor with exceptional color accuracy. Perfect for designers, photographers, and content creators who demand the best visual experience.',
    category_id: '46ea6c18-bb11-4b0b-bfd8-6155c77a90bf',
    cost_price: 85000,
    selling_price: 99900,
    stock_quantity: 6,
    reorder_level: 2,
    specifications: {
      'Brand': 'LG',
      'Model': '27UP850N-W',
      'Screen Size': '27 inches',
      'Resolution': '3840x2160 (4K UHD)',
      'Panel Type': 'IPS',
      'Color Gamut': '95% DCI-P3',
      'HDR': 'VESA DisplayHDR 400',
      'Ports': 'HDMI, DisplayPort, USB-C 96W PD',
      'Features': 'Height Adjustable, Pivot, AMD FreeSync',
      'Warranty': '3 Years'
    }
  },
  {
    sku: 'GPU-RTX4070TI-ASUS',
    name: 'ASUS ROG STRIX RTX 4070 Ti SUPER OC',
    description: 'Dominate in style with the ROG STRIX RTX 4070 Ti SUPER. Featuring an axial-tech fan design, MaxContact technology, and military-grade capacitors for extreme performance and durability.',
    category_id: 'b02e7059-532a-44d3-9c15-8ec2971042a6',
    cost_price: 185000,
    selling_price: 219900,
    stock_quantity: 4,
    reorder_level: 2,
    specifications: {
      'Brand': 'ASUS',
      'Model': 'ROG STRIX RTX 4070 Ti SUPER OC',
      'GPU': 'NVIDIA GeForce RTX 4070 Ti SUPER',
      'VRAM': '16GB GDDR6X',
      'Boost Clock': '2670 MHz (OC Mode)',
      'CUDA Cores': '8448',
      'Ray Tracing': '3rd Gen RT Cores',
      'Cooling': 'Axial-tech 3-Fan Design',
      'Power': '285W TDP, 16-pin connector',
      'Warranty': '4 Years'
    }
  },
  {
    sku: 'GPU-RTX4060-MSI',
    name: 'MSI GeForce RTX 4060 GAMING X 8GB',
    description: 'The perfect 1080p gaming graphics card. DLSS 3 Frame Generation support, excellent power efficiency, and MSI proven cooling solution makes this ideal for compact builds.',
    category_id: 'b02e7059-532a-44d3-9c15-8ec2971042a6',
    cost_price: 68000,
    selling_price: 82500,
    stock_quantity: 10,
    reorder_level: 4,
    specifications: {
      'Brand': 'MSI',
      'Model': 'GeForce RTX 4060 GAMING X',
      'GPU': 'NVIDIA GeForce RTX 4060',
      'VRAM': '8GB GDDR6',
      'Boost Clock': '2595 MHz',
      'CUDA Cores': '3072',
      'Ray Tracing': '3rd Gen RT Cores',
      'Cooling': 'TWIN FROZR 9 Thermal Design',
      'Power': '115W TDP',
      'Warranty': '3 Years'
    }
  },
  {
    sku: 'RAM-CORSAIR-32GB-DDR5',
    name: 'Corsair Vengeance RGB DDR5 32GB Kit (2x16GB)',
    description: 'High-performance DDR5 memory with stunning RGB lighting. Optimized for Intel and AMD platforms with tight timings and high frequencies for maximum performance.',
    category_id: 'c0825c41-a45d-4b31-8d70-0f2ddb03921b',
    cost_price: 32000,
    selling_price: 39500,
    stock_quantity: 15,
    reorder_level: 5,
    specifications: {
      'Brand': 'Corsair',
      'Model': 'Vengeance RGB DDR5',
      'Capacity': '32GB (2x16GB)',
      'Speed': '6000MHz',
      'Timings': 'CL36-36-36-76',
      'Voltage': '1.35V',
      'Type': 'DDR5',
      'RGB': 'Dynamic RGB Lighting',
      'Compatibility': 'Intel XMP 3.0, AMD EXPO',
      'Warranty': 'Lifetime'
    }
  },
  {
    sku: 'RAM-KINGSTON-16GB-DDR4',
    name: 'Kingston FURY Beast 16GB DDR4 3200MHz',
    description: 'Reliable high-performance DDR4 memory perfect for gaming and content creation. Plug and play with automatic XMP optimization.',
    category_id: 'c0825c41-a45d-4b31-8d70-0f2ddb03921b',
    cost_price: 9500,
    selling_price: 12500,
    stock_quantity: 25,
    reorder_level: 8,
    specifications: {
      'Brand': 'Kingston',
      'Model': 'FURY Beast',
      'Capacity': '16GB (1x16GB)',
      'Speed': '3200MHz',
      'Timings': 'CL16',
      'Voltage': '1.35V',
      'Type': 'DDR4',
      'Heat Spreader': 'Low-Profile Aluminum',
      'Compatibility': 'Intel XMP',
      'Warranty': 'Lifetime'
    }
  },
  {
    sku: 'SSD-SAMSUNG-990PRO-2TB',
    name: 'Samsung 990 PRO 2TB NVMe M.2 SSD',
    description: 'The fastest consumer SSD ever made. Blazing 7,450MB/s read speeds with smart thermal solution. Perfect for gamers and professionals who demand the ultimate storage performance.',
    category_id: 'dccd257e-8534-425d-9a60-45baaabe63c6',
    cost_price: 42000,
    selling_price: 52900,
    stock_quantity: 12,
    reorder_level: 4,
    specifications: {
      'Brand': 'Samsung',
      'Model': '990 PRO',
      'Capacity': '2TB',
      'Interface': 'PCIe 4.0 x4 NVMe',
      'Form Factor': 'M.2 2280',
      'Read Speed': '7,450 MB/s',
      'Write Speed': '6,900 MB/s',
      'TBW': '1,200 TB',
      'Controller': 'Samsung Pascal',
      'Warranty': '5 Years'
    }
  },
  {
    sku: 'SSD-WD-BLACK-1TB',
    name: 'WD Black SN850X 1TB NVMe SSD',
    description: 'Built for gaming, the WD Black SN850X delivers blazing-fast speeds with Game Mode 2.0 for predictive loading. RGB heatsink keeps temperatures low during intense sessions.',
    category_id: 'dccd257e-8534-425d-9a60-45baaabe63c6',
    cost_price: 22000,
    selling_price: 28900,
    stock_quantity: 18,
    reorder_level: 5,
    specifications: {
      'Brand': 'Western Digital',
      'Model': 'WD Black SN850X',
      'Capacity': '1TB',
      'Interface': 'PCIe Gen4 x4 NVMe',
      'Form Factor': 'M.2 2280',
      'Read Speed': '7,300 MB/s',
      'Write Speed': '6,300 MB/s',
      'TBW': '600 TB',
      'Features': 'Game Mode 2.0, RGB Heatsink',
      'Warranty': '5 Years'
    }
  },
  {
    sku: 'KB-LOGITECH-G915',
    name: 'Logitech G915 TKL Wireless Mechanical Keyboard',
    description: 'Ultra-thin, wireless mechanical gaming keyboard with LIGHTSPEED technology for pro-grade performance. GL switches provide tactile feedback in an incredibly slim profile.',
    category_id: '0befb9e1-d1ed-4b79-86d5-7c0f8079dab9',
    cost_price: 38000,
    selling_price: 46500,
    stock_quantity: 7,
    reorder_level: 3,
    specifications: {
      'Brand': 'Logitech',
      'Model': 'G915 TKL',
      'Layout': 'Tenkeyless (TKL)',
      'Switch Type': 'GL Tactile (Low Profile)',
      'Connection': 'LIGHTSPEED Wireless / Bluetooth / USB',
      'Battery': '40 hours (RGB on)',
      'RGB': 'LIGHTSYNC RGB per-key',
      'Features': 'Aircraft-grade aluminum, Media controls',
      'Compatibility': 'Windows, macOS',
      'Warranty': '2 Years'
    }
  },
  {
    sku: 'KB-RAZER-HUNTSMAN-V3',
    name: 'Razer Huntsman V3 Pro Analog Keyboard',
    description: 'The worlds fastest keyboard with adjustable actuation. Razer Analog Optical Switches provide unprecedented control with adjustable actuation from 0.1mm to 4.0mm.',
    category_id: '0befb9e1-d1ed-4b79-86d5-7c0f8079dab9',
    cost_price: 42000,
    selling_price: 52900,
    stock_quantity: 5,
    reorder_level: 2,
    specifications: {
      'Brand': 'Razer',
      'Model': 'Huntsman V3 Pro',
      'Layout': 'Full Size',
      'Switch Type': 'Razer Analog Optical Gen-2',
      'Actuation': 'Adjustable 0.1mm - 4.0mm',
      'Connection': 'USB-C (Detachable)',
      'RGB': 'Razer Chroma RGB per-key',
      'Features': 'Magnetic Wrist Rest, Media Dial',
      'Keycaps': 'Doubleshot PBT',
      'Warranty': '2 Years'
    }
  },
  {
    sku: 'MOUSE-LOGITECH-G-PRO-X',
    name: 'Logitech G PRO X SUPERLIGHT 2 Wireless Mouse',
    description: 'The lightest PRO mouse ever at just 60g. LIGHTSPEED wireless, HERO 2 sensor with 44K DPI, and 95 hours of battery life. The choice of esports professionals worldwide.',
    category_id: '67cb8adb-6d7d-4cf0-b0ea-297726547db5',
    cost_price: 28000,
    selling_price: 34900,
    stock_quantity: 12,
    reorder_level: 4,
    specifications: {
      'Brand': 'Logitech',
      'Model': 'G PRO X SUPERLIGHT 2',
      'Weight': '60g',
      'Sensor': 'HERO 2 (44,000 DPI)',
      'Connection': 'LIGHTSPEED Wireless',
      'Battery': '95 hours',
      'Switches': 'LIGHTFORCE Hybrid Switches',
      'Polling Rate': '4000Hz',
      'Feet': 'PTFE',
      'Warranty': '2 Years'
    }
  },
  {
    sku: 'MOUSE-RAZER-DEATHADDER-V3',
    name: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse',
    description: 'The iconic ergonomic shape, perfected. Ultra-lightweight at 63g with Focus Pro 30K optical sensor. 90 hours battery life and HyperSpeed wireless technology.',
    category_id: '67cb8adb-6d7d-4cf0-b0ea-297726547db5',
    cost_price: 25000,
    selling_price: 32500,
    stock_quantity: 10,
    reorder_level: 4,
    specifications: {
      'Brand': 'Razer',
      'Model': 'DeathAdder V3 Pro',
      'Weight': '63g',
      'Sensor': 'Focus Pro 30K Optical',
      'Connection': 'HyperSpeed Wireless / USB-C',
      'Battery': '90 hours',
      'Switches': 'Optical Gen-3 (90M clicks)',
      'Polling Rate': '4000Hz (with dongle)',
      'Shape': 'Ergonomic Right-handed',
      'Warranty': '2 Years'
    }
  },
  {
    sku: 'CPU-INTEL-I9-14900K',
    name: 'Intel Core i9-14900K Processor',
    description: 'The ultimate desktop processor for gamers and creators. 24 cores, 32 threads, up to 6.0 GHz boost clock. Unlocked for overclocking with best-in-class single-threaded performance.',
    category_id: '79651261-648b-487e-99cf-19a3adae2407',
    cost_price: 125000,
    selling_price: 149900,
    stock_quantity: 6,
    reorder_level: 2,
    specifications: {
      'Brand': 'Intel',
      'Model': 'Core i9-14900K',
      'Cores': '24 (8P + 16E)',
      'Threads': '32',
      'Base Clock': '3.2 GHz (P-cores)',
      'Boost Clock': 'Up to 6.0 GHz',
      'Cache': '36MB Intel Smart Cache',
      'TDP': '125W (253W Turbo)',
      'Socket': 'LGA 1700',
      'Warranty': '3 Years'
    }
  },
  {
    sku: 'CPU-AMD-R9-7950X3D',
    name: 'AMD Ryzen 9 7950X3D Processor',
    description: 'The worlds fastest gaming processor with 3D V-Cache technology. 16 cores, 32 threads, 144MB total cache. Unmatched gaming performance meets content creation power.',
    category_id: '79651261-648b-487e-99cf-19a3adae2407',
    cost_price: 135000,
    selling_price: 165000,
    stock_quantity: 4,
    reorder_level: 2,
    specifications: {
      'Brand': 'AMD',
      'Model': 'Ryzen 9 7950X3D',
      'Cores': '16',
      'Threads': '32',
      'Base Clock': '4.2 GHz',
      'Boost Clock': 'Up to 5.7 GHz',
      'Cache': '144MB (64MB 3D V-Cache)',
      'TDP': '120W',
      'Socket': 'AM5',
      'Warranty': '3 Years'
    }
  },
  {
    sku: 'ROUTER-ASUS-AXE16000',
    name: 'ASUS ROG Rapture GT-AXE16000 WiFi 6E Router',
    description: 'Quad-band WiFi 6E gaming router with dedicated gaming port and VPN Fusion. 2.5G WAN/LAN ports for blazing-fast wired connections. AiMesh compatible for whole-home coverage.',
    category_id: '69473bfa-a116-4b89-bceb-b52463a133a0',
    cost_price: 98000,
    selling_price: 125000,
    stock_quantity: 3,
    reorder_level: 1,
    specifications: {
      'Brand': 'ASUS',
      'Model': 'ROG Rapture GT-AXE16000',
      'WiFi Standard': 'WiFi 6E (802.11ax)',
      'Bands': 'Quad-Band',
      'Speed': 'Up to 16,000 Mbps',
      'Ports': '2x 10G, 4x 2.5G LAN, 1x 2.5G WAN',
      'Processor': '2.0 GHz Quad-Core',
      'Features': 'AiMesh, VPN Fusion, Game Acceleration',
      'Coverage': 'Up to 5,000 sq ft',
      'Warranty': '3 Years'
    }
  },
  {
    sku: 'ROUTER-TP-LINK-AX6000',
    name: 'TP-Link Archer AX6000 WiFi 6 Router',
    description: 'High-performance WiFi 6 router with 8 streams and 6,000 Mbps combined speed. 2.5G WAN port for gigabit+ internet. Easy setup with TP-Link Tether app.',
    category_id: '69473bfa-a116-4b89-bceb-b52463a133a0',
    cost_price: 32000,
    selling_price: 42500,
    stock_quantity: 8,
    reorder_level: 3,
    specifications: {
      'Brand': 'TP-Link',
      'Model': 'Archer AX6000',
      'WiFi Standard': 'WiFi 6 (802.11ax)',
      'Bands': 'Dual-Band',
      'Speed': '6,000 Mbps (1148 + 4804)',
      'Ports': '8x Gigabit LAN, 1x 2.5G WAN, 2x USB 3.0',
      'Processor': '1.8 GHz Quad-Core',
      'Features': 'OFDMA, MU-MIMO, HomeCare Security',
      'Coverage': 'Up to 4,000 sq ft',
      'Warranty': '2 Years'
    }
  },
  {
    sku: 'HEADSET-STEELSERIES-PRO',
    name: 'SteelSeries Arctis Nova Pro Wireless Headset',
    description: 'Premium wireless gaming headset with active noise cancellation, hot-swappable batteries, and simultaneous 2.4GHz + Bluetooth connection. Hi-Res certified audio for audiophile-grade sound.',
    category_id: '8c46a120-ba97-4c8b-b551-622f59f08c9e',
    cost_price: 62000,
    selling_price: 79900,
    stock_quantity: 6,
    reorder_level: 2,
    specifications: {
      'Brand': 'SteelSeries',
      'Model': 'Arctis Nova Pro Wireless',
      'Driver': '40mm Premium Hi-Fi',
      'Frequency': '10 - 40,000 Hz',
      'ANC': '4-mic Hybrid Active Noise Cancellation',
      'Connection': '2.4GHz Wireless + Bluetooth (Simultaneous)',
      'Battery': '22hrs (x2 hot-swap batteries)',
      'Microphone': 'ClearCast Gen 2 Retractable',
      'Compatibility': 'PC, PS5, Switch, Mobile',
      'Warranty': '2 Years'
    }
  }
];

async function addProducts() {
  console.log('Adding premium products with specifications...\n');

  let added = 0;
  let skipped = 0;

  for (const product of products) {
    const { error } = await supabase.from('products').insert(product);
    if (error) {
      if (error.code === '23505') {
        console.log(`⏭️  Skipped (exists): ${product.name}`);
        skipped++;
      } else {
        console.log(`❌ Error: ${product.name} - ${error.message}`);
      }
    } else {
      console.log(`✅ Added: ${product.name}`);
      added++;
    }
  }

  console.log(`\n========================================`);
  console.log(`✅ Added: ${added} products`);
  console.log(`⏭️  Skipped: ${skipped} products`);
  console.log(`📦 Total: ${products.length} products processed`);
}

addProducts();
