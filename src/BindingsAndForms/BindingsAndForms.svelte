<script>
  import CustomInput from "./CustomInput.svelte";
  import Toggle from "./Toggle.svelte";

  let appValue = "Test";
  let option = 2;
  let price = 0;
  let agreed = false;
  let favColor = "blue";
  let favColors = ["red", "green"];

  $: console.log(appValue);
  $: console.log(option);
  $: console.log(price);
  $: console.log(agreed);
  $: console.log(favColor);
  $: console.log(favColors);
</script>

<style>
</style>

<!-- Anotação 01 -->
<CustomInput bind:componenteValue={appValue} />
<Toggle bind:chosenOption={option} />

<!-- Anotação 02
<input
  type="number"
  value={price}
  on:input={(event) => console.log(event.target.value)}
/> -->
<input type="number" bind:value={price} />

<label>
  <input type="checkbox" bind:checked={agreed} />
  Agree to terms?
</label>

<h1>Favorite Color?</h1>
<label>
  <input type="radio" name="colors" value="red" bind:group={favColor} />
  Red
</label>
<label>
  <input type="radio" name="colors" value="green" bind:group={favColor} />
  Green
</label>
<label>
  <input type="radio" name="colors" value="blue" bind:group={favColor} />
  Blue
</label>

<h1>Favorite Color(s)?</h1>
<label>
  <input type="checkbox" name="colors" value="red" bind:group={favColors} />
  Red
</label>
<label>
  <input type="checkbox" name="colors" value="green" bind:group={favColors} />
  Green
</label>
<label>
  <input type="checkbox" name="colors" value="blue" bind:group={favColors} />
  Blue
</label>

<!--
  Anotação 01
  Demonstração de como é possível vincular variáveis do componente pai com as
  variáveis expostas do componente filho. Essa técnica é desencorajada pois, com
  ela, o desenvolvedor pode facilmente introduzir bugs. Portanto, use-a com
  cautela!

  Anotação 02
  Mesmo usando o type="number", o JS recebe isso como uma string, sempre como
  string. Nesse caso, number serve apenas para modificar o campo, acrescentando
  um controlador de incremendo e decremento. Usando o bind, o Svelte tentará
  converter automaticamente o campo, é possível verificar isso quando apagamos
  todos os números do input e, no console, aparece a mensagem "null" e não "".
-->
