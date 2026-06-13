import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
});

export const register_school = (data) =>
  API.post("/register_school", data);

export const login_admin = (data) =>
  API.post("/login_school", data);


// ✅ FIXED NAME
export const student_login = (data) =>
  API.post("/student_login", data);

export const staff_login = (data) =>
  API.post("/login_employee", data);



// GET ALL SCHOOL
export const get_school = () =>
  API.get("/all_school");

// UPDATE SCHOOL
export const update_school = (id, data) =>
  API.put(`/update_school/${id}`, data);


//  ================= DELETE =================
export const delete_school = (id, data) =>
  API.delete(`/delete_school/${id}`, {
    data: data,
  });

export const get_profile_school = (id) =>
  API.get(`/profile_school/${id}`);

export const change_password_school = (id, data) =>
  API.put(`/change_password_school/${id}`, data);


// ================= CREATE =================
export const create_sms_template_school = (data) =>
  API.post("/sms_template_school/", data);

// ================= GET =================
export const get_sms_template_school = () =>
  API.get("/sms_template_school_get");

// ================= UPDATE =================
export const update_sms_template_school = (id, data) =>
  API.put(`/update_sms_template_school/${id}`, data);

// ================= DELETE =================
export const delete_sms_template_school = (id, data) =>
  API.delete(`/delete_sms_template_school/${id}`, {
    data,
  });

// ADD SESSION
export const add_session = (data) =>
  API.post("/add_session", data);

export const get_session = () =>
  API.get("/add_session");

export const add_class = (data) =>
  API.post("/add_class", data);

export const get_class = () =>
  API.post("/get_class");

export const add_class_detail = (data) =>
  API.post("/add_class_detail", data);

export const add_subject = (data) =>
  API.post("/add_subject", data);

export const get_subject = () =>
  API.get("/get_subject");
export const get_department = () =>
  API.get("/get_department");


// Admin Login
export const superAdminLogin = (data) =>
  API.post("/super_admin_login", data);