<script>
  import ContactCard from "./ContactCard.svelte";

  let name = "Helton";
  let job = "Estagiário";
  let description = "Estudando Svelte.js";
  let image = "https://avatars.githubusercontent.com/u/50843386?v=4";
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
</script>

<h1>My name is {upperCaseName} and I am {age} years old!</h1>
<button on:click={incrementAge}>Increment Age</button>
<input type="text" bind:value={name} />
<input type="text" bind:value={job} />
<input type="text" bind:value={image} />
<textarea rows="3" bind:value={description} />

<ContactCard
  userName={name}
  {age}
  jobTitle={job}
  {description}
  imageURL={image}
/>

<style>
  h1 {
    color: purple;
  }
</style>
