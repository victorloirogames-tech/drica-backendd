export default async function handler(req, res) {
  try {
    const body = req.method === "POST" ? req.body : {};

    const {
      amount = 10,
      description = "Pedido Drica Confeitaria",
      email = "cliente@test.com"
    } = body;

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description,
        payment_method_id: "pix",
        payer: {
          email
        }
      })
    });

    const data = await response.json();

    return res.status(200).json({
      id: data.id,
      status: data.status,
      qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64:
        data.point_of_interaction?.transaction_data?.qr_code_base64
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
