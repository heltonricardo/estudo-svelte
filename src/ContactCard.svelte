<script>
  export let userName;
  export let age;
  export let jobTitle;
  export let description;
  export let imageURL;
  export let imageText = "Alternative text";
</script>

<div class="contact-card">
  <header>
    <!-- Anotação 01 -->
    <div class="thumb" class:thumb-placeholder={!imageURL}>
      <img src={imageURL} alt={imageText} />
    </div>
    <div class="user-data">
      <h1>{userName}, {age}</h1>
      <h2>{jobTitle}</h2>
    </div>
  </header>
  <div class="description">
    <!-- Anotação 02 -->
    <p>{description}</p>
  </div>
</div>

<style>
  .contact-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    max-width: 30rem;
    border-radius: 5px;
    margin: 1rem 0;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 7rem;
  }

  .thumb {
    width: 33%;
    height: 100%;
  }

  .thumb-placeholder {
    background: #ccc;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-data {
    width: 67%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 1rem;
  }

  h1 {
    font-size: 1.25rem;
    font-family: "Roboto Slab", sans-serif;
    margin: 0.5rem 0;
  }

  h2 {
    font-size: 1rem;
    font-weight: normal;
    color: #5a5a5a;
    margin: 0;
    margin-bottom: 0.5rem;
  }

  .description {
    border-top: 1px solid #ccc;
    padding: 1rem;
  }
</style>

<!--
  Anotação 01
  class:uma_nova_classe={condição} permite ADICIONAR uma classe ao elemento caso
  a condição seja verdadeira.
  
  Anotação 02
  Se por algum motivo quiséssemos que o valor inserido dentro de description
  fosse tratado como HTML, bastaria escrever: <p>{@html description}</p>. Dessa
  forma seria possível escrever código HTML dentro do campo. Cuidado ao usar
  essa opção pois permite ataques como XSS (Cross-site scripting). Quando não
  usamos essa flag, todo o conteúdo é "sanitarizado", tornando-se texto.
-->