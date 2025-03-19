export class UserDetailResponseDTO {
  message: string;
  data: UserDetail;
}

class UserDetail {
  id: string;
  username: string;
  email: string;
  avatar: string
}
