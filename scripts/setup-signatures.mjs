import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vhxqmtgrfjdaubtsbpqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeHFtdGdyZmpkYXVidHNicHF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU0NzkzMiwiZXhwIjoyMDg0MTIzOTMyfQ.EuWjsJbsutiWeCP73sKI6HGOBYYqayvXFIF1RgtX3Go'
)

async function setupSignatures() {
  console.log('Setting up signatures table...\n')

  // Create admin_signatures table
  const { error: sigError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS admin_signatures (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        image_url TEXT NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_admin_signatures_created_by ON admin_signatures(created_by);
      CREATE INDEX IF NOT EXISTS idx_admin_signatures_default ON admin_signatures(is_default);
    `
  })

  if (sigError) {
    console.error('Error creating admin_signatures table:', sigError)
  } else {
    console.log('✓ admin_signatures table created')
  }

  // Create storage bucket for signatures
  const { error: bucketError } = await supabase.storage.createBucket('signatures', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]
  })

  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('Error creating signatures bucket:', bucketError)
  } else {
    console.log('✓ signatures storage bucket ready')
  }

  console.log('\nSetup complete!')
}

setupSignatures()
