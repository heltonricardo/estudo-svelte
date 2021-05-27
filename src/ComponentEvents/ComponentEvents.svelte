<script>
  import Product from "./Product.svelte";
</script>

<Product
  productTitle="A Book"
  on:dblclick={() => alert("Duplo clique!")}
  on:add-to-cart={() => alert("Add to cart!")}
  on:delete={() => alert("Delete")}
/>
