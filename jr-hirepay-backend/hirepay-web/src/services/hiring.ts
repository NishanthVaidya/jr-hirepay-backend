import api from "./api";

export type CreateHiringRequest = {
  // Map these to your backend DTO fields.
  // If unsure, open http://localhost:8080/swagger-ui/index.html and check CreateHiringRequestDTO.
  consultantName: string;
  consultantEmail: string;
};

export type ProcedureResponse = {
  uuid: string;
  product: "HIRING" | "PAYMENT";
  status: string; // e.g., DRAFT, AGREEMENT_SIGNED, ...
  createdAt?: string;
  updatedAt?: string;
};

const HiringService = {
  create: async (payload: CreateHiringRequest) => {
    // Backend endpoint from your controller: POST /api/hiring
    const { data } = await api.post<ProcedureResponse>("/api/hiring", payload);
    return data;
  },

  get: async (uuid: string) => {
    // GET /api/hiring/{uuid}
    const { data } = await api.get<ProcedureResponse>(`/api/hiring/${uuid}`);
    return data;
  },
};

export default HiringService;

