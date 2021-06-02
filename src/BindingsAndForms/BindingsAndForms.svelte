<script>
  import CustomInput from "./CustomInput.svelte";
  import Toggle from "./Toggle.svelte";

  let appValue = "Test";
  let option = 2;

  $: console.log(appValue);
  $: console.log(option);

  function setValue(event) {
    appValue = event.target.value;
  }
</script>

<CustomInput bind:componenteValue={appValue} />
<Toggle bind:chosenOption={option} />

<!--
  Demonstração de como é possível vincular variáveis do componente pai com as
  variáveis expostas do componente filho. Essa técnica é desencorajada pois, com
  ela, o desenvolvedor pode facilmente introduzir bugs. Portanto, use-a com
  cautela!
-->