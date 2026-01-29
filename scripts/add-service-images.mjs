import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vhxqmtgrfjdaubtsbpqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeHFtdGdyZmpkYXVidHNicHF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU0NzkzMiwiZXhwIjoyMDg0MTIzOTMyfQ.EuWjsJbsutiWeCP73sKI6HGOBYYqayvXFIF1RgtX3Go'
)

// Service images mapping - using Unsplash images
const serviceImages = {
  'computer-laptop-sales': [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800'
  ],
  'hardware-maintenance': [
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    'https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800'
  ],
  'printer-sales-repairs': [
    'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800',
    'https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=800'
  ],
  'ram-memory-sales': [
    'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800',
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800'
  ],
  'network-cables-accessories': [
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'
  ],
  'consumables-cartridges': [
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800',
    'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800'
  ],
  'network-power-cabling': [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'
  ],
  'computer-laptop-rental': [
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
  ],
  'service-agreements': [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800'
  ]
}

async function addServiceImages() {
  // Get all services
  const { data: services, error } = await supabase
    .from('services')
    .select('id, title, slug, images')
    .order('display_order')

  if (error) {
    console.error('Error fetching services:', error)
    return
  }

  console.log(`Found ${services.length} services\n`)

  for (const service of services) {
    // Skip 'test' service
    if (service.slug === 'test') {
      console.log(`Skipping: ${service.title}`)
      continue
    }

    const images = serviceImages[service.slug]

    if (images && images.length > 0) {
      const { error: updateError } = await supabase
        .from('services')
        .update({
          images: images,
          image_url: images[0]
        })
        .eq('id', service.id)

      if (updateError) {
        console.error(`Error updating ${service.title}:`, updateError)
      } else {
        console.log(`✓ Updated ${service.title} with ${images.length} images`)
      }
    } else {
      console.log(`⚠ No images defined for: ${service.title} (slug: ${service.slug})`)
    }
  }

  console.log('\nDone!')
}

addServiceImages()
