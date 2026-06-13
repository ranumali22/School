import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaSignInAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import { RiEdit2Fill } from "react-icons/ri";


function StaffCredential() {

    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState({});

    const togglePassword = (id) => {
        setShowPassword((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };
    const handleStaffLogin = (staff) => {

        localStorage.setItem("authRole", "staff");
        localStorage.setItem("authData", JSON.stringify(staff));

        navigate("/staff-dashboard");

    };


    const [employees, setEmployees] = useState(() => {
        const savedEmployees = localStorage.getItem("employees");
        return savedEmployees ? JSON.parse(savedEmployees) : [];

    });

    // Pagination hook
    const {
        currentPage,
        totalPages,
        currentData: paginatedEmployees,
        setCurrentPage,
        itemsPerPage,
        changeItemsPerPage,
    } = usePagination(employees, 10);

    useEffect(() => {
        localStorage.setItem("employees", JSON.stringify(employees));
    }, [employees]);


    return (
        <section className="p-4 rounded-t-2xl max-w-full bg-white">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-black">
                        Employees Credential
                    </h1>

                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border">
                        <thead>
                            <tr className="bg-[#0860C4] text-center text-white ">
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                    #
                                </th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                    Staff Id
                                </th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                    Name
                                </th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                    Father Name
                                </th>

                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                    Role
                                </th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                    Department
                                </th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                    Login Id
                                </th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                    Password
                                </th>

                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedEmployees.length > 0 ? (

                                paginatedEmployees.map((item, index) => (
                                    <tr key={item.id} className="bg-white border-t">

                                        <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>

                                        <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                                            {item.staffId}
                                        </td>
                                        <td className="px-2 md:px-3 py-2 flex items-center gap-2 whitespace-nowrap">

                                            {item.employeeFullName}
                                        </td>
                                        <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.fatherName}</td>

                                        <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                                            <RiEdit2Fill className="text-[1.5rem] " />
                                        </td>

                                        <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.department}</td>
                                        <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.loginId}</td>
                                        <td className="px-2 md:px-4 py-2 whitespace-nowrap flex items-center gap-2">
                                            {showPassword[item.id] ? item.password : "••••••"}

                                            <button
                                                type="button"
                                                onClick={() => togglePassword(item.id)}
                                                className="text-gray-500"
                                            >
                                                {showPassword[item.id] ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <FaSignInAlt
                                                onClick={() => handleStaffLogin(item)}
                                                className="text-[1.5rem] text-green-600 cursor-pointer"
                                                title="Login as Student"
                                            />
                                        </td>



                                    </tr>
                                ))) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">
                                        No Data Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <CommonPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={employees.length}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={changeItemsPerPage}
                    />

                </div>
            </div>
        </section >
    );
}

export default StaffCredential;
