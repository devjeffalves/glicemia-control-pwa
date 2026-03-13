import jwt from "jsonwebtoken";

export function getUserFromToken(req: Request) {

    const cookie = req.headers.get("cookie");

    if (!cookie) return null;

    const token = cookie
        .split(";")
        .find(c => c.trim().startsWith("token="))
        ?.split("=")[1];

    if (!token) return null;

    try {

        const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET!
        );

        return decoded.userId;

    } catch {

        return null;

    }

}