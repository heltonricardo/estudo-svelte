<script>
	let name = "Helton";
	let age = 0;

	// Variável reativa: altera seu valor assim que o valor atribuído é alterado \
	// ou executado. Não é necessário declarar!
	$: upperCaseName = name.toUpperCase();

	function incrementAge() {
		age += 1;
	}

	function changeName() {
		name = "Ricardo";
	}

</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>My name is {upperCaseName} and I am {age} years old!</h1>
<button on:click="{incrementAge}">Increment Age</button>
<button on:click="{changeName}">Change Name</button>