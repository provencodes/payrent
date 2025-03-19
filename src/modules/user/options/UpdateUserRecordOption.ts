import { UpdateRecordGeneric } from "../../../helpers/updateRecordGeneric";
import UserInterface from "../interfaces/user.interface";
import UserIdentifierOptionsType from "./UserIdentifierOptions";

type UserUpdateRecord = Partial<UserInterface>;

type UpdateUserRecordOption = UpdateRecordGeneric<
  UserIdentifierOptionsType,
  UserUpdateRecord
>;

export default UpdateUserRecordOption;
