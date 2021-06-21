<!-- Anotação 01 -->
<script context="module">
  console.log("This code runs once!");
</script>

<script>
  console.log("This code runs multiple times!");
  export let member;
</script>

<style>
  div {
    margin-left: 2rem;
  }
</style>

<div>
  <h1>{member.name}</h1>
  {#if member.isParent}
    {#each member.children as child}
    <!-- Anotação 02 -->
      <svelte:self member={child} />
    {/each}
  {/if}
</div>

<!--
  Anotação 01
  Usamos <script context="module"> para que todo o script colocado ali seja
  executado apenas uma vez, independente de quantas vezes o componente seja
  chamado/renderizado.

  Anotação 02
  A tag svelte:self serve para renderizarmos um componente a partir dele mesmo.
  Muito útil em estruturas hierárquicas como árvore de pastas, por exemplo, ou
  um tipo de estrutura cujo o componente tenha dependência de si mesmo.
-->
