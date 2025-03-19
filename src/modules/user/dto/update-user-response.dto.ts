export class UpdateUserResponseDTO {
  status: string;
  message: string;
  user: {
    id: string;
    name: string;
    phone_number: string;
  };
}
