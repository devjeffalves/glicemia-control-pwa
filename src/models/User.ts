import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
    nome: string;
    email: string;
    password: string;
    role: "user" | "admin";
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    nome: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },

    resetPasswordToken: {
        type: String,
        default: null,
    },

    resetPasswordExpires: {
        type: Date,
        default: null,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default models.User || model<IUser>("User", UserSchema);