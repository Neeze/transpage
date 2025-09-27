const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Order extends Model {}

Order.init(
    {
        jobId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        sourceLang: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        targetLang: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        topic: {
            type: DataTypes.STRING,
            defaultValue: "general",
        },
        outputFormat: {
            type: DataTypes.ENUM("pdf", "docx"),
            defaultValue: "pdf",
        },
        filePath: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        translatedFilePath: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("pending", "processing", "done", "failed"),
            defaultValue: "pending",
        },
        costPoints: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "Order",
        tableName: "orders",
        timestamps: true, // để có createdAt / updatedAt
    }
);

module.exports = Order;
