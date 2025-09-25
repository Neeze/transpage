const express = require("express");
const routes = require("./app/routes");
const logger = require("./app/helpers/logger");
const morgan = require("morgan");
const { sequelize, User, ApiKey, Order, ActivityLog } = require("./app/models");
require("dotenv").config();

const app = express();
app.use(express.json());

// HTTP request log (method, url, status, time)
app.use(morgan("combined", {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

app.use("/api", routes);

sequelize.authenticate()
    .then(() => logger.info("✅ Database connected"))
    .catch(err => logger.error(`❌ DB error: ${err.message}`));

// Sync models → auto create table nếu chưa có
sequelize.sync({ alter: true })
    .then(() => logger.info("✅ All models were synchronized"))
    .catch(err => logger.error(`❌ Sync error: ${err.message}`));

// Error handler (global)
app.use((err, req, res, next) => {
    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
    res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
        errors: { details: err.message }
    });
});

app.listen(process.env.WEB_PORT, () => console.log(`🚀 Server running at http://localhost:${process.env.WEB_PORT}`));
