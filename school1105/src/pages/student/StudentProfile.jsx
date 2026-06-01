import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Shield, Edit3, Save, X, Camera } from "lucide-react";
import { localurl } from "../../api/api";
import toast from "react-hot-toast";

const imageBase = localurl.replace("/api", "");

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  const student_id = localStorage.getItem("student_id");

  useEffect(() => {
    fetchStudentData();
  }, [student_id]);

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`${localurl}student/${student_id}`);
      const data = await response.json();
      if (data.success) {
        setStudent(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // 🧹 CLEAN DATA BEFORE SEND
      const updateData = { ...formData };

      // Remove virtual/calculated fields that don't exist in DB schema or shouldn't be updated here
      delete updateData.className;
      delete updateData.sectionName;
      delete updateData.student_ids;
      delete updateData.loginid;
      delete updateData.registerAdmissionDate;
      delete updateData.section_class;
      delete updateData.registerClass;
      delete updateData.registerSection;

      const response = await fetch(`${localurl}update_students/${student_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (result.success) {
        setIsEditing(false);
        setStudent(formData);
        toast.success("Profile updated successfully ✅");
        fetchStudentData(); // Refresh
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Server error while updating profile");
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] md:bg-[#f3f4f6] pb-12 pt-0 md:pt-6">
      <div className="max-w-6xl mx-auto px-0 md:px-4">
        
        {/* 🔷 HEADER SECTION (Clean for Mobile, Card for Desktop) */}
        <div className="bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-200 mb-0 md:mb-6 overflow-hidden">
          <div className="p-8 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 border-b md:border-b-0 border-gray-100">
            {/* PHOTO */}
            <div className="relative">
              <div className="h-32 w-32 md:h-32 md:w-32 rounded-full md:rounded-2xl border-4 border-white md:border-2 md:border-blue-50 shadow-xl md:shadow-sm overflow-hidden bg-gray-50">
                <img
                  src={student?.photo ? `${imageBase}uploads/student/${student.photo}` : "/default-user.png"}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 md:-bottom-2 md:-right-2 bg-blue-600 text-white p-2 rounded-full md:rounded-lg shadow-lg hover:bg-blue-700 transition">
                  <Camera size={16} />
                </button>
              )}
            </div>

            {/* QUICK INFO */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 capitalize tracking-tight">{student?.studentName}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5 bg-gray-50 md:bg-transparent px-3 py-1 md:p-0 rounded-full">
                  <User size={14} className="text-blue-500" /> ID: {student?.student_ids}
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 md:bg-transparent px-3 py-1 md:p-0 rounded-full">
                  <BookOpen size={14} className="text-green-500" /> {student?.section_class}
                </div>
              </div>
            </div>

            {/* ACTION */}
            {/* <div className="w-full md:w-auto pt-2 md:pt-0">
              {isEditing ? (
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm">
                    <X size={18} /> Cancel
                  </button>
                  <button onClick={handleSave} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-md text-sm">
                    <Save size={18} /> Save
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg">
                  <Edit3 size={18} /> Edit Profile
                </button>
              )}
            </div> */}
          </div>
        </div>

        {/* 🔷 DETAILS SECTION (Direct for Mobile, Grid for Desktop) */}
        <div className="space-y-0 md:space-y-6">
          {/* MOBILE ONLY: COMBINED LIST */}
          <div className="md:hidden bg-white divide-y divide-gray-50 px-6">
            <MobileSectionHeader icon={<Shield size={18} />} title="Personal Details" color="text-blue-600" />
            <div className="py-4 space-y-6">
              <ProfileField label="Full Name" name="studentName" value={formData.studentName} isEditing={isEditing} onChange={handleInputChange} />
              <ProfileField label="Date of Birth" name="dob" value={formData.dob} isEditing={isEditing} onChange={handleInputChange} type="date" />
              <ProfileField label="Gender" name="gender" value={formData.gender} isEditing={isEditing} onChange={handleInputChange} />
              <ProfileField label="Blood Group" name="bloodgroup" value={formData.bloodgroup} isEditing={isEditing} onChange={handleInputChange} />
            </div>

            <MobileSectionHeader icon={<User size={18} />} title="Family Information" color="text-purple-600" />
            <div className="py-4 space-y-6">
              <ProfileField label="Father's Name" name="fatherName" value={formData.fatherName} isEditing={isEditing} onChange={handleInputChange} />
              <ProfileField label="Mother's Name" name="motherName" value={formData.motherName} isEditing={isEditing} onChange={handleInputChange} />
              <ProfileField label="Primary Mobile" name="primaryNo" value={formData.primaryNo} isEditing={isEditing} onChange={handleInputChange} />
            </div>

            <MobileSectionHeader icon={<MapPin size={18} />} title="Contact Information" color="text-rose-500" />
            <div className="py-4 pb-12 space-y-6">
              <ProfileField label="Current Address" name="currentAddress" value={formData.currentAddress} isEditing={isEditing} onChange={handleInputChange} textArea />
              <div className="grid grid-cols-2 gap-4">
                <ProfileField label="City" name="currentCity" value={formData.currentCity} isEditing={isEditing} onChange={handleInputChange} />
                <ProfileField label="Pincode" name="currentPinCode" value={formData.currentPinCode} isEditing={isEditing} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* DESKTOP ONLY: ORIGINAL GRID */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-50">
                  <Shield size={20} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight">Personal Details</h2>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <ProfileField label="Full Name" name="studentName" value={formData.studentName} isEditing={isEditing} onChange={handleInputChange} />
                  <ProfileField label="Date of Birth" name="dob" value={formData.dob} isEditing={isEditing} onChange={handleInputChange} type="date" />
                  <ProfileField label="Gender" name="gender" value={formData.gender} isEditing={isEditing} onChange={handleInputChange} />
                  <ProfileField label="Blood Group" name="bloodgroup" value={formData.bloodgroup} isEditing={isEditing} onChange={handleInputChange} />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-50">
                  <User size={20} className="text-purple-600" />
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight">Family Information</h2>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <ProfileField label="Father's Name" name="fatherName" value={formData.fatherName} isEditing={isEditing} onChange={handleInputChange} />
                  <ProfileField label="Mother's Name" name="motherName" value={formData.motherName} isEditing={isEditing} onChange={handleInputChange} />
                  <ProfileField label="Primary Mobile" name="primaryNo" value={formData.primaryNo} isEditing={isEditing} onChange={handleInputChange} />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-50">
                  <MapPin size={20} className="text-red-500" />
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight">Contact</h2>
                </div>
                <div className="space-y-6">
                  <ProfileField label="Address" name="currentAddress" value={formData.currentAddress} isEditing={isEditing} onChange={handleInputChange} textArea />
                  <ProfileField label="City" name="currentCity" value={formData.currentCity} isEditing={isEditing} onChange={handleInputChange} />
                  <ProfileField label="Pincode" name="currentPinCode" value={formData.currentPinCode} isEditing={isEditing} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileSectionHeader = ({ icon, title, color }) => (
  <div className="flex items-center gap-2 pt-8 pb-2">
    <span className={color}>{icon}</span>
    <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</h2>
  </div>
);

const ProfileField = ({ label, name, value, isEditing, onChange, type = "text", textArea = false }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-0.5">
        {label}
      </label>
      {isEditing ? (
        textArea ? (
          <textarea
            name={name}
            value={value || ""}
            onChange={onChange}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition text-sm text-gray-700 font-medium"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition text-sm text-gray-700 font-medium"
          />
        )
      ) : (
        <div className="px-4 py-2.5 bg-gray-50 border border-gray-50 rounded-xl text-sm text-gray-800 font-bold min-h-[40px]">
          {value || "—"}
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
