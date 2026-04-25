import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
    // Configuração de CORS Segura
    const allowedOrigins = ["https://drica-confeitaria-copy-da100ea4base44.app", "http://localhost:3000"];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    try {
        const { items, method, token, amount, payerEmail, payerCpf } = req.body;
        const payment = new Payment(client);

        // --- LÓGICA GOOGLE PAY ---
        if (method === 'gpay') {
            const gpayResponse = await payment.create({
                body: {
                    transaction_amount: parseFloat(amount),
                    token: token,
                    description: "Drica Confeitaria - GPay",
                    installments: 1,
                    payment_method_id: "master", // O MP tentará identificar, mas ideal é passar dinâmico do front
                    payer: { 
                        email: payerEmail || "cliente@email.com" 
                    }
                }
            });
            return res.status(200).json(gpayResponse);
        }

        // --- LÓGICA PIX ---
        const totalAmount = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
        
        const pixResponse = await payment.create({
            body: {
                transaction_amount: totalAmount,
                description: "Pedido Drica Confeitaria (PIX)",
                payment_method_id: "pix",
                payer: { 
                    email: payerEmail || "cliente@email.com",
                    identification: {
                        type: "CPF",
                        number: payerCpf || "00000000000" // O PIX costuma exigir CPF válido
                    }
                }
            }
        });

        // Verificação de segurança para o QR Code
        if (!pixResponse.point_of_interaction) {
            throw new Error("Mercado Pago não gerou os dados do PIX. Verifique suas credenciais.");
        }

        return res.status(200).json({
            id: pixResponse.id,
            qr_code: pixResponse.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: pixResponse.point_of_interaction.transaction_data.qr_code_base64,
            status: pixResponse.status
        });

    } catch (error) {
        console.error("ERRO NO PROCESSAMENTO:", error);
        return res.status(500).json({ 
            error: "Erro ao processar pagamento", 
            message: error.message,
            details: error.cause || "Sem detalhes adicionais"
        });
    }
}
