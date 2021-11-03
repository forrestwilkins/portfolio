import { useEffect } from "react";
import Router from "next/router";
import { CircularProgress } from "@material-ui/core";

import UserForm from "../../components/Users/Form";
import Messages from "../../utils/messages";
import { useAllUsers, useCurrentUser } from "../../hooks";
import { NavigationPaths } from "../../constants/common";

const SignUp = () => {
  const currentUser = useCurrentUser();
  const [users, _setUsers, usersLoading] = useAllUsers();

  useEffect(() => {
    if (currentUser?.isAuthenticated) Router.push(NavigationPaths.Home);
  }, [currentUser]);

  if (usersLoading) return <CircularProgress />;
  if (currentUser) return <>{Messages.users.alreadyRegistered()}</>;
  if (users.length === 0) return <UserForm />;
  return <>{Messages.invites.redeem.inviteRequired()}</>;
};

export default SignUp;
