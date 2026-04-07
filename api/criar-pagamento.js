import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {

  // ✅ CORS (melhor prática)
  res.setHeader("Access-Control-Allow-Origin", "https://drica-sweet-flow.base44.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio" });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items,

        back_urls: {
          success: "https://drica-sweet-flow.base44.app",
          failure: "https://drica-sweet-flow.base44.app",
          pending: "https://drica-sweet-flow.base44.app"
        },

        auto_return: "approved",

        // 🔥 CORRIGIDO AQUI (backendd com 2 D)
        notification_url: "https://drica-backendd-qg1o.vercel.app/api/webhook"
      }
    });

    return res.status(200).json({
      init_point: result.init_point
    });

  } catch (error) {
    console.error("ERRO:", error);
    return res.status(500).json({
      error: "Erro ao criar pagamento"
    });
  }
}
