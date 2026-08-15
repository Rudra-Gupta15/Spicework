/** Signed-in user shown in the sidebar footer. Swap for real auth data later. */
export interface CurrentUser {
  name: string;
  role: string;
}

export const CURRENT_USER: CurrentUser = {
  name: "Jane Doe",
  role: "IT Technician",
};
