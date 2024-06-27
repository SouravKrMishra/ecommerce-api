const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      console.log(error);
      return res.status(400).json({
        statuscode: 400,
        message: error.details[0].message,
      });
    }
    next();
  };
};

// const validateGetSchema = (schema) => {
//   return (req, res, next) => {
//     const { error } = schema.validate(req.query);
//     if (error) {
//       console.log(error);
//       return res.status(400).json({
//         statuscode: 400,
//         message: error.details[0].message,
//       });
//     }
//     next();
//   };
// };

module.exports = validateSchema;
