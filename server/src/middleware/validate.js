export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!parsed.success) {
    return next({ status: 400, message: parsed.error.issues[0].message });
  }

  req.validated = parsed.data;
  return next();
};
