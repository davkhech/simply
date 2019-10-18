import { connect, model } from "mongoose";
import { userSchema } from "./user";

let executed = false;
let User: any;
const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017";
const database = process.env.MONGODB_DATABASE || "simply";
const mongoArgs = process.env.MONGODB_ARGS;

export async function getModels() {

    if (!executed) {
        let connectionString = [mongoUrl, database].join("/");
        if (mongoArgs) {
            connectionString += mongoArgs;
        }
        await connect(connectionString, {useNewUrlParser: true});
        User = model("User", userSchema);
        executed = true;
    }

    return { User };
}
