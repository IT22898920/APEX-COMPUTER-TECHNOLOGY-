'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { Search, Plus, FolderTree, Folder, FolderOpen, Download } from 'lucide-react'
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
import { CategoryActions } from './category-actions'
import { type Category } from './actions'
import { exportToPDF } from '@/lib/utils/pdf-export'

interface CategoriesTableProps {
  categories: Category[]
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Build category tree
  const parentCategories = categories.filter(c => !c.parent_id)
  const childCategories = categories.filter(c => c.parent_id)

  const getChildren = (parentId: string) =>
    childCategories.filter(c => c.parent_id === parentId)

  // Filter categories based on search
  const filteredParentCategories = parentCategories.filter(category => {
    const query = searchQuery.toLowerCase()
    const matchesParent =
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)

    const children = getChildren(category.id)
    const hasMatchingChild = children.some(child =>
      child.name.toLowerCase().includes(query) ||
      child.slug.toLowerCase().includes(query) ||
      child.description?.toLowerCase().includes(query)
    )

    return matchesParent || hasMatchingChild
  })

  const getFilteredChildren = (parentId: string) => {
    const children = getChildren(parentId)
    if (!searchQuery) return children

    const query = searchQuery.toLowerCase()
    return children.filter(child =>
      child.name.toLowerCase().includes(query) ||
      child.slug.toLowerCase().includes(query) ||
      child.description?.toLowerCase().includes(query)
    )
  }

  const filteredCount = filteredParentCategories.reduce((count, parent) => {
    return count + 1 + getFilteredChildren(parent.id).length
  }, 0)

  // Export to PDF
  const handleExportPDF = async () => {
    const tableData: string[][] = []

    parentCategories.forEach(parent => {
      tableData.push([
        parent.name,
        parent.slug,
        parent.description || '-',
        parent.is_active ? 'Active' : 'Inactive',
        'Parent'
      ])

      getChildren(parent.id).forEach(child => {
        tableData.push([
          `   └ ${child.name}`,
          child.slug,
          child.description || '-',
          child.is_active ? 'Active' : 'Inactive',
          'Sub-category'
        ])
      })
    })

    const doc = await exportToPDF({
      title: 'Product Categories Report',
      headers: ['Category Name', 'Slug', 'Description', 'Status', 'Type'],
      data: tableData,
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 35 },
        2: { cellWidth: 50 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 30, halign: 'center' }
      },
      summary: [
        { label: 'Total Categories', value: categories.length.toString() },
        { label: 'Parent Categories', value: parentCategories.length.toString() },
        { label: 'Sub-categories', value: childCategories.length.toString() },
        { label: 'Active Categories', value: categories.filter(c => c.is_active).length.toString() }
      ]
    })

    doc.save(`categories-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>
              {filteredCount} of {categories.length} categories
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
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
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No categories yet</h3>
            <p className="text-muted-foreground mt-2">
              Get started by adding your first category.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/admin/categories/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Link>
            </Button>
          </div>
        ) : filteredParentCategories.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No categories found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParentCategories.map((category) => (
                  <Fragment key={category.id}>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-primary" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-1">
                          {category.description || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <CategoryActions category={category} />
                      </TableCell>
                    </TableRow>
                    {getFilteredChildren(category.id).map((child) => (
                      <TableRow key={child.id} className="bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2 pl-6">
                            <span className="text-muted-foreground">└</span>
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{child.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {child.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {child.description || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={child.is_active ? 'default' : 'secondary'}>
                            {child.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <CategoryActions category={child} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
