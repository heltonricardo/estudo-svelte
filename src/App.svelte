<script>
  import Basic from "./Basic/Basic.svelte";
  import ComponentEvents from "./ComponentEvents/ComponentEvents.svelte";
  import BindingsAndForms from "./BindingsAndForms/BindingsAndForms.svelte";
  import DataStore from "./DataStore/DataStore.svelte";
  let option = 1;
</script>

<p>
  Select the module: 
  <select bind:value={option}>
    <option value=1>Basic</option>
    <option value=2>Component Events</option>
    <option value=3>Binding and Forms</option>
    <option value=4>Data Store</option>
  </select>
</p>
{#if option == 1}
  <Basic />
{:else if option == 2}
  <ComponentEvents />
{:else if option == 3}
  <BindingsAndForms />
{:else if option == 4}
  <DataStore />
{/if}
