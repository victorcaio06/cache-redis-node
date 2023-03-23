const { createClient } = require("redis");
const express = require("express");

const app = express();
const client = createClient();

const getAllProducts = async () => {
  const time = Math.random() * 10000;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["Produto 1", "Produto 2"]);
    }, time);
  });
};

app.get("/saved", async (request, response) => {
  await client.del("getAllProducts");

  response.send({ ok: true });
});

app.get("/", async (request, response) => {
  const productsCache = await client.get("getAllProducts");

  const isProductsCacheStale = !(await client.get("geAllProducts:validation"));

  if (isProductsCacheStale) {
    const isRefetching = !!(await client.get("getAllProducts:is-refetching"));

    console.log({ isRefetching });

    if (!isRefetching) {
      await client.set("getAllProducts:is-refetching", "true", { EX: 20 });

      setTimeout(async () => {
        console.log("Cache is stale - refetching...");

        const products = await getAllProducts();

        await client.set("getAllProducts", JSON.stringify(products));

        await client.set("getAllProducts:validation", "true", { EX: 5 });

        await client.del("getAllProducts:is-refetching");
      }, 0);
    }
  }

  if (productsCache) {
    return response.send(JSON.parse(productsCache));
  }

  const products = await getAllProducts();

  await client.set("getAllProducts", JSON.stringify(products));

  return response.send(products);
});

const startup = async () => {
  await client.connect();

  client.on("error", (error) => {
    console.log(error);
  });

  app.listen(3434, () => {
    console.log("Server running...");
  });
};

startup();
