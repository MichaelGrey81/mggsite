"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Papa from "papaparse";
import ChartWindow from "@/components/ChartWindow";
import clsx from "clsx";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const HEADER_MAP: Record<string, string> = {
  ITEM_ID: "Item ID",
  ITEM_DESCRIPTION: "Description",
  TOTAL_INVENTORY_VALUE: "Total Inventory Value",
  AVG_COST: "Avg. Cost",
  QTY_ON_HAND: "Qty On Hand",
  AVG_LEADTIME: "Avg. Lead Time",
};

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function isChartWindow(content: Window["content"]): content is Extract<
  Window["content"],
  { chart: any }
> {
  return typeof content === "object" && content !== null && "chart" in content;
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface Window {
  id: string;
  title: string;
  isCollapsed: boolean;
  content:
    | string
    | {
        columns: string[];
        data: any[];
      }
    | {
        chart: {
          type: "pie" | "bar" | string;
          xKey: string;
          yKey: string;
        };
        dataframe: {
          columns: string[];
          data: any[];
        };
      };
  fullData?: any[];
}

interface DataFrameTableProps {
  columns: string[];
  data: any[];
}

const columnHelper = createColumnHelper<any>();

function DataFrameTable({ columns, data }: DataFrameTableProps) {
  const tableColumns = columns.map((col) =>
    columnHelper.accessor(col, {
      header:
        HEADER_MAP[col] ??
        col
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.charAt(0).toUpperCase() + l.slice(1)),
      cell: (info) => {
        const val = info.getValue();
        if (typeof val === "number" && /(value|cost)/i.test(info.column.id)) {
          return currencyFmt.format(val);
        }
        return val;
      },
    })
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700/50 shadow-lg">
      <table className="w-full text-sm text-left text-gray-200 bg-gray-800/80">
        <thead className="text-xs uppercase bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 font-semibold tracking-wide"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-gray-700/50 hover:bg-gray-700/60 transition-colors duration-150"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text:
        "Welcome to Optix by Optimal Inventory Intelligence. Upload your inventory CSV to unlock insights.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [windows, setWindows] = useState<Window[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTo({
        top: panelRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading, isFileLoading]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    setIsFileLoading(true);

    try {
      const text = await file.text();
      const { data: parsed } = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });
      const normalized = (parsed as any[]).map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => {
            const num = Number(v);
            return [k, isNaN(num) ? v : num];
          })
        )
      );
      setRawRows(normalized);
      setMessages((prev) => [...prev, { sender: "bot", text: "CSV parsed locally." }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ CSV parse error." }]);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://127.0.0.1:8000/upload_csv/", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Upload failed");
      setMessages((prev) => [...prev, { sender: "bot", text: "CSV analyzed. Ask me anything." }]);
    } catch {
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Upload failed." }]);
    } finally {
      setIsFileLoading(false);
    }
  };

  const questionToTitle = (q: string) =>
    q
      .replace(/^\s*show(?: me)?(?: the)?\s+/i, "")
      .replace(/[?.!]\s*$/, "")
      .replace(/\b\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

  const deleteWindow = (id: string) =>
    setWindows((prev) => prev.filter((w) => w.id !== id));

  const exportWindowToCSV = (window: Window) => {
    if (
      typeof window.content === "object" &&
      "columns" in window.content &&
      Array.isArray(window.content.columns) &&
      Array.isArray(window.content.data)
    ) {
      const rows = [window.content.columns.join(",")];
      window.content.data.forEach((row) => {
        const vals = window.content.columns.map((col) =>
          `"${(row as any)[col] ?? ""}"`
        );
        rows.push(vals.join(","));
      });
      const blob = new Blob([rows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${window.title.replace(/\s+/g, "_")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/ask/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        credentials: "same-origin",
      });
      const data = await res.json();
      const raw = data.answer;
      const unwrapped = raw && typeof raw === "object" && "answer" in raw ? raw.answer : raw;
      setMessages((prev) => [...prev, { sender: "bot", text: String(unwrapped) }]);

      const hasDF = data.is_dataframe && data.dataframe;
      const isChartReq = /chart|pie chart|bar chart/i.test(question);

      if (hasDF && isChartReq && data.chart) {
        setWindows((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            title: questionToTitle(question),
            content: {
              chart: {
                type: data.chart.type,
                xKey: data.chart.x_key,
                yKey: data.chart.y_key,
              },
              dataframe: data.dataframe,
            },
            fullData: rawRows,
            isCollapsed: false,
          },
        ]);
      } else if (hasDF) {
        setWindows((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            title: questionToTitle(question),
            content: data.dataframe,
            fullData: rawRows,
            isCollapsed: false,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => router.push("/");
  const handleHome = () => router.push("/");
  const toggleWindowCollapse = (id: string) =>
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isCollapsed: !w.isCollapsed } : w))
    );

  // Debounce input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100 flex gap-6 px-6">
      {/* Dashboard */}
      <motion.div
        className="w-[65%] p-6 flex flex-col space-y-4"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Optix Dashboard
          </h2>
          <button onClick={handleHome} className="p-2 hover:bg-gray-800/50 rounded-full">
            <Home className="w-6 h-6 text-gray-300" />
          </button>
        </div>
        <div className="relative flex-1 bg-gray-900/20 p-6 rounded-2xl shadow-xl overflow-auto">
          <AnimatePresence>
            {[...windows].reverse().map((window) => (
              <motion.div
                key={window.id}
                className="bg-gray-800/70 p-5 mb-4 rounded-xl border shadow-lg"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-100">
                    {window.title}
                  </h3>
                  <div className="flex space-x-4 text-sm text-gray-300">
                    <button onClick={() => toggleWindowCollapse(window.id)}>
                      {window.isCollapsed ? "Expand" : "Collapse"}
                    </button>
                    <button onClick={() => exportWindowToCSV(window)}>Export</button>
                    <button onClick={() => deleteWindow(window.id)} className="text-red-400">
                      Delete
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {!window.isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-300 text-sm"
                    >
                      {typeof window.content === "string" ? (
                        window.content
                      ) : isChartWindow(window.content) ? (
                        <ChartWindow
                          id={window.id}
                          title={window.title}
                          data={window.content.dataframe.data}
                          fullData={window.fullData!}
                          xKey={window.content.chart.xKey}
                          yKey={window.content.chart.yKey}
                          onDelete={deleteWindow}
                          type={window.content.chart.type as any}
                        />
                      ) : (
                        <DataFrameTable columns={window.content.columns} data={window.content.data} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Chatbot */}
      <motion.div
        className="w-[35%] flex justify-end p-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="w-full max-w-[36rem] bg-gray-900/95 shadow-2xl flex flex-col rounded-2xl overflow-hidden border border-gray-800/50 h-[calc(100vh-3rem)]">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-800/70">
            <h2 className="text-xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              OptixAI
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
            >
              <X className="w-6 h-6 text-gray-300 hover:text-gray-100" />
            </button>
          </div>
          {/* Chat messages area */}
          <div ref={panelRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-950/30 min-h-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Chat History</span>
              <button
                className="text-xs text-red-400 hover:text-red-300"
                onClick={() => setMessages([])}
              >
                Clear
              </button>
            </div>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={clsx("flex", msg.sender === "user" ? "justify-end" : "justify-start")}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div
                  className={clsx(
                    "px-4 py-2.5 rounded-xl max-w-[85%] text-sm leading-relaxed shadow-md",
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                      : "bg-gray-800/70 text-gray-200 rounded-bl-none border border-gray-700/50"
                  )}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {isFileLoading && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-gray-800/70 text-gray-200 px-4 py-2.5 rounded-xl rounded-bl-none text-sm italic border border-gray-700/50">
                  Analyzing your inventory data...
                </div>
              </motion.div>
            )}
            {loading && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-gray-800/70 text-gray-200 px-4 py-2.5 rounded-xl rounded-bl-none text-sm border border-gray-700/50">
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                </div>
              </motion.div>
            )}
          </div>
          {/* Input area pinned to bottom */}
          <div className="p-4 bg-gray-900/70 border-t border-gray-800/70 space-y-3">
            <label className="flex items-center justify-center px-4 py-2.5 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-colors duration-200 group">
              <span className="text-sm text-gray-300 group-hover:text-gray-100">
                Upload CSV
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about your inventory..."
                className="flex-1 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-sm font-medium text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Visual FX */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.6"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
              <feBlend in="SourceGraphic" mode="overlay" />
            </filter>
          </defs>
          <rect
            width="100%"
            height="100%"
            filter="url(#noise)"
            fill="rgba(59,130,246,0.15)"
          />
        </svg>
      </div>
    </div>
  );
}