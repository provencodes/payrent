export class LoginResponseDto {
  access_token: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}
