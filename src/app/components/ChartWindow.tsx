"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Download, ChevronUp, ChevronDown, Maximize, Minimize, Share2 } from "lucide-react";
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import DrilldownWindow from "./DrilldownWindow";
import { Rnd } from "react-rnd";
import { toBlob } from 'html-to-image';

// ResizeObserver hook
function useResizeObserver(ref) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 350 });

  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height: Math.max(height, 350) });
      }
    });
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return dimensions;
}

// Chart color palette
const CHART_COLORS = [
  "#3b82f6", "#f59e42", "#ef4444", "#10b981", "#a855f7", "#fbbf24", "#6366f1", "#14b8a6"
];

// Enhanced Nivo theme
const nivoTheme = {
  background: "transparent",
  textColor: "#ffffff",
  fontSize: 12,
  axis: {
    domain: { line: { stroke: "#4b5563", strokeWidth: 1.5 } },
    ticks: { line: { stroke: "#4b5563", strokeWidth: 1.5 } },
    legend: { text: { fontSize: 13, fill: "#ffffff", fontWeight: 500 } },
  },
  grid: { line: { stroke: "#4b5563", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.7 } },
  legends: { text: { fontSize: 12, fill: "#ffffff", fontWeight: 500 } },
  tooltip: {
    container: {
      background: "rgba(31, 41, 55, 0.95)",
      color: "#ffffff",
      fontSize: 12,
      borderRadius: 8,
      boxShadow: "0 4px 12px rgba(0,0,0,0.4), 0 0 8px rgba(59, 130, 246, 0.3)",
      padding: "10px 14px",
      border: "1px solid rgba(59, 130, 246, 0.2)",
    }
  },
};

// Shiny gradient for depth
const shinyGradient = [
  {
    id: 'shine',
    type: 'linearGradient',
    colors: [
      { offset: 0, color: 'inherit', opacity: 1 },
      { offset: 50, color: 'inherit', opacity: 0.9 },
      { offset: 100, color: 'inherit', opacity: 0.7 },
    ],
  },
];

interface ChartWindowProps {
  id: string;
  title: string;
  data: any[];
  fullData: any[];
  xKey: string;
  yKey: string;
  onDelete: (id: string) => void;
  type?: "pie" | "bar" | "line";
  showTrendLine?: boolean;
}

export default function ChartWindow({
  id,
  title,
  data,
  fullData,
  xKey,
  yKey,
  onDelete,
  type = "pie",
  showTrendLine = false,
}: ChartWindowProps) {
  const [open, setOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animationKey, setAnimationKey] = useState(Date.now());
  const [showDrilldown, setShowDrilldown] = useState(false);
  const [drilldownData, setDrilldownData] = useState<any[]>([]);
  const [drilldownKey, setDrilldownKey] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(chartContainerRef);

  // Normalize data for Nivo
  const nivoData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    if (type === "pie") {
      return data
        .filter(d => d && d[xKey] != null && d[yKey] != null)
        .map((d, i) => ({
          id: String(d[xKey]),
          label: String(d[xKey]),
          value: Number(d[yKey]) || 0,
          color: CHART_COLORS[i % CHART_COLORS.length],
          originalData: d
        }));
    }

    if (type === "line") {
      return [{
        id: yKey,
        data: data
          .filter(d => d && d[xKey] != null && d[yKey] != null)
          .map(d => ({
            x: String(d[xKey]),
            y: Number(d[yKey]) || 0,
            originalData: d
          }))
      }];
    }

    // Bar chart
    return data
      .filter(d => d && d[xKey] != null && d[yKey] != null)
      .map((d, i) => ({
        index: String(d[xKey]),
        value: Number(d[yKey]) || 0,
        color: CHART_COLORS[i % CHART_COLORS.length],
        originalData: d
      }));
  }, [data, xKey, yKey, type]);

  // Update animation key when data changes
  const dataKey = useMemo(() =>
    data?.map(d => `${d[xKey]}:${d[yKey]}`).join("|") || "",
    [data, xKey, yKey]
  );

  useEffect(() => {
    setAnimationKey(Date.now());
  }, [dataKey]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!chartRef.current) return;
    if (!isFullscreen) {
      if (chartRef.current.requestFullscreen) {
        chartRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === chartRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Export chart data
  const handleExport = () => {
    if (!data || data.length === 0) return;
    const rows = [`${xKey},${yKey}`];
    data
      .filter(row => row && row[xKey] != null && row[yKey] != null)
      .forEach((row) => {
        const label = `${row[xKey]}`.replace(/"/g, '""');
        rows.push(`"${label}",${row[yKey]}`);
      });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}_Chart.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportImage = async () => {
    if (!chartRef.current) return;
    
    try {
      const blob = await toBlob(chartRef.current.querySelector('.chart-container'));
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}_chart.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  };

  // Custom tooltip for pie/bar
  const CustomTooltip = ({ datum }) => (
    <div className="bg-gray-800 border border-blue-500/30 rounded-lg shadow-xl p-4 text-sm backdrop-blur-sm">
      <div className="font-semibold text-white">{datum.label || datum.index}</div>
      <div className="flex items-center mt-2">
        <div
          className="w-4 h-4 rounded-full mr-2"
          style={{ backgroundColor: datum.color }}
        />
        <span className="text-gray-100 font-medium">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(datum.value)}
        </span>
      </div>
      {datum.formattedPercentage && (
        <div className="text-xs text-gray-300 mt-1">
          {datum.formattedPercentage}% of total
        </div>
      )}
    </div>
  );

  // Line chart tooltip
  const LineTooltip = ({ point }) => (
    <CustomTooltip 
      datum={{ 
        label: point.data.x, 
        value: point.data.y, 
        color: point.color 
      }} 
    />
  );

  // Handle drill down
  const handleDrilldown = (data: any) => {
    const clickedLabel = data.id || data.index || data.point?.x;
    if (!clickedLabel) return;
    
    if (!fullData || fullData.length === 0) {
      alert("No detail data is available");
      return;
    }
    
    let fieldToUse = xKey;
    const allKeys = Object.keys(fullData[0]);
    let foundField = false;
    
    for (const key of allKeys) {
      const values = fullData.map(item => String(item[key] || ""));
      if (values.some(val => val.toLowerCase() === clickedLabel.toLowerCase())) {
        fieldToUse = key;
        foundField = true;
        break;
      }
    }
    
    if (!foundField && !fullData[0][xKey]) {
      const possibleFields = ["supplier", "vendor", "manufacturer", "company", "brand"];
      for (const field of possibleFields) {
        const match = allKeys.find(key => key.toLowerCase().includes(field));
        if (match) {
          fieldToUse = match;
          break;
        }
      }
    }
    
    let filtered = fullData.filter(item =>
      String(item[fieldToUse] || "").toLowerCase() === clickedLabel.toLowerCase()
    );
    
    if (filtered.length === 0) {
      filtered = fullData.filter(item =>
        String(item[fieldToUse] || "").toLowerCase().includes(clickedLabel.toLowerCase())
      );
    }
    
    if (filtered.length > 0) {
      setDrilldownData(filtered);
      setDrilldownKey(clickedLabel);
      setShowDrilldown(true);
    } else {
      alert(`No detailed data available for "${clickedLabel}"`);
    }
  };

  const handleCloseDrilldown = () => {
    setShowDrilldown(false);
    setDrilldownData([]);
    setDrilldownKey("");
  };

  // Hover variants for drilldown
  const hoverVariants = {
    initial: { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" },
    hover: {
      scale: 1.03,
      boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3), 0 0 10px rgba(59, 130, 246, 0.2)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  // Export to email/modal
  const handleShareChart = () => {
    // Create a popup with email options
    const emailSubject = encodeURIComponent(`Chart: ${title}`);
    const emailBody = encodeURIComponent(`Please see the attached chart for ${title}.\n\nThis is an automated message from the Inventory Tools system.`);
    
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70';
    modal.innerHTML = `
      <div class="bg-gray-800 p-5 rounded-lg shadow-xl w-96">
        <h3 class="text-white text-lg mb-4">Share Chart</h3>
        
        <div class="flex flex-col space-y-3">
          <a href="mailto:?subject=${emailSubject}&body=${emailBody}" 
             class="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Email Link
          </a>
          
          <button class="flex items-center bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded" id="export-chart-image">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            Save as Image
          </button>
          
          <button class="flex items-center bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded" id="close-chart-modal">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-chart-modal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    document.getElementById('export-chart-image')?.addEventListener('click', () => {
      handleExportImage();
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 500);
    });
  };

  return (
    <>
      <motion.div
        ref={chartRef}
        key={`chart-${id}-${animationKey}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`${isFullscreen ?
          'fixed inset-0 p-8 bg-gray-900 z-50' :
          'bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl min-w-[400px] min-h-[320px]'} relative overflow-hidden`}
        style={{ background: "radial-gradient(circle at top, #1f2937, #111827)" }}
      >
        {/* Title and controls - show title only when collapsed */}
        <div className="flex items-center justify-between mb-4">
          {!open && !isFullscreen && (
            <h3 className="text-white text-xl font-semibold">{title}</h3>
          )}
          <div className="flex items-center space-x-4 text-sm">
            <motion.button
              whileHover={{ scale: 1.1, color: "#3b82f6" }}
              onClick={toggleFullscreen}
              className="text-gray-300 p-1 rounded hover:bg-gray-800/50"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </motion.button>
      
            <motion.button
              whileHover={{ scale: 1.1, color: "#3b82f6" }}
              onClick={handleExport}
              className="text-gray-300 p-1 rounded hover:bg-gray-800/50"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, color: "#ef4444" }}
              onClick={() => onDelete(id)}
              className="text-gray-300 p-1 rounded hover:bg-gray-800/50"
              title="Delete chart"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
            <button
              onClick={handleShareChart}
              className="text-gray-300 hover:text-blue-400 p-1 rounded hover:bg-gray-800/50"
              title="Share/Export as Image"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key={`chart-content-${animationKey}`}
              initial={{ height: 0, opacity: 0, scale: 0.9 }}
              animate={{ height: "auto", opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.8,
                scale: {
                  type: "spring",
                  stiffness: 120,
                  damping: 15
                }
              }}
              className="w-full"
            >
              {nivoData.length === 0 ? (
                <div className="text-gray-400 text-sm p-4">No valid data to display.</div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  ref={chartContainerRef}
                  style={{ 
                    width: '100%',
                    height: isFullscreen ? 600 : (dimensions.height > 0 ? dimensions.height : 350),
                    transition: 'height 0.3s ease'
                  }}
                >
                  {type === "pie" && (
                    <ResponsivePie
                      data={nivoData}
                      margin={{ top: 40, right: 120, bottom: 40, left: 40 }}
                      innerRadius={0.6}
                      padAngle={1}
                      cornerRadius={6}
                      activeOuterRadiusOffset={12}
                      borderWidth={1}
                      borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
                      colors={CHART_COLORS}
                      arcLinkLabelsSkipAngle={8}
                      arcLinkLabelsTextColor="#ffffff"
                      arcLinkLabelsThickness={3}
                      arcLinkLabelsColor={{ from: 'color', modifiers: [['darker', 0.5]] }}
                      arcLabelsSkipAngle={10}
                      arcLabelsTextColor="#ffffff"
                      arcLabelsComponent={({ datum, label }) => null}
                      enableArcLinkLabels={true}
                      tooltip={({ datum }) => {
                        const percentage = (datum.value / nivoData.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1);
                        datum.formattedPercentage = percentage;
                        return <CustomTooltip datum={datum} />;
                      }}
                      theme={nivoTheme}
                      onClick={handleDrilldown}
                      animate={true}
                      motionConfig={{
                        mass: 1,
                        tension: 170,
                        friction: 26,
                        clamp: false,
                        precision: 0.01,
                        velocity: 0,
                      }}
                      transitionMode="startAngle"
                      startAngle={-90}
                      endAngle={270}
                      defs={shinyGradient}
                      fill={[{ match: '*', id: 'shine' }]}
                      onMouseEnter={(datum, event) => {
                        event.currentTarget.style.cursor = 'pointer';
                        event.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))';
                      }}
                      onMouseLeave={(datum, event) => {
                        event.currentTarget.style.cursor = 'default';
                        event.currentTarget.style.filter = 'none';
                      }}
                      legends={[
                        {
                          anchor: 'right',
                          direction: 'column',
                          justify: false,
                          translateX: 80,
                          translateY: 0,
                          itemsSpacing: 8,
                          itemWidth: 100,
                          itemHeight: 24,
                          itemTextColor: '#ffffff',
                          itemDirection: 'left-to-right',
                          itemOpacity: 1,
                          symbolSize: 18,
                          symbolShape: 'circle',
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemTextColor: '#ffffff',
                                symbolSize: 22,
                                itemOpacity: 1,
                              }
                            }
                          ]
                        }
                      ]}
                    />
                  )}

                  {type === "line" && (
                    <ResponsiveLine
                      data={nivoData}
                      margin={{ top: 50, right: 110, bottom: 80, left: 60 }}
                      xScale={{ type: 'point' }}
                      yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: false,
                        reverse: false
                      }}
                      curve="cardinal"
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 4,
                        tickPadding: 8,
                        tickRotation: -30,
                        legend: xKey,
                        legendOffset: 60,
                        legendPosition: 'middle',
                        tickTextColor: "#2dd4bf"
                      }}
                      axisLeft={{
                        tickSize: 4,
                        tickPadding: 8,
                        tickRotation: 0,
                        legend: yKey,
                        legendOffset: -50,
                        legendPosition: 'middle',
                        format: (value) => `$${value.toLocaleString()}`,
                        tickTextColor: "#2dd4bf"
                      }}
                      enableGridX={false}
                      enableGridY={true}
                      enablePoints={true}
                      pointSize={14}
                      pointColor={{ theme: 'background' }}
                      pointBorderWidth={4}
                      pointBorderColor={{ from: 'serieColor', modifiers: [['brighter', 0.5]] }}
                      pointLabelYOffset={-12}
                      useMesh={true}
                      theme={nivoTheme}
                      colors={CHART_COLORS}
                      animate={true}
                      motionConfig="spring"
                      tooltip={LineTooltip}
                      onClick={handleDrilldown}
                      onMouseEnter={(point, event) => {
                        event.currentTarget.style.cursor = 'pointer';
                        event.currentTarget.style.filter = 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))';
                      }}
                      onMouseLeave={(point, event) => {
                        event.currentTarget.style.cursor = 'default';
                        event.currentTarget.style.filter = 'none';
                      }}
                      legends={[
                        {
                          anchor: 'bottom-right',
                          direction: 'column',
                          justify: false,
                          translateX: 100,
                          translateY: 0,
                          itemsSpacing: 0,
                          itemDirection: 'left-to-right',
                          itemWidth: 80,
                          itemHeight: 20,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: 'circle',
                          symbolBorderColor: 'rgba(0, 0, 0, .5)',
                          itemTextColor: "#ffffff"
                        }
                      ]}
                      defs={shinyGradient}
                      fill={[{ match: '*', id: 'shine' }]}
                    />
                  )}

                  {type === "bar" && (
                    <ResponsiveBar
                      data={nivoData}
                      keys={['value']}
                      indexBy="index"
                      margin={{ top: 40, right: 80, bottom: 80, left: 60 }}
                      padding={0.3}
                      valueScale={{ type: 'linear' }}
                      indexScale={{ type: 'band', round: true }}
                      colors={(d) => d.data.color}
                      borderRadius={6}
                      borderColor={{ from: 'color', modifiers: [['darker', 1.2]] }}
                      enableLabel={false}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 4,
                        tickPadding: 8,
                        tickRotation: -30,
                        legend: xKey,
                        legendPosition: 'middle',
                        legendOffset: 56,
                        tickTextColor: "#ffffff"
                      }}
                      axisLeft={{
                        tickSize: 4,
                        tickPadding: 8,
                        tickRotation: 0,
                        legend: yKey,
                        legendPosition: 'middle',
                        legendOffset: -50,
                        format: (value) => `$${value.toLocaleString()}`,
                        tickTextColor: "#ffffff"
                      }}
                      animate={true}
                      motionConfig="stiff"
                      theme={nivoTheme}
                      tooltip={({ id, value, color, indexValue }) => (
                        <CustomTooltip datum={{ label: indexValue, value, color }} />
                      )}
                      onClick={handleDrilldown}
                      onMouseEnter={(datum, event) => {
                        event.currentTarget.style.cursor = 'pointer';
                        event.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))';
                      }}
                      onMouseLeave={(datum, event) => {
                        event.currentTarget.style.cursor = 'default';
                        event.currentTarget.style.filter = 'none';
                      }}
                      legends={[
                        {
                          dataFrom: 'keys',
                          anchor: 'bottom-right',
                          direction: 'column',
                          justify: false,
                          translateX: 120,
                          translateY: 0,
                          itemsSpacing: 2,
                          itemWidth: 100,
                          itemHeight: 20,
                          itemDirection: 'left-to-right',
                          itemOpacity: 0.85,
                          symbolSize: 20,
                          itemTextColor: "#ffffff"
                        }
                      ]}
                      defs={shinyGradient}
                      fill={[{ match: '*', id: 'shine' }]}
                    />
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Drilldown window */}
      {showDrilldown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center"
          variants={hoverVariants}
          whileHover="hover"
        >
          <Rnd
            default={{
              x: Math.max(50, (window.innerWidth - 800) / 2),
              y: Math.max(50, (window.innerHeight - 600) / 2),
              width: 800,
              height: 600,
            }}
            minWidth={400}
            minHeight={300}
            bounds="window"
            dragHandleClassName="draggable-header"
            style={{ zIndex: 1001 }}
          >
            <DrilldownWindow
              id={`drilldown-${id}-${drilldownKey}`}
              title={title}
              data={drilldownData}
              fullData={fullData}
              groupKey={xKey}
              groupValue={drilldownKey}
              onClose={handleCloseDrilldown}
            />
          </Rnd>
        </motion.div>
      )}
    </>
  );
}