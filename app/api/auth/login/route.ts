import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
// import { generateToken, setTokenCookie, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/utils/validators";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		console.log("🚀 ~ POST ~ body:", body);

		// Validate the request body
		const validatedData = loginSchema.parse(body);
		console.log("🚀 ~ POST ~ validatedData:", validatedData);

		// Find the user by email
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, validatedData.email));

		if (!user) {
			return NextResponse.json(
				{ message: "Invalid email or password" },
				{ status: 401 },
			);
		}

		// Verify the password
		const isValidPassword = validatedData.password === user[0]?.password;

		if (!isValidPassword) {
			return NextResponse.json(
				{ message: "Invalid email or password" },
				{ status: 401 },
			);
		}

		// If it's an admin login but the user is not an admin
		// if (user.role !== "user") {
		// 	return NextResponse.json(
		// 		{ message: "Invalid account type" },
		// 		{ status: 401 },
		// 	);
		// }

		// Generate and set the JWT token
		// const token = await generateToken({
		// 	id: user.id,
		// 	email: user.email,
		// 	role: user.role,
		// });

		// await setTokenCookie(token);

		return NextResponse.json(
			{
				message: "Logged in successfully",
				user: {
					...user[0],
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Login error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ message: error.errors[0].message },
				{ status: 400 },
			);
		}

		return NextResponse.json({ message: "Failed to log in" }, { status: 500 });
	}
}
