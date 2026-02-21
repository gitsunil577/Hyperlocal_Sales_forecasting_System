export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div style={{ padding: 48, textAlign: "center" }}>
      <div
        style={{
          width: 40,
          height: 40,
          border: "4px solid #e2e8f0",
          borderTop: "4px solid #4f46e5",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto",
        }}
      />
      <p style={{ marginTop: 16, color: "#64748b", fontWeight: 700 }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
