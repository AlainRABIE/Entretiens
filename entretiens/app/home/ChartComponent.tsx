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

export default function ChartComponent({ data, label }: { data: { date: string; connexions: number; creations: number }[], label?: string }) {
  return (
    <div style={{ background: "#23272f", borderRadius: 14, padding: 18, boxShadow: "0 2px 12px #23272f22", minHeight: 260 }}>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{label || "Statistiques d'activité"}</div>
      <Line
        data={{
          labels: data.map(d => d.date),
          datasets: [
            {
              label: "Connexions",
              data: data.map(d => d.connexions),
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.15)",
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "#3b82f6",
              fill: true
            },
            {
              label: "Créations de compte",
              data: data.map(d => d.creations),
              borderColor: "#22c55e",
              backgroundColor: "rgba(34,197,94,0.15)",
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
            legend: { labels: { color: "#fff", font: { size: 13 } } },
            title: { display: false }
          },
          scales: {
            x: { ticks: { color: "#fff" }, grid: { color: "#23272f" } },
            y: { ticks: { color: "#fff" }, grid: { color: "#23272f" } }
          }
        }}
      />
    </div>
  );
}
