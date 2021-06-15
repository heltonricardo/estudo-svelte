<script>
  import { onMount } from "svelte";
  import hobbyStore from "./store";

  let hobbyInput;
  let isLoading = false;

  onMount(() => {
    isLoading = true;
    fetch("https://meetus-3fe2d-default-rtdb.firebaseio.com/hobbies.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((data) => {
        hobbyStore.setHobbies(Object.values(data));
      })
      .catch((err) => console.log(err))
      .then(() => {
        isLoading = false;
        hobbyInput.focus();
      });
  });

  function addHobby() {
    if (hobbyInput.value && !$hobbyStore.find((h) => h === hobbyInput.value)) {
      isLoading = true;

      // Anotação 01
      fetch("https://meetus-3fe2d-default-rtdb.firebaseio.com/hobbies.json", {
        method: "POST",
        body: JSON.stringify(hobbyInput.value),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed!");
          }
          hobbyStore.addHobby(hobbyInput.value);
          hobbyInput.value = "";
        })
        .catch((err) => console.log(err))
        .then(() => {
          isLoading = false;
          hobbyInput.focus();
        });
    }
  }
</script>

<p>
  ⚠️ Data from this page is dynamically entered by users. The author of this
  project assumes no responsibility for this content. ⚠️
</p>
<br />

<label for="hobby">Enter an item:</label>
<input type="text" id="hobby" bind:this={hobbyInput} />
<button on:click={addHobby}>Add</button>

{#if isLoading}
  <p>Loading...</p>
{:else}
  <ul>
    {#each $hobbyStore as hobby (hobby)}
      <li>{hobby}</li>
    {/each}
  </ul>
{/if}

<!--
  Anotação 01
  Usamos a função fetch() que é provida pelo próprio JavaScript, passando como
  parâmetro a URL da API, nesse caso usamos o FireBase (consulte o arquivo
  src/HTTP/Instrucoes.md). Foi necessário colocar ".json" no final da URL, porém
  apenas porque estamos usando o FireBase, e esse é um requisito dele. O segundo
  argumento é um objeto de configuração de requisição. O FireBase, como a
  maioria das API's, espera receber o corpo da requisição como um Json, então
  convertemos os nossos dados com o auxílio da função JSON.stringify() do JS. O
  header serve para que o FireBase entenda que estamos enviando dados em Json.

  Como o fetch() pode demorar um pouco para fazer requisições, usamos o then()
  para executar ações DEPOIS que a primeira tenha terminado, e catch() para
  capturar eventuais erros que lancemos em then().

  O then() recebe uma resposta http. Podemos verificar se a requisição foi bem
  sucedida usando resposta.ok (valor = 200) .
-->
