<script>
  import { tweened } from "svelte/motion";
  import { cubicIn } from "svelte/easing";
  import { fade, fly, slide, scale } from "svelte/transition";
  import Spring from "./Spring.svelte";

  let boxes = [];
  let boxInput;
  let show = false;

  // Anotação 01
  const progress = tweened(0, {
    delay: 0,
    duration: 1500,
    easing: cubicIn,
  });

  setTimeout(() => {
    progress.set(0.5);
  }, 1500);

  function addBox() {
    boxes = [...boxes, boxInput];
  }

  function discard(box) {
    boxes = boxes.filter((m) => m !== box);
  }
</script>

<style>
  div {
    width: 10rem;
    height: 10rem;
    background: #ccc;
    margin: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    border-radius: 8px;
    padding: 1rem;
  }

  progress {
    display: block;
    margin-bottom: 5rem;
  }

  input {
    margin-top: 5rem;
  }
</style>

<progress value={$progress} />
<!-- <Spring /> -->

<button on:click={() => (show = !show)}>Toggle</button>
{#if show}
  <p transition:slide>Now you see me</p>
{/if}

<input type="text" bind:value={boxInput} />
<button on:click={addBox}>Add</button>
{#if show}
  {#each boxes as box}
    <!-- Anotação 02 -->
    <div
      transition:fly|local={{ x: -200, duration: 2000 }}
      on:click={discard(box)}
      on:introstart={() => console.log("Adding the element starts...")}
      on:introend={() => console.log("Adding the element ends...")}
      on:outrostart={() => console.log("Removing the element starts...")}
      on:outroend={() => console.log("Removing the element ends...")}
    >
      {box}
    </div>
  {/each}
{/if}

<!--
  Anotação 01
  Tweened é um tipo de writable store que também faz animações quando os dados
  são alterados. Esses dados podem ser números, datas e matrizes/objetos com
  números ou datas. O primeiro parâmetro é o valor da store, como em uma
  writable comum, nesse exemplo usamos o número 0 para representar 0% em uma
  barra de progresso, o valor 1 significará 100%. O segundo parâmetro é um
  objeto de configuração da tweened:
  - delay: espera antes de executar a animação, em milissegundos (padrão: 0)
  - duration: duração da animação, em milissegundos (padrão: 400)
  - easing: é a função de animação, que pode ser definida através de outras
    funções disponibilizadas pelo Svelte. É possível acessar os protótipos em:
    node_modules > svelte > types > runtime > easing > index.ts. A função
    CubicIn faz com que o final da animação seja mais rápido que o começo.

  Anotação 02
  Motion é basicamente a animação de valores, enquanto que Transitions são
  animações de aparecimento e desaparecimento. Basta adicionar, à tag HTML, o
  nome da transition. Algumas transições permitem parâmetros e outras precisam
  deles para funcionar corretamente. Elas devem ser enviadas através de um
  objeto de configuração comum do Javascript:
  - fade: permite delay e duration;
  - slide: permite delay, duration e easing;
  - scale: permite delay, duration, easing, start e opacity;
  - fly: permite delay, duration, easing, opacity, x e y.
  O modificador "local" permite restringir a transição apenas para o elemento
  que está sendo adicionado e não para toda a lista, no exemplo.
  Também é possível executar ações no início e término do aparecimento e
  desaparecimento do elemento através dos eventos: introstart, introend,
  outrostart e outroend.
-->
