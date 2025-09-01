"use client";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

import { Chart, ChartTypeRegistry, TooltipItem } from "chart.js";
import { useRef, useEffect } from "react";

export default function RolePieChart({ adminCount, userCount, theme = "light" }: { adminCount: number; userCount: number; theme?: 'light' | 'dark' }) {
    const palette = theme === "dark"
        ? { admin: "#10b981", user: "#818cf8", bg: "#23272b", text: "#f3f4f6" }
        : { admin: "#7c3aed", user: "#22c55e", bg: "#fff", text: "#23272b" };
    const total = adminCount + userCount;
    const chartRef = useRef<any>(null);
    // Affiche le nombre au centre du camembert
    useEffect(() => {
        if (!chartRef.current) return;
        const chart = chartRef.current;
        const ctx = chart.ctx;
        chart.update();
        ctx.save();
        ctx.font = "bold 2.2rem sans-serif";
        ctx.fillStyle = palette.text;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.clearRect(chart.width / 2 - 40, chart.height / 2 - 20, 80, 40);
        ctx.fillText(total.toString(), chart.width / 2, chart.height / 2);
        ctx.restore();
    }, [total, theme]);
    return (
        <div style={{ background: palette.bg, borderRadius: 14, padding: 0, boxShadow: "0 2px 12px #23272f22", minHeight: 260, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ color: palette.text, fontWeight: 700, fontSize: 16, marginBottom: 12, marginTop: 18 }}>Répartition des rôles</div>
            <div style={{ position: "relative", width: 220, height: 220, flexShrink: 0 }}>
                <Doughnut
                    ref={chartRef}
                    data={{
                        labels: ["Administrateur", "Utilisateur"],
                        datasets: [
                            {
                                label: "Utilisateurs",
                                data: [adminCount, userCount],
                                backgroundColor: [palette.admin, palette.user],
                                borderWidth: 2,
                                borderColor: palette.bg
                            }
                        ]
                    }}
                    options={{
                        plugins: {
                            legend: { display: false },
                            title: { display: false }
                        },
                        cutout: "70%"
                    }}
                />
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none"
                }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: palette.text }}>{total}</span>
                </div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, background: palette.admin, borderRadius: "50%", display: "inline-block" }}></span>Admin</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, background: palette.user, borderRadius: "50%", display: "inline-block" }}></span>Utilisateur</span>
            </div>
        </div>
    );
}
