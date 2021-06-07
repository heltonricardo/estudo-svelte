import { readable } from "svelte/store";

let count = 0;

const timer = readable(count, (setFunctionName) => {
  const myFunction = setInterval(() => {
    count++;
    setFunctionName(count);
  }, 1000);

  return () => {
    clearInterval(myFunction);
  };
});

export default timer;

/* Readable é outro tipo de store, a qual não é possível alterar seus dados
   externamente, logo, não é possível usar as funções set e update, somente a
   função subscribe. Seu primeiro parâmetro é o valor inicial da store e o
   segundo é uma função. Nessa função, definimos um nome qualquer para o
   parâmetro. Esse parâmetro, na verdade é um nome para uma outra função que
   usaremos dentro do readable para indicar quando queremos definir um nome
   valor para a store. Por exemplo: usamos a função setInterval que é executada
   no intervalo de tempo especificado, no caso 1000 milissegundos - 1 segundo,
   para executar a função setFunctionName (responsável por atualizar o valor da
    store). Essa função parâmetro do readable deve ter um retorno. E esse
    retorno não poderia ser nada além de OUTRA função! Essa nova função serve de
    limpeza e o Svelte a executa sempre que a store não é mais necessária.
*/
