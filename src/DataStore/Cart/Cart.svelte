<script>
  import CartItem from "./CartItem.svelte";
  import cartItems from "../Cart/cart-store";
  
  /* Anotação 01
  import { onDestroy } from "svelte";
  let items;
  const unsubscribe = cartItems.subscribe((store) => (items = store));

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  }); */
</script>

<style>
  section {
    width: 30rem;
    max-width: 90%;
    margin: 2rem auto;
    border-bottom: 2px solid #ccc;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>

<section>
  <h1>Cart</h1>
  <ul>
    <!-- Anotação 02 -->
    {#each $cartItems as item (item.id)}
      <CartItem id={item.id} title={item.title} price={item.price} />
    {:else}
      <p>No items in cart yet!</p>
    {/each}
  </ul>
</section>

<!--
  Anotação 01
  A função subscribe é executada sempre que ocorre uma alteração nos dados da
  store. Em nosso exemplo existe um botão que permite ocultar e mostrar os itens
  em nosso carrinho. Como a função subscribe está dentro do carrinho, sempre que
  ele é mostrado, é criada uma nova função subscribe, o que poderá sobrecarregar
  a aplicação a longo prazo pois, quando o carrinho é mostrado, todas as funções
  subscribe dele serão executadas. Para que isso nao ocorra, devemos limpar as
  assinaturas tão logo o componente não mais exista. Para isso utilizamos o
  retorno da própria função subscribe, cuja qual é uma outra função que usaremos
  para o nosso propósito dentro do onDestroy (quando o componente é destruído do
  DOM). A função pode ter qualquer nome, mas sempre prefira um sugestivo. A
  condição de existência dentro de onDestroy é um bom hábito apenas para evitar
  eventuais erros, já que a função unsubscribe provavelmente existirá.

  Anotação 02
  Quando precisamos apenas receber os dados de uma store e exibí-los na tela,
  temos um atalho providenciado pelo Svelte. É possível usar diretamente
  "$nome-da-store" para que todo o trabalho de subscribe, extração e uso dos
  dados e unsubscribe seja feito automaticamente. Porém, é importante saber os
  conceitos pois, em muitos casos, precisamos tratar os dados antes de exibí-los
  na tela. Portanto, as variáveis que começam com um cifrão são sempre
  entendidas como stores pelo Svelte.
-->
