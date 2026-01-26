'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PROBLEM_CATEGORIES, TICKET_PRIORITIES } from '@/lib/utils/constants'

export default function NewServiceRequestPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemCategory: '',
    priority: 'medium',
    deviceType: '',
    deviceBrand: '',
    deviceModel: '',
    isOnsite: true,
    locationAddress: '',
    contactPerson: '',
    contactPhone: '',
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to submit a request')
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('service_tickets') as any).insert({
        customer_id: user.id,
        title: formData.title,
        description: formData.description,
        problem_category: formData.problemCategory || null,
        priority: formData.priority,
        device_info: formData.deviceType ? {
          type: formData.deviceType,
          brand: formData.deviceBrand,
          model: formData.deviceModel,
        } : null,
        is_onsite: formData.isOnsite,
        service_location: formData.isOnsite ? {
          address: formData.locationAddress,
          contact_person: formData.contactPerson,
          contact_phone: formData.contactPhone,
        } : null,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Service request submitted successfully!')
      router.push('/customer/service-requests')
      router.refresh()
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customer/service-requests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Service Request</h1>
          <p className="text-muted-foreground">
            Describe your issue and we&apos;ll get back to you within our SLA
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Issue Details */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>Describe the problem you&apos;re experiencing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Please provide as much detail as possible..."
                rows={5}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Problem Category</Label>
                <Select
                  value={formData.problemCategory}
                  onValueChange={(value) => handleChange('problemCategory', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROBLEM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange('priority', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TICKET_PRIORITIES).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>Optional: Tell us about the affected device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <Input
                  id="deviceType"
                  placeholder="e.g., Desktop, Laptop"
                  value={formData.deviceType}
                  onChange={(e) => handleChange('deviceType', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceBrand">Brand</Label>
                <Input
                  id="deviceBrand"
                  placeholder="e.g., HP, Dell, Lenovo"
                  value={formData.deviceBrand}
                  onChange={(e) => handleChange('deviceBrand', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceModel">Model</Label>
                <Input
                  id="deviceModel"
                  placeholder="e.g., ProBook 450 G8"
                  value={formData.deviceModel}
                  onChange={(e) => handleChange('deviceModel', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Location */}
        <Card>
          <CardHeader>
            <CardTitle>Service Location</CardTitle>
            <CardDescription>Where should we send the technician?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Service Type:</Label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.isOnsite}
                    onChange={() => handleChange('isOnsite', true)}
                    className="h-4 w-4"
                    disabled={isLoading}
                  />
                  <span className="text-sm">On-site (we come to you)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.isOnsite}
                    onChange={() => handleChange('isOnsite', false)}
                    className="h-4 w-4"
                    disabled={isLoading}
                  />
                  <span className="text-sm">Drop-off (bring to our office)</span>
                </label>
              </div>
            </div>

            {formData.isOnsite && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="address">Service Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Full address where service is needed"
                    value={formData.locationAddress}
                    onChange={(e) => handleChange('locationAddress', e.target.value)}
                    required={formData.isOnsite}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Name of person to contact on-site"
                      value={formData.contactPerson}
                      onChange={(e) => handleChange('contactPerson', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+94 XX XXX XXXX"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href="/customer/service-requests">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  )
}
