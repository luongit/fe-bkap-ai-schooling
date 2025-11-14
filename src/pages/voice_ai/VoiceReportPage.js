import React, { useEffect, useState } from "react";
import axios from "axios";

export default function VoiceReportPage() {
  const [data, setData] = useState(null);
  const studentId = 1;

  useEffect(() => {
    axios.get(`http://localhost:8080/api/voice-gpt5/report/${studentId}`)
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);

  if (!data) return <p>⏳ Loading report...</p>;

  return (
    <div className="report-container">
      <h2>📊 Weekly Voice Report</h2>
      <p>Total sessions: {data.totalSessions}</p>
      <table>
        <thead>
          <tr><th>Metric</th><th>Score</th></tr>
        </thead>
        <tbody>
          <tr><td>Pronunciation</td><td>{data.avgPronunciation?.toFixed(1)}</td></tr>
          <tr><td>Fluency</td><td>{data.avgFluency?.toFixed(1)}</td></tr>
          <tr><td>Intonation</td><td>{data.avgIntonation?.toFixed(1)}</td></tr>
          <tr><td>Confidence</td><td>{data.avgConfidence?.toFixed(1)}</td></tr>
        </tbody>
      </table>

      <p><b>Recommendation:</b> {data.recommendation}</p>
      <p><b>Top Scenes:</b> {data.topScenes?.join(", ")}</p>

      <style jsx>{`
        .report-container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        td, th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        th { background: #007bff; color: white; }
      `}</style>
    </div>
  );
}
