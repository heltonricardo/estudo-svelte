<script>
  import CustomInput from "./CustomInput.svelte";
  import Toggle from "./Toggle.svelte";
  import { isValidEmail } from "./validation";

  let appValue = "Test";
  let option = 2;
  let price = 0;
  let agreed = false;
  let checkColor = "blue";
  let radioColors = ["red", "green"];
  let selectColor = "green";
  let usernameInput;
  let enteredEmail = "";
  let formIsValid;

  $: console.log(`appValue: ${appValue}`);
  $: console.log(`option: ${option}`);
  $: console.log(`price: ${price}`);
  $: console.log(`agreed: ${agreed}`);

  $: console.log(`checkColor: ${checkColor}`);
  $: console.log(`radioColors: ${radioColors}`);
  $: console.log(`selectColor: ${selectColor}`);

  $: if (isValidEmail(enteredEmail)) {
    formIsValid = true;
  } else {
    formIsValid = false;
  }

  function saveData() {
    //console.log(document.querySelector("#username").value);
    console.log(usernameInput);
  }
</script>

<style>
  .invalid {
    background-color: darkred;
  }
</style>

<!-- Anotação 01 -->
<CustomInput bind:componenteValue={appValue} />
<Toggle bind:chosenOption={option} />

<!-- Anotação 02 -->
<input type="number" bind:value={price} />

<label>
  <input type="checkbox" bind:checked={agreed} />
  Agree to terms?
</label>

<h1>Favorite Color?</h1>
<label>
  <input type="radio" name="colors" value="red" bind:group={checkColor} />
  Red
</label>
<label>
  <input type="radio" name="colors" value="green" bind:group={checkColor} />
  Green
</label>
<label>
  <input type="radio" name="colors" value="blue" bind:group={checkColor} />
  Blue
</label>

<h1>Favorite Color(s)?</h1>
<label>
  <input type="checkbox" name="colors" value="red" bind:group={radioColors} />
  Red
</label>
<label>
  <input type="checkbox" name="colors" value="green" bind:group={radioColors} />
  Green
</label>
<label>
  <input type="checkbox" name="colors" value="blue" bind:group={radioColors} />
  Blue
</label>

<h1>Favorite Color?</h1>
<select bind:value={selectColor}>
  <option value="red">Red</option>
  <option value="green">Green</option>
  <option value="blue">Blue</option>
</select>

<hr />

<!-- Anotação 03 -->
<!-- <input type="text" id="username" /> -->
<input type="text" bind:this={usernameInput} />
<button on:click={saveData}>Save</button>

<hr />

<form on:submit|preventDefault>
  <input
    type="email"
    bind:value={enteredEmail}
    class={isValidEmail(enteredEmail) ? "" : "invalid"}
  />
  <button type="submit" disabled={!formIsValid}>Save</button>
</form>

<!--
  Anotação 01
  Demonstração de como é possível vincular variáveis do componente pai com as
  variáveis expostas do componente filho. Essa técnica é desencorajada pois, com
  ela, o desenvolvedor pode facilmente introduzir bugs. Portanto, use-a com
  cautela!

  Anotação 02
  <input type="number" value={price}
  on:input={(event) => console.log(event.target.value)} />
  Mesmo usando o type="number", o JS recebe isso como uma string, sempre como
  string. Nesse caso, number serve apenas para modificar o campo, acrescentando
  um controlador de incremendo e decremento. Usando o bind, o Svelte tentará
  converter automaticamente o campo, é possível verificar isso quando apagamos
  todos os números do input e, no console, aparece a mensagem "null" e não "".

  Anotação 03
  O bind:this cria um PONTEIRO para determinado elemento. É possível acessar
  todas as propriedades, como no JS, usando ponteiro.value para acessar o valor,
  por exemplo.
-->
