type Props = {
  descuento: string;
};

export default function DiscountBadge({ descuento }: Props) {
  if (!descuento || descuento === "-0%" || descuento === "0%") {
    return null;
  }

  return (
    <span className="absolute top-2 left-2 z-10 flex flex-col items-center justify-center min-w-[68px] rounded-xl bg-gradient-to-br from-red-600 to-orange-500 px-2.5 py-1.5 text-white shadow-lg ring-2 ring-white/40">
      <span className="text-[9px] font-semibold uppercase tracking-wide opacity-95">
        Descuento
      </span>
      <span className="text-sm font-black leading-none mt-0.5">
        {descuento}
      </span>
    </span>
  );
}