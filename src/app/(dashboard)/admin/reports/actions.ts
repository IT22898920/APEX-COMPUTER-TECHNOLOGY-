'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ReportFolder {
  id: string
  name: string
  description: string | null
  parent_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  document_count?: number
}

export interface ReportDocument {
  id: string
  name: string
  description: string | null
  file_url: string
  file_name: string
  file_size: number | null
  file_type: string | null
  folder_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Get all folders
export async function getFolders(parentId?: string | null) {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('report_folders')
      .select('*')
      .order('name', { ascending: true })

    if (parentId === null || parentId === undefined) {
      query = query.is('parent_id', null)
    } else {
      query = query.eq('parent_id', parentId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching folders:', error)
      return { folders: [], error: error.message }
    }

    // Get document count for each folder
    const foldersWithCount = await Promise.all(
      (data || []).map(async (folder) => {
        const { count } = await supabase
          .from('report_documents')
          .select('*', { count: 'exact', head: true })
          .eq('folder_id', folder.id)

        return { ...folder, document_count: count || 0 }
      })
    )

    return { folders: foldersWithCount as ReportFolder[], error: null }
  } catch (error) {
    console.error('Get folders error:', error)
    return { folders: [], error: 'Failed to fetch folders' }
  }
}

// Get all folders (flat list for dropdown)
export async function getAllFolders() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('report_folders')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching all folders:', error)
      return { folders: [], error: error.message }
    }

    return { folders: data as ReportFolder[], error: null }
  } catch (error) {
    console.error('Get all folders error:', error)
    return { folders: [], error: 'Failed to fetch folders' }
  }
}

// Create folder
export async function createFolder(data: {
  name: string
  description?: string
  parent_id?: string | null
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const adminClient = createAdminClient()

    const { data: folder, error } = await adminClient
      .from('report_folders')
      .insert({
        name: data.name,
        description: data.description || null,
        parent_id: data.parent_id || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating folder:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/reports')
    return { success: true, folder }
  } catch (error) {
    console.error('Create folder error:', error)
    return { success: false, error: 'Failed to create folder' }
  }
}

// Update folder
export async function updateFolder(id: string, data: {
  name?: string
  description?: string
}) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('report_folders')
      .update({
        name: data.name,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating folder:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/reports')
    return { success: true }
  } catch (error) {
    console.error('Update folder error:', error)
    return { success: false, error: 'Failed to update folder' }
  }
}

// Delete folder
export async function deleteFolder(id: string) {
  try {
    const supabase = createAdminClient()

    // First delete all documents in the folder
    const { data: documents } = await supabase
      .from('report_documents')
      .select('file_url')
      .eq('folder_id', id)

    // Delete files from storage
    if (documents && documents.length > 0) {
      const filePaths = documents.map(doc => {
        const url = new URL(doc.file_url)
        return url.pathname.split('/reports/')[1]
      }).filter(Boolean)

      if (filePaths.length > 0) {
        await supabase.storage.from('reports').remove(filePaths)
      }
    }

    // Delete folder (cascade will delete documents)
    const { error } = await supabase
      .from('report_folders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting folder:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/reports')
    return { success: true }
  } catch (error) {
    console.error('Delete folder error:', error)
    return { success: false, error: 'Failed to delete folder' }
  }
}

// Get documents in a folder
export async function getDocuments(folderId?: string | null) {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('report_documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (folderId) {
      query = query.eq('folder_id', folderId)
    } else {
      query = query.is('folder_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching documents:', error)
      return { documents: [], error: error.message }
    }

    return { documents: data as ReportDocument[], error: null }
  } catch (error) {
    console.error('Get documents error:', error)
    return { documents: [], error: 'Failed to fetch documents' }
  }
}

// Upload document
export async function uploadDocument(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const folderId = formData.get('folder_id') as string

    if (!file || !name) {
      return { success: false, error: 'File and name are required' }
    }

    const adminClient = createAdminClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = folderId ? `${folderId}/${fileName}` : fileName

    // Upload file
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('reports')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Failed to upload file' }
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('reports')
      .getPublicUrl(uploadData.path)

    // Create document record
    const { data: document, error: docError } = await adminClient
      .from('report_documents')
      .insert({
        name,
        description: description || null,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        folder_id: folderId || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (docError) {
      console.error('Error creating document record:', docError)
      // Try to delete uploaded file
      await adminClient.storage.from('reports').remove([uploadData.path])
      return { success: false, error: docError.message }
    }

    revalidatePath('/admin/reports')
    return { success: true, document }
  } catch (error) {
    console.error('Upload document error:', error)
    return { success: false, error: 'Failed to upload document' }
  }
}

// Update document
export async function updateDocument(id: string, data: {
  name?: string
  description?: string
}) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('report_documents')
      .update({
        name: data.name,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating document:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/reports')
    return { success: true }
  } catch (error) {
    console.error('Update document error:', error)
    return { success: false, error: 'Failed to update document' }
  }
}

// Replace document file
export async function replaceDocument(id: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const file = formData.get('file') as File

    if (!file) {
      return { success: false, error: 'File is required' }
    }

    const adminClient = createAdminClient()

    // Get existing document
    const { data: existingDoc, error: fetchError } = await adminClient
      .from('report_documents')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingDoc) {
      return { success: false, error: 'Document not found' }
    }

    // Delete old file
    try {
      const oldUrl = new URL(existingDoc.file_url)
      const oldPath = oldUrl.pathname.split('/reports/')[1]
      if (oldPath) {
        await adminClient.storage.from('reports').remove([oldPath])
      }
    } catch (e) {
      console.error('Error deleting old file:', e)
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = existingDoc.folder_id ? `${existingDoc.folder_id}/${fileName}` : fileName

    // Upload new file
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('reports')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Failed to upload file' }
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('reports')
      .getPublicUrl(uploadData.path)

    // Update document record
    const { error: updateError } = await adminClient
      .from('report_documents')
      .update({
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating document:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/admin/reports')
    return { success: true }
  } catch (error) {
    console.error('Replace document error:', error)
    return { success: false, error: 'Failed to replace document' }
  }
}

// Delete document
export async function deleteDocument(id: string) {
  try {
    const supabase = createAdminClient()

    // Get document
    const { data: document, error: fetchError } = await supabase
      .from('report_documents')
      .select('file_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      return { success: false, error: 'Document not found' }
    }

    // Delete file from storage
    try {
      const url = new URL(document.file_url)
      const filePath = url.pathname.split('/reports/')[1]
      if (filePath) {
        await supabase.storage.from('reports').remove([filePath])
      }
    } catch (e) {
      console.error('Error deleting file:', e)
    }

    // Delete document record
    const { error } = await supabase
      .from('report_documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting document:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/reports')
    return { success: true }
  } catch (error) {
    console.error('Delete document error:', error)
    return { success: false, error: 'Failed to delete document' }
  }
}

// Get signed URL for private file download
export async function getDownloadUrl(fileUrl: string) {
  try {
    const supabase = createAdminClient()

    // Extract path from URL
    const url = new URL(fileUrl)
    const filePath = url.pathname.split('/reports/')[1]

    if (!filePath) {
      return { url: null, error: 'Invalid file URL' }
    }

    const { data, error } = await supabase.storage
      .from('reports')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error)
      return { url: null, error: error.message }
    }

    return { url: data.signedUrl, error: null }
  } catch (error) {
    console.error('Get download URL error:', error)
    return { url: null, error: 'Failed to get download URL' }
  }
}

// Save signed document (replaces original)
export async function saveSignedDocument(
  originalDocumentId: string,
  signedFileBase64: string,
  fileName: string,
  fileType: string,
  fileSize: number
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const adminClient = createAdminClient()

    // Get original document info
    const { data: originalDoc, error: docError } = await adminClient
      .from('report_documents')
      .select('name, folder_id, file_url')
      .eq('id', originalDocumentId)
      .single()

    if (docError) {
      return { success: false, error: 'Original document not found' }
    }

    // Delete old file from storage
    try {
      const oldUrl = new URL(originalDoc.file_url)
      const oldFilePath = oldUrl.pathname.split('/reports/')[1]
      if (oldFilePath) {
        await adminClient.storage.from('reports').remove([decodeURIComponent(oldFilePath)])
      }
    } catch (e) {
      console.warn('Could not delete old file:', e)
    }

    // Convert base64 to buffer
    const base64Data = signedFileBase64.split(',')[1] || signedFileBase64
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename for signed version
    const fileExt = fileType === 'application/pdf' ? 'pdf' : 'png'
    const uniqueFileName = `signed-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = originalDoc.folder_id ? `${originalDoc.folder_id}/${uniqueFileName}` : uniqueFileName

    // Upload signed file
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('reports')
      .upload(filePath, buffer, {
        contentType: fileType,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Failed to upload signed document' }
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('reports')
      .getPublicUrl(uploadData.path)

    // Update existing document record (replace, not create new)
    const { error: updateError } = await adminClient
      .from('report_documents')
      .update({
        file_url: publicUrl,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', originalDocumentId)

    if (updateError) {
      console.error('Error updating document record:', updateError)
      // Try to delete uploaded file
      await adminClient.storage.from('reports').remove([uploadData.path])
      return { success: false, error: updateError.message }
    }

    revalidatePath('/admin/reports')
    return { success: true }
  } catch (error) {
    console.error('Save signed document error:', error)
    return { success: false, error: 'Failed to save signed document' }
  }
}
