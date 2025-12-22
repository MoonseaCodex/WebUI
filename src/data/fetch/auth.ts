"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./base";

import type { UserStatus, NewAccount, Credentials } from "@/types/user";
import type { UUID } from "@/types/uuid";

type PasswordResetParams = { user_id: string; token: string; password: string };
type PasswordChangeParams = {
  oldPass: string;
  newPass1: string;
  newPass2: string;
};
type UpdateProfileParams = {
  username: string;
  email: string;
  discordID: string;
};

// Get the currently logged in user's details
async function getUserStatus() {
  return api.get("/api/auth/user_details").then((r) => {
    const status: UserStatus = {
      authenticated: true,
      username: r.data.username,
      email: r.data.email,
      discordID: r.data.discord_id,
      dmUUID: r.data.dm_info[0].uuid,
      dmHours: r.data.dm_info[0].hours,
    };
    return status;
  }).catch((_error) => {
    const status: Partial<UserStatus> = {
      authenticated: false,
    }
    return status;
  })
}

// Logs the user in and updates the user information store
async function doLogin(creds: Credentials) {
  return api.post("/api/auth/login", creds);
}

// Log user out and clear user information
async function doLogout() {
  return api.post("api/auth/logout");
}

// Create new account
async function doRegisterAccount(details: NewAccount) {
  return api.post("/api/auth/register", details);
}

async function requestPasswordReset(email: string) {
  return api.post("/api/auth/forgot_password", { email: email });
}

async function completePasswordReset(data: PasswordResetParams) {
  return api.post("/api/auth/password_reset", data);
}

async function doPasswordUpdate(data: PasswordChangeParams) {
  return api.post("/api/auth/change_password", data);
}

async function doUpdate(data: Partial<UpdateProfileParams>) {
  // Copy changes to a new object to allow us to translate between back and front end data representation
  const profileChanges: any = {};
  if (data.discordID) profileChanges.discord_id = data.discordID;
  if (data.username) profileChanges.username = data.username;
  if (data.email) profileChanges.email = data.email;

  return api.patch("/api/auth/user_details", profileChanges);
}

async function setDMHoursFn(data: { dmUUID: UUID; hours: number }) {
  return api.patch(`/api/data/dm_log/${data.dmUUID}`, { hours: data.hours });
}

/****************************************************************************************/
/*               hook, bundles everything up nicely for ease of use                     */
/****************************************************************************************/
export function useUserStatus() {
  const queryClient = useQueryClient();

  const fetchData = useQuery({
    queryKey: ["user-status"],
    queryFn: getUserStatus,
  });

  const login = useMutation({
    mutationFn: doLogin,
    onSuccess: (response) => {
      queryClient.setQueryData(["user-status"], {
        authenticated: true,
        username: response.data.username,
        email: response.data.email,
        discordID: response.data.discord_id,
        dmUUID: response.data.dm_info[0].uuid,
        dmHours: response.data.dm_info[0].hours,
      });
    },
  });

  const register = useMutation({
    mutationFn: doRegisterAccount,
    onSuccess: (response) => {
      queryClient.setQueryData(["user-status"], {
        authenticated: true,
        username: response.data.username,
        email: response.data.email,
        discordID: response.data.discord_id,
        dmUUID: response.data.dm_info[0].uuid,
        dmHours: response.data.dm_info[0].hours,
      });
    },
  });

  const logout = useMutation({
    mutationFn: doLogout,
    onSuccess: () => {
      queryClient.setQueryData(["user-status"], { authenticated: false });
    },
  });

  const forgotPassword = useMutation({
    mutationFn: requestPasswordReset,
  });

  const resetPassword = useMutation({
    mutationFn: completePasswordReset,
  });

  const changePassword = useMutation({
    mutationFn: doPasswordUpdate,
  });

  const updateProfile = useMutation({
    mutationFn: doUpdate,
  });

  const setDMHours = useMutation({
    mutationFn: setDMHoursFn,
  });

  return {
    login: login.mutateAsync,
    logout: logout.mutateAsync,
    registerAccount: register.mutateAsync,
    requestPasswordReset: forgotPassword.mutateAsync,
    completePasswordReset: resetPassword.mutateAsync,
    changePassword: changePassword.mutateAsync,
    updateProfile: updateProfile.mutateAsync,
    setDMHours: setDMHours.mutateAsync,
    ...fetchData,
  };
}
