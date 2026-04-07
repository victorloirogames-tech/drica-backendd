export default async function handler(req, res) {
  // 🔥 CORS (opcional aqui, mas seguro)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    console.log("🔔 Webhook recebido");

    const data = req.body;

    console.log("📦 Dados recebidos:", JSON.stringify(data));

    // 🔥 Verifica se é notificação de pagamento
    if (data.type === "payment") {
      const paymentId = data.data.id;

      console.log("💰 ID do pagamento:", paymentId);

      // 👉 Aqui você pode buscar detalhes do pagamento (opcional)
      // Exemplo futuro:
      // const payment = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {...})

      // 👉 Aqui você pode atualizar seu pedido no banco
      // Exemplo:
      // status = "pago"

      console.log("✅ Pagamento recebido e processado");
    }

    return res.status(200).json({
      received: true
    });

  } catch (error) {
    console.error("❌ Erro no webhook:", error);

    return res.status(500).json({
      error: "Erro no webhook"
    });
  }
}
