const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategoryModel = new Schema(
    {
        categoryName: {type: String, required: true},
        queryParams: {type: String, required: true},
        isActive: {type: Number, default: 1, min: 0, max: 1},
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("categories", CategoryModel);
