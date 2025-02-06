export const Errormessage = {
  UserExist: {
    success: false,
    apiErrorCode: '403',
    errorMessage: 'User already exist',
  },

  IncorrectEmail: {
    success: false,
    apiErrorCode: '401',
    errorMessage: 'Email is not a valid type',
  },

  Unmatchpassword: {
    success: false,
    apiErrorCode: '401',
    errorMessage: 'Password does not match',
  },

  Wronginput: {
    success: false,
    apiErrorCode: '401',
    errorMessage: 'Wrong Input',
  },

  CommunityExist: {
    success: false,
    apiErrorCode: '401',
    errorMessage: 'Community already exist',
  },

  OwnerNotFound: {
    success: false,
    apiErrorCode: '401',
    errorMessage: 'Owner not found',
  },

  CommunityNotFound: {
    success: false,
    apiErrorCode: '401',
    errorMessage:
      'Community either doesnt belong to this owner or doesnt exist',
  },

  CreatorNotFound: {
    success: false,
    apiErrorCode: '401',
    errorMessage: 'Creator not found',
  },

  UserNotFound: {
    success: false,
    apiErrorCode: '401',
    errorMessage: 'User not found',
  },

  ProductNotFound: {
    success: false,
    apiErrorCode: '401',
    errorMessage: 'User not found',
  },

  EmailNotSent: {
    success: false,
    apiErrorCode: '403',
    errorMessage: 'Email not sent',
  },

  InvalidData: {
    success: false,
    apiErrorCode: '400',
    errorMessage: 'Name or email is missing',
  },

  InvalidEmailData: {
    success: false,
    apiErrorCode: '400',
    errorMessage: 'email is missing',
  },

  EventNotFound: {
    success: false,
    apiErrorCode: '400',
    errorMessage: 'Event not found',
  },

  TicketNotFound: {
    success: false,
    apiErrorCode: '400',
    errorMessage: 'Ticket not found',
  },
};
