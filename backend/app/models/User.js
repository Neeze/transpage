const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class User extends Model {}

User.init({
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: true }, // Google login có thể null
    role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    provider: { type: DataTypes.ENUM("local", "google"), defaultValue: "local" },
    googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
    avatarUrl: { type: DataTypes.TEXT, allowNull: true }
}, {
    sequelize,
    modelName: "User",
    tableName: "users"
});

module.exports = User;
