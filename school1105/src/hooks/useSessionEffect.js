import { useEffect } from "react";

const useSessionEffect = (callback) => {
  useEffect(() => {
    const handle = () => {
      const session_id = localStorage.getItem("session_id");
      callback(session_id);
    };

    handle();

    window.addEventListener("sessionChanged", handle);

    return () => {
      window.removeEventListener("sessionChanged", handle);
    };
  }, []); // ❗ dependency empty rakho
};


export default useSessionEffect;


