export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "ID do pagamento é obrigatório" });
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    );

    const data = await response.json();

    return res.status(200).json({
      id: data.id,
      status: data.status
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
