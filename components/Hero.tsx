import { getTranslations } from "next-intl/server";

export default async function Hero() {
  const t = await getTranslations("Home");

  return (
    <section className="border-b border-orange-100 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-center">
        <div className="flex justify-center mb-4">
          <img
            src="/logo-oferthis.png"
            alt="Oferthis"
            className="h-20 sm:h-24 md:h-28 w-auto object-contain"
          />
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight text-gray-900">
          {t("heroTitle")}
        </h2>

        <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-2xl mx-auto">
          {t("heroSubtitle")}
        </p>

        <form
          action="/buscar"
          method="get"
          className="mt-6 max-w-2xl mx-auto w-full px-1"
        >
          <div className="flex items-center gap-2 bg-white border border-orange-200 rounded-2xl shadow-sm focus-within:border-orange-500 transition p-1.5 sm:p-2 w-full max-w-full">
            <input
              type="search"
              name="q"
              placeholder={t("searchPlaceholder")}
              className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 text-base outline-none rounded-xl"
              style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
              required
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl transition shrink-0 text-sm sm:text-base"
            >
              {t("searchButton")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}