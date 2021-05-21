<script>
  let name = "Helton";
  let age = 0;

  /* Variável reativa: altera seu valor assim que o valor atribuído é alterado
   * ou executado. Não é necessário declarar! O símbolo "$:" significa
   * basicamente: execute a operação assim que houver alguma modificação e/ou
   * execução.
   */
  $: upperCaseName = name.toUpperCase();
  $: console.log(name);
  $: if (name == "Ricardo") {
    age = 26;
  }

  function incrementAge() {
    age += 1;
  }

  function changeName() {
    name = "Ricardo";
  }

  function nameInput(event) {
    name = event.target.value;
  }
</script>

<h1>My name is {upperCaseName} and I am {age} years old!</h1>
<button on:click={incrementAge}>Increment Age</button>
<!-- <button on:click="{changeName}">Change Name</button> -->
<input type="text" value={name} on:input={nameInput} />

<style>
  h1 {
    color: purple;
  }
</style>
