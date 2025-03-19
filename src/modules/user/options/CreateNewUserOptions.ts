import UserInterface from "../interfaces/user.interface";

type CreateNewUserOptions = Pick<
  UserInterface,
  "email" | "username" | "password"
> & {
  admin_secret?: string;
};
export default CreateNewUserOptions;
