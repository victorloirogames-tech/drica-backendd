export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    try {
        const { token, amount } = req.body;

        const response = await fetch("https://api.mercadopago.com/v1/payments", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                transaction_amount: parseFloat(amount),
                token: token, // O token gerado pelo Google Pay
                description: "Pedido GPay Drica",
                installments: 1,
                payment_method_id: "master", // Ou lógica para detectar a bandeira
                payer: { email: "cliente-gpay@email.com" }
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
