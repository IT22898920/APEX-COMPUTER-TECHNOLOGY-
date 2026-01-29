import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vhxqmtgrfjdaubtsbpqu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeHFtdGdyZmpkYXVidHNicHF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU0NzkzMiwiZXhwIjoyMDg0MTIzOTMyfQ.EuWjsJbsutiWeCP73sKI6HGOBYYqayvXFIF1RgtX3Go'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('Setting up storage buckets...')

  // Create payment-receipts bucket
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('payment-receipts', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
  })

  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log('✓ Bucket "payment-receipts" already exists')
    } else {
      console.error('Error creating bucket:', bucketError)
      return
    }
  } else {
    console.log('✓ Created bucket "payment-receipts"')
  }

  console.log('\nStorage setup complete!')
  console.log('\nNote: You need to set up RLS policies in Supabase Dashboard:')
  console.log('1. Go to Storage > payment-receipts > Policies')
  console.log('2. Add policy for INSERT: (auth.uid() IS NOT NULL)')
  console.log('3. Add policy for SELECT: true (public read)')
}

setupStorage()
