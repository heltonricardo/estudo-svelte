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
  <!-- Anotação 02 -->
  <Modal
    on:cancel={() => (showModal = false)}
    on:close={() => (showModal = false)}
    let:didAgree={closeable}
  >
    <!-- Anotação 01 -->
    <h1 slot="header">Hi!</h1>
    <p>This works!</p>
    <p>This works!</p>
    <button
      slot="footer"
      on:click={() => (showModal = false)}
      disabled={!closeable}>Confirm</button
    >
    <p>This works!</p>
  </Modal>
{/if}

<!--
  Anotação 01
  É possível enviar conteúdo para o Modal em vários locais/slots diferentes no
  mesmo. Todo o conteúdo que sem definição de um nome do slot destino será
  enviado para o slot não nomeado dentro do Modal.

  Anotação 02
  Aqui no componente pai, podemos verificar o valor de uma variável que pertence
  ao Modal. Em Modal existe uma variável chamada "agreed". No slot onde ela
  está, usamos a declaração "didAgreed={agreed}". Podemos dizer que "didAgreed"
  é quem trará o valor "agreed" do filho para o pai, podemos usar o nome que
  quisermos. Aqui, no componente pai, usamos NO COMPONENTE (e não no slot) a
  a declaração "let:didAgree={closeable}". Isso quer dizer que estamos usando
  "closeable" como um apelido para a variável que está no Modal.
-->
