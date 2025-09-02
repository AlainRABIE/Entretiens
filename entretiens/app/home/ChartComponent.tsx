"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ChartComponent({ data, label, theme = "light" }: { data: { date: string; connexions: number; creations: number }[], label?: string, theme?: 'light' | 'dark' }) {
  // Palette dynamique selon le thème
  const palette = theme === "dark"
    ? {
        bg: "#23272f",
        text: "#fff",
        grid: "#23272f",
        legend: "#fff"
      }
    : {
        bg: "#fff",
        text: "#23272b",
        grid: "#e5e7eb",
        legend: "#23272b"
      };
  return (
    <div style={{ background: palette.bg, borderRadius: 14, padding: 18, boxShadow: `0 2px 12px ${palette.bg}22`, minHeight: 260 }}>
      <div style={{ color: palette.text, fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{label || "Statistiques d'activité"}</div>
      <Line
        data={{
          labels: data.map(d => d.date),
          datasets: [
            {
              label: "Connexions",
              data: data.map(d => d.connexions),
              borderColor: "#3b82f6",
              backgroundColor: theme === 'dark' ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)",
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "#3b82f6",
              fill: true
            },
            {
              label: "Créations de compte",
              data: data.map(d => d.creations),
              borderColor: "#22c55e",
              backgroundColor: theme === 'dark' ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.08)",
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "#22c55e",
              fill: true
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { labels: { color: palette.legend, font: { size: 13 } } },
            title: { display: false }
          },
          scales: {
            x: { ticks: { color: palette.text }, grid: { color: palette.grid } },
            y: { ticks: { color: palette.text }, grid: { color: palette.grid } }
          }
        }}
      />
    </div>
  );
}
