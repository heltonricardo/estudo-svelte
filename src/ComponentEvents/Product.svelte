<script>
  export let productTitle;
</script>

<article on:dblclick>
  <h1>{productTitle}</h1>
  <button on:click>Add to Cart</button>
  <button>Delete</button>
</article>

<!--
  Não atribuir algo ao "on:click" significa que não será o próprio componente o
  responsável por lidar com esse evento. O evento será encaminhado/propadado.
  Porém o evento é propagado apenas UM nível acima. Então o componente pai pode
  "tratar" o evento ou apenas propagálo novamente.
 -->