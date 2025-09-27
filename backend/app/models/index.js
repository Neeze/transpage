const sequelize = require("../../config/database");

// Import các models
const User = require("./User");
const ApiKey = require("./ApiKey");
const Order = require("./Order");
const ActivityLog = require("./ActivityLog");

// Associations
User.hasMany(ApiKey, { foreignKey: "userId" });
ApiKey.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

User.hasMany(ActivityLog, { foreignKey: "userId" });
ActivityLog.belongsTo(User, { foreignKey: "userId" });

// Export ra dùng chung
module.exports = {
    sequelize,
    User,
    ApiKey,
    Order,
    ActivityLog,
};
