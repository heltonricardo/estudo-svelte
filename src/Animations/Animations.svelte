<script>
  import { tweened } from "svelte/motion";
  import { cubicIn } from "svelte/easing";

  // Anotação 01
  const progress = tweened(0, {
    delay: 0,
    duration: 1500,
    easing: cubicIn,
  });

  setTimeout(() => {
    progress.set(0.5);
  }, 1500);
</script>

<progress value={$progress} />

<!--
  Anotação 01
  Tweened é um tipo de writable store que também faz animações quando os dados
  são alterados. Esses dados podem ser números, datas, matrizes e objetos de
  com números ou datas. O primeiro parâmetro é o valor da store, como em uma
  writable comum, nesse exemplo usamos o número 0 para representar 0% em uma
  barra de progresso, o valor 1 significará 100%. O segundo parâmetro é um
  objeto de configuração da tweened:
  - delay: espera antes de executar a animação, em milissegundos (padrão: 0)
  - duration: duração da animação, em milissegundos (padrão: 400)
  - easing: é a função de animação, que pode ser definida através de outras
    funções disponibilizadas pelo Svelte. É possível acessar os protótipos em:
    node_modules > svelte > types > runtime > easing > index.ts. A função
    CubicIn faz com que o final da animação seja mais rápido que o começo.
-->
