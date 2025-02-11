import UserInterface from '../interfaces/user.interface';

class CreateUserSuccessResponse {
  data: {
    user: {
      username: string;
      email: string;
      createdAt: Date;
    };
  };
}

class CreateUserErrorResponse {
  message: string;
  error: string;
}
class RequestVerificationToken {
  email: string;
}

export {
  CreateUserErrorResponse,
  CreateUserSuccessResponse,
  RequestVerificationToken,
};

type UserResponseDTO = Partial<UserInterface>;

export default UserResponseDTO;
