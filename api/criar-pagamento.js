const { MercadoPagoConfig, Payment } = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

module.exports = async function handler(req, res) {
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
    const { items, method, token, amount } = req.body;
    const payment = new Payment(client);

    // GOOGLE PAY
    if (method === "gpay") {
      const result = await payment.create({
        body: {
          transaction_amount: Number(amount),
          token: token,
          description: "Pedido Drica Confeitaria",
          installments: 1,
          payment_method_id: "visa",
          payer: {
            email: "cliente@email.com"
          }
        }
      });

      return res.status(200).json(result);
    }

    // PIX
    const total =
      items?.reduce(
        (acc, item) =>
          acc + Number(item.unit_price) * Number(item.quantity),
        0
      ) || Number(amount);

    const result = await payment.create({
      body: {
        transaction_amount: total,
        description: "Pedido Drica PIX",
        payment_method_id: "pix",
        payer: {
          email: "cliente@email.com"
        }
      }
    });

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};
