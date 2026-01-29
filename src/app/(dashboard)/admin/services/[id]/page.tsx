'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, X, Plus, Briefcase, ImageIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { updateService, getServices, type Service } from '../actions'
import { MultiImageUpload } from '@/components/ui/multi-image-upload'

// Available icons for services
const AVAILABLE_ICONS = [
  { value: 'Monitor', label: 'Computer/Laptop', emoji: '💻' },
  { value: 'Printer', label: 'Printer', emoji: '🖨️' },
  { value: 'Wrench', label: 'Repairs/Maintenance', emoji: '🔧' },
  { value: 'Network', label: 'Network/Cabling', emoji: '🌐' },
  { value: 'ShoppingCart', label: 'Sales', emoji: '🛒' },
  { value: 'Cpu', label: 'Hardware/Parts', emoji: '⚙️' },
  { value: 'Cable', label: 'Cables', emoji: '🔌' },
  { value: 'Package', label: 'Accessories', emoji: '📦' },
  { value: 'FileText', label: 'Contracts/Agreements', emoji: '📄' },
  { value: 'Laptop', label: 'Rental', emoji: '💼' },
  { value: 'HardDrive', label: 'Storage/Memory', emoji: '💾' },
  { value: 'Zap', label: 'Power/UPS', emoji: '⚡' },
]

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [service, setService] = useState<Service | null>(null)
  const [newFeature, setNewFeature] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    icon: 'Monitor',
    features: [] as string[],
    images: [] as string[],
    is_featured: false,
    is_active: true,
  })

  // Load service
  useEffect(() => {
    const loadService = async () => {
      const { services, error } = await getServices()

      if (error) {
        toast.error('Failed to load service')
        router.push('/admin/services')
        return
      }

      const svc = services.find(s => s.id === id)
      if (!svc) {
        toast.error('Service not found')
        router.push('/admin/services')
        return
      }

      setService(svc)
      setFormData({
        title: svc.title,
        slug: svc.slug,
        description: svc.description,
        icon: svc.icon,
        features: svc.features || [],
        images: svc.images?.length ? svc.images : (svc.image_url ? [svc.image_url] : []),
        is_featured: svc.is_featured,
        is_active: svc.is_active,
      })
      setIsFetching(false)
    }

    loadService()
  }, [id, router])

  // Add feature
  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature('')
    }
  }

  // Remove feature
  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.title || !formData.description) {
      toast.error('Please fill in title and description')
      setIsLoading(false)
      return
    }

    const result = await updateService(id, {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      icon: formData.icon,
      images: formData.images,
      features: formData.features,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
    })

    setIsLoading(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to update service')
      return
    }

    toast.success('Service updated successfully!')
    router.replace('/admin/services')
    router.refresh()
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading service...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Service not found</h3>
          <Button className="mt-4" asChild>
            <Link href="/admin/services">Back to Services</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Service</h1>
          <p className="text-muted-foreground">
            Update service information
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>
              Update the service details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Service Name *</Label>
              <Input
                id="title"
                placeholder="e.g., Computer Sales & Repairs"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this service offers..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <span className="flex items-center gap-2">
                        <span>{icon.emoji}</span>
                        <span>{icon.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Images */}
            <div className="space-y-2">
              <Label>Service Images</Label>
              <MultiImageUpload
                value={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
                maxImages={5}
                bucket="product-images"
                folder="services"
              />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label>Features / What&apos;s Included</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., HP, Canon, Epson brands"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddFeature()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="gap-1">
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feature)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Add features one by one (press Enter or click +)
              </p>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_featured">Show on Homepage</Label>
                  <p className="text-xs text-muted-foreground">
                    Display this service on the homepage
                  </p>
                </div>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Make this service visible to customers
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/services">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
