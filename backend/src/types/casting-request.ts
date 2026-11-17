export type CastingRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type CreateCastingRequestInput = {
  actorId: string;
  castingRoleId?: string;
};

export type UpdateCastingRequestStatusInput = {
  status: "ACCEPTED" | "REJECTED";
};

export type CastingRequestQuery = {
  status?: CastingRequestStatus;
  page?: number;
  limit?: number;
};
