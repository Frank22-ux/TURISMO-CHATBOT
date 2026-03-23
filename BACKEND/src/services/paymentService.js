const axios = require('axios');

class PaymentService {
    constructor() {
        this.privateKey = process.env.KUSHKI_PRIVATE_KEY;
        this.baseUrl = 'https://api-uat.kushkipagos.com/card/v1/charges'; // Sandbox URL
    }

    async processCharge(token, amount, metadata = {}) {
        try {
            console.log('Processing Kushki charge for amount:', amount);
            
            const response = await axios.post(
                this.baseUrl,
                {
                    token,
                    amount: {
                        subtotalIva: 0,
                        iva: 0,
                        subtotalIva0: amount,
                        currency: 'USD'
                    },
                    metadata
                },
                {
                    headers: {
                        'Private-Merchant-Id': this.privateKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Kushki Charge Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Error procesando el pago con Kushki'
            };
        }
    }
}

module.exports = new PaymentService();
