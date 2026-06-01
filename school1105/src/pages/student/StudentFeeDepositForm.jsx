import React, { useState } from "react";
import FeeReceipt from "../../Component/ui/FeeReceipt";
import { FaSearch, FaFileExcel } from "react-icons/fa";
import { MdDelete, MdPrint } from "react-icons/md";

import { localurl } from "../../api/api";
import { showError, showSuccess } from "../../Component/common/alert";

const FloatingInput = ({ label, name, value, onChange, type = "text" }) => {
  return (
    <div className="relative w-full">
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full border border-gray-400 rounded-xl px-4 py-3  text-sm outline-none focus:border-indigo-500"
      />

      <label
        htmlFor={name}
        className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-600
        transition-all
        peer-placeholder-shown:-top-3
        peer-placeholder-shown:text-gray-500
        peer-placeholder-shown:text-base
        peer-focus:-top-2
        peer-focus:text-sm
        peer-focus:text-indigo-500"
      >
        {label}
      </label>
    </div>
  );
};
const StudentFeeDepositForm = ({ student, closeForm, apicallback }) => {
  console.log("students_fee", student);

  const today = new Date().toISOString().split("T")[0];

  const [receiptData, setReceiptData] = useState(null);
  const [deposit, setDeposit] = useState(student?.deposit || []);
  const [deposits1, setDeposits] = useState(student?.all_amount || []);

  const deposits = Object.values(student?.all_amount?.[0] ?? {});

  console.log("all_amount", deposits);

  const handleSubmit = async (type) => {
    for (let d of deposit) {
      if (Number(d.feerec || 0) > Number(d.allot || 0)) {
        showError(
          `❌ Received fee for "${d.fee_head_name}" cannot exceed Allotted fee (Max: ₹${d.allot})`,
        );
        return;
      }
    }

    try {
      const payload = {
        student_id: student.student_id,
        session_id: localStorage.getItem("session_id"),
        school_id: localStorage.getItem("school_id"),
        fees: deposit.map((d) => ({
          fee_head_id: d.fee_head_id,
          fee_date: new Date().toISOString().split("T")[0],
          fee_amount: Number(d.amount || 0),
          fee_pay: Number(d.feerec || 0),
          fee_discount: Number(d.rebate || 0),
          pay_date: d.recdate,
          next_pay: d.nextdate,
        })),
      };

      console.log("API PAYLOAD:", payload);

      const res = await fetch(localurl + "add_student_fee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("API RESPONSE:", data);

      if (data.success) {
        showSuccess(`✅ ${data.message || "Fee Saved Successfully"}`);

        if (type == "exit") {
          closeForm();
          apicallback();
        }
      } else {
        showError(`❌ ${data.message || "Something went wrong"}`);
      }
    } catch (err) {
      console.error("ERROR:", err);
      showError("❌ Server Error");
    }
  };

  const deleteReceipt = async (receiptNo) => {
    if (!window.confirm("Are you sure you want to delete this fee receipt?"))
      return;

    try {
      const school_id = localStorage.getItem("school_id");
      const session_id = localStorage.getItem("session_id");
      const student_id = student.student_id;

      const res = await fetch(
        `${localurl}delete_student_fee/${school_id}/${session_id}/${student_id}/${receiptNo}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (data.success) {
        showSuccess("✅ " + (data.message || "Receipt deleted successfully"));
        apicallback();
        closeForm();
      } else {
        showError("❌ " + (data.message || "Failed to delete receipt"));
      }
    } catch (err) {
      console.error("ERROR DELETING RECEIPT:", err);
      showError("❌ Server Error");
    }
  };

  const handeldeposit = (fee_head_id, value) => {
    const newDeposit = deposit.map((d) => {
      if (d.fee_head_id === fee_head_id) {
        if (Number(value || 0) > Number(d.allot || 0)) {
          showError(
            `❌ Received fee cannot exceed Allotted fee (Max: ₹${d.allot})`,
          );
          return { ...d, feerec: d.allot };
        }
        return { ...d, feerec: value };
      }
      return d;
    });
    setDeposit(newDeposit);
  };

  const handeldepositdiscount = (fee_head_id, value) => {
    const newDeposit = deposit.map((d) =>
      d.fee_head_id === fee_head_id ? { ...d, rebate: value } : d,
    );
    setDeposit(newDeposit);
  };

  const handeldepositrecdate = (fee_head_id, recamount) => {
    const newDeposits = deposit.map((d) =>
      d.fee_head_id === fee_head_id ? { ...d, recdate: recamount } : d,
    );

    setDeposit(newDeposits);
  };
  const handeldepositnextdate = (fee_head_id, recamount) => {
    const newDeposits = deposit.map((d) =>
      d.fee_head_id === fee_head_id ? { ...d, nextdate: recamount } : d,
    );
    setDeposit(newDeposits);
  };

  console.log("deposit", deposit);
  const handleCancel = () => {
    apicallback(); 
    closeForm(); 
  };
  return (
    <>
      <div className="bg-white max-w-6xl mx-auto p-6 rounded">
        {/* Header */}

        {/* Student Detail */}
        <h3 className="mb-3 font-semibold text-lg">
          Student Detail :{" "}
          <span>
            {student.stu_prefix || ""}
            {student.student_ids || "-"}{" "}
          </span>{" "}
        </h3>

        {/* Student Basic Info */}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4 capitalize">
          <div className="col-span-1">
            <span className="text-sm ">
              <span className="text-sm font-bold ">SR No : </span>
              {student.registerNo || ""}
            </span>
          </div>
          <div className="col-span-1">
            <span className="text-sm">
              <span className="text-sm font-bold ">Class: </span>
              {student.class}
            </span>
          </div>
          <div className="col-span-1">
            <span className="text-sm ">
              <span className="text-sm font-bold ">S.N : </span>
              {student.students_name}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-sm ">
              <span className="text-sm font-bold ">F.N :</span>
              {student.father_name}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-sm ">
              <span className="text-sm font-bold ">M.N : </span>
              {student.motherName}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-sm ">
              <span className="text-sm font-bold ">C.No.</span>{" "}
              {student.primaryNo}
            </span>
          </div>
        </div>
        <div className="mb-6">
          {/* Fee Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/60 border border-blue-200 p-4 md:p-5 rounded-2xl shadow-sm">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-blue-600 mb-1">Total Fee</p>
              <p className="font-bold text-xl md:text-2xl text-blue-800">
                ₹ {student.Allot}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100/60 border border-green-200 p-4 md:p-5 rounded-2xl shadow-sm">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-green-600 mb-1">Deposited</p>
              <p className="font-bold text-xl md:text-2xl text-green-800">
                ₹ {student.Paid}
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100/60 border border-red-200 p-4 md:p-5 rounded-2xl shadow-sm">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-red-600 mb-1">Pending</p>
              <p className="font-bold text-xl md:text-2xl text-red-800">
                ₹ {student.Balance}
              </p>
            </div>
          </div>
        </div>

        {/* Deposit Fee */}
        <h3 className="mb-2 font-semibold">Deposit Fee</h3>

        <div>
          {deposit.length > 0 &&
            deposit.map((data) => {
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                  <FloatingInput
                    label="Fee Head"
                    name="fee_head_name"
                    type="text"
                    value={data.fee_head_name}
                    onChange={(e) =>
                      handeldeposit(data.fee_head_id, e.target.value)
                    }
                  />

                  <FloatingInput
                    label="Allot Fee"
                    name="rebate"
                    type="text"
                    value={data.allot}
                    onChange={(e) =>
                      handeldepositdiscount(data.fee_head_id, e.target.value)
                    }
                  />

                  <FloatingInput
                    key={data.fee_head_id}
                    label="Fee Rec."
                    value={data.feerec}
                    onChange={(e) =>
                      handeldeposit(data.fee_head_id, e.target.value)
                    }
                  />

                  <FloatingInput
                    label="Rec Date"
                    name="recDate"
                    type="date"
                    value={data.recdate}
                    onChange={(e) =>
                      handeldepositrecdate(data.fee_head_id, e.target.value)
                    }
                  />
                  <FloatingInput
                    label="Next Date"
                    name="nextDate"
                    type="date"
                    value={data.nextdate}
                    onChange={(e) =>
                      handeldepositnextdate(data.fee_head_id, e.target.value)
                    }
                  />
                </div>
              );
            })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => handleSubmit("continue")}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Save & Continue
          </button>

          <button
            onClick={() => handleSubmit("exit")}
            className="bg-purple-600 text-white px-6 py-2 rounded"
          >
            Save & Exit
          </button>

          <button
            onClick={handleCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded"
          >
            Cancel
          </button>
        </div>

        {/* Deposit History */}

        <div className="flex flex-col md:flex-row sm:flex-row md:items-center md:justify-between gap-4 mt-5 mb-4">
          <h3 className="font-semibold text-lg">Deposited Fee Detail</h3>

          {/* Top Controls */}
          <div className="flex justify-between items-center ">
            <div className="flex items-center flex items-center border rounded-xl px-3 py-2 gap-2 w-full md:w-[350px]">
              <FaSearch className="text-gray-500" />

              <input
                type="text"
                placeholder="Search..."
                className="outline-none w-full"
              />
            </div>
          </div>
        </div>
        <div className=" overflow-x-auto">
          <table className="min-w-full table-auto border">
            <thead>
              <tr className="bg-[#0860C4] text-center text-white">
                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  #
                </th>
                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  Fee Receipt No. ⬍
                </th>
                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  Fee Received ⬍
                </th>

                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  Rec Date ⬍
                </th>
                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  Delete{" "}
                </th>
                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  Print
                </th>
              </tr>
            </thead>

            <tbody>
              {deposits.length > 0 &&
                deposits.map((d, i) => (
                  <tr
                    key={d.id}
                    className="bg-white border-t hover:bg-gray-100 text-center"
                  >
                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {i + 1}
                    </td>

                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {d.receiptNo}
                    </td>

                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {d.fee_pay}
                    </td>

                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {d.pay_date
                        ? new Date(d.pay_date).toLocaleDateString("en-GB")
                        : ""}
                    </td>

                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      <button
                        onClick={() => deleteReceipt(d.receiptNo)}
                        className="text-red-500 text-lg"
                      >
                        <MdDelete size={24} />
                      </button>
                    </td>

                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      <button
                        onClick={() => setReceiptData(d)}
                        className="text-blue-600 text-lg"
                      >
                        <MdPrint size={24} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Info */}

        <div className="flex justify-between text-sm mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Show </span>
            <select className="border px-2 py-1 rounded">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="border px-2 py-1 rounded text-gray-400">
              Prev
            </button>

            <button className="border px-2 py-1 rounded bg-gray-200">1</button>

            <button className="border px-2 py-1 rounded text-gray-400">
              Next
            </button>
          </div>
        </div>
        {receiptData && (
          <FeeReceipt
            student={student}
            deposit={receiptData}
            close={() => setReceiptData(null)}
          />
        )}
      </div>
    </>
  );
};

export default StudentFeeDepositForm;
