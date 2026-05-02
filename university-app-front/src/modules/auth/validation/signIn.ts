export const signInFormValidation = () => {
  return {
    email: {
      required: "Email is required",
      pattern: {
        value: /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/,
        message: "Invalid email",
      },
    },
    password: {
      required: "Password is required",
    },
  };
};
