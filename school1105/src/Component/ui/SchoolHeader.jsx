import React, { useEffect, useState } from "react";
import { get_school } from "../../Api";

const SchoolHeader = () => {
  const [school, setSchool] = useState(null);

  useEffect(() => {
    fetchSchool();
  }, []);

  const fetchSchool = async () => {
    try {
      const res = await get_school();

      const school_id = localStorage.getItem("school_id");

      const data = res.data?.row?.find(
        (item) => item.id == school_id
      );
      console.log("School fetch error:", data);
      setSchool(data);

    } catch (err) {
      console.log("School fetch error:", err);
    }
  };

  return (<></>
    // <div className="w-full border-b pb-3 mb-4">
    //   <div className="flex items-center justify-between text-sm">
    //     <p>Reg. No.: {school?.registration_no || "-"}</p>
    //     <p>Affl. No.: {school?.affiliation_no || "-"}</p>
    //   </div>

    //   <div className="flex items-center gap-4 mt-2">
    //     <img
    //       src={school?.upload_logo || "/logo.png"}
    //       alt="logo"
    //       className="h-16 w-16 object-contain"
    //     />

    //     <div className="text-center w-full">
    //       <h1 className="text-xl font-bold">
    //         {school?.school_name || "School Name"}
    //       </h1>

    //       <p className="text-sm">
    //         {school?.address || "Address"}
    //       </p>

    //       <p className="text-sm">
    //         Contact No.: {school?.phone || "-"}
    //       </p>
    //     </div>
    //   </div>

    //   <hr className="mt-3 border-black" />
    // </div>
  );
};

export default SchoolHeader;