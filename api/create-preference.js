import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
  try {
    const { items } = req.body;

    const preference = {
      items: items.map(item => ({
        title: item.nome,
        unit_price: Number(item.preco),
        quantity: item.quantidade
      })),
      back_urls: {
        success: "https://seu-app.com/pedidos",
        failure: "https://seu-app.com/erro",
        pending: "https://seu-app.com/pedidos"
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);

    res.status(200).json({
      url: response.body.init_point
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
}
