'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Briefcase, Star, Eye, EyeOff, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ServiceActions } from './service-actions'
import { type Service } from './actions'
import { exportToPDF } from '@/lib/utils/pdf-export'

interface ServicesTableProps {
  services: Service[]
}

// Icon mapping for display
const iconDisplay: Record<string, string> = {
  Monitor: '💻',
  Printer: '🖨️',
  Wrench: '🔧',
  Network: '🌐',
  ShoppingCart: '🛒',
  Cpu: '⚙️',
  Cable: '🔌',
  Package: '📦',
  FileText: '📄',
  Laptop: '💼',
  HardDrive: '💾',
  Zap: '⚡',
}

export function ServicesTable({ services }: ServicesTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter services based on search
  const filteredServices = services.filter(service => {
    const query = searchQuery.toLowerCase()
    return (
      service.title.toLowerCase().includes(query) ||
      service.slug.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.features?.some(f => f.toLowerCase().includes(query))
    )
  })

  // Export to PDF
  const handleExportPDF = async () => {
    const tableData = services.map(service => [
      service.title,
      service.description.length > 60
        ? service.description.substring(0, 60) + '...'
        : service.description,
      (service.features || []).slice(0, 3).join(', ') +
        ((service.features || []).length > 3 ? '...' : ''),
      service.is_featured ? 'Yes' : 'No',
      service.is_active ? 'Active' : 'Inactive'
    ])

    const doc = await exportToPDF({
      title: 'Services Report',
      headers: ['Service', 'Description', 'Features', 'Featured', 'Status'],
      data: tableData,
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 55 },
        2: { cellWidth: 45 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' }
      },
      summary: [
        { label: 'Total Services', value: services.length.toString() },
        { label: 'Active Services', value: services.filter(s => s.is_active).length.toString() },
        { label: 'Featured Services', value: services.filter(s => s.is_featured).length.toString() }
      ]
    })

    doc.save(`services-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Services</CardTitle>
            <CardDescription>
              {filteredServices.length} of {services.length} services
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px] sm:w-[250px]"
              />
            </div>

            {/* Export */}
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No services yet</h3>
            <p className="text-muted-foreground mt-2">
              Get started by adding your first service.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/admin/services/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Link>
            </Button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No services found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {iconDisplay[service.icon] || '🔧'}
                        </span>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {service.title}
                            {service.is_featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                        {service.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(service.features || []).slice(0, 2).map((feature, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {(service.features || []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{service.features.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {service.is_active ? (
                          <Badge variant="default" className="gap-1">
                            <Eye className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <EyeOff className="h-3 w-3" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <ServiceActions service={service} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
