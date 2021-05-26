<script>
  import Product from "./Product.svelte";
</script>

<Product
  productTitle="A Book"
  on:click={() => alert("Clique simples!")}
  on:dblclick={() => alert("Duplo clique!")}
/>
