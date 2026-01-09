import { FaIdCardClip } from "react-icons/fa6";
import api from "../api/axios";

function IdRenewal(){
    return (
        <div className="bg-gray-800 p-6 w-full rounded-xl mt-2 h-80 overflow-auto no-scrollbar">
            <div className="flex items-center gap-2">
                {/* <FaIdCardClip className="text-[16px] mb-2"/> */}
                <h2 className="text-lg font-bold mb-2">ID RENEWAL</h2>
            </div>

        </div>
    );
}

export default IdRenewal;