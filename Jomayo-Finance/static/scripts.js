document.getElementById('investment-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const amount = document.getElementById('amount').value;
    const symbolOptions = document.getElementById('symbols').options;
    const symbols = Array.from(symbolOptions).filter(option => option.selected).map(option => option.value);

    fetch('/invest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, symbols }),
    })
        .then(response => response.json())
        .then(data => {
            const recommendationsDiv = document.getElementById('recommendations');
            const plansDiv = document.getElementById('plans');
            plansDiv.innerHTML = '';

            for (const [symbol, details] of Object.entries(data)) {
                const planDiv = document.createElement('div');
                planDiv.classList.add('plan');

                const symbolHeader = document.createElement('h3');
                symbolHeader.textContent = `Stock: ${symbol}`;
                planDiv.appendChild(symbolHeader);

                const allocationUl = document.createElement('ul');
                for (const [category, value] of Object.entries(details.plan)) {
                    const li = document.createElement('li');
                    li.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)}: $${value}`;
                    allocationUl.appendChild(li);
                }
                planDiv.appendChild(allocationUl);

                const recommendation = document.createElement('p');
                recommendation.textContent = `Recommendation: ${details.recommendation}`;
                planDiv.appendChild(recommendation);

                const newsHeader = document.createElement('h4');
                newsHeader.textContent = 'Recent News:';
                planDiv.appendChild(newsHeader);

                details.news.forEach(item => {
                    const newsItem = document.createElement('div');
                    newsItem.classList.add('news-item');
                    const newsLink = document.createElement('a');
                    newsLink.href = item.link;
                    newsLink.target = '_blank';
                    newsLink.textContent = item.title;
                    newsItem.appendChild(newsLink);
                    planDiv.appendChild(newsItem);
                });

                plansDiv.appendChild(planDiv);
            }

            recommendationsDiv.classList.remove('hidden');
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});



