const { db } = require("../config/db");

class Database {
  // Execute SELECT query dynamically
  async getData(table, fields = "*", conditions = {}, limit = "", orderBy = "id", orderType = "DESC") {

    let sql = `SELECT ${fields} FROM \`${table}\``;
    let values = [];

    // Build WHERE clause
    if (Object.keys(conditions).length > 0) {
      const where = [];

      // ✅ FIX: Skip delete_status for tables that don't have it (like user_device_tokens)
      if (table !== "user_device_tokens" && table !== "user_device_token") {
        where.push("`delete_status` = ?");
        values.push("show");
      }
      for (let key in conditions) {
        const val = conditions[key];
        if (Array.isArray(val)) {
          // Operator provided: [operator, value]
          const operator = val[0].toUpperCase();
          switch (operator) {
            case "IN":
              where.push(`\`${key}\` IN (${val[1].map(() => "?").join(",")})`);
              values.push(...val[1]);
              break;
            case "LIKE":
              where.push(`\`${key}\` LIKE ?`);
              values.push(`%${val[1]}%`);
              break;
            case "BETWEEN":
              where.push(`\`${key}\` BETWEEN ? AND ?`);
              values.push(val[1][0], val[1][1]);
              break;
            default:
              where.push(`\`${key}\` ${operator} ?`);
              values.push(val[1]);
          }
        } else {
          where.push(`\`${key}\` = ?`);
          values.push(val);
        }
      }
      sql += " WHERE " + where.join(" AND ");
    }

    // Order
    if (orderBy) {
      sql += ` ORDER BY \`${orderBy}\` ${orderType}`;
    }

    // Limit
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    try {
      const [rows] = await db.query(sql, values);
      return rows;
    } catch (error) {
      throw new Error(error.message);
    }

  }

  // Insert data dynamically
  async insertData(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    const query = `INSERT INTO \`${table}\` (\`${keys.join("`, `")}\`) VALUES (${placeholders})`;

    const [result] = await db.execute(query, values);

    return result.insertId;
  }

  // Update data
  async updateData(table, data, condition) {
    const setKeys = Object.keys(data).map((key) => `\`${key}\` = ?`).join(", ");
    const setValues = Object.values(data);
    const condKeys = Object.keys(condition).map((key) => `\`${key}\` = ?`).join(" AND ");
    const condValues = Object.values(condition);
    const sql = `UPDATE \`${table}\` SET ${setKeys} WHERE ${condKeys}`;
    console.log("SQL QUERY:", sql);
    console.log("SQL VALUES:", [...setValues, ...condValues]);

    const [result] = await db.query(sql, [...setValues, ...condValues]);
    return result;
  }

  // Update data with WHERE IN
  async updateDataWhereIn(table, data, field, values) {
    if (!values.length) return false;
    const setKeys = Object.keys(data).map((key) => `\`${key}\` = ?`).join(", ");
    const setValues = Object.values(data);
    const placeholders = values.map(() => "?").join(",");
    const sql = `UPDATE \`${table}\` SET ${setKeys} WHERE \`${field}\` IN (${placeholders})`;
    const [result] = await db.query(sql, [...setValues, ...values]);
    return result.affectedRows;
  }

  // Delete data dynamically
  async deleteData(table, condition) {
    if (!Object.keys(condition).length) return false;
    const condKeys = Object.keys(condition).map((key) => `\`${key}\` = ?`).join(" AND ");
    const condValues = Object.values(condition);
    const sql = `DELETE FROM \`${table}\` WHERE ${condKeys}`;
    const [result] = await db.query(sql, condValues);
    return result.affectedRows;
  }

  // Run custom query
  async runCustomQuery(sql, params = []) {
    const [rows] = await db.query(sql, params);
    return rows;
  }
}

module.exports = new Database();