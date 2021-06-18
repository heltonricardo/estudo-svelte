<script>
  import Product from "./DynamicComponent/Product.svelte";
  import CartItem from "./DynamicComponent/CartItem.svelte";
  import FamilyNode from "./RecursiveComponent/FamilyNode.svelte";

  let list = [
    { component: Product, data: { id: "p1", title: "Product", price: 13.18 } },
    { component: CartItem, data: { id: "c1", title: "Cart Item", amount: 28 } },
  ];
  let selected = 0;

  function toggle() {
    selected = selected ? 0 : 1;
  }

  /********************/

  let familyStructure = [
    {
      name: "John",
      isParent: true,
      children: [
        {
          name: "Moe",
          isParent: true,
          children: [{ name: "Julie", isParent: false }],
        },
      ],
    },
    { name: "Anna", isParent: false },
  ];
</script>

<style>
  hr {
    margin: 3rem 0;
  }
</style>

<!-- Anotação 01 -->
<button on:click={toggle}>Toggle Display</button>
<svelte:component this={list[selected].component} {...list[selected].data} />

<hr />

{#each familyStructure as familyMember}
  <FamilyNode member={familyMember} />
{/each}

<!--
  Anotação 01
  A tag svelte:component permite criar componentes informando o nome do
  construtor do componente através do this={} e passando os o valores das
  propriedades normalmente como já fizemos. Nesse caso, criamos objetos com o
  nome dos componentes e suas propriedades, fazendo com que não seja necessário
  criar uma declaração #if para renderizar diferentes tipos de componentes.
-->
