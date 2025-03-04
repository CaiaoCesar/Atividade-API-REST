document.addEventListener("DOMContentLoaded", function () {
   
    const pesquisa = document.querySelector("#pesquisaDado")
    const resultados = document.getElementById("resultados");

    pesquisa.addEventListener("submit", (event) => {
        event.preventDefault();

        const queryValue = event.target.querySelector("input[name=buscar]").value.trim();
      
        if (!queryValue){
            alert("Informar um Valor de Busca é Obrigatório."); 
            return;
        }

        //get com axios 
        axios
            .get(`https://world.openfoodfacts.net/api/v2/product/${queryValue}?fields=product_name,selected_images,nutriscore_data`)
            .then((response) => {
                if (response.data.status === 0) {
                    resultados.textContent = "Produto não encontrado!";
                } else {
                    const product = response.data.product;
                    const nutriscoreData = product.nutriscore_data;

                    // Verifica se há imagens disponíveis
                    const imageUrl = product.selected_images?.front?.display?.en || "https://via.placeholder.com/400";

                    // Criar o layout HTML personalizado
                    const productHTML = `
                        <div class="product-card">
                            <h2>${product.product_name}</h2>

                            <div class= "img-produto">
                                <img src="${imageUrl}" alt="${product.product_name}" style="max-width: 100%; height: auto;">
                            </div>

                            <div class="nutriscore-grade">
                                <strong>Nota Nutri-Score:</strong> ${nutriscoreData.grade.toUpperCase()}
                            </div>
                            <div class="nutriscore-details">
                                <h3>Detalhes Nutricionais:</h3>
                                <ul>
                                    <li><strong>Pontos Negativos:</strong> ${nutriscoreData.negative_points} / ${nutriscoreData.negative_points_max}</li>
                                    <li><strong>Pontos Positivos:</strong> ${nutriscoreData.positive_points} / ${nutriscoreData.positive_points_max}</li>
                                </ul>
                                <h4>Componentes Negativos:</h4>
                                <ul>
                                    ${nutriscoreData.components.negative.map(comp => `
                                        <li>
                                            <strong>${comp.id}:</strong> ${comp.value} ${comp.unit} (Pontos: ${comp.points})
                                        </li>
                                    `).join('')}
                                </ul>
                                <h4>Componentes Positivos:</h4>
                                <ul>
                                    ${nutriscoreData.components.positive.map(comp => `
                                        <li>
                                            <strong>${comp.id}:</strong> ${comp.value} ${comp.unit} (Pontos: ${comp.points})
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    `;

                    // Inserir o HTML personalizado na div de resultados
                    resultados.innerHTML = productHTML;
                }
            })
            .catch((error) => {
                console.error("Erro ao buscar produto:", error);
                resultados.textContent = "Produto não encontrado.";
            });
    });
   

    // //post com axios 

    // const data = null; 

    // axios
    //     .post("https://world.openfoodfacts.net/cgi/product_jqm2.pl", data)
    //     .then((response) => {
    //         alert(JSON.stringify(response.data))
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //     });


});
