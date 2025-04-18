const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

// event listener
client.on("error", (error) => console.log("redis client error", error));

async function testRedisConnection() {
  try {
    await client.connect();
    console.log("connected to redis");

    await client.set("name", "JSingh");
    const extractValue = await client.get("name");
    console.log(extractValue);

    const deleteCount = await client.del("name");
    console.log(deleteCount);

    const extractUpdatedValue = await client.get("name");
    console.log(extractUpdatedValue);

    await client.set("count", "100");
    const incrCount = await client.incr("count");
    console.log(incrCount);
  } catch (error) {
    console.error(error);
  } finally {
    await client.quit();
  }
}

testRedisConnection();
