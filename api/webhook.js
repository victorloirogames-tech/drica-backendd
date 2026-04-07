export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    console.log("🔔 Webhook recebido");

    const data = req.body;

    if (data.type === "payment") {
      const paymentId = data.data.id;

      console.log("💰 ID do pagamento:", paymentId);

      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
          }
        }
      );

      const payment = await response.json();

      if (payment.status === "approved") {
        console.log("✅ PAGAMENTO APROVADO");

        // 👉 aqui você vai atualizar o pedido futuramente
        // status = "pago"
      } else {
        console.log("⏳ Status:", payment.status);
      }
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("❌ Erro webhook:", error);

    return res.status(500).json({ error: "Erro webhook" });
  }
}
