import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vhxqmtgrfjdaubtsbpqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeHFtdGdyZmpkYXVidHNicHF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU0NzkzMiwiZXhwIjoyMDg0MTIzOTMyfQ.EuWjsJbsutiWeCP73sKI6HGOBYYqayvXFIF1RgtX3Go'
);

const products = [
  // Laptops
  { name: 'HP 15s-fq5000 Laptop', sku: 'HP-15S-FQ5000', category_id: 'b504857f-426e-4a25-8a32-47142c322e37', selling_price: 185000, cost_price: 165000, stock_quantity: 10, description: 'Intel Core i5-1235U, 8GB RAM, 512GB SSD, 15.6" FHD Display, Windows 11 Home', is_active: true },
  { name: 'Dell Inspiron 15 3520', sku: 'DELL-INS-3520', category_id: 'b504857f-426e-4a25-8a32-47142c322e37', selling_price: 175000, cost_price: 155000, stock_quantity: 8, description: 'Intel Core i5-1235U, 8GB RAM, 512GB SSD, 15.6" FHD, Windows 11', is_active: true },
  { name: 'Lenovo IdeaPad 3 15IAU7', sku: 'LEN-IP3-15IAU7', category_id: 'b504857f-426e-4a25-8a32-47142c322e37', selling_price: 168000, cost_price: 150000, stock_quantity: 12, description: 'Intel Core i5-1235U, 8GB RAM, 256GB SSD, 15.6" FHD Display', is_active: true },
  { name: 'ASUS VivoBook 15 X1502', sku: 'ASUS-VB15-X1502', category_id: 'b504857f-426e-4a25-8a32-47142c322e37', selling_price: 172000, cost_price: 152000, stock_quantity: 6, description: 'Intel Core i5-1235U, 8GB RAM, 512GB SSD, 15.6" FHD IPS', is_active: true },
  { name: 'Acer Aspire 5 A515-57', sku: 'ACER-A5-A515', category_id: 'b504857f-426e-4a25-8a32-47142c322e37', selling_price: 165000, cost_price: 145000, stock_quantity: 5, description: 'Intel Core i5-1235U, 8GB RAM, 512GB SSD, 15.6" FHD', is_active: true },

  // Desktop Computers
  { name: 'HP ProDesk 400 G9 SFF', sku: 'HP-PD400-G9', category_id: '12353d6e-9fb8-4763-a928-71979284fa67', selling_price: 195000, cost_price: 175000, stock_quantity: 5, description: 'Intel Core i5-12500, 8GB RAM, 256GB SSD, Windows 11 Pro', is_active: true },
  { name: 'Dell OptiPlex 3000 SFF', sku: 'DELL-OP3000', category_id: '12353d6e-9fb8-4763-a928-71979284fa67', selling_price: 185000, cost_price: 165000, stock_quantity: 7, description: 'Intel Core i5-12500, 8GB RAM, 256GB SSD, Windows 11 Pro', is_active: true },
  { name: 'Lenovo ThinkCentre M70s Gen 3', sku: 'LEN-TC-M70S', category_id: '12353d6e-9fb8-4763-a928-71979284fa67', selling_price: 205000, cost_price: 185000, stock_quantity: 4, description: 'Intel Core i5-12400, 8GB RAM, 512GB SSD, Windows 11 Pro', is_active: true },

  // Printers - Laser
  { name: 'HP LaserJet Pro M404dn', sku: 'HP-LJ-M404DN', category_id: '7580ad69-a6de-4997-9430-3f42fc59c494', selling_price: 85000, cost_price: 72000, stock_quantity: 8, description: 'Mono Laser Printer, 40ppm, Duplex, Network Ready', is_active: true },
  { name: 'Brother HL-L2350DW', sku: 'BRO-HL-L2350', category_id: '7580ad69-a6de-4997-9430-3f42fc59c494', selling_price: 48000, cost_price: 40000, stock_quantity: 12, description: 'Mono Laser Printer, 32ppm, Duplex, Wireless', is_active: true },
  { name: 'Canon imageCLASS LBP226dw', sku: 'CAN-LBP226DW', category_id: '7580ad69-a6de-4997-9430-3f42fc59c494', selling_price: 55000, cost_price: 46000, stock_quantity: 6, description: 'Mono Laser Printer, 38ppm, Duplex, Wireless, Mobile Print', is_active: true },

  // Printers - Inkjet
  { name: 'Epson EcoTank L3250', sku: 'EPS-ET-L3250', category_id: 'b9b34da7-d514-44a3-80fc-9f1633d3ded6', selling_price: 42000, cost_price: 35000, stock_quantity: 15, description: 'All-in-One Ink Tank Printer, Print/Scan/Copy, WiFi, Borderless', is_active: true },
  { name: 'Canon PIXMA G3020', sku: 'CAN-PX-G3020', category_id: 'b9b34da7-d514-44a3-80fc-9f1633d3ded6', selling_price: 38000, cost_price: 32000, stock_quantity: 10, description: 'All-in-One Ink Tank Printer, Print/Scan/Copy, WiFi', is_active: true },
  { name: 'HP Smart Tank 580', sku: 'HP-ST-580', category_id: 'b9b34da7-d514-44a3-80fc-9f1633d3ded6', selling_price: 45000, cost_price: 38000, stock_quantity: 8, description: 'All-in-One Ink Tank Printer, Print/Scan/Copy, WiFi, Bluetooth', is_active: true },

  // RAM Memory
  { name: 'Kingston Fury Beast 8GB DDR4 3200MHz', sku: 'KNG-FB-8GB-3200', category_id: 'c0825c41-a45d-4b31-8d70-0f2ddb03921b', selling_price: 8500, cost_price: 7000, stock_quantity: 25, description: '8GB DDR4 3200MHz CL16 Desktop Memory', is_active: true },
  { name: 'Kingston Fury Beast 16GB DDR4 3200MHz', sku: 'KNG-FB-16GB-3200', category_id: 'c0825c41-a45d-4b31-8d70-0f2ddb03921b', selling_price: 15500, cost_price: 13000, stock_quantity: 20, description: '16GB DDR4 3200MHz CL16 Desktop Memory', is_active: true },
  { name: 'Corsair Vengeance LPX 16GB DDR4 3200MHz', sku: 'COR-VG-16GB', category_id: 'c0825c41-a45d-4b31-8d70-0f2ddb03921b', selling_price: 16500, cost_price: 14000, stock_quantity: 15, description: '16GB (2x8GB) DDR4 3200MHz CL16 Kit', is_active: true },
  { name: 'Kingston ValueRAM 8GB DDR4 2666MHz Laptop', sku: 'KNG-VR-8GB-LP', category_id: 'c0825c41-a45d-4b31-8d70-0f2ddb03921b', selling_price: 7500, cost_price: 6200, stock_quantity: 30, description: '8GB DDR4 2666MHz SODIMM Laptop Memory', is_active: true },

  // SSDs
  { name: 'Samsung 870 EVO 500GB SATA SSD', sku: 'SAM-870EVO-500', category_id: 'dccd257e-8534-425d-9a60-45baaabe63c6', selling_price: 18500, cost_price: 15500, stock_quantity: 20, description: '500GB 2.5" SATA III SSD, 560MB/s Read, 530MB/s Write', is_active: true },
  { name: 'Samsung 980 500GB NVMe SSD', sku: 'SAM-980-500', category_id: 'dccd257e-8534-425d-9a60-45baaabe63c6', selling_price: 19500, cost_price: 16500, stock_quantity: 15, description: '500GB M.2 NVMe SSD, 3100MB/s Read, 2600MB/s Write', is_active: true },
  { name: 'Kingston NV2 1TB NVMe SSD', sku: 'KNG-NV2-1TB', category_id: 'dccd257e-8534-425d-9a60-45baaabe63c6', selling_price: 28000, cost_price: 24000, stock_quantity: 12, description: '1TB M.2 NVMe SSD, 3500MB/s Read, 2100MB/s Write', is_active: true },
  { name: 'WD Blue SN570 500GB NVMe SSD', sku: 'WD-SN570-500', category_id: 'dccd257e-8534-425d-9a60-45baaabe63c6', selling_price: 17500, cost_price: 14500, stock_quantity: 18, description: '500GB M.2 NVMe SSD, 3500MB/s Read, 2300MB/s Write', is_active: true },

  // Monitors
  { name: 'Dell P2422H 24" FHD Monitor', sku: 'DELL-P2422H', category_id: '46ea6c18-bb11-4b0b-bfd8-6155c77a90bf', selling_price: 68000, cost_price: 58000, stock_quantity: 8, description: '24" FHD IPS, USB-C Hub, Height Adjustable, VESA Mount', is_active: true },
  { name: 'HP M24f FHD Monitor', sku: 'HP-M24F', category_id: '46ea6c18-bb11-4b0b-bfd8-6155c77a90bf', selling_price: 42000, cost_price: 35000, stock_quantity: 10, description: '24" FHD IPS, AMD FreeSync, 75Hz, Ultra-Slim', is_active: true },
  { name: 'LG 27UP850N 27" 4K UHD Monitor', sku: 'LG-27UP850N', category_id: '46ea6c18-bb11-4b0b-bfd8-6155c77a90bf', selling_price: 125000, cost_price: 108000, stock_quantity: 4, description: '27" 4K UHD IPS, USB-C 96W, HDR400, DCI-P3 95%', is_active: true },
  { name: 'Samsung 24" Curved Monitor LC24F390', sku: 'SAM-LC24F390', category_id: '46ea6c18-bb11-4b0b-bfd8-6155c77a90bf', selling_price: 38000, cost_price: 32000, stock_quantity: 12, description: '24" FHD Curved VA, AMD FreeSync, 60Hz', is_active: true },

  // Networking - Routers
  { name: 'TP-Link Archer AX55 WiFi 6 Router', sku: 'TPL-AX55', category_id: '69473bfa-a116-4b89-bceb-b52463a133a0', selling_price: 28000, cost_price: 23000, stock_quantity: 15, description: 'AX3000 Dual Band WiFi 6 Router, Gigabit, OneMesh', is_active: true },
  { name: 'TP-Link Archer C6 AC1200 Router', sku: 'TPL-C6', category_id: '69473bfa-a116-4b89-bceb-b52463a133a0', selling_price: 12500, cost_price: 10000, stock_quantity: 20, description: 'AC1200 Dual Band WiFi Router, Gigabit Ports, MU-MIMO', is_active: true },
  { name: 'D-Link DIR-X1560 WiFi 6 Router', sku: 'DLK-X1560', category_id: '69473bfa-a116-4b89-bceb-b52463a133a0', selling_price: 22000, cost_price: 18000, stock_quantity: 10, description: 'AX1500 WiFi 6 Router, Dual Band, OFDMA, MU-MIMO', is_active: true },

  // Networking - Switches
  { name: 'TP-Link TL-SG108 8-Port Gigabit Switch', sku: 'TPL-SG108', category_id: '9a5c7b16-ba51-4a37-8e66-93e6ced08cba', selling_price: 6500, cost_price: 5200, stock_quantity: 25, description: '8-Port 10/100/1000Mbps Desktop Switch, Plug & Play', is_active: true },
  { name: 'TP-Link TL-SG1016D 16-Port Gigabit Switch', sku: 'TPL-SG1016D', category_id: '9a5c7b16-ba51-4a37-8e66-93e6ced08cba', selling_price: 14500, cost_price: 12000, stock_quantity: 12, description: '16-Port Gigabit Desktop/Rackmount Switch', is_active: true },
  { name: 'D-Link DGS-1008A 8-Port Gigabit Switch', sku: 'DLK-1008A', category_id: '9a5c7b16-ba51-4a37-8e66-93e6ced08cba', selling_price: 5800, cost_price: 4800, stock_quantity: 18, description: '8-Port Gigabit Unmanaged Desktop Switch', is_active: true },

  // Keyboards
  { name: 'Logitech MK270 Wireless Keyboard & Mouse', sku: 'LOG-MK270', category_id: '0befb9e1-d1ed-4b79-86d5-7c0f8079dab9', selling_price: 8500, cost_price: 7000, stock_quantity: 20, description: 'Wireless Keyboard and Mouse Combo, 2.4GHz, Full-Size', is_active: true },
  { name: 'Logitech K120 USB Keyboard', sku: 'LOG-K120', category_id: '0befb9e1-d1ed-4b79-86d5-7c0f8079dab9', selling_price: 2800, cost_price: 2200, stock_quantity: 35, description: 'Wired USB Keyboard, Spill-Resistant, Quiet Keys', is_active: true },
  { name: 'HP 125 Wired Keyboard', sku: 'HP-125-KB', category_id: '0befb9e1-d1ed-4b79-86d5-7c0f8079dab9', selling_price: 3200, cost_price: 2600, stock_quantity: 30, description: 'USB Wired Keyboard, Full-Size, Adjustable Tilt Legs', is_active: true },

  // Mice
  { name: 'Logitech M190 Wireless Mouse', sku: 'LOG-M190', category_id: '67cb8adb-6d7d-4cf0-b0ea-297726547db5', selling_price: 3500, cost_price: 2800, stock_quantity: 30, description: 'Full-Size Wireless Mouse, 1000 DPI, 18-Month Battery', is_active: true },
  { name: 'Logitech M100 USB Mouse', sku: 'LOG-M100', category_id: '67cb8adb-6d7d-4cf0-b0ea-297726547db5', selling_price: 1500, cost_price: 1100, stock_quantity: 40, description: 'Wired USB Mouse, 1000 DPI, Ambidextrous', is_active: true },
  { name: 'HP 150 Wired Mouse', sku: 'HP-150-MS', category_id: '67cb8adb-6d7d-4cf0-b0ea-297726547db5', selling_price: 1800, cost_price: 1400, stock_quantity: 35, description: 'USB Wired Optical Mouse, 1600 DPI', is_active: true },

  // USB Flash Drives
  { name: 'SanDisk Ultra Flair 32GB USB 3.0', sku: 'SD-UF-32GB', category_id: 'ab327c18-1533-4eb9-8db6-dcdc82ea669f', selling_price: 2200, cost_price: 1700, stock_quantity: 50, description: '32GB USB 3.0 Flash Drive, 150MB/s Read', is_active: true },
  { name: 'SanDisk Ultra Flair 64GB USB 3.0', sku: 'SD-UF-64GB', category_id: 'ab327c18-1533-4eb9-8db6-dcdc82ea669f', selling_price: 3500, cost_price: 2800, stock_quantity: 40, description: '64GB USB 3.0 Flash Drive, 150MB/s Read', is_active: true },
  { name: 'Kingston DataTraveler Exodia 32GB', sku: 'KNG-DTE-32GB', category_id: 'ab327c18-1533-4eb9-8db6-dcdc82ea669f', selling_price: 1800, cost_price: 1400, stock_quantity: 45, description: '32GB USB 3.2 Gen 1 Flash Drive', is_active: true },

  // Network Cables
  { name: 'Cat6 UTP Cable 305m Box (Blue)', sku: 'CAT6-305M-BLU', category_id: 'bf74b873-eb7e-44d2-9bed-6f5079c6b8fd', selling_price: 28000, cost_price: 23000, stock_quantity: 20, description: 'Cat6 UTP Network Cable, 305m Pull Box, 23AWG Pure Copper', is_active: true },
  { name: 'Cat6 Patch Cable 2m (Pack of 5)', sku: 'CAT6-2M-5PK', category_id: 'bf74b873-eb7e-44d2-9bed-6f5079c6b8fd', selling_price: 2500, cost_price: 1800, stock_quantity: 30, description: 'Cat6 RJ45 Patch Cord, 2 Meter, Pack of 5', is_active: true },
  { name: 'RJ45 Connector Cat6 (100pcs)', sku: 'RJ45-CAT6-100', category_id: 'bf74b873-eb7e-44d2-9bed-6f5079c6b8fd', selling_price: 3500, cost_price: 2800, stock_quantity: 40, description: 'Cat6 RJ45 Connectors, Gold Plated, 100 Pieces', is_active: true },

  // Printer Ink & Toner
  { name: 'HP 107A Black Toner Cartridge', sku: 'HP-107A-BLK', category_id: 'ec634147-823e-4f67-ac96-14ced4804f97', selling_price: 8500, cost_price: 7000, stock_quantity: 25, description: 'Original HP Black Toner, 1000 Pages Yield', is_active: true },
  { name: 'Canon 057 Black Toner Cartridge', sku: 'CAN-057-BLK', category_id: 'ec634147-823e-4f67-ac96-14ced4804f97', selling_price: 12500, cost_price: 10500, stock_quantity: 15, description: 'Original Canon Black Toner, 3100 Pages Yield', is_active: true },
  { name: 'Epson 003 Ink Bottle Set (4 Colors)', sku: 'EPS-003-SET', category_id: 'ec634147-823e-4f67-ac96-14ced4804f97', selling_price: 5500, cost_price: 4500, stock_quantity: 40, description: 'Original Epson Ink Set - Black, Cyan, Magenta, Yellow', is_active: true },
  { name: 'Canon GI-71 Ink Bottle Set (4 Colors)', sku: 'CAN-GI71-SET', category_id: 'ec634147-823e-4f67-ac96-14ced4804f97', selling_price: 5200, cost_price: 4200, stock_quantity: 35, description: 'Original Canon Ink Set - Black, Cyan, Magenta, Yellow', is_active: true },
];

async function addProducts() {
  console.log('Adding', products.length, 'products...');
  let added = 0;
  let errors = 0;

  for (const product of products) {
    const { error } = await supabase.from('products').insert(product);
    if (error) {
      console.log('Error adding', product.name, ':', error.message);
      errors++;
    } else {
      added++;
      process.stdout.write('.');
    }
  }

  console.log('\n\nDone!');
  console.log('Added:', added);
  console.log('Errors:', errors);
}

addProducts();
