import { searchAliExpress } from "../services/aliexpress";

export default async function TestAliExpressPage() {
  let resultado: any;

  try {
    resultado = await searchAliExpress("auriculares");
  } catch (e: any) {
    resultado = { error: String(e?.message || e) };
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Prueba AliExpress API</h1>
      <pre className="bg-gray-100 p-4 rounded-xl text-xs overflow-auto whitespace-pre-wrap">
        {JSON.stringify(resultado, null, 2)}
      </pre>
    </main>
  );
}