<script>
  import Modal from "./Modal.svelte";
  import Product from "./Product.svelte";
  import { tick } from "svelte";

  let text = "This is some dummy text!";

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

  function transform(event) {
    if (event.keyCode !== 9) {
      // TAB ASCII code: 9
      return;
    }
    event.preventDefault(); // Impede o comportameto padrão "próximo elemento"
    const selectionStart = event.target.selectionStart;
    const selectionEnd = event.target.selectionEnd;
    const value = event.target.value;

    text =
      value.slice(0, selectionStart) +
      value.slice(selectionStart, selectionEnd).toUpperCase() +
      value.slice(selectionEnd);

    // Anotação 03
    // event.target.selectionStart = selectionStart;
    // event.target.selectionEnd = selectionEnd;
    
    tick().then(() => {
      event.target.selectionStart = selectionStart;
      event.target.selectionEnd = selectionEnd;
    });
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

<!-- Anotação 03 -->
<textarea rows="5" value={text} on:keydown={transform} />

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

  Anotação 03
  Simplesmente definir a nova seleção dentro da função, não fará com que
  tenhamos o efeito desejado pois o "value={text}" da tag (a atualização do DOM)
  só será executada na próxima micro-transação. Além disso, não é possível
  utilizar afterUpdate() dentro de uma função. Usaremos o tick(). A função tick
  retorna uma promessa que, quando for concluída, a próxima micro-transação será
  executada.
-->
