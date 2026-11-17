export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type ApplyToRoleInput = {
  castingRoleId: string;
};

export type UpdateApplicationStatusInput = {
  status: "ACCEPTED" | "REJECTED";
};

export type ApplicationQuery = {
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
};
