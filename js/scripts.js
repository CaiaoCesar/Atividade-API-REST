document.addEventListener("DOMContentLoaded", function () {
    const pesquisa = document.querySelector("#pesquisaDado");
    const resultados = document.getElementById("resultados");

    pesquisa.addEventListener("submit", (event) => {
        event.preventDefault();

        const queryValue = event.target.querySelector("input[name=buscar]").value.trim();
      
        if (!queryValue) {
            alert("Informar um Valor de Busca é Obrigatório."); 
            return;
        }

        // Endpoint oficial da Open Food Facts para busca por nome
        const apiUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(queryValue)}&search_simple=1&action=process&json=1`;

        axios
            .get(apiUrl)
            .then((response) => {
                const products = response.data.products;

                if (products.length === 0) {
                    resultados.textContent = "Nenhum produto encontrado!";
                } else {
                    resultados.innerHTML = ""; // Limpa os resultados anteriores

                    // Itera sobre os produtos encontrados
                    products.forEach(product => {
                        const productName = product.product_name || "Nome não disponível";
                        const imageUrl = product.image_url || "https://via.placeholder.com/400";
                        const nutriscoreGrade = product.nutriscore_grade ? product.nutriscore_grade.toUpperCase() : "Não disponível";
                        const productCode = product.code; // Código de barras do produto

                        // Criar o layout HTML inicial para cada produto
                        const productHTML = `
                            <div class="product-card" data-code="${productCode}">
                                <h2>${productName}</h2>
                                <div class="img-produto">
                                    <img src="${imageUrl}" alt="${productName}" style="max-width: 100%; height: auto;">
                                </div>
                                <div class="nutriscore-grade">
                                    <strong>Nota Nutri-Score:</strong> ${nutriscoreGrade}
                                </div>
                                <div class="additional-info" style="display: none;">
                                    <!-- Informações adicionais serão carregadas aqui -->
                                </div>
                            </div>
                        `;

                        // Inserir o HTML personalizado na div de resultados
                        resultados.innerHTML += productHTML;
                    });

                    // Adiciona evento de clique para expandir o card
                    document.querySelectorAll(".product-card").forEach(card => {
                        card.addEventListener("click", function () {
                            const code = this.getAttribute("data-code");
                            const additionalInfo = this.querySelector(".additional-info");

                            // Se já estiver expandido, recolhe
                            if (additionalInfo.style.display === "block") {
                                additionalInfo.style.display = "none";
                            } else {
                                // Busca informações adicionais do produto
                                fetchAdditionalProductInfo(code, additionalInfo);
                            }
                        });
                    });
                }
            })
            .catch((error) => {
                console.error("Erro ao buscar produto:", error);
                resultados.textContent = "Erro ao buscar produtos.";
            });
    });

    // Função para traduzir texto usando LibreTranslate
    async function translateText(text, targetLanguage = 'pt') {
        const apiUrl = 'https://libretranslate.com/translate';

        try {
            const response = await axios.post(apiUrl, {
                q: text,
                source: 'auto',
                target: targetLanguage,
                format: 'text',
            });
            return response.data.translatedText;
        } catch (error) {
            console.error('Erro ao traduzir:', error);
            return text; // Retorna o texto original em caso de erro
        }
    }

    // Função para buscar informações adicionais do produto
    async function fetchAdditionalProductInfo(code, additionalInfo) {
        const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;

        axios
            .get(apiUrl)
            .then(async (response) => {
                const product = response.data.product;

                if (product) {
                    // Extrai informações adicionais
                    const ingredients = product.ingredients_text || "Ingredientes não disponíveis.";
                    const nutritionTable = product.nutriments || {};
                    const brand = product.brands || "Marca não disponível";
                    const country = product.countries || "País de origem não disponível";

                    // Traduz os textos
                    const ingredientsTranslated = await translateText(ingredients);
                    const countryTranslated = await translateText(country);

                    // Traduz a tabela nutricional
                    const nutritionTableTranslated = {};
                    for (const [key, value] of Object.entries(nutritionTable)) {
                        const keyTranslated = await translateText(key);
                        nutritionTableTranslated[keyTranslated] = value;
                    }

                    // Cria o HTML para as informações adicionais
                    const additionalInfoHTML = `
                        <section id="dadosAlimento">
                            <h3>Informações Adicionais:</h3>
                            <p><strong>Marca:</strong> ${brand}</p>
                            <p><strong>País de Origem:</strong> ${countryTranslated}</p>
                            <h4>Ingredientes:</h4>
                            <p>${ingredientsTranslated}</p>
                            <h4>Tabela Nutricional:</h4>
                        </section>
                        
                        <ul id="itensNutricionais">
                            ${Object.entries(nutritionTableTranslated).map(([key, value]) => `
                                <li class="nutrItem"><strong>${key}:</strong> ${value}</li>
                            `).join('')}
                        </ul>
                    `;

                    // Insere o HTML no card
                    additionalInfo.innerHTML = additionalInfoHTML;
                    additionalInfo.style.display = "block";
                } else {
                    additionalInfo.innerHTML = "<p>Não foi possível carregar informações adicionais.</p>";
                    additionalInfo.style.display = "block";
                }
            })
            .catch((error) => {
                console.error("Erro ao buscar informações adicionais:", error);
                additionalInfo.innerHTML = "<p>Erro ao carregar informações adicionais.</p>";
                additionalInfo.style.display = "block";
            });
    }
});