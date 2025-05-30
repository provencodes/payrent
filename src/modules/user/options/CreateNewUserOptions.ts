import UserInterface from "../interfaces/user.interface";

type CreateNewUserOptions = Pick<
  UserInterface,
  "email" | "name" | "password"
> & {
  admin_secret?: string;
};
export default CreateNewUserOptions;
