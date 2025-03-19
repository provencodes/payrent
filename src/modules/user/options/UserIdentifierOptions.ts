type UserIdentifierOptionsType =
  | {
      identifierType: 'id';
      identifier: string;
    }
  | {
      identifierType: 'username';
      identifier: string;
    }
  | {
      identifierType: 'email';
      identifier: string;
    };

export default UserIdentifierOptionsType;
