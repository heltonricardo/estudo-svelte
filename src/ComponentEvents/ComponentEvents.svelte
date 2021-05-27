<script>
  import App from "../App.svelte";
  import Modal from "./Modal.svelte";
  import Product from "./Product.svelte";

  let products = [
    {
      id: "p1",
      title: "A Book",
      price: 9.99,
    },
  ];

  function addToCart(event) {
    console.log(event.detail);
  }

  function deleteProduct(event) {
    console.log(event.detail);
  }
</script>

{#each products as product}
  <Product
    {...product}
    on:dblclick={() => alert("Duplo clique!")}
    on:add-to-cart={addToCart}
    on:delete={deleteProduct}
  />
{/each}

<Modal>
  <h1 slot="header">Hi!</h1>
  <p>This works!</p>
  <p>This works!</p>
  <input slot="footer" type="text" name="" id="">
  <p>This works!</p>
</Modal>

<!-- 
  É possível enviar conteúdo para o Modal em vários locais/slots diferentes no
  mesmo. Todo o conteúdo que sem definição de um nome do slot destino será
   enviado para o slot não nomeado dentro do Modal.
 -->