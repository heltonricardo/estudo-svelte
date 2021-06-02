<script>
  let val = "Test";
  $: console.log(val);

  function setValue(event) {
    val = event.target.value;
  }
</script>

<input type="text" value={val} on:input={setValue} />
