<script>
  import Product from "./DynamicComponent/Product.svelte";
  import CartItem from "./DynamicComponent/CartItem.svelte";
  import FamilyNode from "./RecursiveComponent/FamilyNode.svelte";

  /************************** COMPONENTES DINÂMICOS ***************************/

  let list = [
    { component: Product, data: { id: "p1", title: "Product", price: 13.18 } },
    { component: CartItem, data: { id: "c1", title: "Cart Item", amount: 28 } },
  ];
  let selected = 0;

  function toggle() {
    selected = selected ? 0 : 1;
  }

  /************************** COMPONENTES RECURSIVOS **************************/

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

  /*************************** WINDOWS, BODY E HEAD ***************************/

  let y;
  let enter;
  let titleNumber = 0;
</script>

<style>
  hr {
    margin: 3rem 0;
  }

  div {
    height: 2500px;
  }
</style>

<div>
  <!-- Anotação 01 -->
  <button on:click={toggle}>Toggle Display</button>
  <svelte:component this={list[selected].component} {...list[selected].data} />

  <hr />

  {#each familyStructure as familyMember}
    <FamilyNode member={familyMember} />
  {/each}

  <hr />

  <h1>Scroll Y: {y}</h1>
  <h1>Mouse enter: {enter}</h1>
  <button on:click={() => ++titleNumber}>Add 1 to Page's Title</button>
</div>

<!-- Anotação 02 -->
<svelte:window bind:scrollY={y} />
<svelte:body
  on:mouseenter={() => (enter = true)}
  on:mouseleave={() => (enter = false)} />
<svelte:head>
  <title>Svelte {titleNumber}</title>
</svelte:head>

<!--
  Anotação 01
  A tag svelte:component permite criar componentes informando o nome do
  construtor do componente através do this={} e passando os o valores das
  propriedades normalmente como já fizemos. Nesse caso, criamos objetos com o
  nome dos componentes e suas propriedades, fazendo com que não seja necessário
  criar uma declaração #if para renderizar diferentes tipos de componentes.

  Anotação 02
  A tag svelte:window nos permite interagir com o ambiente em que o script
  esteja executando, não sendo necessário usar escutadores de evento como, por
  exemplo, windows.addEventListener() pode ser substituído por "svelte:window
  on:keydown={}". Também é possível vincular nossas variáveis a atributos, como
  "svelte:window bind:scrollY={y}".

  A tag svelte:body é semelhante à window no que se refere a nos possibilitar
  não escrever um escutador Vanilla JavaScript como
  "document.body.addEventListener()".

  A tag svelte:head permite manipular os elementos que se localizam dentro da
  seção head do HTML, como title, meta e link, por exemplo.
-->
