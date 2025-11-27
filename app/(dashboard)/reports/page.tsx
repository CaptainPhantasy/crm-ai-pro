/**
 * Reports Page
 * Main reports and analytics dashboard
 *
 * Agent Swarm 7: Reports & Analytics
 */

'use client'

import { useState, useEffect } from 'react'
import { ReportTemplate, ReportFilters, Report, ReportData, ChartType } from '@/lib/types/reports'
import { getDefaultFilters } from '@/lib/reports/date-utils'
import { ReportTemplateSelector } from '@/components/reports/ReportTemplateSelector'
import { ReportFilterPanel } from '@/components/reports/ReportFilterPanel'
import { ReportPreview } from '@/components/reports/ReportPreview'
import { ReportExportButton } from '@/components/reports/ReportExportButton'
import { ReportBuilderDialog } from '@/components/reports/ReportBuilderDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, RefreshCw } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [filters, setFilters] = useState<ReportFilters>(getDefaultFilters())
  const [report, setReport] = useState<Report | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [chartType, setChartType] = useState<ChartType>('line')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [customReportDialogOpen, setCustomReportDialogOpen] = useState(false)

  // Auto-generate report when template or filters change
  useEffect(() => {
    if (selectedTemplate) {
      generateReport()
    }
  }, [selectedTemplate, filters])

  const generateReport = async () => {
    if (!selectedTemplate) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        from: filters.dateRange.from,
        to: filters.dateRange.to,
      })

      if (filters.techId) params.append('techId', filters.techId)
      if (filters.customerId) params.append('customerId', filters.customerId)
      if (filters.jobStatus?.[0]) params.append('status', filters.jobStatus[0])
      if (filters.serviceType?.[0]) params.append('serviceType', filters.serviceType[0])

      const response = await fetch(`/api/reports/${selectedTemplate.id}?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const { data, metadata } = await response.json()

      const newReport: Report = {
        id: `report-${Date.now()}`,
        type: selectedTemplate.id,
        title: selectedTemplate.name,
        description: selectedTemplate.description,
        filters,
        data,
        chartType: selectedTemplate.defaultChartType,
        createdAt: metadata.generatedAt,
        createdBy: metadata.generatedBy,
        accountId: '',
      }

      setReport(newReport)
      setReportData(data)
      setChartType(selectedTemplate.defaultChartType)

      toast({
        title: 'Report Generated',
        description: `${selectedTemplate.name} generated successfully`,
      })
    } catch (err) {
      const error = err as Error
      setError(error)
      toast({
        title: 'Report Generation Failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setReport(null)
    setReportData(null)
    setError(null)
  }

  const handleFiltersChange = (newFilters: ReportFilters) => {
    setFilters(newFilters)
  }

  const handleChartTypeChange = (newChartType: ChartType) => {
    setChartType(newChartType)
    if (report) {
      setReport({ ...report, chartType: newChartType })
    }
  }

  const handleRefresh = () => {
    generateReport()
  }

  const handleSaveCustomReport = (config: any) => {
    toast({
      title: 'Custom Report Saved',
      description: 'Your custom report has been saved successfully',
    })
    // In production, would save to database
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Generate comprehensive business reports and analyze your data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCustomReportDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Custom Report
          </Button>
          {report && (
            <>
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <ReportExportButton
                report={report}
                type={selectedTemplate!.id}
                filters={filters}
              />
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6 mt-6">
          {!selectedTemplate ? (
            <ReportTemplateSelector
              onSelectTemplate={handleTemplateSelect}
              selectedTemplate={selectedTemplate || undefined}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <ReportFilterPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  availableFilters={selectedTemplate.availableFilters}
                />

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Change Template
                </Button>
              </div>

              {/* Report Preview */}
              <div className="lg:col-span-3">
                {loading && !reportData ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-sm text-muted-foreground mt-4">
                          Generating report...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : report && reportData ? (
                  <ReportPreview
                    report={report}
                    data={reportData}
                    chartType={chartType}
                    onChartTypeChange={handleChartTypeChange}
                    loading={loading}
                    error={error}
                  />
                ) : null}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <p className="text-muted-foreground">No saved reports yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Generate and save reports to access them here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Report Builder Dialog */}
      <ReportBuilderDialog
        open={customReportDialogOpen}
        onOpenChange={setCustomReportDialogOpen}
        onSave={handleSaveCustomReport}
      />
    </div>
  )
}
