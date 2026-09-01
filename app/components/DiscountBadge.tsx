type Props = {
  descuento: string;
};

export default function DiscountBadge({ descuento }: Props) {
  const limpio = (descuento || "").trim();
  const numero = parseInt(limpio.replace(/[^0-9]/g, ""), 10);

  if (!limpio || Number.isNaN(numero) || numero <= 0) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes oferthis-flotar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      <span
        className="absolute top-2 left-2 z-20 flex flex-col items-center justify-center min-w-[68px] rounded-xl bg-gradient-to-br from-red-600 to-orange-500 px-2.5 py-1.5 text-white shadow-lg ring-2 ring-white/40"
        style={{ animation: "oferthis-flotar 1.6s ease-in-out infinite" }}
      >
        <span className="text-[9px] font-semibold uppercase tracking-wide opacity-95">
          Descuento
        </span>
        <span className="text-sm font-black leading-none mt-0.5">
          {limpio.startsWith("-") ? limpio : `-${numero}%`}
        </span>
      </span>
    </>
  );
}