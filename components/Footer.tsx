import { getTranslations } from "next-intl/server";
import NewsletterForm from "../app/components/NewsletterForm";

export default async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between flex-wrap gap-8 mb-10">
          <div>
            <h3 className="text-3xl font-bold">
              Ofer<span className="text-orange-500">this</span>
            </h3>
            <p className="text-gray-400 mt-3">{t("tagline")}</p>
          </div>

          <div className="text-gray-400 self-end">{t("copyright")}</div>
        </div>

        <NewsletterForm />
      </div>
    </footer>
  );
}