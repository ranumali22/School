const { create, getAll, update, runCustomQuery } = require("../model/school_account");

exports.upload_work = async (req, res) => {
    try {
        const { school_id, session_id, staff_id, class_id, title, description } = req.body;
        const file = req.file;

        if (!school_id || !session_id || !staff_id || !class_id) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const data = {
            school_id,
            session_id,
            staff_id,
            class_id,
            title,
            description,
            file_path: file ? file.filename : null,
            date: req.body.date || new Date().toISOString().split('T')[0],
            delete_status: 'show'
        };

        const result = await create("school_homework", data);
        if (result) {
            res.json({ success: true, message: "Work uploaded successfully", id: result });
        } else {
            res.json({ success: false, message: "Failed to upload work" });
        }
    } catch (error) {
        console.error("Upload Work Error:", error);
        res.json({ success: false, message: error.message });
    }
};

exports.get_staff_work = async (req, res) => {
    try {
        const { school_id, session_id, staff_id } = req.params;
        const sql = `
            SELECT h.*, c.class_name 
            FROM school_homework h
            LEFT JOIN class c ON h.class_id = c.id
            WHERE h.school_id = ? AND h.session_id = ? AND h.staff_id = ? AND h.delete_status = 'show'
            ORDER BY h.id DESC
        `;
        const rows = await runCustomQuery(sql, [school_id, session_id, staff_id]);
        res.json({ success: true, row: rows });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

exports.get_student_work = async (req, res) => {
    try {
        const { school_id, session_id, class_id } = req.params;
        console.log("Fetching Student Work for:", { school_id, session_id, class_id });
        const sql = `
            SELECT h.*, e.employeeFullName as teacher_name
            FROM school_homework h
            LEFT JOIN employee e ON h.staff_id = e.id
            WHERE h.school_id = ? AND h.session_id = ? AND h.class_id = ? AND h.delete_status = 'show'
            ORDER BY h.id DESC
        `;
        const rows = await runCustomQuery(sql, [school_id, session_id, class_id]);
        res.json({ success: true, row: rows });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

exports.update_work = async (req, res) => {
    try {
        const { id } = req.params;
        const { class_id, title, description } = req.body;
        const file = req.file;
        console.log("Updating Work:", { id, body: req.body, file: file ? file.filename : 'no-file' });

        const data = {
            class_id,
            title,
            description,
            date: req.body.date
        };

        if (file) {
            data.file_path = file.filename;
        }

        const result = await update("school_homework", data, id);
        if (result) {
            res.json({ success: true, message: "Work updated successfully" });
        } else {
            res.json({ success: false, message: "Failed to update work" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

exports.delete_work = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await update("school_homework", { delete_status: 'hide' }, id);
        res.json({ success: true, message: "Work deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

exports.get_class_sections = async (req, res) => {
    try {
        const { school_id } = req.params;
        const sql = `
            SELECT cs.id, CONCAT(c.class_name, ' ', cs.section) as class_name 
            FROM class_section cs
            JOIN class c ON cs.class_id = c.id
            WHERE cs.school_id = ? AND cs.delete_status = 'show'
            ORDER BY c.display_order, cs.display_order
        `;
        const rows = await runCustomQuery(sql, [school_id]);
        res.json({ success: true, row: rows });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
