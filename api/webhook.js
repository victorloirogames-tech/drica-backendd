module.exports = async function handler(req, res) {
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
    const body = req.body;

    if (body.type === "payment") {
      const paymentId = body.data.id;

      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
          }
        }
      );

      const payment = await response.json();

      console.log("STATUS:", payment.status);

      if (payment.status === "approved") {
        console.log("Pagamento aprovado");
      }
    }

    return res.status(200).json({
      received: true
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erro webhook"
    });
  }
};
