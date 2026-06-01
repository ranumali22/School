import React, { useState } from "react";

const PreviousDueFeeForm = ({
  student,
  deposits,
  setDeposits,
  closeForm
}) => {

  const [amount, setAmount] = useState("");
  const [rebate, setRebate] = useState("");
  const [recDate, setRecDate] = useState("");

  const previousSession = "2023-2024";

  const handleSubmit = () => {

    const newDeposit = {

      id: Date.now(),
      studentId: student.id,
      studentName: student.name,
      session: previousSession,
      receiptNo: deposits.length + 1,
      amount: Number(amount),
      rebate: Number(rebate),
      recDate

    };

    const updated = [...deposits, newDeposit];

    setDeposits(updated);

    localStorage.setItem("feeDeposits", JSON.stringify(updated));

    closeForm();

  };

  return (

    <div className="bg-white max-w-xl mx-auto p-6 rounded">

      <h2 className="text-xl font-bold mb-4">
        Previous Session Due
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">

        <div>
          <label className="text-sm">Student</label>
          <p className="font-semibold">{student.name}</p>
        </div>

        <div>
          <label className="text-sm">Class</label>
          <p className="font-semibold">{student.class}</p>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">

        <div>
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border w-full p-2 rounded"
          />
        </div>

        <div>
          <label>Rebate</label>
          <input
            type="number"
            value={rebate}
            onChange={(e) => setRebate(e.target.value)}
            className="border w-full p-2 rounded"
          />
        </div>

        <div>
          <label>Date</label>
          <input
            type="date"
            value={recDate}
            onChange={(e) => setRecDate(e.target.value)}
            className="border w-full p-2 rounded"
          />
        </div>

      </div>

      <div className="flex justify-end gap-2">

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>

        <button
          onClick={closeForm}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>

      </div>

    </div>

  );

};

export default PreviousDueFeeForm;