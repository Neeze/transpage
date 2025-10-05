// models/Payment.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Payment extends Model {}

Payment.init({
    orderId: { type: DataTypes.STRING, allowNull: false, unique: true },
    requestId: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.BIGINT, allowNull: false }, // VND
    points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    orderInfo: { type: DataTypes.STRING, allowNull: false },
    transId: { type: DataTypes.STRING },
    resultCode: { type: DataTypes.INTEGER },
    message: { type: DataTypes.STRING },
    payType: { type: DataTypes.STRING },
    status: {
        type: DataTypes.ENUM("pending", "success", "failed"),
        defaultValue: "pending",
    },
}, {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
});



module.exports = Payment;
