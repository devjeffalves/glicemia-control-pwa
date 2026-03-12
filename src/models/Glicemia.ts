import mongoose from "mongoose";

const GlicemiaSchema = new mongoose.Schema({

    valor: {
        type: Number,
        required: true
    },

    observacao: {
        type: String
    },

    data: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.models.Glicemia ||
    mongoose.model("Glicemia", GlicemiaSchema);