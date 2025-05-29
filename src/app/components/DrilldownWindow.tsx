"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  X, Maximize, Minimize, Download, ArrowUp, ArrowDown, Filter, Search, 
  Mail, Image, Share2 
} from "lucide-react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";

interface DrilldownWindowProps {
  id: string;
  title: string;
  data: any[];
  fullData: any[];
  groupKey: string;
  groupValue: string;
  onClose: (id: string) => void;
}

export default function DrilldownWindow({
  id,
  title,
  data,
  fullData,
  groupKey,
  groupValue,
  onClose,
}: DrilldownWindowProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const windowRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  
  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  // This enhances your data with proper inventory value calculations
  const enhancedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      // Look for quantity fields with various possible names
      const qtyField = item.Quantity_on_Hand ?? item.QTY_ON_HAND ?? item.Qty_On_Hand ?? 0;
      const costField = item.Avg_Cost ?? item.AVG_COST ?? item.Unit_Cost ?? 0;
      
      // Convert to numbers and handle potential strings
      const qty = typeof qtyField === 'string' ? parseFloat(qtyField) : Number(qtyField);
      const cost = typeof costField === 'string' ? parseFloat(costField) : Number(costField);
      
      // Calculate inventory value
      const inventoryValue = qty * cost;
      
      return {
        ...item,
        // Ensure we have consistent field names
        Quantity_on_Hand: qty,
        Avg_Cost: cost,
        Inventory_Value: inventoryValue
      };
    });
  }, [data]);

  const visibleColumns = useMemo(() => [
    { key: "Location", header: "Location" },
    { key: "Item_ID", header: "Item ID" },
    { key: "Item_Description", header: "Item Description" },
    { key: "Quantity_on_Hand", header: "Quantity on Hand" },
    { key: "Avg_Cost", header: "Avg Cost" },
    { key: "Inventory_Value", header: "Inventory Value" },
  ], []);

  // Create columns based on data
  const columns = useMemo(() => {
    return visibleColumns.map(col => ({
      accessorKey: col.key,
      header: col.header,
      enableSorting: true,
      enableColumnFilter: true,
      cell: info => {
        const value = info.getValue();
        
        // Format currency values
        if (col.key === "Avg_Cost" || col.key === "Inventory_Value") {
          return value != null ? 
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(Number(value)) : "";
        }
        
        // Format quantities
        if (col.key === "Quantity_on_Hand") {
          return value != null ? Number(value).toLocaleString() : "";
        }
        
        return value;
      }
    }));
  }, [visibleColumns]);

  // Initialize column visibility
  useEffect(() => {
    if (data.length > 0) {
      const initialVisibility: Record<string, boolean> = {};
      Object.keys(data[0]).forEach(column => {
        const sample = data[0][column];
        const shouldHide = typeof sample === 'string' && sample.length > 100;
        initialVisibility[column] = !shouldHide;
      });
      setColumnVisibility(initialVisibility);
    }
  }, [data]);

  // Create table instance
  const table = useReactTable({
    data: enhancedData, // Use enhanced data here instead of raw data
    columns,
    enableSorting: true,
    enableColumnFilters: true,
    enableResizing: true,
    enableColumnDragging: true,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchTerm,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setSearchTerm,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!windowRef.current) return;
    
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    } else {
      if (windowRef.current.requestFullscreen) {
        windowRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === windowRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Export to CSV
  const handleExport = () => {
    if (!data || data.length === 0) return;
    
    // Get visible columns
    const visibleCols = table.getAllLeafColumns()
      .filter(column => column.getIsVisible())
      .map(column => column.id);
    
    const visibleData = data.map(row => {
      const newRow: Record<string, any> = {};
      visibleCols.forEach(col => {
        newRow[col] = row[col];
      });
      return newRow;
    });
    
    // Create CSV content
    const headers = visibleCols.join(',');
    const rows = visibleData.map(row => {
      return visibleCols.map(col => {
        const val = row[col];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val === null || val === undefined ? '' : val;
      }).join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}_${groupValue}_drill.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add this function to share/email the data
  const handleShareData = () => {
    // Create a popup with email options
    const emailSubject = encodeURIComponent(`Inventory Data: ${groupValue}`);
    const emailBody = encodeURIComponent(`Please find attached the inventory data for ${groupValue}.\n\nThis is an automated message from the Inventory Tools system.`);
    
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70';
    modal.innerHTML = `
      <div class="bg-gray-800 p-5 rounded-lg shadow-xl w-96">
        <h3 class="text-white text-lg mb-4">Share Options</h3>
        
        <div class="flex flex-col space-y-3">
          <a href="mailto:?subject=${emailSubject}&body=${emailBody}" 
             class="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Send as Email
          </a>
          
          <button class="flex items-center bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded" id="copy-to-clipboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copy Link
          </button>
          
          <button class="flex items-center bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded" id="close-modal">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-modal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    document.getElementById('copy-to-clipboard')?.addEventListener('click', () => {
      // Generate a shareable URL or data
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl);
      
      const button = document.getElementById('copy-to-clipboard');
      if (button) {
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 1500);
      }
    });
  };

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-900 rounded-lg border border-gray-700 shadow-2xl overflow-hidden flex flex-col w-full h-full"
    >
      {/* Header with proper draggable class */}
      <div className="draggable-header bg-gray-800/90 backdrop-blur-sm p-3 flex items-center justify-between border-b border-gray-700/50">
        <h3 className="text-white text-lg font-medium flex items-center">
          <span className="text-blue-400 mr-2">Details:</span> {groupValue}
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFullscreen}
            className="text-gray-300 hover:text-blue-400 p-1 rounded-full hover:bg-gray-700/50"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button
            onClick={handleExport}
            className="text-gray-300 hover:text-blue-400 p-1 rounded-full hover:bg-gray-700/50"
            title="Export CSV"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleShareData}
            className="text-gray-300 hover:text-blue-400 p-1 rounded-full hover:bg-gray-700/50"
            title="Share/Email"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onClose(id)}
            className="text-gray-300 hover:text-red-400 p-1 rounded-full hover:bg-gray-700/50"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="p-3 border-b border-gray-700 flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search all columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-md pl-9"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        </div>
      </div>
      
      {/* Active filters */}
      {columnFilters.length > 0 && (
        <div className="bg-gray-800/60 p-2 border-b border-gray-700 flex flex-wrap items-center gap-2">
          {columnFilters.map(filter => (
            <div key={filter.id} className="bg-blue-800/50 text-xs px-2 py-1 rounded-md flex items-center">
              <span className="font-medium mr-1">{filter.id}:</span>
              <span>{String(filter.value)}</span>
              <button
                className="ml-2 text-gray-300 hover:text-white"
                onClick={() => 
                  setColumnFilters(prev => prev.filter(f => f.id !== filter.id))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button 
            className="text-xs text-gray-400 hover:text-white"
            onClick={() => setColumnFilters([])}
          >
            Clear All
          </button>
        </div>
      )}
      
      {/* Table Container */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-180px)]' : 'max-h-[60vh]'} overflow-auto p-2 relative`}>
        {table.getRowModel().rows.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No data available</div>
        ) : (
          <table
            ref={tableRef}
            className="w-full text-sm border-collapse relative"
            style={{ borderSpacing: 0 }}
          >
            <thead className="sticky top-0 bg-gray-900 z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`p-2 text-left text-gray-300 font-medium border-b border-gray-700 
                        ${header.column.getIsSorted() ? 'text-blue-300' : ''}
                        cursor-pointer hover:bg-gray-800`}
                      style={{
                        width: header.getSize(),
                        position: 'relative'
                      }}
                    >
                      <div
                        className="flex items-center justify-between"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="truncate max-w-[200px]" title={header.column.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        <div className="flex items-center">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="w-3 h-3 ml-1" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="w-3 h-3 ml-1" />
                          ) : null}
                          <div className="relative ml-1 group" onClick={(e) => e.stopPropagation()}>
                            <Filter className="w-3 h-3 text-gray-500 hover:text-white" />
                            <div className="absolute hidden group-hover:block right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 p-2 w-48">
                              <input
                                type="text"
                                placeholder={`Filter ${header.column.id}...`}
                                value={header.column.getFilterValue() as string || ''}
                                onChange={e => header.column.setFilterValue(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded text-xs mb-1"
                              />
                              <div className="text-xs text-gray-400">Start typing to filter</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Resize handle */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 bg-gray-700 cursor-col-resize hover:bg-blue-500"
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                    row.index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="p-2 text-gray-300"
                      title={String(cell.getValue() || '')}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/60 flex justify-between items-center">
        <div className="text-gray-400 text-sm">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )} of {table.getFilteredRowModel().rows.length} items
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          <button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
              let pageNum;
              const currentPage = table.getState().pagination.pageIndex + 1;
              const totalPages = table.getPageCount();
              
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={i}
                  onClick={() => table.setPageIndex(pageNum - 1)}
                  className={`px-2 py-1 text-xs rounded ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
        
        <div className="flex items-center">
          <span className="text-xs text-gray-400 mr-2">Page Size:</span>
          <select
            className="bg-gray-700 text-white text-xs p-1 rounded"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}