<script>
  import {
    createEventDispatcher,
    onMount,
    onDestroy,
    beforeUpdate,
    afterUpdate,
  } from "svelte";
  const dispatch = createEventDispatcher();

  let agreed = false;
  let autoscroll = false;

  // Anotação 01 -----------------
  onMount(() => {
    console.log("onMount!");
  });

  onDestroy(() => {
    console.log("onDestroy!");
  });

  console.log("Script executed!");
  // -----------------------------

  // Anotação 02 ------------------------------------
  beforeUpdate(() => {
    console.log("beforeUpdate!");
    autoscroll = agreed;
  });

  afterUpdate(() => {
    console.log("afterUpdate!");

    if (autoscroll) {
      const modal = document.querySelector(".modal");
      modal.scrollTo(0, modal.scrollHeight);
    }
  });
  // ------------------------------------------------
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
    max-height: 15vh;
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
    <!-- Anotação 03 -->
    <slot name="header" />
  </header>

  <div class="content">
    <slot />
  </div>

  <div class="disclaimer">
    <p>Before you close, you need to agree to our terms!</p>
    <button on:click={() => (agreed = true)}>Agree</button>
  </div>
  <footer>
    <slot name="footer" didAgree={agreed}>
      <button on:click={() => dispatch("close")} disabled={!agreed}
        >Close</button
      >
    </slot>
  </footer>
</div>

<!--
  Anotação 01
  Essa é uma demonstração do ciclo de vida de um componente:
  Declaração -> Montagem -> Destruição. O primeiro log no console que vemos no
  browser, ao abrir o Modal, é o "Script executed!", quando ocorre a declaração
  de tudo o que está dentro das tags <script>. Depois, quando ele está sendo
  montado no DOM/tela , executa a função onMont. Esse é um bom local para
  requisitarmos dados de um servidor, por exemplo. E, ao ser destruído, o Svelte
  executará a função onDestroy do componente. A ordem de declaração das funções
  dentro de <script> é indiferente.

  Anotação 02
  Esse seria um segundo ciclo de vida de um componente, que refere-se às suas
  atualizações. A função beforeUpdate é executada antes de QUALQUER qualquer
  atualização no DOM do componente. E a função afterUpdate é executada depois de
  QUALQUER atualização. Podemos perceber esses comportamentos abrindo o Modal,
  clicando no botão "Agree" (a variável booleana reativa é alterada) e depois
  clicando em "Close". Lembrando que quando ambas as funções são executadas, a
  ação já ocorreu.

  Anotação 03
  Os slots são usados para enviar conteúdo para um componente filho de uma
  maneira diferente. Podendo-se enviar outros elementos para serem utilizados e
  renderizados. Nesse exemplo, o nosso Modal é apenas um local para inserirmos
  outros componentes. Podem existir n slots, porém apenas um pode ficar sem um
  nome. Analisando o <footer> é possível perceber o uso de uma estrutura padrão
  caso nenhuma propriedade/componente seja enviado para esse slot. Esse
  conteúdo será substituido pelo conteúdo enviado, caso exista.
 -->
