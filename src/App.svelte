<script>
  import Basic from "./Basic/Basic.svelte";
  import ComponentEvents from "./ComponentEvents/ComponentEvents.svelte";
  import BindingsAndForms from "./BindingsAndForms/BindingsAndForms.svelte";
  import DataStore from "./DataStore/DataStore.svelte";
  import Animations from "./Animations/Animations.svelte";

  let option = 5;
  $: console.log(option);
</script>

<style>
  hr {
    margin: 3rem 0;
  }
</style>

<p>
  Select the module:
  <select bind:value={option}>
    <option value={1}>Basic</option>
    <option value={2}>Component Events</option>
    <option value={3}>Binding and Forms</option>
    <option value={4}>Data Store</option>
    <option value={5}>Transitions, Motions and Animations</option>
  </select>
</p>
<hr />

{#if option === 1}
  <Basic />
{:else if option === 2}
  <ComponentEvents />
{:else if option === 3}
  <BindingsAndForms />
{:else if option === 4}
  <DataStore />
{:else if option === 5}
  <Animations />
{/if}
