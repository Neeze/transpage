const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class ActivityLog extends Model {}

ActivityLog.init({
    action: { type: DataTypes.STRING, allowNull: false },
    metadata: { type: DataTypes.JSON },
    pointBefore: { type: DataTypes.INTEGER, allowNull: true },
    pointChange: { type: DataTypes.INTEGER, allowNull: true },
    pointAfter: { type: DataTypes.INTEGER, allowNull: true }
}, {
    sequelize,
    modelName: "ActivityLog",
    tableName: "activity_logs",
    timestamps: true,
});

module.exports = ActivityLog;
