import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    session: String,
}, { timestamps: {createdAt: "creation_date", updatedAt: "modification_date"} });

export { userSchema };
