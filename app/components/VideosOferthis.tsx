"use client";

type VideoItem = {
  titulo: string;
  src?: string;
};

const videos: VideoItem[] = [
  { titulo: "Ofertas de hoy", src: "/videos/principal.mp4" },
  { titulo: "TikTok 1", src: "/videos/tiktok1.mp4" },
  { titulo: "TikTok 2", src: "/videos/tiktok2.mp4" },
];

function VideoCard({
  item,
  grande = false,
}: {
  item: VideoItem;
  grande?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gray-200 ${
        grande ? "h-[140px] sm:h-[180px]" : "h-[140px] sm:h-[86px]"
      }`}
    >
      {item.src ? (
                <video
          className="h-full w-full object-contain bg-white"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src={item.src} type="video/mp4" />
        </video>
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600 text-white">
          <div className="text-center px-2">
            <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-sm">
              ▶
            </div>
            <p className="text-xs font-semibold">{item.titulo}</p>
          </div>
        </div>
      )}
      <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
        TikTok · Oferthis
      </span>
    </div>
  );
}

export default function VideosOferthis() {
  const [principal, secundario1, secundario2] = videos;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
        <h3 className="mb-3 text-base sm:text-lg font-bold text-gray-900">
          Vídeos Oferthis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <VideoCard item={principal} grande />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            <VideoCard item={secundario1} />
            <VideoCard item={secundario2} />
          </div>
        </div>
      </div>
    </section>
  );
}