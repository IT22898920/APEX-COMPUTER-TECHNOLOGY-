import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vhxqmtgrfjdaubtsbpqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeHFtdGdyZmpkYXVidHNicHF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU0NzkzMiwiZXhwIjoyMDg0MTIzOTMyfQ.EuWjsJbsutiWeCP73sKI6HGOBYYqayvXFIF1RgtX3Go'
)

async function setupReports() {
  console.log('Setting up reports tables...\n')

  // Create report_folders table
  const { error: foldersError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS report_folders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id UUID REFERENCES report_folders(id) ON DELETE CASCADE,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_report_folders_parent ON report_folders(parent_id);
      CREATE INDEX IF NOT EXISTS idx_report_folders_created_by ON report_folders(created_by);
    `
  })

  if (foldersError) {
    console.error('Error creating report_folders table:', foldersError)
  } else {
    console.log('✓ report_folders table created')
  }

  // Create report_documents table
  const { error: docsError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS report_documents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        file_url TEXT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size BIGINT,
        file_type VARCHAR(100),
        folder_id UUID REFERENCES report_folders(id) ON DELETE CASCADE,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_report_documents_folder ON report_documents(folder_id);
      CREATE INDEX IF NOT EXISTS idx_report_documents_created_by ON report_documents(created_by);
    `
  })

  if (docsError) {
    console.error('Error creating report_documents table:', docsError)
  } else {
    console.log('✓ report_documents table created')
  }

  // Create storage bucket for reports
  const { error: bucketError } = await supabase.storage.createBucket('reports', {
    public: false,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed'
    ]
  })

  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('Error creating reports bucket:', bucketError)
  } else {
    console.log('✓ reports storage bucket ready')
  }

  console.log('\nSetup complete!')
}

setupReports()
