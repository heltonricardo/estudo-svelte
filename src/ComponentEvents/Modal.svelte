<script>
  import { createEventDispatcher } from "svelte";
  let dispatch = createEventDispatcher();
</script>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.75);
    z-index: 10;
  }

  .modal {
    padding: 1rem;
    position: fixed;
    top: 10vh;
    left: 10%;
    width: 80%;
    max-height: 80vh;
    background: white;
    border-radius: 5px;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    overflow: scroll;
  }

  header {
    border-bottom: 1px solid #ccc;
  }
</style>

<div class="backdrop" on:click={() => dispatch("cancel")} />

<div class="modal">
  <header>
    <slot name="header" />
  </header>

  <div class="content">
    <slot />
  </div>

  <footer>
    <slot name="footer">
      <button on:click={() => dispatch("close")}>Close</button>
    </slot>
  </footer>
</div>

<!-- 
  Os slots são usados para enviar conteúdo para um componente filho de uma
  maneira diferente. Podendo-se enviar outros elementos para serem utilizados e
  renderizados. Nesse exemplo, o nosso Modal é apenas um local para inserirmos
  outros componentes. Podem existir n slots, porém apenas um pode ficar sem um
  nome. Analisando o <footer> é possível perceber o uso de uma estrutura padrão
  caso nenhuma propriedade/componente seja enviado para esse slot. Esse
  conteúdo será substituido pelo conteúdo enviado, caso exista.
 -->
