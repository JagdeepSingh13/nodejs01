const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

// event listener
client.on("error", (error) => console.log("redis client error", error));

async function redisDataStructures() {
  try {
    await client.connect();
    // strings -> SET, GET, MSET, MGET

    await client.set("user:name", "JSingh");
    const name = client.get("user:name");

    await client.mSet(["user:email", "j@j.com", "user:age", "60"]);
    const [email, age] = await client.mGet(["user:email", "user:age"]);
    console.log(email, age);

    // list -> LPUSH, RPUSH, LRANGE, LPOP, RPOP
    await client.lPush("notes", ["note 1", "note 2"]);
    const extractAllNotes = await client.lRange("notes", 0, -1);
    console.log(extractAllNotes);

    // sets -> SADD, SMEMBERS, SISMEMBER, SREM
    await client.sAdd("user:nickname", ["john", "varun", "hwk"]);
    const extractNicknames = await client.sMembers("user:nickname");
    console.log(extractNicknames);
  } catch (error) {
    console.error(error);
  } finally {
    client.quit();
  }
}

redisDataStructures();
