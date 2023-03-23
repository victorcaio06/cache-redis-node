const { createClient } = require("redis");
const express = require("express");

const app = express();
const client = createClient();

const getAllProducts = async () => {
  const time = Math.random() * 7000;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["Produto 1", "Produto 2"]);
    }, time);
  });
};

app.get("/", async (request, response) => {
  const productsCache = await client.get("getAllProducts");

  if (productsCache) {
    return response.send(JSON.parse(productsCache));
  }

  const products = await getAllProducts();

  await client.set("getAllProducts", JSON.stringify(products));

  return response.send(products);
});

const startup = async () => {
  await client.connect();

  app.listen(3434, () => {
    console.log("Server running...");
  });
};

startup();
