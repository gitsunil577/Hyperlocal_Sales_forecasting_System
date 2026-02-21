import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, password, businessName, location } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("salesforecast");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = email.toLowerCase().includes("admin") ? "admin" : "vendor";

    const result = await usersCollection.insertOne({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role,
      businessName: businessName || "",
      location: location || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { ok: true, userId: result.insertedId.toString(), role },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
