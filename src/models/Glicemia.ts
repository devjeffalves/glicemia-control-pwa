import mongoose from "mongoose";

const GlicemiaSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    valor: {
        type: Number,
        required: true
    },

    data: {
        type: Date,
        default: Date.now // 🔥 resolve automaticamente
    },

    observacao: {
        type: String
    }

});

export default mongoose.models.Glicemia ||
    mongoose.model("Glicemia", GlicemiaSchema);