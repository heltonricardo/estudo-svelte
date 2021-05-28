<script>
  import Modal from "./Modal.svelte";
  import Product from "./Product.svelte";

  let products = [
    {
      id: "p1",
      title: "A Book",
      price: 9.99,
    },
  ];

  let showModal = false;

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

<br />
<button on:click={() => (showModal = true)}>Show Modal</button>

{#if showModal}
  <Modal
    on:cancel={() => (showModal = false)}
    on:close={() => (showModal = false)}
  >
    <h1 slot="header">Hi!</h1>
    <p>This works!</p>
    <p>This works!</p>
    <button slot="footer" on:click={() => (showModal = false)}>Confirm</button>
    <p>This works!</p>
  </Modal>
{/if}

<!-- 
  É possível enviar conteúdo para o Modal em vários locais/slots diferentes no
  mesmo. Todo o conteúdo que sem definição de um nome do slot destino será
  enviado para o slot não nomeado dentro do Modal.
 -->
