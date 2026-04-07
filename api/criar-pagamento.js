import { MercadoPagoConfig } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {

  // ✅ CORS
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

    // ✅ Calcula total
    const total = items.reduce((acc, item) => {
      return acc + item.unit_price * item.quantity;
    }, 0);

    // ✅ Cria pagamento PIX direto
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction_amount: total,
        description: "Pedido Drica Confeitaria",
        payment_method_id: "pix",
        payer: {
          email: "cliente@email.com"
        }
      })
    });

    const data = await response.json();

    return res.status(200).json({
      id: data.id,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (error) {
    console.error("ERRO:", error);

    return res.status(500).json({
      error: "Erro ao gerar PIX"
    });
  }
}
