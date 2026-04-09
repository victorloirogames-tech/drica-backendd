import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
    // ✅ Configuração de CORS
    res.setHeader("Access-Control-Allow-Origin", "*"); // Em produção, mude para seu domínio drica-sweet-flow.base44.app
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    try {
        const { items, method, token, amount } = req.body;
        const payment = new Payment(client);

        // --- LÓGICA PARA GOOGLE PAY ---
        if (method === 'gpay') {
            const gpayResponse = await payment.create({
                body: {
                    transaction_amount: parseFloat(amount),
                    token: token, // O token que o Google Pay gera
                    description: "Pedido Drica Confeitaria (GPay)",
                    installments: 1,
                    payment_method_id: "master", // O MP identifica a bandeira, mas 'master' ou 'visa' servem de base
                    payer: { email: "cliente@email.com" }
                }
            });

            return res.status(200).json({ 
                status: gpayResponse.status, 
                id: gpayResponse.id 
            });
        }

        // --- LÓGICA PARA PIX (O que você já tinha) ---
        const totalPix = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
        
        const pixResponse = await payment.create({
            body: {
                transaction_amount: totalPix,
                description: "Pedido Drica Confeitaria (PIX)",
                payment_method_id: "pix",
                payer: { email: "cliente@email.com" }
            }
        });

        return res.status(200).json({
            id: pixResponse.id,
            qr_code: pixResponse.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: pixResponse.point_of_interaction.transaction_data.qr_code_base64
        });

    } catch (error) {
        console.error("ERRO NO PAGAMENTO:", error);
        return res.status(500).json({ error: "Erro ao processar pagamento", detalhes: error.message });
    }
}
