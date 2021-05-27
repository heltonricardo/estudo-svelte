<script>
  // Anotação 01
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let productTitle;

  function addToCart() {
    // Anotação 02
    dispatch("add-to-cart", {id: "p1"});
  }
</script>

<article on:dblclick>
  <h1>{productTitle}</h1>
  <!-- Anotação 03
  <button on:click>Add to Cart</button>  -->
  <button on:click={addToCart}>Add to Cart</button>
  <button on:click={() => dispatch("delete")}>Delete</button>
</article>

<!--
  Anotação 01
  Para criarmos eventos próprios importamos createEventDispatcher.

  Anotação 02
  Informamos o nome do evento a ser transmitido e, opcionalmente, um parâmetro,
  que pode ser um número, uma string ou um objeto, por exemplo.

  Anotação 03
  Não atribuir algo ao "on:click" significa que não será o próprio componente o
  responsável por lidar com esse evento. O evento será encaminhado/propadado.
  Porém o evento é propagado apenas UM nível acima. Então o componente pai pode
  "tratar" o evento ou apenas propagá-lo novamente. Nesse caso, não será
  possível distinguir qual dos botões foi clicado (se ambos estiverem com o
  evento de clique), se usarmos apenas os eventos pré-definidos.
-->
