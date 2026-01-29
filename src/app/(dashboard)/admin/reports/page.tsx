'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Folder,
  FileText,
  Plus,
  Upload,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  ArrowLeft,
  FolderPlus,
  FileUp,
  Search,
  RefreshCw,
  File,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  Loader2,
  X,
  Eye,
  ChevronRight,
  FolderOpen,
  Files,
  FileCode,
  FileVideo,
  FileAudio,
  Maximize2,
  Minimize2,
  ExternalLink,
  PenTool,
  Star,
  Check,
  Image as ImageIcon,
  FileSignature,
  ZoomIn,
  ZoomOut,
  Move,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import {
  getFolders,
  getAllFolders,
  getDocuments,
  createFolder,
  updateFolder,
  deleteFolder,
  uploadDocument,
  updateDocument,
  replaceDocument,
  deleteDocument,
  getDownloadUrl,
  saveSignedDocument,
  type ReportFolder,
  type ReportDocument,
} from './actions'
import {
  getSignatures,
  createSignature,
  updateSignature,
  deleteSignature,
  setDefaultSignature,
  type AdminSignature,
} from './signature-actions'
import { SignaturePad } from '@/components/ui/signature-pad'
import { PDFDocument } from 'pdf-lib'

function getFileIcon(fileType: string | null) {
  if (!fileType) return { icon: File, color: 'text-gray-500', bg: 'bg-gray-100' }
  if (fileType.includes('pdf')) return { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' }
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv'))
    return { icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50' }
  if (fileType.includes('image')) return { icon: FileImage, color: 'text-purple-600', bg: 'bg-purple-50' }
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive'))
    return { icon: FileArchive, color: 'text-amber-600', bg: 'bg-amber-50' }
  if (fileType.includes('word') || fileType.includes('document'))
    return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' }
  if (fileType.includes('presentation') || fileType.includes('powerpoint'))
    return { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' }
  if (fileType.includes('video')) return { icon: FileVideo, color: 'text-pink-600', bg: 'bg-pink-50' }
  if (fileType.includes('audio')) return { icon: FileAudio, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  if (fileType.includes('text') || fileType.includes('code') || fileType.includes('json') || fileType.includes('xml'))
    return { icon: FileCode, color: 'text-cyan-600', bg: 'bg-cyan-50' }
  return { icon: File, color: 'text-gray-500', bg: 'bg-gray-100' }
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toUpperCase() || 'FILE'
}

function canPreview(fileType: string | null) {
  if (!fileType) return false
  return fileType.includes('image') || fileType.includes('pdf')
}

export default function ReportsPage() {
  const [folders, setFolders] = useState<ReportFolder[]>([])
  const [documents, setDocuments] = useState<ReportDocument[]>([])
  const [allFolders, setAllFolders] = useState<ReportFolder[]>([])
  const [currentFolder, setCurrentFolder] = useState<ReportFolder | null>(null)
  const [folderPath, setFolderPath] = useState<ReportFolder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showEditDocDialog, setShowEditDocDialog] = useState(false)
  const [showReplaceDialog, setShowReplaceDialog] = useState(false)
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false)
  const [showDeleteDocDialog, setShowDeleteDocDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Signature states
  const [signatures, setSignatures] = useState<AdminSignature[]>([])
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [showDeleteSignatureDialog, setShowDeleteSignatureDialog] = useState(false)
  const [editingSignature, setEditingSignature] = useState<AdminSignature | null>(null)
  const [signatureForm, setSignatureForm] = useState({ name: '', title: '', file: null as File | null, is_default: false })
  const [activeTab, setActiveTab] = useState('documents')
  const [signatureMode, setSignatureMode] = useState<'upload' | 'draw'>('draw')
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null)

  // Sign document states
  const [selectedSignature, setSelectedSignature] = useState<AdminSignature | null>(null)
  const [signatureSize, setSignatureSize] = useState(120)
  const [isPdfDoc, setIsPdfDoc] = useState(false)
  const [pdfPageCount, setPdfPageCount] = useState(1)
  const [selectedPdfPage, setSelectedPdfPage] = useState(1)
  const [isSignMode, setIsSignMode] = useState(false)
  const [docZoom, setDocZoom] = useState(100) // Document zoom percentage
  const [pdfPageSize, setPdfPageSize] = useState<{ width: number; height: number } | null>(null)
  const [pdfPageImage, setPdfPageImage] = useState<string | null>(null) // Rendered PDF page as image

  // Multiple signatures support
  interface PlacedSignature {
    id: string
    signature: AdminSignature
    x: number  // percentage position
    y: number
    size: number
    page: number  // for PDFs
  }
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([])
  const [draggingSignatureId, setDraggingSignatureId] = useState<string | null>(null)
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null)

  // Form states
  const [editingFolder, setEditingFolder] = useState<ReportFolder | null>(null)
  const [editingDocument, setEditingDocument] = useState<ReportDocument | null>(null)
  const [folderForm, setFolderForm] = useState({ name: '', description: '' })
  const [uploadForm, setUploadForm] = useState({ name: '', description: '', file: null as File | null })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceFileInputRef = useRef<HTMLInputElement>(null)
  const signatureFileInputRef = useRef<HTMLInputElement>(null)

  // Load data
  const loadData = async () => {
    setIsLoading(true)
    const folderId = currentFolder?.id || null

    const [foldersResult, documentsResult, allFoldersResult] = await Promise.all([
      getFolders(folderId),
      getDocuments(folderId),
      getAllFolders(),
    ])

    setFolders(foldersResult.folders)
    setDocuments(documentsResult.documents)
    setAllFolders(allFoldersResult.folders)
    setIsLoading(false)
  }

  // Load signatures
  const loadSignatures = async () => {
    const result = await getSignatures()
    setSignatures(result.signatures)
  }

  useEffect(() => {
    loadData()
    loadSignatures()
  }, [currentFolder])

  // Hide body overflow when in sign mode or fullscreen
  useEffect(() => {
    if (isSignMode || isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSignMode, isFullscreen])

  // Render PDF page to image using pdf.js
  const renderPdfPageToImage = useCallback(async (url: string, pageNum: number): Promise<{ imageUrl: string; width: number; height: number } | null> => {
    try {
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

      const loadingTask = pdfjsLib.getDocument(url)
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(pageNum)

      // Get the original page dimensions (scale 1)
      const originalViewport = page.getViewport({ scale: 1 })

      // Render at 2x scale for better quality
      const scale = 2
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) return null

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      } as any).promise

      return {
        imageUrl: canvas.toDataURL('image/png'),
        width: originalViewport.width,
        height: originalViewport.height
      }
    } catch (error) {
      console.error('Error rendering PDF page:', error)
      return null
    }
  }, [])

  // Re-render PDF when page changes in sign mode
  useEffect(() => {
    if (isSignMode && isPdfDoc && viewUrl) {
      renderPdfPageToImage(viewUrl, selectedPdfPage).then(result => {
        if (result) {
          setPdfPageImage(result.imageUrl)
        }
      })
    }
  }, [isSignMode, isPdfDoc, viewUrl, selectedPdfPage, renderPdfPageToImage])

  // Navigate to folder
  const navigateToFolder = (folder: ReportFolder) => {
    setFolderPath([...folderPath, folder])
    setCurrentFolder(folder)
  }

  // Navigate back
  const navigateBack = () => {
    const newPath = [...folderPath]
    newPath.pop()
    setFolderPath(newPath)
    setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1] : null)
  }

  // Navigate to root
  const navigateToRoot = () => {
    setFolderPath([])
    setCurrentFolder(null)
  }

  // Create/Edit folder
  const handleSaveFolder = async () => {
    if (!folderForm.name.trim()) {
      toast.error('Folder name is required')
      return
    }

    setIsSubmitting(true)

    if (editingFolder) {
      const result = await updateFolder(editingFolder.id, folderForm)
      if (result.success) {
        toast.success('Folder updated')
        setShowFolderDialog(false)
        setEditingFolder(null)
        setFolderForm({ name: '', description: '' })
        loadData()
      } else {
        toast.error(result.error || 'Failed to update folder')
      }
    } else {
      const result = await createFolder({
        ...folderForm,
        parent_id: currentFolder?.id || null,
      })
      if (result.success) {
        toast.success('Folder created')
        setShowFolderDialog(false)
        setFolderForm({ name: '', description: '' })
        loadData()
      } else {
        toast.error(result.error || 'Failed to create folder')
      }
    }

    setIsSubmitting(false)
  }

  // Delete folder
  const handleDeleteFolder = async () => {
    if (!editingFolder) return

    setIsSubmitting(true)
    const result = await deleteFolder(editingFolder.id)

    if (result.success) {
      toast.success('Folder deleted')
      setShowDeleteFolderDialog(false)
      setEditingFolder(null)
      loadData()
    } else {
      toast.error(result.error || 'Failed to delete folder')
    }

    setIsSubmitting(false)
  }

  // Upload document
  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.name.trim()) {
      toast.error('File and name are required')
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('file', uploadForm.file)
    formData.append('name', uploadForm.name)
    formData.append('description', uploadForm.description)
    if (currentFolder) {
      formData.append('folder_id', currentFolder.id)
    }

    const result = await uploadDocument(formData)

    if (result.success) {
      toast.success('Document uploaded')
      setShowUploadDialog(false)
      setUploadForm({ name: '', description: '', file: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadData()
    } else {
      toast.error(result.error || 'Failed to upload document')
    }

    setIsSubmitting(false)
  }

  // Edit document
  const handleUpdateDocument = async () => {
    if (!editingDocument) return

    setIsSubmitting(true)
    const result = await updateDocument(editingDocument.id, {
      name: editingDocument.name,
      description: editingDocument.description || undefined,
    })

    if (result.success) {
      toast.success('Document updated')
      setShowEditDocDialog(false)
      setEditingDocument(null)
      loadData()
    } else {
      toast.error(result.error || 'Failed to update document')
    }

    setIsSubmitting(false)
  }

  // Replace document
  const handleReplaceDocument = async (file: File) => {
    if (!editingDocument) return

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('file', file)

    const result = await replaceDocument(editingDocument.id, formData)

    if (result.success) {
      toast.success('Document replaced')
      setShowReplaceDialog(false)
      setEditingDocument(null)
      loadData()
    } else {
      toast.error(result.error || 'Failed to replace document')
    }

    setIsSubmitting(false)
  }

  // Delete document
  const handleDeleteDocument = async () => {
    if (!editingDocument) return

    setIsSubmitting(true)
    const result = await deleteDocument(editingDocument.id)

    if (result.success) {
      toast.success('Document deleted')
      setShowDeleteDocDialog(false)
      setEditingDocument(null)
      loadData()
    } else {
      toast.error(result.error || 'Failed to delete document')
    }

    setIsSubmitting(false)
  }

  // View document
  const handleView = async (doc: ReportDocument) => {
    const result = await getDownloadUrl(doc.file_url)

    if (result.url) {
      setViewUrl(result.url)
      setEditingDocument(doc)
      setShowViewDialog(true)
    } else {
      toast.error('Failed to get file URL')
    }
  }

  // Download document
  const handleDownload = async (doc: ReportDocument) => {
    const result = await getDownloadUrl(doc.file_url)

    if (result.url) {
      window.open(result.url, '_blank')
    } else {
      toast.error('Failed to get download link')
    }
  }

  // Create signature
  const handleCreateSignature = async () => {
    if (!signatureForm.name.trim()) {
      toast.error('Signature name is required')
      return
    }

    // Check if we have either an uploaded file or a drawn signature
    if (signatureMode === 'upload' && !signatureForm.file) {
      toast.error('Please upload a signature image')
      return
    }

    if (signatureMode === 'draw' && !drawnSignature) {
      toast.error('Please draw your signature')
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()

    if (signatureMode === 'upload' && signatureForm.file) {
      formData.append('file', signatureForm.file)
    } else if (signatureMode === 'draw' && drawnSignature) {
      // Convert data URL to blob
      const response = await fetch(drawnSignature)
      const blob = await response.blob()
      formData.append('file', blob, 'signature.png')
    }

    formData.append('name', signatureForm.name)
    formData.append('title', signatureForm.title)
    formData.append('is_default', signatureForm.is_default.toString())

    const result = await createSignature(formData)

    if (result.success) {
      toast.success('Signature created')
      setShowSignatureDialog(false)
      setSignatureForm({ name: '', title: '', file: null, is_default: false })
      setDrawnSignature(null)
      if (signatureFileInputRef.current) signatureFileInputRef.current.value = ''
      loadSignatures()
    } else {
      toast.error(result.error || 'Failed to create signature')
    }

    setIsSubmitting(false)
  }

  // Handle drawn signature
  const handleSignatureDrawn = (dataUrl: string) => {
    setDrawnSignature(dataUrl)
  }

  // Download signed document with multiple signatures
  // Helper function to remove white background from signature image
  const removeWhiteBackground = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(imageUrl)
          return
        }

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Convert white/near-white pixels to transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          // If pixel is white or near-white (threshold 250), make it transparent
          if (r > 250 && g > 250 && b > 250) {
            data[i + 3] = 0 // Set alpha to 0 (transparent)
          }
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(imageUrl)
      img.src = imageUrl
    })
  }

  const handleDownloadSigned = async () => {
    if (!viewUrl || !editingDocument || placedSignatures.length === 0) {
      toast.error('Please add at least one signature to the document')
      return
    }

    setIsSubmitting(true)

    try {
      if (isPdfDoc) {
        // Handle PDF signing with multiple signatures
        const pdfResponse = await fetch(viewUrl)
        const pdfArrayBuffer = await pdfResponse.arrayBuffer()
        const pdfDoc = await PDFDocument.load(pdfArrayBuffer)
        const pages = pdfDoc.getPages()

        // Process each placed signature
        for (const placed of placedSignatures) {
          // Load signature image and remove white background
          const transparentSigUrl = await removeWhiteBackground(placed.signature.image_url)
          const sigResponse = await fetch(transparentSigUrl)
          const sigArrayBuffer = await sigResponse.arrayBuffer()

          // Embed signature image (always as PNG for transparency)
          const sigImage = await pdfDoc.embedPng(sigArrayBuffer)

          // Get the page for this signature
          const page = pages[placed.page - 1]
          if (!page) continue

          const { width, height } = page.getSize()

          // Calculate signature dimensions
          const sigWidth = (placed.size / 100) * width * 0.4
          const sigHeight = sigWidth * (sigImage.height / sigImage.width)

          // Convert from preview coordinates (origin top-left) to PDF coordinates (origin bottom-left)
          // The signature center should be at (placed.x%, placed.y%) from top-left
          const centerX = (placed.x / 100) * width
          const centerY = height - (placed.y / 100) * height

          // Position the signature so its center is at the calculated point
          // pdf-lib drawImage uses bottom-left corner as reference
          const sigX = centerX - sigWidth / 2
          const sigY = centerY - sigHeight / 2

          // Draw signature on page
          page.drawImage(sigImage, {
            x: Math.max(0, Math.min(width - sigWidth, sigX)),
            y: Math.max(0, Math.min(height - sigHeight, sigY)),
            width: sigWidth,
            height: sigHeight,
          })
        }

        // Save and download
        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
        const link = document.createElement('a')
        link.download = `signed-${editingDocument.file_name}`
        link.href = URL.createObjectURL(blob)
        link.click()
        URL.revokeObjectURL(link.href)

        toast.success(`PDF signed with ${placedSignatures.length} signature(s)`)
      } else {
        // Handle image signing with multiple signatures
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas not supported')

        // Load document image
        const docImg = new Image()
        docImg.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          docImg.onload = resolve
          docImg.onerror = reject
          docImg.src = viewUrl
        })

        canvas.width = docImg.width
        canvas.height = docImg.height

        // Draw document
        ctx.drawImage(docImg, 0, 0)

        // Draw each signature
        for (const placed of placedSignatures) {
          // Remove white background from signature
          const transparentSigUrl = await removeWhiteBackground(placed.signature.image_url)

          const sigImg = new Image()
          sigImg.crossOrigin = 'anonymous'
          await new Promise((resolve, reject) => {
            sigImg.onload = resolve
            sigImg.onerror = reject
            sigImg.src = transparentSigUrl
          })

          // Calculate signature position and size
          const sigWidth = (placed.size / 100) * docImg.width * 0.4
          const sigHeight = sigWidth * (sigImg.height / sigImg.width)
          const sigX = (placed.x / 100) * docImg.width - sigWidth / 2
          const sigY = (placed.y / 100) * docImg.height - sigHeight / 2

          ctx.drawImage(sigImg, sigX, sigY, sigWidth, sigHeight)
        }

        // Download
        const link = document.createElement('a')
        link.download = `signed-${editingDocument.file_name}`
        link.href = canvas.toDataURL('image/png')
        link.click()

        toast.success(`Document signed with ${placedSignatures.length} signature(s)`)
      }

      setIsSignMode(false)
      setPlacedSignatures([])
    } catch (error) {
      console.error('Error signing document:', error)
      toast.error('Failed to sign document. Make sure signature images are accessible.')
    }

    setIsSubmitting(false)
  }

  // Save signed document to storage
  const handleSaveSigned = async () => {
    if (!viewUrl || !editingDocument || placedSignatures.length === 0) {
      toast.error('Please add at least one signature to the document')
      return
    }

    setIsSubmitting(true)

    try {
      let signedFileBase64: string
      let fileType: string
      let fileName: string

      // Get fresh download URL to avoid expired signed URLs
      const { url: freshUrl, error: urlError } = await getDownloadUrl(editingDocument.file_url)
      if (urlError || !freshUrl) {
        toast.error('Failed to access document. Please try again.')
        setIsSubmitting(false)
        return
      }

      if (isPdfDoc) {
        // Handle PDF signing
        const pdfResponse = await fetch(freshUrl)
        if (!pdfResponse.ok) {
          throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`)
        }
        const pdfArrayBuffer = await pdfResponse.arrayBuffer()
        const pdfDoc = await PDFDocument.load(pdfArrayBuffer)
        const pages = pdfDoc.getPages()

        for (const placed of placedSignatures) {
          const transparentSigUrl = await removeWhiteBackground(placed.signature.image_url)
          const sigResponse = await fetch(transparentSigUrl)
          const sigArrayBuffer = await sigResponse.arrayBuffer()
          const sigImage = await pdfDoc.embedPng(sigArrayBuffer)

          const page = pages[placed.page - 1]
          if (!page) continue

          const { width, height } = page.getSize()
          const sigWidth = (placed.size / 100) * width * 0.4
          const sigHeight = sigWidth * (sigImage.height / sigImage.width)
          const centerX = (placed.x / 100) * width
          const centerY = height - (placed.y / 100) * height
          const sigX = centerX - sigWidth / 2
          const sigY = centerY - sigHeight / 2

          page.drawImage(sigImage, {
            x: Math.max(0, Math.min(width - sigWidth, sigX)),
            y: Math.max(0, Math.min(height - sigHeight, sigY)),
            width: sigWidth,
            height: sigHeight,
          })
        }

        const pdfBytes = await pdfDoc.save()
        const uint8Array = new Uint8Array(pdfBytes)
        let binary = ''
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i])
        }
        signedFileBase64 = btoa(binary)
        fileType = 'application/pdf'
        fileName = `signed-${editingDocument.file_name}`
      } else {
        // Handle image signing
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas not supported')

        const docImg = new Image()
        docImg.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          docImg.onload = resolve
          docImg.onerror = reject
          docImg.src = freshUrl
        })

        canvas.width = docImg.width
        canvas.height = docImg.height
        ctx.drawImage(docImg, 0, 0)

        for (const placed of placedSignatures) {
          const transparentSigUrl = await removeWhiteBackground(placed.signature.image_url)
          const sigImg = new Image()
          sigImg.crossOrigin = 'anonymous'
          await new Promise((resolve, reject) => {
            sigImg.onload = resolve
            sigImg.onerror = reject
            sigImg.src = transparentSigUrl
          })

          const sigWidth = (placed.size / 100) * docImg.width * 0.4
          const sigHeight = sigWidth * (sigImg.height / sigImg.width)
          const sigX = (placed.x / 100) * docImg.width - sigWidth / 2
          const sigY = (placed.y / 100) * docImg.height - sigHeight / 2
          ctx.drawImage(sigImg, sigX, sigY, sigWidth, sigHeight)
        }

        signedFileBase64 = canvas.toDataURL('image/png')
        fileType = 'image/png'
        fileName = `signed-${editingDocument.file_name.replace(/\.[^/.]+$/, '')}.png`
      }

      // Calculate approximate file size
      const base64Data = signedFileBase64.split(',')[1] || signedFileBase64
      const fileSize = Math.ceil(base64Data.length * 0.75)

      // Save to storage
      const result = await saveSignedDocument(
        editingDocument.id,
        signedFileBase64,
        fileName,
        fileType,
        fileSize
      )

      if (result.success) {
        toast.success('Signed document saved successfully!')
        setIsSignMode(false)
        setPlacedSignatures([])
        loadData()
      } else {
        toast.error(result.error || 'Failed to save signed document')
      }
    } catch (error) {
      console.error('Error saving signed document:', error)
      toast.error('Failed to save signed document')
    }

    setIsSubmitting(false)
  }

  // Add signature to document at position
  const handleAddSignature = (x: number, y: number) => {
    if (!selectedSignature) {
      toast.error('Please select a signature first')
      return
    }

    // Clamp position to keep signature visible (not too close to edges)
    const clampedX = Math.max(10, Math.min(90, x))
    const clampedY = Math.max(10, Math.min(90, y))

    const newPlaced: PlacedSignature = {
      id: `sig-${Date.now()}`,
      signature: selectedSignature,
      x: clampedX,
      y: clampedY,
      size: signatureSize,
      page: selectedPdfPage,
    }

    setPlacedSignatures(prev => [...prev, newPlaced])
    setSelectedPlacedId(newPlaced.id)
  }

  // Remove placed signature
  const handleRemoveSignature = (id: string) => {
    setPlacedSignatures(prev => prev.filter(s => s.id !== id))
    if (selectedPlacedId === id) {
      setSelectedPlacedId(null)
    }
  }

  // Update placed signature size
  const handleUpdateSignatureSize = (id: string, size: number) => {
    setPlacedSignatures(prev => prev.map(s => s.id === id ? { ...s, size } : s))
  }

  // Set default signature
  const handleSetDefaultSignature = async (id: string) => {
    const result = await setDefaultSignature(id)
    if (result.success) {
      toast.success('Default signature updated')
      loadSignatures()
    } else {
      toast.error(result.error || 'Failed to set default signature')
    }
  }

  // Delete signature
  const handleDeleteSignature = async () => {
    if (!editingSignature) return

    setIsSubmitting(true)
    const result = await deleteSignature(editingSignature.id)

    if (result.success) {
      toast.success('Signature deleted')
      setShowDeleteSignatureDialog(false)
      setEditingSignature(null)
      loadSignatures()
    } else {
      toast.error(result.error || 'Failed to delete signature')
    }

    setIsSubmitting(false)
  }

  // Filter items by search
  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredDocuments = documents.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalItems = filteredFolders.length + filteredDocuments.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-blue-600 p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Files className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Reports & Documents</h1>
              <p className="text-white/80 mt-1">
                Manage your files and folders
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {activeTab === 'documents' ? (
              <>
                <Button
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                  onClick={() => {
                    setEditingFolder(null)
                    setFolderForm({ name: '', description: '' })
                    setShowFolderDialog(true)
                  }}
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
                <Button
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => {
                    setUploadForm({ name: '', description: '', file: null })
                    setShowUploadDialog(true)
                  }}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </>
            ) : (
              <Button
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => {
                  setSignatureForm({ name: '', title: '', file: null, is_default: false })
                  setShowSignatureDialog(true)
                }}
              >
                <PenTool className="mr-2 h-4 w-4" />
                Add Signature
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {activeTab === 'documents' ? (
            <>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <p className="text-sm text-white/70">Current Location</p>
                <p className="text-lg font-semibold">{currentFolder?.name || 'Root'}</p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <p className="text-sm text-white/70">Folders</p>
                <p className="text-lg font-semibold">{filteredFolders.length}</p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <p className="text-sm text-white/70">Files</p>
                <p className="text-lg font-semibold">{filteredDocuments.length}</p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <p className="text-sm text-white/70">Total Items</p>
                <p className="text-lg font-semibold">{totalItems}</p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <p className="text-sm text-white/70">Total Signatures</p>
                <p className="text-lg font-semibold">{signatures.length}</p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <p className="text-sm text-white/70">Default Signature</p>
                <p className="text-lg font-semibold">{signatures.find(s => s.is_default)?.name || 'None'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="documents" className="gap-2">
            <Files className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="signatures" className="gap-2">
            <PenTool className="h-4 w-4" />
            Signatures
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6 mt-6">
          {/* Breadcrumb & Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm overflow-x-auto">
              <Button
                variant={currentFolder ? "ghost" : "secondary"}
                size="sm"
                className="h-8 px-3 shrink-0"
                onClick={navigateToRoot}
              >
                <FolderOpen className="mr-1.5 h-4 w-4" />
                Root
              </Button>
              {folderPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center shrink-0">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant={index === folderPath.length - 1 ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => {
                      const newPath = folderPath.slice(0, index + 1)
                      setFolderPath(newPath)
                      setCurrentFolder(folder)
                    }}
                  >
                    {folder.name}
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex-1" />

            {/* Search and Actions */}
            <div className="flex items-center gap-2">
              {currentFolder && (
                <Button variant="outline" size="sm" onClick={navigateBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 sm:w-64"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={loadData} className="shrink-0">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Folders */}
          {filteredFolders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Folder className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Folders</h3>
                <Badge variant="secondary" className="ml-1">{filteredFolders.length}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredFolders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="group cursor-pointer hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 transition-all duration-200"
                    onClick={() => navigateToFolder(folder)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Folder className="h-7 w-7 text-primary" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              setEditingFolder(folder)
                              setFolderForm({ name: folder.name, description: folder.description || '' })
                              setShowFolderDialog(true)
                            }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingFolder(folder)
                                setShowDeleteFolderDialog(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="font-medium truncate mb-1">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {folder.document_count} {folder.document_count === 1 ? 'file' : 'files'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {filteredDocuments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Files</h3>
                <Badge variant="secondary" className="ml-1">{filteredDocuments.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => {
                  const fileInfo = getFileIcon(doc.file_type)
                  const FileIcon = fileInfo.icon
                  const isPreviewable = canPreview(doc.file_type)

                  return (
                    <Card key={doc.id} className="group hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${fileInfo.bg} shrink-0`}>
                            <FileIcon className={`h-6 w-6 ${fileInfo.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate" title={doc.name}>{doc.name}</p>
                                <p className="text-xs text-muted-foreground truncate" title={doc.file_name}>
                                  {doc.file_name}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleView(doc)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    setEditingDocument(doc)
                                    setShowEditDocDialog(true)
                                  }}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setEditingDocument(doc)
                                    setShowReplaceDialog(true)
                                  }}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Replace File
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                      setEditingDocument(doc)
                                      setShowDeleteDocDialog(true)
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs font-normal">
                                {getFileExtension(doc.file_name)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(doc.file_size)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredFolders.length === 0 && filteredDocuments.length === 0 && (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-6 mb-6">
                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'No results found' : 'This folder is empty'}
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  {searchQuery
                    ? `No files or folders match "${searchQuery}"`
                    : 'Get started by creating a folder or uploading a document'}
                </p>
                {!searchQuery && (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => {
                      setEditingFolder(null)
                      setFolderForm({ name: '', description: '' })
                      setShowFolderDialog(true)
                    }}>
                      <FolderPlus className="mr-2 h-4 w-4" />
                      New Folder
                    </Button>
                    <Button onClick={() => {
                      setUploadForm({ name: '', description: '', file: null })
                      setShowUploadDialog(true)
                    }}>
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
        </TabsContent>

        {/* Signatures Tab */}
        <TabsContent value="signatures" className="space-y-6 mt-6">
          {signatures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {signatures.map((signature) => (
                <Card key={signature.id} className={`group hover:shadow-lg transition-all duration-200 ${signature.is_default ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-4">
                    <div className="relative">
                      {signature.is_default && (
                        <Badge className="absolute -top-2 -right-2 bg-primary">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          Default
                        </Badge>
                      )}
                      <div className="aspect-[3/2] rounded-lg border bg-white flex items-center justify-center overflow-hidden mb-4">
                        <img
                          src={signature.image_url}
                          alt={signature.name}
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold truncate">{signature.name}</h3>
                        {signature.title && (
                          <p className="text-sm text-muted-foreground truncate">{signature.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(signature.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        {!signature.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleSetDefaultSignature(signature.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setEditingSignature(signature)
                            setShowDeleteSignatureDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-6 mb-6">
                  <PenTool className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No signatures yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  Create a signature to use on your documents
                </p>
                <Button onClick={() => {
                  setSignatureForm({ name: '', title: '', file: null, is_default: false })
                  setShowSignatureDialog(true)
                }}>
                  <PenTool className="mr-2 h-4 w-4" />
                  Add Signature
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* View Document Dialog */}
      <Dialog open={showViewDialog} onOpenChange={(open) => {
        setShowViewDialog(open)
        if (!open) {
          setIsFullscreen(false)
          setIsSignMode(false)
        }
      }}>
        <DialogContent className={`${isSignMode || isFullscreen ? '!max-w-none w-[100vw] h-[100vh] !rounded-none !p-0' : 'max-w-5xl w-[90vw] h-[85vh] max-h-[85vh]'} overflow-hidden`}>
          {/* Hide default header when in sign mode (sign mode has its own toolbar) */}
          {!isSignMode && (
            <DialogHeader className={isFullscreen ? 'absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm p-4 border-b' : ''}>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    {editingDocument?.name}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDocument?.file_name} • {formatFileSize(editingDocument?.file_size || null)}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(viewUrl || '', '_blank')}
                    title="Open in New Tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {/* More Options Menu */}
                  {editingDocument && (editingDocument.file_type?.includes('image') || editingDocument.file_type?.includes('pdf')) && signatures.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-primary/10 hover:bg-primary/20">
                        <MoreVertical className="h-5 w-5 text-primary" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {signatures.length > 0 ? (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={async () => {
                            // Setup sign mode
                            const isPdf = editingDocument.file_type?.includes('pdf')
                            setIsPdfDoc(isPdf || false)

                            if (isPdf && viewUrl) {
                              try {
                                const response = await fetch(viewUrl)
                                const arrayBuffer = await response.arrayBuffer()
                                const pdfDoc = await PDFDocument.load(arrayBuffer)
                                setPdfPageCount(pdfDoc.getPageCount())
                                setSelectedPdfPage(1)
                                // Get first page dimensions for aspect ratio
                                const firstPage = pdfDoc.getPage(0)
                                const { width, height } = firstPage.getSize()
                                setPdfPageSize({ width, height })
                              } catch (error) {
                                console.error('Error loading PDF:', error)
                                setPdfPageCount(1)
                                setPdfPageSize(null)
                              }
                            } else {
                              setPdfPageSize(null)
                            }

                            const defaultSig = signatures.find(s => s.is_default) || signatures[0]
                            setSelectedSignature(defaultSig || null)
                            setSignatureSize(120)
                            setPlacedSignatures([])
                            setSelectedPlacedId(null)
                            setDraggingSignatureId(null)
                            setDocZoom(100)
                            setPdfPageImage(null) // Reset, will be rendered by useEffect
                            setIsSignMode(true)
                            setIsFullscreen(false)
                          }}
                        >
                          <FileSignature className="mr-2 h-4 w-4" />
                          Sign Document
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="cursor-pointer text-muted-foreground"
                          onClick={() => {
                            setShowViewDialog(false)
                            setActiveTab('signatures')
                            toast.info('Create a signature first in the Signatures tab')
                          }}
                        >
                          <FileSignature className="mr-2 h-4 w-4" />
                          Sign Document
                          <Badge variant="outline" className="ml-auto text-xs">No signatures</Badge>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={async () => {
                          if (editingDocument) {
                            const { url } = await getDownloadUrl(editingDocument.file_url)
                            if (url) {
                              const link = document.createElement('a')
                              link.href = url
                              link.download = editingDocument.file_name
                              link.click()
                            }
                          }
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Original
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </DialogHeader>
          )}

          {isSignMode ? (
            /* Sign Mode - Large view with floating controls */
            <div className="relative w-full h-full">
              {/* Top Toolbar - Floating */}
              <div className="absolute top-0 left-0 right-0 z-40 p-2">
                <div className="bg-white shadow-md border rounded-lg p-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Signature Selection */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium whitespace-nowrap">Signature:</Label>
                      <div className="flex gap-2">
                        {signatures.map((sig) => (
                          <div
                            key={sig.id}
                            className={`p-1.5 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedSignature?.id === sig.id
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-200 hover:border-primary/50 bg-white'
                            }`}
                            onClick={() => setSelectedSignature(sig)}
                            title={sig.name}
                          >
                            <img src={sig.image_url} alt={sig.name} className="h-8 w-auto max-w-[60px] object-contain" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="h-8 w-px bg-gray-200" />

                    {/* Size Control for new signatures */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Size:</Label>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSignatureSize(Math.max(50, signatureSize - 20))}>
                        <ZoomOut className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">{signatureSize}px</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSignatureSize(Math.min(300, signatureSize + 20))}>
                        <ZoomIn className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Selected signature controls */}
                    {selectedPlacedId && (() => {
                      const selected = placedSignatures.find(s => s.id === selectedPlacedId)
                      if (!selected) return null
                      return (
                        <>
                          <div className="h-8 w-px bg-gray-200" />
                          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                            <span className="text-sm font-medium text-primary">Selected:</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setPlacedSignatures(prev => prev.map(s => s.id === selectedPlacedId ? { ...s, size: Math.max(50, s.size - 20) } : s))}
                            >
                              <ZoomOut className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-12 text-center">{selected.size}px</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setPlacedSignatures(prev => prev.map(s => s.id === selectedPlacedId ? { ...s, size: Math.min(300, s.size + 20) } : s))}
                            >
                              <ZoomIn className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleRemoveSignature(selectedPlacedId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )
                    })()}

                    {/* PDF Page Navigation */}
                    {isPdfDoc && pdfPageCount > 1 && (
                      <>
                        <div className="h-8 w-px bg-gray-200" />
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedPdfPage(Math.max(1, selectedPdfPage - 1))} disabled={selectedPdfPage <= 1}>
                            <ArrowLeft className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">Page {selectedPdfPage}/{pdfPageCount}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedPdfPage(Math.min(pdfPageCount, selectedPdfPage + 1))} disabled={selectedPdfPage >= pdfPageCount}>
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}

                    <div className="flex-1" />

                    {/* Document Zoom */}
                    <div className="h-8 w-px bg-gray-200" />
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Doc:</Label>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDocZoom(Math.max(25, docZoom - 25))}>
                        <ZoomOut className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">{docZoom}%</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDocZoom(Math.min(200, docZoom + 25))}>
                        <ZoomIn className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDocZoom(100)}>
                        Reset
                      </Button>
                    </div>

                    <div className="h-8 w-px bg-gray-200" />

                    {/* Placed count */}
                    <Badge variant="secondary" className="text-sm">
                      {placedSignatures.length} signature{placedSignatures.length !== 1 ? 's' : ''} placed
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Document Area - Full */}
              <div
                className="absolute inset-x-0 top-16 bottom-20 bg-gray-100 overflow-auto"
                onWheel={(e) => {
                  if (e.ctrlKey) {
                    e.preventDefault()
                    const delta = e.deltaY > 0 ? -10 : 10
                    setDocZoom(prev => Math.max(50, Math.min(200, prev + delta)))
                  }
                }}
              >
                {/* Centering wrapper - expands when zoomed for scrolling */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    padding: '1rem',
                    minHeight: '100%',
                    minWidth: '100%',
                    // Expand wrapper when zoomed to enable scrolling
                    ...(docZoom !== 100 && {
                      minHeight: `${docZoom + 20}%`,
                      minWidth: `${docZoom + 20}%`,
                    }),
                  }}
                >
                  <div
                    data-doc-area="true"
                    className="relative bg-white cursor-crosshair shadow-lg"
                    style={{
                      // Fixed logical size
                      ...(pdfPageSize ? {
                        aspectRatio: `${pdfPageSize.width} / ${pdfPageSize.height}`,
                        width: 'auto',
                        height: '70vh',
                      } : {
                        width: '70vh',
                        height: '70vh',
                      }),
                      // Visual zoom via transform - origin at top-left for simpler calculations
                      transform: `scale(${docZoom / 100})`,
                      transformOrigin: 'top left',
                    }}
                    onClick={(e) => {
                      // Get the scaled rect
                      const rect = e.currentTarget.getBoundingClientRect()
                      const scale = docZoom / 100

                      // Calculate click position in LOGICAL (unscaled) coordinates
                      // rect dimensions are scaled, so divide to get logical size
                      const logicalWidth = rect.width / scale
                      const logicalHeight = rect.height / scale

                      // Click offset from scaled top-left, converted to logical
                      const clickX = (e.clientX - rect.left) / scale
                      const clickY = (e.clientY - rect.top) / scale

                      // Percentage of logical dimensions
                      const x = (clickX / logicalWidth) * 100
                      const y = (clickY / logicalHeight) * 100

                      handleAddSignature(x, y)
                    }}
                  >
                    {/* Document Preview */}
                    {viewUrl && editingDocument && (
                      <>
                        {editingDocument.file_type?.includes('image') ? (
                          <img src={viewUrl} alt="Document" className="absolute inset-0 w-full h-full pointer-events-none" />
                        ) : pdfPageImage ? (
                          <img src={pdfPageImage} alt="PDF Page" className="absolute inset-0 w-full h-full pointer-events-none" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                              <p className="text-sm text-muted-foreground">Loading PDF...</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Placed Signatures - positioned relative to container */}
                    {placedSignatures
                      .filter(s => !isPdfDoc || s.page === selectedPdfPage)
                      .map((placed, index) => (
                        <div
                          key={placed.id}
                          className="absolute"
                          style={{
                            left: `${placed.x}%`,
                            top: `${placed.y}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: selectedPlacedId === placed.id ? 50 : 20 + index
                          }}
                        >
                          <div
                            className={`relative cursor-move ${selectedPlacedId === placed.id ? 'outline outline-4 outline-primary outline-offset-2 rounded' : 'hover:outline hover:outline-2 hover:outline-gray-400 hover:outline-offset-2 rounded'}`}
                            onClick={(e) => { e.stopPropagation(); setSelectedPlacedId(placed.id) }}
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              setDraggingSignatureId(placed.id)
                              setSelectedPlacedId(placed.id)
                            }}
                          >
                            <img
                              src={placed.signature.image_url}
                              alt={placed.signature.name}
                              style={{ width: `${placed.size}px` }}
                              className="pointer-events-none bg-white rounded shadow-xl select-none"
                              draggable={false}
                            />
                            <button
                              type="button"
                              className="absolute -top-3 -right-3 h-7 w-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                handleRemoveSignature(placed.id)
                              }}
                              title="Delete"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                  {/* Drag overlay */}
                  {draggingSignatureId && (
                    <div
                      className="fixed inset-0 cursor-move z-[100]"
                      onMouseMove={(e) => {
                        const docArea = document.querySelector('[data-doc-area]') as HTMLElement
                        if (!docArea) return
                        const rect = docArea.getBoundingClientRect()
                        const scale = docZoom / 100

                        // Convert to logical coordinates
                        const logicalWidth = rect.width / scale
                        const logicalHeight = rect.height / scale
                        const clickX = (e.clientX - rect.left) / scale
                        const clickY = (e.clientY - rect.top) / scale

                        const x = Math.max(5, Math.min(95, (clickX / logicalWidth) * 100))
                        const y = Math.max(5, Math.min(95, (clickY / logicalHeight) * 100))
                        setPlacedSignatures(prev => prev.map(s => s.id === draggingSignatureId ? { ...s, x, y } : s))
                      }}
                      onMouseUp={() => setDraggingSignatureId(null)}
                      onMouseLeave={() => setDraggingSignatureId(null)}
                    />
                  )}

                  {/* Help overlay when no signatures */}
                  {placedSignatures.filter(s => !isPdfDoc || s.page === selectedPdfPage).length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/70 text-white rounded-2xl p-8 text-center max-w-md">
                        <FileSignature className="h-16 w-16 mx-auto mb-4 opacity-80" />
                        <p className="text-xl font-semibold mb-2">Click anywhere to place signature</p>
                        <p className="text-sm opacity-80">
                          Select a signature from the top toolbar, then click on the document where you want to place it
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </div>

              {/* Bottom Action Bar - Floating */}
              <div className="absolute bottom-0 left-0 right-0 z-40 p-3">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border p-3">
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={() => { setIsSignMode(false); setPlacedSignatures([]); setSelectedPlacedId(null) }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>

                    {/* Placed signatures summary */}
                    {placedSignatures.length > 0 && (
                      <div className="flex items-center gap-2 flex-1 justify-center">
                        {placedSignatures.slice(0, 5).map((placed, i) => (
                          <div
                            key={placed.id}
                            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center bg-white cursor-pointer transition-all ${
                              selectedPlacedId === placed.id ? 'border-primary' : 'border-gray-200'
                            }`}
                            onClick={() => {
                              setSelectedPlacedId(placed.id)
                              if (isPdfDoc) setSelectedPdfPage(placed.page)
                            }}
                            title={`Signature ${i + 1}: ${placed.signature.name}`}
                          >
                            <img src={placed.signature.image_url} alt="" className="max-w-full max-h-full object-contain p-1" />
                          </div>
                        ))}
                        {placedSignatures.length > 5 && (
                          <Badge variant="outline">+{placedSignatures.length - 5} more</Badge>
                        )}
                      </div>
                    )}

                    <Button
                      size="lg"
                      onClick={handleSaveSigned}
                      disabled={isSubmitting || placedSignatures.length === 0}
                      className="min-w-[150px]"
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      Save
                    </Button>
                    <Button
                      onClick={handleDownloadSigned}
                      disabled={isSubmitting || placedSignatures.length === 0}
                      variant="outline"
                      className="min-w-[150px]"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Normal View Mode */
            <>
              <div className={`relative overflow-auto rounded-lg border bg-muted/30 ${isFullscreen ? 'h-[calc(100vh-140px)] mt-16' : 'min-h-[400px] max-h-[60vh]'}`}>
                {viewUrl && editingDocument && (
                  <>
                    {editingDocument.file_type?.includes('image') ? (
                      <div className={`flex items-center justify-center p-4 ${isFullscreen ? 'h-full' : ''}`}>
                        <img
                          src={viewUrl}
                          alt={editingDocument.name}
                          className={`object-contain rounded-lg ${isFullscreen ? 'max-w-full max-h-full' : 'max-w-full max-h-[55vh]'}`}
                        />
                      </div>
                    ) : editingDocument.file_type?.includes('pdf') ? (
                      <iframe
                        src={viewUrl}
                        className={`w-full ${isFullscreen ? 'h-full' : 'h-[60vh]'}`}
                        title={editingDocument.name}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16">
                        <File className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Preview not available for this file type
                        </p>
                        <Button onClick={() => handleDownload(editingDocument)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download to View
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter className={isFullscreen ? 'absolute bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm p-4 border-t' : ''}>
                <Button variant="outline" onClick={() => {
                  setShowViewDialog(false)
                  setIsFullscreen(false)
                }}>
                  Close
                </Button>
                {editingDocument && (
                  <Button onClick={() => handleDownload(editingDocument)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Folder Dialog */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              {editingFolder ? 'Edit Folder' : 'Create Folder'}
            </DialogTitle>
            <DialogDescription>
              {editingFolder ? 'Update folder details' : 'Create a new folder to organize your documents'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name *</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={folderForm.name}
                onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder-desc">Description</Label>
              <Textarea
                id="folder-desc"
                placeholder="Optional description"
                value={folderForm.description}
                onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFolder} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingFolder ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Upload Document
            </DialogTitle>
            <DialogDescription>
              Upload to {currentFolder ? `"${currentFolder.name}"` : 'root folder'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-file">File *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Input
                  ref={fileInputRef}
                  id="doc-file"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setUploadForm({
                        ...uploadForm,
                        file,
                        name: uploadForm.name || file.name.replace(/\.[^/.]+$/, ''),
                      })
                    }
                  }}
                />
                {uploadForm.file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{uploadForm.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadForm.file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setUploadForm({ ...uploadForm, file: null })
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="doc-file" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium">Click to upload</p>
                    <p className="text-sm text-muted-foreground">
                      Max 50MB. PDF, Word, Excel, Images, etc.
                    </p>
                  </label>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-name">Document Name *</Label>
              <Input
                id="doc-name"
                placeholder="Enter document name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-desc">Description</Label>
              <Textarea
                id="doc-desc"
                placeholder="Optional description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isSubmitting || !uploadForm.file}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={showEditDocDialog} onOpenChange={setShowEditDocDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Document
            </DialogTitle>
            <DialogDescription>Update document details</DialogDescription>
          </DialogHeader>
          {editingDocument && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-doc-name">Document Name *</Label>
                <Input
                  id="edit-doc-name"
                  value={editingDocument.name}
                  onChange={(e) => setEditingDocument({ ...editingDocument, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-doc-desc">Description</Label>
                <Textarea
                  id="edit-doc-desc"
                  value={editingDocument.description || ''}
                  onChange={(e) => setEditingDocument({ ...editingDocument, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDocDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDocument} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace Document Dialog */}
      <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Replace File
            </DialogTitle>
            <DialogDescription>
              Upload a new file to replace &quot;{editingDocument?.file_name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Input
                ref={replaceFileInputRef}
                id="replace-file"
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleReplaceDocument(file)
                  }
                }}
              />
              <label htmlFor="replace-file" className="cursor-pointer">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium">Click to select new file</p>
                <p className="text-sm text-muted-foreground">
                  The file will be replaced immediately
                </p>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplaceDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation */}
      <AlertDialog open={showDeleteFolderDialog} onOpenChange={setShowDeleteFolderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{editingFolder?.name}&quot;? This will also delete all documents inside this folder. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Document Confirmation */}
      <AlertDialog open={showDeleteDocDialog} onOpenChange={setShowDeleteDocDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{editingDocument?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={(open) => {
        setShowSignatureDialog(open)
        if (!open) {
          setDrawnSignature(null)
          setSignatureForm({ name: '', title: '', file: null, is_default: false })
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Add Signature
            </DialogTitle>
            <DialogDescription>
              Draw your signature or upload an image
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Mode Tabs */}
            <Tabs value={signatureMode} onValueChange={(v) => setSignatureMode(v as 'upload' | 'draw')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="draw" className="gap-2">
                  <PenTool className="h-4 w-4" />
                  Draw
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="draw" className="mt-4">
                {drawnSignature ? (
                  <div className="space-y-3">
                    <div className="border-2 rounded-lg p-4 bg-white">
                      <img
                        src={drawnSignature}
                        alt="Your signature"
                        className="max-w-full max-h-[150px] mx-auto object-contain"
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDrawnSignature(null)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Redraw Signature
                      </Button>
                    </div>
                  </div>
                ) : (
                  <SignaturePad onSave={handleSignatureDrawn} width={400} height={180} />
                )}
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Input
                    ref={signatureFileInputRef}
                    id="sig-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSignatureForm({ ...signatureForm, file })
                      }
                    }}
                  />
                  {signatureForm.file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-full max-w-[200px] aspect-[3/2] rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                        <img
                          src={URL.createObjectURL(signatureForm.file)}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{signatureForm.file.name}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSignatureForm({ ...signatureForm, file: null })
                          if (signatureFileInputRef.current) signatureFileInputRef.current.value = ''
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="sig-file" className="cursor-pointer">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="font-medium">Click to upload signature</p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG, GIF, SVG (max 5MB)
                      </p>
                    </label>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="sig-name">Name *</Label>
              <Input
                id="sig-name"
                placeholder="e.g., John Doe Signature"
                value={signatureForm.name}
                onChange={(e) => setSignatureForm({ ...signatureForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sig-title">Title/Position</Label>
              <Input
                id="sig-title"
                placeholder="e.g., Managing Director"
                value={signatureForm.title}
                onChange={(e) => setSignatureForm({ ...signatureForm, title: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sig-default"
                checked={signatureForm.is_default}
                onCheckedChange={(checked) => setSignatureForm({ ...signatureForm, is_default: checked === true })}
              />
              <Label htmlFor="sig-default" className="text-sm font-normal cursor-pointer">
                Set as default signature
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSignature}
              disabled={isSubmitting || !signatureForm.name || (signatureMode === 'upload' ? !signatureForm.file : !drawnSignature)}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Signature Confirmation */}
      <AlertDialog open={showDeleteSignatureDialog} onOpenChange={setShowDeleteSignatureDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Signature</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{editingSignature?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSignature}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
