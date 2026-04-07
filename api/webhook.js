export default async function handler(req, res) {
  try {
    console.log("🔔 Webhook recebido:");

    const body = req.body;
    console.log(JSON.stringify(body, null, 2));

    // Aqui você pode futuramente:
    // - Atualizar pedido no banco
    // - Marcar como pago

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro no webhook");
  }
}
