export default function CedisIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="12"
        y="18"
        fontSize="20"
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        ₵
      </text>
    </svg>
  );
}
