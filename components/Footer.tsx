import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-2xl font-extrabold">
            Ofer<span className="text-orange-500">this</span>
          </h3>
          <p className="mt-3 text-gray-400 text-sm">{t("tagline")}</p>
        </div>

        <div>
          <h4 className="font-bold mb-3">{t("categories")}</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/categoria/tecnologia" className="hover:text-orange-500">
                Tecnología
              </Link>
            </li>
            <li>
              <Link href="/categoria/hogar" className="hover:text-orange-500">
                Hogar
              </Link>
            </li>
            <li>
              <Link href="/categoria/gaming" className="hover:text-orange-500">
                Gaming
              </Link>
            </li>
            <li>
              <Link href="/categoria/deporte" className="hover:text-orange-500">
                Deporte
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-3">{t("links")}</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-orange-500">
                {t("home")}
              </Link>
            </li>
            <li>
              <Link href="/favoritos" className="hover:text-orange-500">
                {t("favorites")}
              </Link>
            </li>
            <li>
              <Link href="/aviso-legal" className="hover:text-orange-500">
                Aviso legal
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-orange-500">
                Privacidad
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-orange-500">
                Cookies
              </Link>
            </li>
            <li>
              <Link href="/afiliados" className="hover:text-orange-500">
                Afiliados
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Oferthis. {t("rights")}
      </div>
    </footer>
  );
}