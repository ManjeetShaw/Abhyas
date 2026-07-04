import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function ScoreChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data?.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: data.map((d) => new Date(d.date).toLocaleDateString()),
        datasets: [
          {
            label: "Score",
            data: data.map((d) => d.score),
            borderColor: "#6c5ce7",
            backgroundColor: "rgba(108, 92, 231, 0.15)",
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "#6c5ce7",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: { color: "#9a9ca8" },
            grid: { color: "#262834" },
          },
          x: {
            ticks: { color: "#9a9ca8" },
            grid: { display: false },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data]);

  if (!data?.length) {
    return <p className="muted">Complete a few interviews to see your progress here.</p>;
  }

  return <canvas ref={canvasRef} height={220}></canvas>;
}
