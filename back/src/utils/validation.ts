const validateFields =
  (fields: any) =>
  (
    req: { body: { [x: string]: any } },
    res: {
      status: (arg0: number) => {
        (): any;
        new (): any;
        json: { (arg0: { error: string }): any; new (): any };
      };
    },
    next: () => void
  ) => {
    for (const field of fields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    next();
  };

export default { validateFields };
