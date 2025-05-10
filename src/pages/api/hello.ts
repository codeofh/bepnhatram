import { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
  version: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  res.status(200).json({
    name: "BẾP NHÀ TRÂM API",
    version: "1.0.0",
  });
}
