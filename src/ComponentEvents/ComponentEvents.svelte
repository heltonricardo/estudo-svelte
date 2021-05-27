<script>
  import App from "../App.svelte";
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
