import mongoose from "mongoose";

const UserSessionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    userName: {
        type: String,
        required: true
    },

    userEmail: {
        type: String,
        required: true
    },

    loginAt: {
        type: Date,
        default: Date.now,
        required: true
    },

    logoutAt: {
        type: Date,
        default: null
    },

    // Duração em segundos (preenchida ao logout)
    durationSeconds: {
        type: Number,
        default: null
    },

    // "active" = sessão aberta | "ended" = logout explícito | "expired" = expirou sem logout
    status: {
        type: String,
        enum: ["active", "ended", "expired"],
        default: "active"
    },

    userAgent: {
        type: String,
        default: ""
    },

});

export default mongoose.models.UserSession ||
    mongoose.model("UserSession", UserSessionSchema);
