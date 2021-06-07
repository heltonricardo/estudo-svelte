import { writable } from "svelte/store";

const products = writable([
  {
    id: "p1",
    title: "A Book",
    price: 9.99,
    description: "A great book!",
  },
  {
    id: "p2",
    title: "A Carpet",
    price: 99.99,
    description: "Red and green.",
  },
]);

export default products;
