const db = require("../database/database");

// Model school_account
const school_account = {
  // Get all 
  getAll: async (table, value, condition, limits) => {
    const rows = await db.getData(table, value, condition, limits);
    return rows;
  },

  // Create new 
  create: async (table, data) => {
    const id = await db.insertData(table, data);




    return id;
  }
  ,

  update: async (table, data, id) => {

    const condition = typeof id === 'object' ? id : { "id": id };
    const result = await db.updateData(table, data, condition);
    return result;
  },

  // Delete
  deleteData: async (table, condition) => {
    const result = await db.deleteData(table, condition);
    return result;
  },

  // Custom Query
  runCustomQuery: async (sql, params) => {
    const rows = await db.runCustomQuery(sql, params);
    return rows;
  }

};

module.exports = school_account;