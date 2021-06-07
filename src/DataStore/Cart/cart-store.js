import { writable } from "svelte/store";

const cart = writable([
  {
    id: "p1",
    title: "Test",
    price: 9.99,
  },
  {
    id: "p2",
    title: "Test",
    price: 9.99,
  },
]);

export default cart;