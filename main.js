import { createApp, defineAsyncComponent } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

function loadComponent(name) {
  return () => import(`./${name}/main.js`).then((m) => m.default());
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {path: "/", component: loadComponent("home")},
    {path: "/pies", component: loadComponent("pies")},
    {path: "/bars", component: loadComponent("bars")},
    {path: "/utilities", component: loadComponent("utilities")},
    {path: "/nested-pie", component: loadComponent("nested-pie")}
  ],
});

createApp({
  template: "#template",
  components: {
    Home: defineAsyncComponent(loadComponent("home")),
  },
})
  .use(router)
  .mount("#app");
