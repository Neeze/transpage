const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class ApiKey extends Model {}

ApiKey.init({
    key: { type: DataTypes.STRING, unique: true, allowNull: false },
    status: { type: DataTypes.ENUM("active", "revoked"), defaultValue: "active" }
}, { sequelize, modelName: "ApiKey", tableName: "apikeys" });

module.exports = ApiKey;
