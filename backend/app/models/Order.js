const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Order extends Model {}

Order.init({
    sourceLang: DataTypes.STRING,
    targetLang: DataTypes.STRING,
    originalText: DataTypes.TEXT,
    translatedText: DataTypes.TEXT,
    status: { type: DataTypes.ENUM("pending", "processing", "done", "failed"), defaultValue: "pending" },
    costPoints: DataTypes.INTEGER
}, { sequelize, modelName: "Order", tableName: "orders" });

module.exports = Order;
