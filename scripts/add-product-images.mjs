import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vhxqmtgrfjdaubtsbpqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeHFtdGdyZmpkYXVidHNicHF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU0NzkzMiwiZXhwIjoyMDg0MTIzOTMyfQ.EuWjsJbsutiWeCP73sKI6HGOBYYqayvXFIF1RgtX3Go'
);

// Product images mapping by SKU
const productImages = {
  // Laptops
  'HP-15S-FQ5000': ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
  'DELL-INS-3520': ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
  'LEN-IP3-15IAU7': ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
  'ASUS-VB15-X1502': ['https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=800', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
  'ACER-A5-A515': ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],

  // Desktop Computers
  'HP-PD400-G9': ['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800', 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800'],
  'DELL-OP3000': ['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800', 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800'],
  'LEN-TC-M70S': ['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800', 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800'],

  // Laser Printers
  'HP-LJ-M404DN': ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800', 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800'],
  'BRO-HL-L2350': ['https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'],
  'CAN-LBP226DW': ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800', 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800'],

  // Inkjet Printers
  'EPS-ET-L3250': ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800', 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800'],
  'CAN-PX-G3020': ['https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'],
  'HP-ST-580': ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800', 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800'],

  // RAM Memory
  'KNG-FB-8GB-3200': ['https://images.unsplash.com/photo-1562976540-1502c2145186?w=800', 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800'],
  'KNG-FB-16GB-3200': ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800', 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800'],
  'COR-VG-16GB': ['https://images.unsplash.com/photo-1562976540-1502c2145186?w=800', 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800'],
  'KNG-VR-8GB-LP': ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800', 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800'],

  // SSDs
  'SAM-870EVO-500': ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800', 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800'],
  'SAM-980-500': ['https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800'],
  'KNG-NV2-1TB': ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800', 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800'],
  'WD-SN570-500': ['https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800'],

  // Monitors
  'DELL-P2422H': ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800'],
  'HP-M24F': ['https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],
  'LG-27UP850N': ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800'],
  'SAM-LC24F390': ['https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],

  // Routers
  'TPL-AX55': ['https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'],
  'TPL-C6': ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800', 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800'],
  'DLK-X1560': ['https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'],

  // Switches
  'TPL-SG108': ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'],
  'TPL-SG1016D': ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'],
  'DLK-1008A': ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'],

  // Keyboards
  'LOG-MK270': ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800'],
  'LOG-K120': ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'],
  'HP-125-KB': ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800'],

  // Mice
  'LOG-M190': ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'],
  'LOG-M100': ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'],
  'HP-150-MS': ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'],

  // USB Flash Drives
  'SD-UF-32GB': ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800', 'https://images.unsplash.com/photo-1618410320928-25228d811631?w=800'],
  'SD-UF-64GB': ['https://images.unsplash.com/photo-1618410320928-25228d811631?w=800', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800'],
  'KNG-DTE-32GB': ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800', 'https://images.unsplash.com/photo-1618410320928-25228d811631?w=800'],

  // Network Cables
  'CAT6-305M-BLU': ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'],
  'CAT6-2M-5PK': ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'],
  'RJ45-CAT6-100': ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'],

  // Ink & Toner
  'HP-107A-BLK': ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800', 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800'],
  'CAN-057-BLK': ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800', 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800'],
  'EPS-003-SET': ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800', 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800'],
  'CAN-GI71-SET': ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800', 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800'],

  // === NEW PREMIUM PRODUCTS ===

  // Gaming Laptops
  'LAPTOP-ROG-G16': [
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80',
    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80'
  ],
  'LAPTOP-MACBOOK-PRO-14': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b92e2e?w=800&q=80'
  ],

  // Gaming Desktop
  'DESKTOP-CUSTOM-GAMING': [
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80',
    'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80'
  ],

  // Gaming Monitors
  'MONITOR-SAMSUNG-G7-32': [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80',
    'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80'
  ],
  'MONITOR-LG-4K-27': [
    'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800&q=80',
    'https://images.unsplash.com/photo-1559163499-413811fb2344?w=800&q=80'
  ],

  // Graphics Cards
  'GPU-RTX4070TI-ASUS': [
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
    'https://images.unsplash.com/photo-1555618254-5e7168330a9e?w=800&q=80'
  ],
  'GPU-RTX4060-MSI': [
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    'https://images.unsplash.com/photo-1555618254-5e7168330a9e?w=800&q=80'
  ],

  // Premium RAM
  'RAM-CORSAIR-32GB-DDR5': [
    'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80',
    'https://images.unsplash.com/photo-1592664474505-51c549ad15c5?w=800&q=80'
  ],
  'RAM-KINGSTON-16GB-DDR4': [
    'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80',
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80'
  ],

  // Premium SSDs
  'SSD-SAMSUNG-990PRO-2TB': [
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
    'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?w=800&q=80'
  ],
  'SSD-WD-BLACK-1TB': [
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
    'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80'
  ],

  // Gaming Keyboards
  'KB-LOGITECH-G915': [
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'
  ],
  'KB-RAZER-HUNTSMAN-V3': [
    'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'
  ],

  // Gaming Mice
  'MOUSE-LOGITECH-G-PRO-X': [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80'
  ],
  'MOUSE-RAZER-DEATHADDER-V3': [
    'https://images.unsplash.com/photo-1623820919239-0d0ff10797a1?w=800&q=80',
    'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=800&q=80'
  ],

  // Processors
  'CPU-INTEL-I9-14900K': [
    'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&q=80',
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80'
  ],
  'CPU-AMD-R9-7950X3D': [
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
    'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&q=80'
  ],

  // Premium Routers
  'ROUTER-ASUS-AXE16000': [
    'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80'
  ],
  'ROUTER-TP-LINK-AX6000': [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
    'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80'
  ],

  // Gaming Headset
  'HEADSET-STEELSERIES-PRO': [
    'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80',
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80'
  ],
};

async function updateProductImages() {
  console.log('Updating product images...\n');

  let updated = 0;
  let errors = 0;

  for (const [sku, images] of Object.entries(productImages)) {
    // Store images array AND set image_url to first image (for table display)
    const { error } = await supabase
      .from('products')
      .update({
        images: images,
        image_url: images[0]  // First image is shown in product list
      })
      .eq('sku', sku);

    if (error) {
      console.log(`Error updating ${sku}:`, error.message);
      errors++;
    } else {
      updated++;
      process.stdout.write('.');
    }
  }

  console.log('\n\nDone!');
  console.log('Updated:', updated);
  console.log('Errors:', errors);
}

updateProductImages();
