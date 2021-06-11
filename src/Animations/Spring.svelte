<script>
  import { spring } from "svelte/motion";
  import { writable } from "svelte/store";

  let cards = writable([
    {
      id: "c1",
      color: "red",
    },
    {
      id: "c2",
      color: "blue",
    },
    {
      id: "c3",
      color: "green",
    },
    {
      id: "c4",
      color: "orange",
    },
  ]);
  let cardPos = spring(
    [
      {
        rotation: 0,
        dx: 0,
      },
      {
        rotation: -10,
        dx: 0,
      },
      {
        rotation: 19,
        dx: 0,
      },
      {
        rotation: -25,
        dx: 0,
      },
    ],
    {
      stiffness: 0.05,
      damping: 0.9,
      precision: 0.001
    }
  );

  function discard(index) {
    cardPos.update((items) => {
      const updatedCardPositions = [...items];
      const updatedCardPos = { ...updatedCardPositions[index] };
      updatedCardPos.dx = 1200;
      updatedCardPos.rotation = 60;
      updatedCardPositions[index] = updatedCardPos;
      return updatedCardPositions;
    });
  }
</script>

<style>
  .page {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
  }

  .card {
    position: absolute;
    width: 20rem;
    height: 30rem;
    background: #ccc;
    left: calc(50% - 10rem);
    top: calc(50vh - 15rem);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    border-radius: 5px;
  }
</style>

<div class="page">
  <div class="cards">
    {#each $cards as card, i (card.id)}
      <div
        class="card"
        style="background: {card.color}; transform: rotateZ({$cardPos[i]
          .rotation}deg) translateX({$cardPos[i].dx}px)"
        on:click={discard.bind(this, i)}
      />
    {/each}
  </div>
</div>

<!--
  Esse componente possui duas writable store. As contém informações sobre alguns
  cards que são renderizados na tela. Os dados foram separados dessa forma para
  que a segunda store seja composta por objetos que só possuem números, com isso
  conseguiremos adicionar animações com tweened. Porém usaremos a spring, outra
  store, semelhante à tweened, porém que não é linear, pois leva em consideração
  a física (spring, além de primavera, é mola em inglês). Seu segundo parâmetro
  é um objeto de configuração com algumas propriedades:
  - stiffness: rigidez - valor entre 0 e 1, quanto maior o valor, mais apertada
    ficará a mola.
  - damping: amortecimento - valor entre 0 e 1, quanto menor o valor, mais
    elástica ficará a mola.
  - precision: precisão - limite no qual a mola é considerada em repouso. Quanto
    menor o valor, mais preciso será.
-->
