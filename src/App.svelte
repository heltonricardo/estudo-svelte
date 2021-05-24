<script>
  import ContactCard from "./ContactCard.svelte";

  let name = "";
  let title = "";
  let image = "";
  let description = "";
  let formState = "empty";

  let createdContacts = [];

  function addContact() {
    if (
      name.trim().length == 0 ||
      title.trim().length == 0 ||
      image.trim().length == 0 ||
      description.trim().length == 0
    ) {
      formState = "invalid";
      return;
    }

    // Anotação 01
    createdContacts = [
      ...createdContacts,
      {
        id: Math.random(),
        name,
        jogTitle: title,
        imageURL: image,
        desc: description,
      },
    ];

    formState = "done";
  }

  function deleteFirst() {
    createdContacts = createdContacts.slice(1);
  }

  function deleteLast() {
    createdContacts = createdContacts.slice(0, -1);
  }
</script>

<form id="form">
  <div class="form-control">
    <label for="userName">User Name</label>
    <input type="text" bind:value={name} id="userName" />
  </div>
  <div class="form-control">
    <label for="jobTitle">Job Title</label>
    <input type="text" bind:value={title} id="jobTitle" />
  </div>
  <div class="form-control">
    <label for="image">Image URL</label>
    <input type="text" bind:value={image} id="image" />
  </div>
  <div class="form-control">
    <label for="desc">Description</label>
    <textarea rows="3" bind:value={description} id="desc" />
  </div>
  <!-- Anotação 02 -->
  <button on:click|preventDefault={addContact}>Add Contact Card</button>
</form>

<button on:click={deleteFirst}>Delete first</button>
<button on:click={deleteLast}>Delete last</button>

{#if formState === "invalid"}
  <p>Invalid input.</p>
{:else}
  <p>Please enter some data and hit the button!</p>
{/if}

<!-- Anotação 03 -->
{#each createdContacts as contact, i (contact.id)}
  <h2># {i + 1}</h2>
  <ContactCard
    userName={contact.name}
    jobTitle={contact.jobTitle}
    description={contact.desc}
    userImage={contact.imageURL}
  />
{:else}
  <p>Please start adding some contacts, we found none!</p>
{/each}

<!--
  Anotação 01
  Para que seja possível renderizar os componentes de arrays em tempo real, é
  necessário fazer a reatribuição desses componentes, e não usar funções prontas
  do JS, como o push, por exemplo. Nesse caso usamos o spread operator (os três
  pontos) para atribuir "tudo o que já tem dentro do objeto" + o novo conteúdo.

  Anotação 02
  É possível usar modificadores após o pipe. Seguem os mais conhecidos:
  - preventDefault: impede o comportamento padrão do browser. Um botão no form
  recarrega a página por padrão, por exemplo;
  - stopPropagation: impede que o evento "suba" para o elemento pai na lista
  hierárquica de elementos;
  - once: permite que o evento aconteça somente uma vez.

  Anotação 03
  Para que não haja problemas na renderização de componentes de arrays, é
  altamente recomendado criarmos uma chave única para para elemento. Nesse caso,
  para fins didáticos, usamos um número aleatório, mas deve-se sempre usar um
  valor diferente para cada um dos elementos. A chave única vai entre parênteses
  sempre no fim da instrução de iteração.
-->

<style>
  #form {
    width: 30rem;
    max-width: 100%;
    margin: 1rem 0;
  }
</style>
