// /api/criar-pagamento.js

import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {
    const payment = new Payment(client);

    const {
      method,
      token,
      amount,
      items = []
    } = req.body;

    // =========================
    // GOOGLE PAY
    // =========================
    if (method === "gpay") {
      const response = await payment.create({
        body: {
          transaction_amount: Number(amount),
          token: token,
          description: "Pedido Drica Confeitaria",
          installments: 1,
          payer: {
            email: "cliente@dricaconfeitaria.com"
          }
        }
      });

      return res.status(200).json({
        success: true,
        id: response.id,
        status: response.status
      });
    }

    // =========================
    // PIX
    // =========================
    const total = items.reduce((acc, item) => {
      return acc + Number(item.unit_price) * Number(item.quantity);
    }, 0);

    const pix = await payment.create({
      body: {
        transaction_amount: total,
        description: "Pedido Drica Confeitaria",
        payment_method_id: "pix",
        payer: {
          email: "cliente@dricaconfeitaria.com"
        }
      }
    });

    return res.status(200).json({
      success: true,
      id: pix.id,
      status: pix.status,
      qr_code:
        pix.point_of_interaction.transaction_data.qr_code,
      qr_code_base64:
        pix.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (error) {
    console.error("ERRO PAGAMENTO:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
