export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "ACTOR" | "CASTER";
};

export type LoginInput = {
  email: string;
  password: string;
};