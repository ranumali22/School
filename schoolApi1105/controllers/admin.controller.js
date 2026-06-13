const { create, getAll, update, runCustomQuery } = require("../model/school_account");

exports.superadminLogin = async (req, res) => {
    try {
        const { login_id, password } = req.body;

        if (!login_id?.trim()) {
            return res.status(400).json({
                success: false,
                field: "login_id",
                message: "Login ID is required.",
            });
        }

        if (!password?.trim()) {
            return res.status(400).json({
                success: false,
                field: "password",
                message: "Password is required.",
            });
        }

        const sql = `
            SELECT 
                id,
                login_id,
                password,
                created_at,
                updated_at
            FROM admin
            WHERE login_id = ?
            LIMIT 1
        `;

        // 🔁 CHANGED HERE
        const result = await runCustomQuery(sql, [login_id.trim()]);

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                field: "login_id",
                message: "Login ID does not exist.",
            });
        }

        const admin = result[0];

        if (admin.password !== password) {
            return res.status(401).json({
                success: false,
                field: "password",
                message: "Incorrect password.",
            });
        }

        delete admin.password;

        return res.status(200).json({
            success: true,
            message: "Admin login successful.",
            data: admin,
        });

    } catch (error) {
        console.error("Admin Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while processing login request.",
            error: error.message,
        });
    }
};