document.addEventListener("DOMContentLoaded", function () {
    // Funções para a busca de produtos
    const pesquisa = document.querySelector("#pesquisaDado");
    const resultados = document.getElementById("resultados");

    pesquisa.addEventListener("submit", (event) => {
        event.preventDefault();

        const queryValue = event.target.querySelector("input[name=buscar]").value.trim();
      
        if (!queryValue) {
            alert("Informar um Valor de Busca é Obrigatório."); 
            return;
        }

        // Endpoint da Open Food Facts para busca por nome
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
                                    <img src="${imageUrl}" alt="${productName}" style="max-width: 100%; height: auto; justify-content: center; text-align: center;">
                                </div>

                                <div class="nutriscore-grade">
                                    <strong>Nota Nutri-Score:</strong> ${nutriscoreGrade}
                                </div>

                                <button class="verDados">Exibir Dados 👁‍🗨➕</button>

                                <div class="additional-info" style="display: none;">
                                    <!-- Informações adicionais serão carregadas aqui -->
                                </div>
                            </div>
                        `;

                        // Inserir o HTML personalizado na div de resultados
                        resultados.innerHTML += productHTML;
                    });

                    // Adiciona evento de clique no botao para expandir o card
                    document.querySelectorAll(".verDados").forEach(button => {
                        button.addEventListener("click", function (event) {
                            event.stopPropagation();  // Impede que o evento de clique se propague para o card
                           
                            const card = this.closest(".product-card");
                            const code = card.getAttribute("data-code");
                            const additionalInfo = card.querySelector(".additional-info");

                            // Se já estiver expandido, recolhe
                            if (additionalInfo.style.display === "block") {
                                additionalInfo.style.display = "none";
                                this.textContent  = "Exibir Dados 👁‍🗨➕";
                            } else {
                                // Busca informações adicionais do produto
                                fetchAdditionalProductInfo(code, additionalInfo);
                                this.textContent = "Ocultar Dados 👀➖"; //Muda o texto do botao
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

    // Função para buscar informações adicionais do produto
    async function fetchAdditionalProductInfo(code, additionalInfo) {
        const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;

        axios
            .get(apiUrl)
            .then((response) => {
                const product = response.data.product;

                if (product) {
                    // Extrai informações adicionais
                    const ingredients = product.ingredients_text || "Ingredientes não disponíveis.";
                    const nutritionTable = product.nutriments || {};
                    const brand = product.brands || "Marca não disponível";
                    const country = product.countries || "País de origem não disponível";

                    // Cria o HTML para as informações adicionais
                    const additionalInfoHTML = `
                        <section id="dadosAlimento">
                            <h3>Informações Adicionais:</h3>
                            <p><strong>Marca:</strong> ${brand}</p>
                            <p><strong>País de Origem:</strong> ${country}</p>
                            <h4>Ingredientes:</h4>
                            <p>${ingredients}</p>
                            <h4>Tabela Nutricional:</h4>
                        </section>
                        
                        <ul id="itensNutricionais">
                            ${Object.entries(nutritionTable).map(([key, value]) => `
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

    // Funções para o cadastro de produtos
    const botaoCadastro = document.getElementById("botaoCadastro");
    const formAdicionarProduto = document.getElementById("formAdicionarProduto");
    const mensagemCadastro = document.getElementById("mensagemCadastro");

    if (botaoCadastro && formAdicionarProduto && mensagemCadastro) {
        botaoCadastro.addEventListener("click", function (event) {
            event.preventDefault();

            // Alterna a visibilidade do formulário e do botão
            if (formAdicionarProduto.style.display === "none") {
                formAdicionarProduto.style.display = "block";
                mensagemCadastro.style.display = "block";
                botaoCadastro.textContent = "Fechar Cadastro 🔒";
            } else {
                formAdicionarProduto.style.display = "none";
                mensagemCadastro.style.display = "none";
                botaoCadastro.textContent = "Cadastrar Produto 🛍🛒";
            }
        });

        formAdicionarProduto.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Coletar os dados do formulário
            const formData = new FormData(formAdicionarProduto);
            const produto = {
                code: Math.random().toString(36).substring(7), // Código de barras fictício
                product_name: formData.get("nome"),
                brands: formData.get("marca"),
                ingredients_text: formData.get("ingredientes"),
                countries: formData.get("pais"),
                nutriscore_grade: formData.get("nutriscore"),
                image_url: formData.get("imagem"),
            };

            // Validar os dados
            if (!produto.product_name || !produto.brands || !produto.ingredients_text || !produto.countries || !produto.nutriscore_grade || !produto.image_url) {
                alert("Todos os campos são obrigatórios!");
                return;
            }

            // Criar um novo FormData para enviar os dados no formato multipart/form-data
            const data = new FormData();
            data.append("code", produto.code);
            data.append("product_name", produto.product_name);
            data.append("brands", produto.brands);
            data.append("ingredients_text", produto.ingredients_text);
            data.append("countries", produto.countries);
            data.append("nutriscore_grade", produto.nutriscore_grade);
            data.append("image_url", produto.image_url);

            // Enviar os dados para a API do Open Food Facts
            try {
                const response = await axios.post("https://world.openfoodfacts.org/cgi/product_jqm2.pl", data, {
                    headers: {
                        "Content-Type": "multipart/form-data", // Formato aceito pela API
                    },
                });

                if (response.data.status === 1) {
                    alert("Produto cadastrado com sucesso, mas só será armazenado ao passar na verificação da Open Food!");
                    formAdicionarProduto.reset(); 
                } else {
                    alert("Erro ao cadastrar o produto. Tente novamente.");
                    console.error("Resposta da API:", response.data);
                }
            } catch (error) {
                console.error("Erro ao cadastrar produto:", error);
                alert("Erro ao cadastrar o produto. Verifique o console para mais detalhes.");
            }
        });
    }
});