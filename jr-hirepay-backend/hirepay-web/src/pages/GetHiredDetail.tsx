import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HiringService, { ProcedureResponse } from "../services/hiring";
import toast from "react-hot-toast";

export default function GetHiredDetail() {
  const { uuid } = useParams();
  const [proc, setProc] = useState<ProcedureResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await HiringService.get(uuid!);
        setProc(data);
      } catch (e: any) {
        toast.error(e.message ?? "Failed to load request");
      }
    };
    if (uuid) load();
  }, [uuid]);

  if (!uuid) return <div>Missing request id</div>;
  if (!proc) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Hiring Request</h1>
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><span className="text-gray-500">UUID</span><div className="font-mono">{proc.uuid}</div></div>
          <div><span className="text-gray-500">Product</span><div>{proc.product}</div></div>
          <div><span className="text-gray-500">Status</span><div className="font-semibold">{proc.status}</div></div>
        </div>
      </div>
      <p className="text-gray-600">Next: upload agreement and tax/payment forms.</p>
    </div>
  );
}

