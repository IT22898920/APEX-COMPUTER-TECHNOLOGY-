'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Package, Edit, Download, FileText } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils/format'
import { exportToPDF, formatPDFCurrency } from '@/lib/utils/pdf-export'
import { DeleteProductButton } from './delete-button'

interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  category_id: string | null
  image_url: string | null
  cost_price: number
  selling_price: number
  stock_quantity: number
  reorder_level: number
  is_active: boolean
  created_at: string
  category: { name: string } | null
}

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter products based on search
  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.category?.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    )
  })

  // Export to PDF with company letterhead
  const handleExportPDF = async (type: 'all' | 'filtered' | 'low-stock') => {
    let title = 'Product Inventory Report'
    let dataToExport = filteredProducts

    if (type === 'low-stock') {
      title = 'Low Stock Products Report'
      dataToExport = products.filter(p => p.stock_quantity <= p.reorder_level)
    } else if (type === 'all') {
      title = 'Complete Product Inventory'
      dataToExport = products
    }

    const tableData = dataToExport.map(product => [
      product.sku,
      product.name,
      product.category?.name || '-',
      formatPDFCurrency(product.cost_price),
      formatPDFCurrency(product.selling_price),
      product.stock_quantity.toString(),
      product.is_active ? 'Active' : 'Inactive'
    ])

    const totalStockValue = dataToExport.reduce((sum, p) => sum + (p.selling_price * p.stock_quantity), 0)
    const totalCostValue = dataToExport.reduce((sum, p) => sum + (p.cost_price * p.stock_quantity), 0)

    const doc = await exportToPDF({
      title,
      headers: ['SKU', 'Product Name', 'Category', 'Cost', 'Price', 'Stock', 'Status'],
      data: tableData,
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 28 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 20, halign: 'center' }
      },
      summary: [
        { label: 'Total Products', value: dataToExport.length.toString() },
        { label: 'Active Products', value: dataToExport.filter(p => p.is_active).length.toString() },
        { label: 'Total Stock Value', value: formatPDFCurrency(totalStockValue) },
        { label: 'Total Cost Value', value: formatPDFCurrency(totalCostValue) },
        { label: 'Potential Profit', value: formatPDFCurrency(totalStockValue - totalCostValue) }
      ]
    })

    const fileName = type === 'low-stock'
      ? `low-stock-report-${new Date().toISOString().split('T')[0]}.pdf`
      : `product-inventory-${new Date().toISOString().split('T')[0]}.pdf`

    doc.save(fileName)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Products</CardTitle>
            <CardDescription>
              {filteredProducts.length} of {products.length} products
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px] sm:w-[250px]"
              />
            </div>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportPDF('filtered')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export Current View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportPDF('all')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export All Products
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportPDF('low-stock')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export Low Stock Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            {products.length === 0 ? (
              <>
                <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
                <p className="text-muted-foreground mt-2">
                  Get started by adding your first product.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/admin/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search query.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">{product.sku}</code>
                    </TableCell>
                    <TableCell>
                      {product.category?.name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.cost_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.selling_price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          product.stock_quantity === 0
                            ? 'destructive'
                            : product.stock_quantity <= product.reorder_level
                            ? 'outline'
                            : 'secondary'
                        }
                        className={
                          product.stock_quantity === 0
                            ? ''
                            : product.stock_quantity <= product.reorder_level
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : ''
                        }
                      >
                        {product.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
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
