'use client'

import { useState, useRef } from 'react'
import { Upload, X, Link as LinkIcon, Loader2, ImageIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  bucket?: string
  folder?: string
}

// Image preview component
function ImagePreview({
  url,
  index,
  onRemove,
  isMain
}: {
  url: string
  index: number
  onRemove: () => void
  isMain: boolean
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className="relative group aspect-square rounded-lg border overflow-hidden bg-muted">
      {!error ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Image ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <ImageIcon className="h-6 w-6 mb-1" />
          <span className="text-[10px]">Failed</span>
        </div>
      )}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      {isMain && (
        <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded z-10">
          Main
        </span>
      )}
    </div>
  )
}

export function MultiImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  bucket = 'product-images',
  folder = 'products'
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check max images limit
    if (value.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setIsUploading(true)
    const newUrls: string[] = []

    try {
      const supabase = createClient()

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`)
          continue
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 5MB`)
          continue
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Upload error:', error)
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path)

        newUrls.push(publicUrl)
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls])
        toast.success(`${newUrls.length} image(s) uploaded!`)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload images')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter an image URL')
      return
    }

    if (value.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    // Basic URL validation
    try {
      new URL(urlInput)
      onChange([...value, urlInput.trim()])
      setUrlInput('')
      setShowUrlInput(false)
      toast.success('Image URL added!')
    } catch {
      toast.error('Please enter a valid URL')
    }
  }

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
  }

  const canAddMore = value.length < maxImages

  return (
    <div className="space-y-3">
      <Label>Product Images ({value.length}/{maxImages})</Label>

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {value.map((url, index) => (
            <ImagePreview
              key={`${url}-${index}`}
              url={url}
              index={index}
              onRemove={() => handleRemove(index)}
              isMain={index === 0}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No images added yet
          </p>
        </div>
      )}

      {/* Upload Options */}
      {canAddMore && (
        <div className="flex flex-wrap gap-2">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Images
              </>
            )}
          </Button>

          {/* URL Input Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlInput(!showUrlInput)}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Add URL
          </Button>
        </div>
      )}

      {/* URL Input */}
      {showUrlInput && canAddMore && (
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleUrlSubmit()
              }
            }}
          />
          <Button type="button" size="sm" onClick={handleUrlSubmit}>
            Add
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Upload up to {maxImages} images (max 5MB each). First image will be the main image.
      </p>
    </div>
  )
}
