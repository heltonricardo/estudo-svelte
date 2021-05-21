<script>
	let name = "Helton";
	let age = 0;

	function incrementAge() {
		age += 1;
	}
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>My name is {name} and I am {age} years old!</h1>
<button on:click="{incrementAge}">Increment Age</button>