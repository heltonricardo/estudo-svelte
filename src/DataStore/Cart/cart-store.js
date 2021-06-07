import { writable } from "svelte/store";

const cart = writable([
  {
    id: "p3",
    title: "Test",
    price: 9.99,
  },
  {
    id: "p4",
    title: "Test",
    price: 9.99,
  },
]);

export default cart;