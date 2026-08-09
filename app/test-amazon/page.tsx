import { amazonConfig, isAmazonConfigured } from "../services/amazon";

export default function TestAmazonPage() {
  const configurado = isAmazonConfigured();

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Prueba Amazon API</h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <p>
          <strong>Configurado:</strong>{" "}
          {configurado ? (
            <span className="text-green-600">Sí</span>
          ) : (
            <span className="text-red-600">No</span>
          )}
        </p>

        <p>
          <strong>Client ID:</strong>{" "}
          {amazonConfig.clientId
            ? amazonConfig.clientId.slice(0, 20) + "..."
            : "No definido"}
        </p>

        <p>
          <strong>Partner Tag:</strong> {amazonConfig.partnerTag || "No definido"}
        </p>

        <p>
          <strong>Marketplace:</strong> {amazonConfig.marketplace}
        </p>

        <p className="text-sm text-gray-500 mt-6">
          Si aparece “Sí” y se ven los datos, las claves se están leyendo
          correctamente desde .env.local.
        </p>
      </div>
    </main>
  );
}