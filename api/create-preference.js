import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
  // 🔥 CORS (obrigatório)
  res.setHeader("Access-Control-Allow-Origin", "*");
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
      return res.status(400).json({
        error: "Carrinho vazio"
      });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items,

        // 🔥 FORÇA PIX + evita parcelamento bugado
        payment_methods: {
          installments: 1,
          excluded_payment_types: [
            { id: "ticket" } // remove boleto se quiser só PIX
          ]
        },

        // 🔥 IMPORTANTE: coloca tua URL real
        back_urls: {
          success: "https://drica-confeitaria.vercel.app/sucesso",
          failure: "https://drica-confeitaria.vercel.app/erro",
          pending: "https://drica-confeitaria.vercel.app/pendente"
        },

        auto_return: "approved",

        // 🔥 WEBHOOK REAL (troca pelo teu domínio)
        notification_url: "https://drica-backend-qg1o.vercel.app/api/webhook",

        external_reference: Date.now().toString()
      }
    });

    return res.status(200).json({
      init_point: result.init_point
    });

  } catch (error) {
    console.error("ERRO DETALHADO:", error);

    return res.status(500).json({
      error: "Erro ao criar pagamento",
      detalhe: error.message
    });
  }
}
