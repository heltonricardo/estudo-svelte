<script>
  import Product from "./Product.svelte";
  import CartItem from "./CartItem.svelte";

  let list = [
    { component: Product, data: { id: "p1", title: "Product", price: 13.18 } },
    { component: CartItem, data: { id: "c1", title: "Cart Item", amount: 28 } },
  ];
  let selected = 0;

  function toggle() {
    selected = selected ? 0 : 1;
  }
</script>

<button on:click={toggle}>Toggle Display</button>
<svelte:component this={list[selected].component} {...list[selected].data} />

<!--
  A tag svelte:component permite criar componentes informando o nome do
  construtor do componente através do this={} e passando os o valores das
  propriedades normalmente como já fizemos. Nesse caso, criamos objetos com o
  nome dos componentes e suas propriedades, fazendo com que não seja necessário
  criar uma declaração #if para renderizar diferentes tipos de componentes.
-->
