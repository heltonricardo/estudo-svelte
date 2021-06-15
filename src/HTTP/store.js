import { writable } from "svelte/store";

const hobbies = writable([]);

const store = {
  subscribe: hobbies.subscribe,

  addHobby: (hobby) => {
    hobbies.update((items) => [hobby, ...items]);
  },

  setHobbies: (items) => hobbies.set(items),
};

export default store;
