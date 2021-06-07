<script>
  import Cart from "./Cart/Cart.svelte";
  import Products from "./Products/Products.svelte";
  import Button from "./UI/Button.svelte";

  let showCart = true;
</script>

<Button on:click={() => (showCart = !showCart)}>Toggle Cart</Button>
{#if showCart}
  <Cart />
{/if}
<Products />
