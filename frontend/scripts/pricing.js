const API_BASE_URL = CONFIG.API_BASE_URL;

async function loadPricingPlans() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/pricing/plans`);
        const data = await response.json();

        if (data.success) {
            const pricingCardsContainer = document.querySelector('.pricing-cards');
            pricingCardsContainer.innerHTML = '';

            data.plans.forEach(plan => {
                const cardHtml = `
                    <div class="pricing-card">
                        <div class="pricing-card-header">
                            <h4>${plan.name}</h4>
                        </div>
                        <div class="pricing-card-body">
                            <h1 class="pricing-price">${plan.price} ₸<span>/month</span></h1>
                            <ul>
                                ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                            <a href="login.html" class="btn-primary">${plan.buttonText}</a>
                        </div>
                    </div>
                `;
                pricingCardsContainer.insertAdjacentHTML('beforeend', cardHtml);
            });
        }
    } catch (error) {
        console.error('Error loading pricing plans:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadPricingPlans); 