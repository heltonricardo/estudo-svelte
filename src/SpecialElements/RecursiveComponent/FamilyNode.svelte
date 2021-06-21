<script>
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
      <svelte:self member={child} />
    {/each}
  {/if}
</div>

<!--
  A tag svelte:self serve para renderizarmos um componente a partir dele mesmo.
  Muito útil em estruturas hierárquicas como árvore de pastas, por exemplo, ou
  um tipo de estrutura cujo o componente tenha dependência de si mesmo.
-->