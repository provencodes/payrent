export class LoginResponseDto {
  access_token: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      userType: string;
    };
  };
}
