type UserIdentifierOptionsType =
  | {
      identifierType: 'id';
      identifier: string;
    }
  | {
      identifierType: 'name';
      identifier: string;
    }
  | {
      identifierType: 'email';
      identifier: string;
    };

export default UserIdentifierOptionsType;
