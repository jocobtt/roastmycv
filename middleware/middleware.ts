import nextConnect from "next-connect";
import multiparty from "multiparty";

const middleware = nextConnect();

middleware.use(async (req, res, next) => {
  const form = new multiparty.Form();
  console.log(req)

  await form.parse(req, function (err, fields, files) {
    console.log({ fields });
    req.body = fields;
    req.files = files;
    next();
  });
});

export default middleware;
