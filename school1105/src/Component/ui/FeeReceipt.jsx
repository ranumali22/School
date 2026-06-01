import React, { useEffect, useState } from "react";


const FeeReceipt = ({ student, deposit, close }) => {

    const [school, setSchool] = useState(null);
    const API = `${import.meta.env.VITE_SERVER_URL}`
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("school"));
        setSchool(data);
    }, []);


    const numberToWords = (num) => {
        const ones = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen",
        ];

        const tens = [
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety",
        ];

        const convertTwo = (n) => {
            if (n < 20) return ones[n];
            return tens[Math.floor(n / 10)] + " " + ones[n % 10];
        };

        const convertThree = (n) => {
            let str = "";
            if (Math.floor(n / 100) > 0) {
                str += ones[Math.floor(n / 100)] + " Hundred ";
                n = n % 100;
            }
            if (n > 0) str += convertTwo(n);
            return str.trim();
        };

        num = Number(num);

        if (num === 0) return "Zero";

        let result = "";

        if (Math.floor(num / 1000) > 0) {
            result += convertThree(Math.floor(num / 1000)) + " Thousand ";
            num = num % 1000;
        }

        if (num > 0) {
            result += convertThree(num);
        }

        return result.trim();
    };
    const handlePrint = () => {
        const content = document.getElementById("print-content");

        if (!content) return alert("Print content not found");

        const win = window.open("", "", "width=900,height=700");

        win.document.write(`
    <html>
      <head>
        <title>Print</title>

        <!-- Tailwind add karo -->
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Inter', sans-serif;
          }

          .wrapper {
            width: 190mm;
            margin: auto;
          }

          img {
            max-width: 100%;
          }
        </style>
      </head>

      <body>
        <div class="wrapper">
          ${content.innerHTML}
        </div>
      </body>
    </html>
  `);

        win.document.close();

        // 🔥 IMPORTANT (image load fix)
        setTimeout(() => {
            win.print();
            win.close();
        }, 500);
    };
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-start overflow-y-auto py-10 z-[9999]">
            <div className="bg-white p-6 rounded-2xl w-[620px] relative print:p-0 shadow-2xl mx-4 mb-10">

                {/* Close */}
                <button
                    onClick={close}
                    className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-xl hover:bg-red-600 transition-all z-[10000] print:hidden text-xl font-bold border-4 border-white"
                >
                    ✕
                </button>

                {/* Print */}
                <div className="text-center mb-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Print
                    </button>
                </div>

                {/* Receipt */}
                <div id="print-content" className="border-2 border-blue-500 p-4">
                    {/* 🔥 SCHOOL HEADER */}
                    <div className="flex justify-between text-xs mb-2">
                        <span>Reg. No.: {school?.registration_no || "-"}</span>
                        <span>Affl. No.: {school?.affiliation_no || "-"}</span>
                    </div>

                    <div className="flex items-center gap-3 border-b pb-2">
                        {/* <img
                            src={school?.upload_logo || "/logo.png"}
                            className="w-14 h-14"
                        /> */}

                        <img
                            src={
                                school?.upload_logo
                                    ? `${API}/uploads/${school.upload_logo}`
                                    : "/logo.png"
                            }
                            alt="School Logo"
                            className="w-14 h-14 object-contain"
                        />

                        <div className="text-center flex-1">
                            <h2 className="font-bold text-lg capitalize">
                                {school?.school_name || "School Name"}
                            </h2>

                            <p className="text-xs">{school?.address || ""}</p>

                            <p className="text-xs">
                                Contact No.: {school?.mobile_no || school?.phone || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-center font-semibold my-3 bg-gray-300 py-1">
                        Fees Receipt
                    </h3>

                    {/* Receipt Info */}

                    <div className="flex justify-between text-sm mb-2">
                        <span>
                            Receipt No : <b>{deposit.receiptNo}</b>
                        </span>

                        <span>
                            Date :{" "}
                            {deposit.pay_date
                                ? new Date(deposit.pay_date)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, " ")
                                : ""}
                        </span>
                    </div>

                    <div className="border-b mb-2 pb-1 text-sm">
                        Mr./Ms. :<b className="ml-2 capitalize">{student.students_name}</b>
                    </div>

                    <div className="border-b mb-2 pb-1 text-sm">
                        S/o - D/o :<b className="ml-2 capitalize">{student.father_name}</b>
                    </div>

                    <div className="flex justify-between border-b pb-2 mb-3 text-sm">
                        <span>
                            Class : <b>{student.class}</b>
                        </span>
                        <span>
                            Session : <b>{student.session}</b>
                        </span>
                    </div>

                    {/* Fee Table */}

                    <table className="w-full border text-sm">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-1">S. No.</th>
                                <th className="border p-1">PARTICULARS</th>
                                <th className="border p-1">AMT(IN RS.)</th>
                            </tr>
                        </thead>

                        <tbody>
                            {deposit.all_fee &&
                                deposit.all_fee.map((data, i) => (
                                    <tr>
                                        <td className="border p-1 text-center">{i + 1}</td>
                                        <td className="border p-1">{data.fee_head}</td>
                                        <td className="border p-1 text-right">{data.fee_pay}</td>
                                    </tr>
                                ))}

                            <tr>
                                <td className="border p-1" colSpan="2">
                                    <b>Total</b>
                                </td>

                                <td className="border p-1 text-right">
                                    <b>{deposit.fee_pay}</b>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="border p-2 mt-2 text-sm">
                        <p className="text-sm mt-3">
                            Rs. (In Words):
                            <b> {numberToWords(deposit.fee_pay)} Only</b>
                        </p>{" "}
                    </div>

                    {/* Footer */}

                    <div className="flex justify-between mt-6 text-sm">
                        <span>Date :{new Date().toLocaleDateString("en-GB")}</span>

                        <span>Authorised Signatory</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeReceipt;