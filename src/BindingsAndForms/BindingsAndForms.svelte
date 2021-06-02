<script>
  import CustomInput from "./CustomInput.svelte";
  import Toggle from "./Toggle.svelte";

  let appValue = "Test";
  let option = 2;
  let price;

  $: console.log(appValue);
  $: console.log(option);
  $: console.log(price);

  function setValue(event) {
    appValue = event.target.value;
  }
</script>

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
