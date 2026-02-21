export default function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      style={{
        margin: 16,
        padding: 16,
        background: "#fee2e2",
        borderRadius: 16,
        border: "1px solid #fecaca",
      }}
    >
      <p style={{ fontWeight: 800, color: "#991b1b" }}>Error: {message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          style={{
            marginTop: 8,
            padding: "8px 16px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
