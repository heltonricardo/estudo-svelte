<script>
  let hobbies = [];
  let hobbyInput;

  function addHobby() {
    if (hobbyInput && !hobbies.find((h) => h === hobbyInput)) {
      hobbies = [...hobbies, hobbyInput];

      // Anotação 01
      fetch("https://meetus-3fe2d-default-rtdb.firebaseio.com/hobbies.json", {
        method: "POST",
        body: JSON.stringify(hobbies),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(res => {
        if (!res.ok) {
            throw new Error("Failed!")
        }
        // ...
      }).catch(err => console.log(err));
    }
  }
</script>

<label for="hobby">Hobby</label>
<input type="text" id="hobby" bind:value={hobbyInput} />
<button on:click={addHobby}>Add Hobby</button>

<ul>
  {#each hobbies as hobby (hobby)}
    <li>{hobby}</li>
  {/each}
</ul>

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
-->
