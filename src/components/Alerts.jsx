import { useEffect, useState } from "react";
import api from "../api/axios";

function Alerts() {

    const [warnings, setWarnings] = useState({
        stock: [],
        zones: []
    });

    useEffect(() => {

        const fetchWarnings = async () => {

            try {

                const res = await api.get(
                    "/api/medicine-expiry/warnings"
                );

                setWarnings(res.data);

            } catch (err) {

                console.error(err);
            }
        };

        fetchWarnings();

    }, []);

    return (
        <div className="space-y-4">

            {warnings.stock.length > 0 && (

                <div className="bg-yellow-600 p-3 rounded">

                    <p className="font-bold mb-2">
                        Central Stock Expiring Within 30 Days
                    </p>

                    {warnings.stock.map((item, index) => (

                        <div
                            key={index}
                            className="border-b py-1 text-sm"
                        >
                            {item.item_name}
                            {" - "}
                            {item.brand}
                            {" - Expiry: "}
                            {item.expiry_date?.slice(0, 10)}
                        </div>

                    ))}

                </div>
            )}

            {warnings.zones.length > 0 && (

                <div className="bg-red-700 p-3 rounded">

                    <p className="font-bold mb-2">
                        Zone Medicines Expiring Within 30 Days
                    </p>

                    {warnings.zones.map((item, index) => (

                        <div
                            key={index}
                            className="border-b py-1 text-sm"
                        >
                            Zone ID: {item.zone_id}
                            {" - "}
                            {item.item_name}
                            {" - "}
                            {item.brand}
                            {" - Expiry: "}
                            {item.expiry_date?.slice(0, 10)}
                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}

export default Alerts;